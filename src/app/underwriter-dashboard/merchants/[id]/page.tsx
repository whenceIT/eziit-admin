"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Box,
  Stack,
  Snackbar,
} from "@mui/material"
import Grid from "@mui/material/Unstable_Grid2"
import { useUser } from "@/hooks/use-user"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Request {
  id: string
  user_id: string
  request_type: string
  requester_type: string
  requester_id: string
  recipient_type: string
  recipient_id: string
  status: string
  created_at: string
  updated_at: string
}

type AlertSeverity = "success" | "error" | "info" | "warning"

interface MerchantDetails {
  id: number
  user_id: string | null
  name: string
  email: string
  phone: string
  float: number
  merchants: string | null
  transactions: string | null
  employer: string | null
  employer_name?: string
  ratings: number | null
  comments: string | null
  status: string
  created_at?: string
  updated_at?: string
  is_linked?: boolean
  underwriter_id?: string 
}

export default function MerchantDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const merchantId = params.id as string
  const { user } = useUser()

  const [merchant, setMerchant] = React.useState<MerchantDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertSeverity>("success")

  React.useEffect(() => {
    const fetchMerchantDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const merchantResponse = await fetch(`${API_BASE_URL}/merchant/${merchantId}`)
        if (!merchantResponse.ok) throw new Error(`Failed to fetch merchant details: ${merchantResponse.statusText}`)
        const merchantData = await merchantResponse.json()

        let isLinked = false
        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
          if (requestsResponse.ok) {
            const allRequests: Request[] = await requestsResponse.json()
            const relevantRequests = allRequests.filter((req) => {
              if (req.request_type !== "underwriter-merchant") return false
              const involvesUnderwriter = (req.requester_type === "underwriter" && req.requester_id === user.id) ||
                (req.recipient_type === "underwriter" && req.recipient_id === user.id)
              const involvesMerchant = (req.requester_type === "merchant" && req.requester_id === merchantData.user_id) ||
                (req.recipient_type === "merchant" && req.recipient_id === merchantData.user_id)
              return involvesUnderwriter && involvesMerchant
            })

            const approvedRequest = relevantRequests.find(req => req.status === "approved")
            if (approvedRequest) isLinked = true
          }
        } catch (err) {
          console.error("Error checking relationship status:", err)
        }

        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (merchantData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${merchantData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        let underwriterName = "N/A"
        if (merchantData.underwriter_id) {
          const underwriterResponse = await fetch(`${API_BASE_URL}/underwriter/${merchantData.underwriter_id}`)
          if (underwriterResponse.ok) {
            const underwriterData = await underwriterResponse.json()
            underwriterName = underwriterData.name || `Underwriter ID: ${merchantData.underwriter_id}`
          }
        }

        setMerchant({
          id: merchantData.id,
          user_id: merchantData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          float: merchantData.float || 0,
          merchants: merchantData.merchants || "N/A",
          employer: merchantData.employers,
          transactions: merchantData.transactions || "N/A",
          ratings: merchantData.ratings || 0,
          comments: merchantData.comments || "",
          status: merchantData.status || "active",
          created_at: merchantData.created_at,
          updated_at: merchantData.updated_at,
          is_linked: isLinked,
          underwriter_id: merchantData.underwriter_id,
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching merchant details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchMerchantDetails()
  }, [merchantId, user?.id])

  const handleRequestLink = async () => {
    try {
      if (!user?.id || !merchant?.user_id) {
        throw new Error("Missing user or merchant ID")
      }

      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests: Request[] = await requestsResponse.json()
        const pendingRequests = allRequests.filter((req) => {
          if (req.request_type !== "underwriter-merchant" || req.status !== "pending") return false
          const involvesUnderwriter = (req.requester_type === "underwriter" && req.requester_id === user.id) ||
            (req.recipient_type === "underwriter" && req.recipient_id === user.id)
          const involvesMerchant = (req.requester_type === "merchant" && req.requester_id === merchant.user_id) ||
            (req.recipient_type === "merchant" && req.recipient_id === merchant.user_id)
          return involvesUnderwriter && involvesMerchant
        })
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this merchant")
          setSnackbarSeverity("info")
          setSnackbarOpen(true)
          return
        }
      }

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          request_type: "underwriter-merchant",
          requester_type: "underwriter",
          requester_id: user.id,
          recipient_type: "merchant",
          recipient_id: merchant.user_id,
        }),
      })

      if (!response.ok) throw new Error(await response.text() || "Failed to send link request")
      setSnackbarMessage("Link request sent successfully!")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
    } catch (error) {
      console.error("Error requesting link:", error)
      setSnackbarMessage(error instanceof Error ? error.message : "Failed to send link request")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleGoBack = () => {
    router.push("/underwriter-dashboard/merchants/allmerchants")
  }

  const handleCloseSnackbar = () => setSnackbarOpen(false)

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!merchant) return <Alert severity="error">Merchant not found</Alert>

  return (
    <Grid container spacing={3}>
      <Grid xs={12} component="div">
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={handleGoBack} variant="outlined">Back</Button>
          <Typography variant="h4">Merchant Details</Typography>
          <Box />
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={6} component="div">
                <Typography variant="h5" gutterBottom>{merchant.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>Merchant ID: {merchant.id}</Typography>
                {merchant.user_id && <Typography variant="body2" color="text.secondary" gutterBottom>User ID: {merchant.user_id}</Typography>}

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Email:</strong> {merchant.email}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {merchant.phone}</Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Financial Information</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Float:</strong> ${merchant.float}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {merchant.status}</Typography>
                </Stack>
              </Grid>

              <Grid xs={12} md={6} component="div">
                <Typography variant="subtitle1" gutterBottom>Employment Information</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Employer:</strong> {merchant.employer_name}</Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Additional Information</Typography>
                <Stack spacing={1}>
                  <Typography variant="body2"><strong>Ratings:</strong> {merchant.ratings}/5</Typography>
                  <Typography variant="body2"><strong>Comments:</strong> {merchant.comments || "No comments available"}</Typography>
                  {merchant.created_at && <Typography variant="body2"><strong>Created:</strong> {new Date(merchant.created_at).toLocaleString()}</Typography>}
                  {merchant.updated_at && <Typography variant="body2"><strong>Last Updated:</strong> {new Date(merchant.updated_at).toLocaleString()}</Typography>}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>

          <Divider />
          <CardActions>
            {!merchant.is_linked ? (
              <Button variant="contained" color="primary" onClick={handleRequestLink}>Request Link to Merchant</Button>
            ) : (
              <Typography color="success.main">You are already linked to this merchant</Typography>
            )}
          </CardActions>
        </Card>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  )
}
