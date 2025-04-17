"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Grid from "@mui/material/Unstable_Grid2"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TablePagination from "@mui/material/TablePagination"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
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
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/merchants`)
        if (!response.ok) throw new Error(`Failed to fetch merchant relationships: ${response.statusText}`)
        
        const data = await response.json()
        console.log("Relationship API Response:", data)

        if (!data.merchants || data.merchants.length === 0) {
          setMerchants([])
          setLoading(false)
          return
        }

        const merchantDetails = await Promise.all(
          data.merchants.map(async (rel: any) => {
            try {
              const merchantUserId = rel.recipient_type === 'merchant' 
                ? rel.recipient_id 
                : rel.requester_id;

              const userResponse = await fetch(`${API_BASE_URL}/user/${merchantUserId}`)
              if (!userResponse.ok) throw new Error("User not found")
              const userData = await userResponse.json()

              const merchantResponse = await fetch(`${API_BASE_URL}/merchants?user_id=${merchantUserId}`)
              if (!merchantResponse.ok) throw new Error("Merchant record not found")
              const merchantData = await merchantResponse.json()
              
              const merchantRecord = Array.isArray(merchantData) 
                ? merchantData.find((c: any) => c.user_id === merchantUserId)
                : merchantData;

              if (!merchantRecord) throw new Error("No matching merchant record found")

                return {
                  id: merchantRecord.id,
                  user_id: userData.id,
                  name: `${userData.first_name} ${userData.last_name}`,
                  email: userData.email,
                  phone: userData.phone || null,
                  float: Number(merchantRecord.float) || 0,
                  ratings: merchantRecord.ratings || null,
                  merchant_code: merchantRecord.merchant_code || null,
                  status: merchantRecord.status || null,
                  transactions: merchantRecord.transactions || null,
                  stores: merchantRecord.stores || null,
                  comments: merchantRecord.comments || null,
                  clients: merchantRecord.clients || null,
                  employers: merchantRecord.employers || null,
                  underwriter_status: merchantRecord.underwriter_status || null,
                  underwriter_id: merchantRecord.underwriter_id || null
                } satisfies Merchant
            } catch (err) {
              console.error(`Error loading merchant details:`, err)
              return null
            }
          })
        )

        setMerchants(merchantDetails.filter(Boolean) as Merchant[])
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
          My Linked Merchants
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