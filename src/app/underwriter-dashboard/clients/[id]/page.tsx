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

interface ClientDetails {
  id: number
  user_id: number | null
  name: string
  email: string
  phone: string
  float: number
  merchants: string | null
  transactions: string | null
  employer_id?: string | null
  employer_name?: string
  ratings: number | null
  comments: string | null
  created_at?: string
  is_linked?: boolean
  updated_at?: string
}

export default function ClientDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const { user } = useUser()
  const [client, setClient] = React.useState<ClientDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertSeverity>("success") 

  React.useEffect(() => {
    const fetchClientDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        // Fetch client details
        const clientResponse = await fetch(`${API_BASE_URL}/client/${clientId}`)
        if (!clientResponse.ok) {
          throw new Error(`Failed to fetch client details: ${clientResponse.statusText}`)
        }

        const clientData = await clientResponse.json()
        console.log("Client Data:", clientData)

        // Check relationship status
        let isLinked = false

        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
          if (requestsResponse.ok) {
            const allRequests: Request[] = await requestsResponse.json()
            
            const relevantRequests = allRequests.filter((req: Request) => {
              if (req.request_type !== "underwriter-client") return false
              
              const involvesUnderwriter = 
                (req.requester_type === "underwriter" && req.requester_id === user.id) || 
                (req.recipient_type === "underwriter" && req.recipient_id === user.id)
                
              const involvesClient = 
                (req.requester_type === "client" && req.requester_id === clientData.user_id) || 
                (req.recipient_type === "client" && req.recipient_id === clientData.user_id)
                
              return involvesUnderwriter && involvesClient
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

        // Fetch user details
        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (clientData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${clientData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        //HERE CHECK THIS 
        let employerName = "N/A"
        if (clientData.employer_id) {
          const employerResponse = await fetch(`${API_BASE_URL}/employer/${clientData.employer_id}`)
          if (employerResponse.ok) {
            const employerData = await employerResponse.json()
            employerName = employerData.name || `Employer ID: ${clientData.employer_id}`
          }
        }

        setClient({
          id: clientData.id,
          user_id: clientData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          float: clientData.float || 0,
          merchants: clientData.merchants || "N/A",
          transactions: clientData.transactions || "N/A",
          employer_id: clientData.employer_id || null,
          employer_name: employerName,
          ratings: clientData.ratings || 0,
          comments: clientData.comments || "",
          created_at: clientData.created_at,
          updated_at: clientData.updated_at,
          is_linked: isLinked
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching client details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchClientDetails()
  }, [clientId, user?.id])

  const handleRequestLink = async () => {
    try {
      if (!user?.id) {
        throw new Error("Merchant not authenticated")
      }

      if (!client?.user_id) {
        throw new Error("Client has no associated user ID")
      }

      // Check for existing pending requests
      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests: Request[] = await requestsResponse.json()
        
        const pendingRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "underwriter-client") return false
          if (req.status !== "pending") return false
        
          const involvesUnderwriter = 
            (req.requester_type === "underwriter" && req.requester_id === user.id) || 
            (req.recipient_type === "underwriter" && req.recipient_id === user.id)
            
            const involvesClient = 
            (req.requester_type === "client" && Number(req.requester_id) === Number(client.user_id)) || 
            (req.recipient_type === "client" && Number(req.recipient_id) === Number(client.user_id))
            
          return involvesUnderwriter && involvesClient
        })
        
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this client")
          setSnackbarSeverity("info")
          setSnackbarOpen(true)
          return
        }
      }

      // Create new request
      const requestPayload = {
        user_id: user.id,
        request_type: "underwriter-client",
        requester_type: "underwriter",
        requester_id: user.id,
        recipient_type: "client",
        recipient_id: client.user_id 
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
      
      // Refresh client data to update is_linked status
      const clientResponse = await fetch(`${API_BASE_URL}/client/${clientId}`)
      if (clientResponse.ok) {
        const clientData = await clientResponse.json()
        setClient(prev => prev ? {...prev, is_linked: true} : null)
      }
    } catch (error) {
      console.error("Error requesting link:", error)
      setSnackbarMessage(error instanceof Error ? error.message : "Failed to send link request")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleGoBack = () => {
    router.push("/underwriter-dashboard/clients/allclients")
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!client) return <Alert severity="error">Client not found</Alert>

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={handleGoBack} variant="outlined">
            Back to All Clients
          </Button>
          <Typography variant="h4">Client Details</Typography>
          <Box /> {/* Empty box for flex spacing */}
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Client ID: {client.id}
                </Typography>
                {client.user_id && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User ID: {client.user_id}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {client.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {client.phone}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Financial Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Float:</strong> ${client.float.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Transactions:</strong> {client.transactions}
                  </Typography>
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Employment Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Employer:</strong> {client.employer_name || "N/A"}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Additional Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Ratings:</strong> {client.ratings}/5
                  </Typography>
                  <Typography variant="body2">
                    <strong>Comments:</strong> {client.comments || "No comments available"}
                  </Typography>
                  {client.created_at && (
                    <Typography variant="body2">
                      <strong>Created:</strong> {new Date(client.created_at).toLocaleString()}
                    </Typography>
                  )}
                  {client.updated_at && (
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> {new Date(client.updated_at).toLocaleString()}
                    </Typography>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions>
            {!client.is_linked && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRequestLink}
                disabled={!user?.id || !client.user_id}
              >
                Request Link to Client
              </Button>
            )}
            {client.is_linked && (
              <Typography color="success.main">
                You are already linked to this client
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