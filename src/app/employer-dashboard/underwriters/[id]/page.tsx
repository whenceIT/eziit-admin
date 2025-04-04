"use client"

import React, { useEffect, useState } from "react"
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

const API_BASE_URL = "http://localhost:5000" 

interface UnderwriterDetails {
  id: number
  user_id: string | null
  name: string
  email: string
  phone: string
  organisation_name: string | null
  float: number | null
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

  const [underwriter, setUnderwriter] = useState<UnderwriterDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success")

  // Debug logging
  console.log("Rendering UnderwriterDetails component")
  console.log("Params:", params)
  console.log("Underwriter ID:", underwriterId)
  console.log("User:", user)

  useEffect(() => {
    const fetchUnderwriterDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching underwriter details for ID: ${underwriterId}`)
        
        const underwriterResponse = await fetch(`${API_BASE_URL}/underwriter/${underwriterId}`)
        
        if (!underwriterResponse.ok) {
          const errorText = await underwriterResponse.text()
          throw new Error(`Failed to fetch underwriter: ${underwriterResponse.status} - ${errorText}`)
        }

        const underwriterData = await underwriterResponse.json()
        console.log("Underwriter Data:", underwriterData)

        if (!underwriterData) {
          throw new Error("Received empty underwriter data")
        }

        let isLinked = false
        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
          if (requestsResponse.ok) {
            const allRequests = await requestsResponse.json()
            console.log('All requests:', allRequests)
            
            const relevantRequests = allRequests.filter((req: any) => {
              if (req.request_type !== "employer-underwriter") return false
              
              const involvesUser = 
                (req.requester_type === "employer" && req.requester_id === user.id) || 
                (req.recipient_type === "employer" && req.recipient_id === user.id)
                
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
        }

        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (underwriterData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${underwriterData.user_id}`)
          if (userResponse.ok) {
            const userData_response = await userResponse.json()
            userData = userData_response.user || userData_response
            console.log("User data:", userData)
          }
        }

        setUnderwriter({
          id: underwriterData.id,
          user_id: underwriterData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || underwriterData.name || "N/A",
          email: userData.email || underwriterData.email || "N/A",
          phone: userData.phone || underwriterData.phone || "N/A",
          organisation_name: underwriterData.organisation_name || "N/A",
          float: underwriterData.float || 0,
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
        console.error("Detailed error:", {
          error: err,
          message: err instanceof Error ? err.message : "Unknown error"
        })
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchUnderwriterDetails()

 
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [underwriterId, user?.id, loading])

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
          if (req.request_type !== "employer-underwriter") return false
          if (req.status !== "pending") return false
          
          const involvesUser = 
            (req.requester_type === "employer" && req.requester_id === user.id) || 
            (req.recipient_type === "employer" && req.recipient_id === user.id)
            
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

      // Create new request
      const requestPayload = {
        user_id: user.id,
        request_type: "employer-underwriter",
        requester_type: "employer",
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
        throw new Error(errorText || "Failed to send link request")
      }

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
    router.push("/employer-dashboard/underwriters/allunderwriters")
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {timeoutReached ? (
          <Alert severity="warning">
            Loading is taking longer than expected. Please check your network connection.
          </Alert>
        ) : (
          <>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading underwriter details...</Typography>
          </>
        )}
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    )
  }

  if (!underwriter) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Underwriter not found
        <Button onClick={handleGoBack} sx={{ ml: 2 }}>Back to Underwriters</Button>
      </Alert>
    )
  }

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
                  {underwriter.organisation_name && (
                    <Typography variant="body2">
                      <strong>Organisation:</strong> {underwriter.organisation_name}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Status:</strong> <Chip 
                      label={underwriter.status} 
                      color={underwriter.status === "active" || underwriter.status === "approved" ? "success" : "default"} 
                      size="small" 
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Float:</strong> {underwriter.float !== null ? `$${underwriter.float.toLocaleString()}` : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Ratings:</strong> {underwriter.ratings !== null ? `${underwriter.ratings}/5` : 'N/A'}
                  </Typography>
                  {underwriter.created_at && (
                    <Typography variant="body2">
                      <strong>Created:</strong> {new Date(underwriter.created_at).toLocaleString()}
                    </Typography>
                  )}
                  {underwriter.is_linked && (
                    <Typography variant="body2" color="success.main">
                      <strong>Connection Status:</strong> Linked
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