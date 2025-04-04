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
  Chip,
  Snackbar,
} from "@mui/material"
import Grid from "@mui/material/Unstable_Grid2"
import { useUser } from "@/hooks/use-user"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface UnderwriterDetails {
  id: number
  user_id: number | null
  name: string
  email: string
  phone: string
  organisation_name: string
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
}

export default function UnderwriterDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const underwriterId = params.id as string
  const { user } = useUser()

  const [underwriter, setUnderwriter] = React.useState<UnderwriterDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error" | "info">("success")

  React.useEffect(() => {
    const fetchUnderwriterDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
    
        const underwriterResponse = await fetch(`${API_BASE_URL}/underwriter/${underwriterId}`)
        if (!underwriterResponse.ok) {
          throw new Error(`Failed to fetch underwriter details: ${underwriterResponse.statusText}`)
        }

        const underwriterData = await underwriterResponse.json()
        console.log("Underwriter Data:", underwriterData)

        let isLinked = false

        try {

          const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
          if (requestsResponse.ok) {
            const allRequests = await requestsResponse.json()
            console.log('All requests:', allRequests)
            
            const relevantRequests = allRequests.filter((req: any) => {
            
              if (req.request_type !== "merchant-underwriter") return false
     
              const involvesUser = 
                (req.requester_type === "merchant" && req.requester_id === user.id) || 
                (req.recipient_type === "merchant" && req.recipient_id === user.id)
                
              const involvesUnderwriter = 
                (req.requester_type === "underwriter" && req.requester_id === underwriterData.user_id) || 
                (req.recipient_type === "underwriter" && req.recipient_id === underwriterData.user_id)
                
              return involvesUser && involvesUnderwriter
            })
            
            console.log('Relevant requests:', relevantRequests)
    
            const approvedRequest = relevantRequests.find((req: any) => req.status === "approved")
            if (approvedRequest) {
              isLinked = true
            }
          }
        } catch (err) {
          console.error("Error checking relationship status:", err)
          isLinked = false
        }

        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (underwriterData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${underwriterData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        setUnderwriter({
          id: underwriterData.id,
          user_id: underwriterData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          organisation_name: underwriterData.organisation_name || "N/A",
          float: underwriterData.float || 0,
          merchants: underwriterData.merchants || "N/A",
          transactions: underwriterData.transactions || "N/A",
          employer: underwriterData.employer_id ? `ID: ${underwriterData.employer_id}` : "N/A",
          ratings: underwriterData.ratings || 0,
          comments: underwriterData.comments || "",
          status: underwriterData.status || "active",
          created_at: underwriterData.created_at,
          updated_at: underwriterData.updated_at,
          is_linked: isLinked
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching underwriter details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchUnderwriterDetails()
  }, [underwriterId, user?.id])

  const handleRequestLink = async () => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      if (!underwriter?.user_id) {
        throw new Error("Underwriter has no associated user ID")
      }

      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests = await requestsResponse.json()
        
        const pendingRequests = allRequests.filter((req: any) => {
          if (req.request_type !== "merchant-underwriter") return false
          if (req.status !== "pending") return false
          
          const involvesUser = 
            (req.requester_type === "merchant" && req.requester_id === user.id) || 
            (req.recipient_type === "merchant" && req.recipient_id === user.id)
            
          const involvesUnderwriter = 
            (req.requester_type === "underwriter" && req.requester_id === underwriter.user_id) || 
            (req.recipient_type === "underwriter" && req.recipient_id === underwriter.user_id)
            
          return involvesUser && involvesUnderwriter
        })
        
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this underwriter")
          setSnackbarSeverity("info")
          setSnackbarOpen(true)
          return
        }
      }

      const requestPayload = {
        user_id: user.id,
        request_type: "merchant-underwriter",
        requester_type: "merchant",
        requester_id: user.id,
        recipient_type: "underwriter",
        recipient_id: underwriter.user_id
      }

      console.log("Sending request payload:", requestPayload)

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Failed to send link request")
      }

      const responseData = await response.json()
      console.log("Request created successfully:", responseData)

      setSnackbarMessage("Link request sent successfully!")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
      setUnderwriter(prev => prev ? {...prev, is_linked: false} : null)
    } catch (error) {
      console.error("Error requesting link:", error)
      setSnackbarMessage(error instanceof Error ? error.message : "Failed to send link request")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleGoBack = () => {
    router.push("/merchant-dashboard/underwriters/allunderwriters")
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!underwriter) return <Alert severity="error">Underwriter not found</Alert>

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={handleGoBack} variant="outlined">
            Back to Underwriters
          </Button>
          <Typography variant="h4">Underwriter Details</Typography>
          <Box />
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {underwriter.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Underwriter ID: {underwriter.id}
                </Typography>
                {underwriter.user_id && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User ID: {underwriter.user_id}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {underwriter.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {underwriter.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Organisation:</strong> {underwriter.organisation_name}
                  </Typography>
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Information
                </Typography>
                <Stack spacing={1}>
                  {/*<Typography variant="body2">
                    <strong>Status:</strong> <Chip label={underwriter.status} color={underwriter.status === "active" ? "success" : "default"} size="small" />
                  </Typography>*/}
                  {underwriter.created_at && (
                    <Typography variant="body2">
                      <strong>Created:</strong> {new Date(underwriter.created_at).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions>
            {!underwriter.is_linked ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRequestLink}
                disabled={!user?.id || !underwriter.user_id}
              >
                Request Link to Underwriter
              </Button>
            ) : (
              <Typography color="success.main">
                You are already linked to this underwriter
              </Typography>
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