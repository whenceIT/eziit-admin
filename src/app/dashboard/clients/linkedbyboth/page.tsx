"use client"

import type * as React from "react"
import { useEffect, useState, useCallback } from "react"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Head from "next/head"

import { config } from "@/config"
import { ClientsFilters } from "@/components/dashboard/client/clients-filters"
import { ClientsTable } from "@/components/dashboard/client/clients-table"
import type { Client } from "@/components/dashboard/client/clients-table"

export default function LinkedByBothClientsPage(): React.JSX.Element {
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("https://ezitt.whencefinancesystem.com/clients")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json()

      const transformedData = data
        .filter((client: any) => client.employer_status === "approved" && client.merchant_status === "approved")
        .map((client: any) => ({
          id: client.id ?? null,
          user_id: client.user_id ?? "N/A",
          float: client.float ?? 0,
          merchants: client.merchants ?? "N/A",
          transactions: client.transactions ?? "N/A",
          employer: client.employer ?? "N/A",
          ratings: client.ratings ?? 0,
          comments: client.comments ?? "",
          employer_status: client.employer_status,
          merchant_status: client.merchant_status,
          declined_by: client.declined_by ?? null,
        }))

      setClients(transformedData)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

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
        <title>{`Linked by Both | Dashboard | ${config.site.name}`}</title>
      </Head>

      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
            <Typography variant="h4">Clients Linked by Both</Typography>
            <Typography color="text.secondary" variant="body2">
              Clients approved by both merchants and employers
            </Typography>
          </Stack>
        </Stack>
        <ClientsFilters />
        <ClientsTable
          count={clients.length}
          rows={paginatedClients}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Stack>
    </>
  )
}

function applyPagination(rows: Client[], page: number, rowsPerPage: number): Client[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
}

