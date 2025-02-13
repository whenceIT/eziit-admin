"use client"

import type * as React from "react"
import { useState, useCallback } from "react"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Head from "next/head"

import { config } from "@/config"
import { ClientsFilters } from "@/components/dashboard/client/clients-filters"
import { ClientsTable } from "@/components/dashboard/client/clients-table"
import type { Client } from "@/components/dashboard/client/clients-table"

export default function MerchantClientsPage(): React.JSX.Element {
  const [clients, setClients] = useState<Client[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [isLoading, setIsLoading] = useState(false)

  const fetchClients = useCallback(async (status: string | null) => {
    if (!status) {
      setClients([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`https://ezitt.whencefinancesystem.com/clients?type=merchant`)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()

      const filteredData = data.filter((client: any) => client.merchant_status.toLowerCase() === status.toLowerCase())

      const transformedData = filteredData.map((client: any) => ({
        id: client.id ?? null,
        user_id: client.user_id ?? "N/A",
        float: client.float ?? 0,
        merchants: client.merchants ?? "N/A",
        transactions: client.transactions ?? "N/A",
        employer: client.employer ?? "N/A",
        ratings: client.ratings ?? 0,
        comments: client.comments ?? "",
        employer_status: client.employer_status ?? "",
        merchant_status: client.merchant_status ?? "",
      }))

      setClients(transformedData)
    } catch (error) {
      console.error("Error fetching clients:", error)
      setClients([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFilter = useCallback(
    (status: string | null) => {
      setActiveFilter(status)
      fetchClients(status)
      setPage(0)
    },
    [fetchClients],
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
        <title>{`Merchant Clients | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
            <Typography variant="h4">Linked Merchants</Typography>
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
              <Button
                color={activeFilter === "declined" ? "primary" : "inherit"}
                variant={activeFilter === "declined" ? "contained" : "outlined"}
                onClick={() => handleFilter("declined")}
              >
                Declined
              </Button>
              {activeFilter && (
                <Button color="inherit" variant="outlined" onClick={() => handleFilter(null)}>
                  Clear Filter
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
        <ClientsFilters />
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
            {activeFilter ? "No clients found for the selected filter." : "Please select a filter to view clients."}
          </Typography>
        )}
      </Stack>
    </>
  )
}

function applyPagination(rows: Client[], page: number, rowsPerPage: number): Client[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
}

