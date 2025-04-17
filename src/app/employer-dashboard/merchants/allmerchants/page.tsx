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
import { EmployerMerchantsTable, type Merchant } from "@/components/dashboard/employer/employer-merchants"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

export default function AllMerchants(): React.JSX.Element {
  const [merchants, setMerchants] = React.useState<Merchant[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const { user } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    const fetchAllMerchants = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const merchantsResponse = await fetch(`${API_BASE_URL}/merchants`)
        if (!merchantsResponse.ok) {
          throw new Error(`Failed to fetch merchants: ${merchantsResponse.statusText}`)
        }

        const merchantsData = await merchantsResponse.json()
        console.log("All Merchants Data:", merchantsData)

        const merchantsWithUserDetails = await Promise.all(
          merchantsData.map(async (merchant: any) => {
            let name = "N/A"
            let email = "N/A"
            let phone = "N/A"

            if (merchant.user_id) {
              try {
                const userResponse = await fetch(`${API_BASE_URL}/user/${merchant.user_id}`)
                
                if (userResponse.ok) {
                  const userData = await userResponse.json()
                  const userInfo = userData.user || userData
                  
                  if (userInfo) {
                    name = `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() || "N/A"
                    email = userInfo.email || "N/A"
                    phone = userInfo.phone || "N/A"
                  }
                }
              } catch (userErr) {
                console.error(`Error fetching user details for merchant ${merchant.id}:`, userErr)
              }
            }

            return {
              id: merchant.id,
              user_id: merchant.user_id,
              merchant_code: merchant.merchant_code || "N/A",
              transactions: merchant.transactions || "N/A",
              stores: merchant.stores || "N/A",
              ratings: merchant.ratings || 0,
              comments: merchant.comments || "N/A",
              clients: merchant.clients || "N/A",
              employers: merchant.employers || "N/A",
              status: merchant.status || "N/A",
              underwriter_status: merchant.underwriter_status || "neutral",
              underwriter_id: merchant.underwriter_id || "N/A",
              name,
              email,
              phone,
              float: merchant.float || 0
            } satisfies Merchant
          })
        )

        setMerchants(merchantsWithUserDetails)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchAllMerchants()
  }, [user])

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewDetails = (merchantId: number) => {
    router.push(`/employer-dashboard/merchants/${merchantId}`)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedMerchants = merchants.slice(startIndex, endIndex)

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Typography variant="h4" gutterBottom>
          All Merchants
        </Typography>
        {merchants.length === 0 ? (
          <Alert severity="info">No merchants found.</Alert>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <EmployerMerchantsTable 
              merchants={paginatedMerchants} 
              onViewDetails={handleViewDetails} 
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={merchants.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}