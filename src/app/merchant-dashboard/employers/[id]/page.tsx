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

// 1. Added Request interface to type API response
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

interface Employer {
  id: number
  user_id: string | null
  name: string
  email: string
  phone: string
  organisation_name?: string | null
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

export default function EmployerDetailsPage(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const employerId = params.id as string
  const { user } = useUser()
  const [employer, setEmployer] = React.useState<Employer | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  // 3. Updated state type to use AlertSeverity
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertSeverity>("success")

  React.useEffect(() => {
    const fetchEmployerDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const employerResponse = await fetch(`${API_BASE_URL}/employer/${employerId}`)
        if (!employerResponse.ok) {
          throw new Error(`Failed to fetch employer details: ${employerResponse.statusText}`)
        }

        const employerData = await employerResponse.json()

        let isLinked = false

        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
          if (requestsResponse.ok) {
            // 4. Added type annotation for API response
            const allRequests: Request[] = await requestsResponse.json()
            
            // 5. Added type annotation for req parameter
            const relevantRequests = allRequests.filter((req: Request) => {
              if (req.request_type !== "merchant-employer" && req.request_type !== "employer-merchant") return false
              
              const involvesMerchant = 
                (req.requester_type === "merchant" && req.requester_id === user.id) || 
                (req.recipient_type === "merchant" && req.recipient_id === user.id)
                
              const involvesEmployer = 
                (req.requester_type === "employer" && req.requester_id === employerData.user_id) || 
                (req.recipient_type === "employer" && req.recipient_id === employerData.user_id)
                
              return involvesMerchant && involvesEmployer
            })
            
            const approvedRequest = relevantRequests.find(req => req.status === "approved")
            if (approvedRequest) {
              isLinked = true
            }
          }
        } catch (err) {
          console.error("Error checking relationship status:", err)
          isLinked = false
        }

        let userData = { first_name: "", last_name: "", email: "", phone: "", organisation_name: "" }
        if (employerData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${employerData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        let employerName = "N/A"
        if (employerData.employer_id) {
          const employerResponse = await fetch(`${API_BASE_URL}/employer/${employerData.employer_id}`)
          if (employerResponse.ok) {
            const employerDetails = await employerResponse.json()
            employerName = employerDetails.name || `Employer ID: ${employerData.employer_id}`
          }
        }

        setEmployer({
          id: employerData.id,
          user_id: employerData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          organisation_name: userData.organisation_name || "N/A",
          float: employerData.float || 0,
          merchants: employerData.merchants || "N/A",
          transactions: employerData.transactions || "N/A",
          employer: employerData.employer_id ? `ID: ${employerData.employer_id}` : "N/A",
          employer_name: employerName,
          ratings: employerData.ratings || 0,
          comments: employerData.comments || "",
          status: employerData.status || "active",
          created_at: employerData.created_at,
          updated_at: employerData.updated_at,
          is_linked: isLinked
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching employer details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchEmployerDetails()
  }, [employerId, user?.id])

  const handleRequestLink = async () => {
    try {
      if (!user?.id) {
        throw new Error("Merchant not authenticated")
      }

      if (!employer?.user_id) {
        throw new Error("Employer has no associated user ID")
      }

      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        
        const allRequests: Request[] = await requestsResponse.json()
        
       
        const pendingRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "merchant-employer") return false
          if (req.status !== "pending") return false
        
          const involvesMerchant = 
            (req.requester_type === "merchant" && req.requester_id === user.id) || 
            (req.recipient_type === "merchant" && req.recipient_id === user.id)
            
          const involvesEmployer = 
            (req.requester_type === "employer" && req.requester_id === employer.user_id) || 
            (req.recipient_type === "employer" && req.recipient_id === employer.user_id)
            
          return involvesMerchant && involvesEmployer
        })
        
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this employer")
          setSnackbarSeverity("info") 
          setSnackbarOpen(true)
          return
        }
      }

      const requestPayload = {
        user_id: user.id,
        request_type: "merchant-employer",
        requester_type: "merchant",
        requester_id: user.id,
        recipient_type: "employer",
        recipient_id: employer.user_id
      }

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
    } catch (error) {
      console.error("Error requesting link:", error)
      setSnackbarMessage(error instanceof Error ? error.message : "Failed to send link request")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleGoBack = () => {
    router.push("/merchant-dashboard/employers/allemployers")
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!employer) return <Alert severity="error">Employer not found</Alert>

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={handleGoBack} variant="outlined">
            Back
          </Button>
          <Typography variant="h4">Employer Details</Typography>
          <Box />
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {employer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employer ID: {employer.id}
                </Typography>
                {employer.user_id && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User ID: {employer.user_id}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {employer.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {employer.phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Organization:</strong> {employer.organisation_name}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Financial Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Float:</strong> ${employer.float}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {employer.status}
                  </Typography>
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Additional Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Ratings:</strong> {employer.ratings}/5
                  </Typography>
                  <Typography variant="body2">
                    <strong>Comments:</strong> {employer.comments || "No comments available"}
                  </Typography>
                  {employer.created_at && (
                    <Typography variant="body2">
                      <strong>Created:</strong> {new Date(employer.created_at).toLocaleString()}
                    </Typography>
                  )}
                  {employer.updated_at && (
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> {new Date(employer.updated_at).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions>
            {!employer.is_linked && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRequestLink}
                disabled={!user?.id || !employer.user_id}
              >
                Request Link to Employer
              </Button>
            )}
            {employer.is_linked && (
              <Typography color="success.main">
                You are already linked to this employer
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