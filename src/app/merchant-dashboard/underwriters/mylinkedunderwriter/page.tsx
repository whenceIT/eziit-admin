"use client"

import * as React from "react"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { UnderwritersTable } from "@/components/dashboard/merchant/underwriters-table"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

export interface Underwriter {
  id: number
  name: string
  email: string
  phone: string | null
  organisation_name: string
  status: string
  float?: number
  ratings?: number
}

export default function UnderwriterPage(): React.JSX.Element {
  const [underwriters, setUnderwriters] = React.useState<Underwriter[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    const fetchUnderwriters = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/underwriters`)
        if (!response.ok) throw new Error(`Failed to fetch underwriter relationships: ${response.statusText}`)
        
        const data = await response.json()
        console.log("Relationship API Response:", data)

        if (!data.underwriters || data.underwriters.length === 0) {
          setUnderwriters([])
          setLoading(false)
          return
        }

        const underwriterDetails = await Promise.all(
          data.underwriters.map(async (rel: any) => {
            try {
              const underwriterUserId = rel.recipient_type === 'underwriter' 
                ? rel.recipient_id 
                : rel.requester_id

              const userResponse = await fetch(`${API_BASE_URL}/user/${underwriterUserId}`)
              if (!userResponse.ok) throw new Error("User not found")
              const userData = await userResponse.json()

              const underwriterResponse = await fetch(`${API_BASE_URL}/underwriters?user_id=${underwriterUserId}`)
              if (!underwriterResponse.ok) throw new Error("Underwriter record not found")
              const underwriterData = await underwriterResponse.json()

              const underwriterRecord = Array.isArray(underwriterData) 
                ? underwriterData.find((c: any) => c.user_id === underwriterUserId)
                : underwriterData

              if (!underwriterRecord) throw new Error("No matching underwriter record found")

              return {
                id: underwriterRecord.id,
                userId: underwriterData.id,
                name: `${userData.first_name} ${userData.last_name}`,
                email: userData.email,
                phone: userData.phone || "N/A",
                organisation_name: underwriterData.organisation_name || "N/A",
                float: Number(underwriterData.float) || 0,
                ratings: underwriterData.ratings || 0
              }
            } catch (err) {
              console.error(`Error loading underwriter details:`, err)
              return null
            }
          })
        )

        setUnderwriters(underwriterDetails.filter(Boolean) as Underwriter[])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching underwriters:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchUnderwriters()
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewDetails = (underwriterId: number) => {
    router.push(`/merchant-dashboard/underwriters/${underwriterId}`)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          My Underwriters
        </Typography>
        <UnderwritersTable 
          underwriters={underwriters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          onViewDetails={handleViewDetails}
          count={underwriters.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </Grid>
  )
}
