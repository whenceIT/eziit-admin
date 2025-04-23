"use client"

import type * as React from "react"
import { useState, useCallback, useEffect } from "react"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Head from "next/head"

import { config } from "@/config"
import { EmployersTable } from "@/components/dashboard/employer/employers-table"

export default function EmployerClientsPage(): React.JSX.Element {
  const [relationships, setRelationships] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

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

  const fetchRelationships = useCallback(
    async (status: string | null) => {
      setIsLoading(true)
      try {
        const response = await fetch("https://ezitt.whencefinancesystem.com/requests")
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()

        const filteredRequests = data.filter((req: any) => {
          const isValidType = req.request_type === "underwriter-employer" || req.request_type === "employer-underwriter"
          const isValidStatus = status ? req.status.toLowerCase() === status.toLowerCase() : true
          return isValidType && isValidStatus
        })

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

        setRelationships(transformedData)
      } catch (error) {
        console.error("Error fetching relationships:", error)
        setRelationships([])
      } finally {
        setIsLoading(false)
      }
    },
    [users]
  )

  //

  const handleFilter = useCallback(
    (status: string | null) => {
      setActiveFilter(status)
      fetchRelationships(status)
      setPage(0)
    },
    [fetchRelationships]
  )

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const paginatedRelationships = applyPagination(relationships, page, rowsPerPage)

  return (
    <>
      <Head>
        <title>{`Underwriter-Employer Relationships | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
            <Typography variant="h5">Underwriter-Employer Relationships</Typography>
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
        ) : relationships.length > 0 ? (
          <EmployersTable
            count={relationships.length}
            items={paginatedRelationships}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
          />
        ) : (
          <Typography>
            {activeFilter ? "No relationships found for the selected filter." : "Please select a filter to view relationships."}
          </Typography>
        )}
      </Stack>
    </>
  )
}

function applyPagination(rows: any[], page: number, rowsPerPage: number): any[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
}