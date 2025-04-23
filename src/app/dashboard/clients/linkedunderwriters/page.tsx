"use client"

import type * as React from "react"
import { useState, useCallback, useEffect } from "react"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Head from "next/head"

import { config } from "@/config"
import { ClientsFilters } from "@/components/dashboard/client/clients-filters"
import { ClientsTable } from "@/components/dashboard/client/clients-table"
import type { Client } from "@/components/dashboard/client/clients-table"

export default function UnderwriterClientsPage(): React.JSX.Element {
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://ezitt.whencefinancesystem.com/users")
        if (!response.ok) throw new Error("Error fetching users")
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("User fetch error:", error)
      }
    }
    fetchUsers()
  }, [])

  // Fetch clients based on selected filter
  const fetchClients = useCallback(
    async (status: string | null) => {
      setIsLoading(true)
      try {
        const response = await fetch("https://ezitt.whencefinancesystem.com/requests")
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        const data = await response.json()

        // Filter by request_type and status
        const filteredRequests = data.filter((req: any) => {
          const isValidType =
            req.request_type === "underwriter-client" || req.request_type === "client-underwriter"
          const isValidStatus = status ? req.status.toLowerCase() === status.toLowerCase() : true
          return isValidType && isValidStatus
        })

        // Map to include user names
        const transformedData = filteredRequests.map((request: any) => {
          const requester = users.find((u) => u.id === request.requester_id)
          const recipient = users.find((u) => u.id === request.recipient_id)

          return {
            id: request.id,
            requester_first_name: requester ? requester.first_name : '',
            requester_last_name: requester ? requester.last_name : '',
            requester_type: request.requester_type,
            recipient_first_name: recipient ? recipient.first_name : '',
            recipient_last_name: recipient ? recipient.last_name : '',
            recipient_type: request.recipient_type,
            relationship_type: request.request_type,
            status: request.status,
          }
        })

        setClients(transformedData)
      } catch (error) {
        console.error("Error fetching requests:", error)
        setClients([])
      } finally {
        setIsLoading(false)
      }
    },
    [users]
  )

  const handleFilter = useCallback(
    (status: string | null) => {
      setActiveFilter(status)
      fetchClients(status)
      setPage(0)
    },
    [fetchClients]
  )

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const paginatedClients = applyPagination(clients, page, rowsPerPage)

  return (
    <>
      <Head>
        <title>{`Client-Underwriter Relationships | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
            <Typography variant="h5">Client-Underwriter Relationships</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Button
                color={activeFilter === "approved" ? "primary" : "inherit"}
                variant={activeFilter === "approved" ? "contained" : "outlined"}
                onClick={() => handleFilter("approved")}
              >
                Approved
              </Button>
              <Button
                color={activeFilter === "pending" ? "primary" : "inherit"}
                variant={activeFilter === "pending" ? "contained" : "outlined"}
                onClick={() => handleFilter("pending")}
              >
                Pending
              </Button>
              {/*<Button
                color={activeFilter === "declined" ? "primary" : "inherit"}
                variant={activeFilter === "declined" ? "contained" : "outlined"}
                onClick={() => handleFilter("declined")}
              >
                Declined
              </Button>*/}
              {activeFilter && (
                <Button color="inherit" variant="outlined" onClick={() => handleFilter(null)}>
                  Clear Filter
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>

        
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : clients.length > 0 ? (
          <ClientsTable
            count={clients.length}
            rows={paginatedClients}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
          />
        ) : (
          <Typography>
            {activeFilter ? "No underwriter relationships found for the selected filter." : "Please select a filter to view relationships."}
          </Typography>
        )}
      </Stack>
    </>
  )
}

function applyPagination(rows: Client[], page: number, rowsPerPage: number): Client[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
}