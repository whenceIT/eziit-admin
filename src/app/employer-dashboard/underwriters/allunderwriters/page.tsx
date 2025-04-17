"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import TablePagination from "@mui/material/TablePagination"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { UnderwriterTable, type Underwriter } from "@/components/dashboard/employer/underwriters-table"

const API_BASE_URL = "http://localhost:5000" //"https://ezitt.whencefinancesystem.com"

export default function EmployerUnderwriters(): React.JSX.Element {
  const [underwriters, setUnderwriters] = React.useState<Underwriter[]>([]) // Added type here
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    const fetchAllUnderwriters = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const underwritersResponse = await fetch(`${API_BASE_URL}/underwriters`)
        if (!underwritersResponse.ok) {
          throw new Error(`Failed to fetch underwriters: ${underwritersResponse.statusText}`)
        }

        const underwritersData = await underwritersResponse.json()
        console.log("All Underwriters Data:", underwritersData)

        const processedUnderwriters = await Promise.all(
          underwritersData.map(async (underwriter: any) => {
            try {
              let name = "N/A"
              if (underwriter.user_id) {
                const userResponse = await fetch(`${API_BASE_URL}/user/${underwriter.user_id}`)
                if (userResponse.ok) {
                  const userData = await userResponse.json()
                  name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A"
                }
              }

              return {
                id: underwriter.id,
                user_id: underwriter.user_id,
                name: name,
                organisation_name: underwriter.organisation_name || "N/A",
                email: underwriter.email || "N/A",
                phone: underwriter.phone || "N/A",
              } satisfies Underwriter
            } catch (error) {
              console.error(`Error processing underwriter ${underwriter.id}:`, error)
              return {
                id: underwriter.id,
                user_id: underwriter.user_id,
                name: "Error loading underwriter",
                organisation_name: "N/A",
                email: "N/A",
                phone: "N/A",
              } satisfies Underwriter
            }
          })
        )

        setUnderwriters(processedUnderwriters)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchAllUnderwriters()
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewDetails = (underwriterId: number) => {
    router.push(`/employer-dashboard/underwriters/${underwriterId}`)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedUnderwriters = underwriters.slice(startIndex, endIndex)

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          All Underwriters
        </Typography>
        {underwriters.length === 0 ? (
          <Alert severity="info">No underwriters found.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <UnderwriterTable
              underwriters={paginatedUnderwriters}
              count={underwriters.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}