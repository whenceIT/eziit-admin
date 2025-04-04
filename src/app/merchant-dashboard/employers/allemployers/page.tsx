"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TablePagination from "@mui/material/TablePagination"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { EmployersTable } from "@/components/dashboard/merchant/employers-table"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

export interface Employer {
  id: number
  user_id: number | null
  name: string
  email: string
  phone: string | null
  float: number | null
  organisation_name: string
  merchants: string | null
  transactions: string | null
  employer: string | null
  ratings: number | null
  comments: string | null
  status: "approved" | "pending" | "declined"
  
}

export default function AllEmployers(): React.JSX.Element {
  const router = useRouter()
  const [employers, setEmployers] = React.useState<Employer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()

  React.useEffect(() => {
    const fetchAllEmployers = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        // Fetch all employers from the database
        const employersResponse = await fetch(`${API_BASE_URL}/employers`)
        if (!employersResponse.ok) {
          throw new Error(`Failed to fetch employers: ${employersResponse.statusText}`)
        }

        const employersData = await employersResponse.json()
        console.log("All Employers Data:", employersData)

        // Process employer data
        const processedEmployers = await Promise.all(
          employersData.map(async (employer: any) => {
            try {
              // Fetch user details if user_id exists
              let name = "N/A"
              let email = "N/A"
              let phone = "N/A"
              let organisation_name = "N/A"
              if (employer.user_id) {
                const userResponse = await fetch(`${API_BASE_URL}/user/${employer.user_id}`)
                if (userResponse.ok) {
                  const userData = await userResponse.json()
                  name = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A"
                  email = userData.email || "N/A"
                  phone = userData.phone || "N/A"
                  organisation_name = userData.organisation_name || "N/A"
                }
              }

              return {
                id: employer.id,
                user_id: employer.user_id,
                name: name,
                email: email,
                phone: phone,
                organisation_name: employer.organisation_name ,
                float: employer.float || 0,
                merchants: employer.merchants || "N/A",
                transactions: employer.transactions || "N/A",
                employer: employer.employer_id ? `ID: ${employer.employer_id}` : "N/A",
                ratings: employer.ratings || 0,
                comments: employer.comments || "",
                status: employer.status || "pending"
                
              }
            } catch (error) {
              console.error(`Error processing employer ${employer.id}:`, error)
              return {
                id: employer.id,
                user_id: employer.user_id,
                name: "Error loading employer",
                email: "N/A",
                phone: "N/A",
                float: 0,
                merchants: "N/A",
                transactions: "N/A",
                employer: "N/A",
                ratings: 0,
                comments: "",
                status: "pending" as const,
                organisation_name: null
              }
            }
          }),
        )

        setEmployers(processedEmployers)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchAllEmployers()
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewDetails = (employerId: number) => {
    router.push(`/merchant-dashboard/employers/${employerId}`)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedEmployers = employers.slice(startIndex, endIndex)

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          All Employers
        </Typography>
        {employers.length === 0 ? (
          <Alert severity="info">No employers found.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <EmployersTable 
              employers={paginatedEmployers} 
              count={employers.length}
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


