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
  Grid,
  Paper,
  Avatar,
  Chip,
} from "@mui/material"
import { useUser } from "@/hooks/use-user"
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from "@mui/icons-material"

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

interface UserRating {
  rating: number
  comment: string
  created_at: string
  rater_name: string
}

interface ClientDetails {
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
  status: string
  created_at?: string
  updated_at?: string
  is_linked?: boolean
  average_rating?: number | null
  ratings?: UserRating[]
}

interface ConnectionCounts {
  merchants: number
  underwriters: number
  employers: number
  clients: number
}

export default function ClientDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const { user } = useUser()
  const [client, setClient] = React.useState<ClientDetails | null>(null)
  const [connectionCounts, setConnectionCounts] = React.useState<ConnectionCounts>({
    merchants: 0,
    underwriters: 0,
    employers: 0,
    clients: 0
  })
  const [loading, setLoading] = React.useState(true)
  const [loadingRatings, setLoadingRatings] = React.useState(false)
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
        setLoading(true)
        
        // Fetch client details
        const clientResponse = await fetch(`${API_BASE_URL}/client/${clientId}`)
        if (!clientResponse.ok) {
          throw new Error(`Failed to fetch client details: ${clientResponse.statusText}`)
        }

        const clientData = await clientResponse.json()

        if (!clientData) {
          throw new Error("Received empty client data")
        }

        // Fetch all requests to count connections
        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        // Filter approved requests where this client is either requester or recipient
        const clientRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === clientData.user_id) || 
          (request.recipient_id === clientData.user_id)))
        
        // Count connections by type, excluding self-connections
        const counts = {
          merchants: clientRequests.filter(req => 
            (req.requester_type === 'merchant' && req.requester_id !== clientData.user_id) || 
            (req.recipient_type === 'merchant' && req.recipient_id !== clientData.user_id)
          ).length,
          
          underwriters: clientRequests.filter(req => 
            (req.requester_type === 'underwriter' && req.requester_id !== clientData.user_id) || 
            (req.recipient_type === 'underwriter' && req.recipient_id !== clientData.user_id)
          ).length,
          
          employers: clientRequests.filter(req => 
            (req.requester_type === 'employer' && req.requester_id !== clientData.user_id) || 
            (req.recipient_type === 'employer' && req.recipient_id !== clientData.user_id)
          ).length,
          
          clients: clientRequests.filter(req => 
            (req.requester_type === 'client' && req.requester_id !== clientData.user_id) || 
            (req.recipient_type === 'client' && req.recipient_id !== clientData.user_id)
          ).length
        }

        setConnectionCounts(counts)

        let isLinked = false
        const relevantRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "merchant-client") return false
          
          const involvesEmployer = 
            (req.requester_type === "employer" && req.requester_id === user.id) || 
            (req.recipient_type === "employer" && req.recipient_id === user.id)
            
          const involvesClient = 
            (req.requester_type === "client" && req.requester_id === clientData.user_id) || 
            (req.recipient_type === "client" && req.recipient_id === clientData.user_id)
            
          return involvesEmployer && involvesClient
        })
        
        const approvedRequest = relevantRequests.find(req => req.status === "approved")
        if (approvedRequest) {
          isLinked = true
        }

        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (clientData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${clientData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        let employerName = "N/A"
        if (clientData.employer_id) {
          const employerResponse = await fetch(`${API_BASE_URL}/employer/${clientData.employer_id}`)
          if (employerResponse.ok) {
            const employerData = await employerResponse.json()
            employerName = employerData.name || `Employer ID: ${clientData.employer_id}`
          }
        }

        // Fetch ratings and comments
        setLoadingRatings(true)
        try {
          const ratingsResponse = await fetch(`${API_BASE_URL}/user/${clientData.user_id}/ratings`)
          if (!ratingsResponse.ok) throw new Error('Failed to fetch ratings')
          
          const ratingsData = await ratingsResponse.json()
          const clientRatings = ratingsData.ratings || []
          
          // Calculate average rating
          let averageRating = null
          if (clientRatings.length > 0) {
            const sum: number = clientRatings.reduce((acc: number, curr: UserRating) => acc + curr.rating, 0)
            averageRating = sum / clientRatings.length
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
            employer: clientData.employer_id ? `ID: ${clientData.employer_id}` : "N/A",
            employer_name: employerName,
            status: clientData.status || "active",
            created_at: clientData.created_at,
            updated_at: clientData.updated_at,
            is_linked: isLinked,
            average_rating: averageRating,
            ratings: clientRatings
          })
        } catch (ratingError) {
          console.error("Error fetching ratings:", ratingError)
          setClient({
            id: clientData.id,
            user_id: clientData.user_id,
            name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
            email: userData.email || "N/A",
            phone: userData.phone || "N/A",
            float: clientData.float || 0,
            merchants: clientData.merchants || "N/A",
            transactions: clientData.transactions || "N/A",
            employer: clientData.employer_id ? `ID: ${clientData.employer_id}` : "N/A",
            employer_name: employerName,
            status: clientData.status || "active",
            created_at: clientData.created_at,
            updated_at: clientData.updated_at,
            is_linked: isLinked,
            average_rating: null,
            ratings: []
          })
        } finally {
          setLoadingRatings(false)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching client details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
        setLoadingRatings(false)
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

    
      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests: Request[] = await requestsResponse.json()
        
        const pendingRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "merchant-client") return false
          if (req.status !== "pending") return false
        
          const involvesEmployer = 
            (req.requester_type === "employer" && req.requester_id === user.id) || 
            (req.recipient_type === "employer" && req.recipient_id === user.id)
            
          const involvesClient = 
            (req.requester_type === "client" && req.requester_id === client.user_id) || 
            (req.recipient_type === "client" && req.recipient_id === client.user_id)
            
          return involvesEmployer && involvesClient
        })
        
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this client")
          setSnackbarSeverity("info")
          setSnackbarOpen(true)
          return
        }
      }

      const requestPayload = {
        user_id: user.id,
        request_type: "employer-client",
        requester_type: "employer",
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
    } catch (error) {
      console.error("Error requesting link:", error)
      setSnackbarMessage(error instanceof Error ? error.message : "Failed to send link request")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleGoBack = () => {
    router.push("/employer-dashboard/employees/allclients")
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  )

  if (error) return <Alert severity="error">{error}</Alert>
  if (!client) return <Alert severity="error">Client not found</Alert>

  return (
    <Box sx={{ p: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Back to Clients
      </Button>

      <Typography variant="h5" gutterBottom>
        Client Details
      </Typography>

      <Grid container spacing={3}>
        {/* Client Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" p={2}>
                <Avatar sx={{ 
                  width: 120, 
                  height: 120, 
                  fontSize: 48,
                  mb: 2,
                  bgcolor: 'primary.main'
                }}>
                  {client.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h5" align="center">
                  {client.name}
                </Typography>
                <Typography color="text.secondary" align="center">
                  Client
                </Typography>
                {/*{client.average_rating !== null && (
                  <Box display="flex" alignItems="center" mt={1}>
                    <StarIcon color="warning" />
                    <Typography variant="h6" ml={0.5}>
                      {client.average_rating?.toFixed(1)}/5
                    </Typography>
                    <Typography variant="caption" color="text.secondary" ml={1}>
                      ({client.ratings?.length || 0} ratings)
                    </Typography>
                  </Box>
                )}*/}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{client.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{client.phone}</Typography>
                </Box>

                <Box>
                  {/*<Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography 
                    color={client.status === 'active' ? 'success.main' : 'error.main'}
                  >
                    {client.status}
                  </Typography>*/}
                </Box>

                <Box>
                  {/*<Typography variant="subtitle2" color="text.secondary">
                    Float Balance
                  </Typography>
                  <Typography>${client.float}</Typography>*/}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          {/* Connections Overview */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connections
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This client is connected to the following entities through approved requests:
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center'
                  }}>
                    <StoreIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {connectionCounts.merchants}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Merchants
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center'
                  }}>
                    <GavelIcon color="secondary" sx={{ fontSize: 40 }} />
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {connectionCounts.underwriters}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Underwriters
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center'
                  }}>
                    <BusinessIcon color="info" sx={{ fontSize: 40 }} />
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {connectionCounts.employers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employers
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center'
                  }}>
                    <PeopleIcon color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {connectionCounts.clients}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Other Clients
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Client Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client ID
                  </Typography>
                  <Typography>{client.id}</Typography>
                </Grid>
                {client.user_id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography>{client.user_id}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employer
                  </Typography>
                  <Typography>{client.employer_name}</Typography>
                </Grid>
                {client.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Created
                    </Typography>
                    <Typography>
                      {new Date(client.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {client.updated_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography>
                      {new Date(client.updated_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Ratings and Comments Section */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ratings & Comments
              </Typography>
              
              {loadingRatings ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {client.average_rating !== null && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <StarIcon color="warning" />
                      <Typography variant="h6" ml={0.5}>
                        {client.average_rating?.toFixed(1)}/5
                      </Typography>
                      <Typography variant="caption" color="text.secondary" ml={1}>
                        ({client.ratings?.length || 0} ratings)
                      </Typography>
                    </Box>
                  )}

                  {client.ratings && client.ratings.length > 0 ? (
                    <Stack spacing={2}>
                      {client.ratings
                        .filter(rating => rating.comment) // Only show ratings with comments
                        .map((rating, index) => (
                          <Paper key={index} elevation={2} sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography fontWeight="bold">
                                {rating.rater_name}
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <StarIcon color="warning" fontSize="small" />
                                <Typography ml={0.5}>{rating.rating}/5</Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {rating.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                              {new Date(rating.created_at).toLocaleString()}
                            </Typography>
                          </Paper>
                        ))}
                      
                      {client.ratings.filter(r => r.comment).length === 0 && (
                        <Typography color="text.secondary">No comments available</Typography>
                      )}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">
                      No ratings or comments yet
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Link Button */}
          <Card sx={{ mt: 3 }}>
            <CardActions>
              {!client.is_linked && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRequestLink}
                  disabled={!user?.id || !client.user_id}
                  fullWidth
                >
                  Request Link to Client
                </Button>
              )}
              {client.is_linked && (
                <Typography color="success.main" sx={{ p: 2 }}>
                  You are already linked to this client
                </Typography>
              )}
            </CardActions>
          </Card>
        </Grid>
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
    </Box>
  )
}