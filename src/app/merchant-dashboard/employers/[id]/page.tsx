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
  comments: string | null
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

export default function EmployerDetailsPage(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const employerId = params.id as string
  const { user } = useUser()
  const [employer, setEmployer] = React.useState<Employer | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingRatings, setLoadingRatings] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertSeverity>("success")
  const [connectionCounts, setConnectionCounts] = React.useState<ConnectionCounts>({
    merchants: 0,
    underwriters: 0,
    employers: 0,
    clients: 0
  })

  React.useEffect(() => {
    const fetchEmployerDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        const employerResponse = await fetch(`${API_BASE_URL}/employer/${employerId}`)
        if (!employerResponse.ok) {
          throw new Error(`Failed to fetch employer details: ${employerResponse.statusText}`)
        }

        const employerData = await employerResponse.json()

        if (!employerData) {
          throw new Error("Received empty employer data")
        }

        // Fetch all requests to count connections
        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        // Filter approved requests where this employer is either requester or recipient
        const employerRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === employerData.user_id) || 
          (request.recipient_id === employerData.user_id))
        )
        
        // Count connections by type, excluding self-connections
        const counts = {
          merchants: employerRequests.filter(req => 
            (req.requester_type === 'merchant' && req.requester_id !== employerData.user_id) || 
            (req.recipient_type === 'merchant' && req.recipient_id !== employerData.user_id)
          ).length,
          
          underwriters: employerRequests.filter(req => 
            (req.requester_type === 'underwriter' && req.requester_id !== employerData.user_id) || 
            (req.recipient_type === 'underwriter' && req.recipient_id !== employerData.user_id)
          ).length,
          
          employers: employerRequests.filter(req => 
            (req.requester_type === 'employer' && req.requester_id !== employerData.user_id) || 
            (req.recipient_type === 'employer' && req.recipient_id !== employerData.user_id)
          ).length,
          
          clients: employerRequests.filter(req => 
            (req.requester_type === 'client' && req.requester_id !== employerData.user_id) || 
            (req.recipient_type === 'client' && req.recipient_id !== employerData.user_id)
          ).length
        }

        setConnectionCounts(counts)

        let isLinked = false
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

        // Fetch ratings and comments
        setLoadingRatings(true)
        let averageRating = null
        let employerRatings: UserRating[] = []
        
        try {
          if (employerData.user_id) {
            const ratingsResponse = await fetch(`${API_BASE_URL}/user/${employerData.user_id}/ratings`)
            if (!ratingsResponse.ok) throw new Error('Failed to fetch ratings')
            
            const ratingsData = await ratingsResponse.json()
            employerRatings = ratingsData.ratings || []
            
            // Calculate average rating
            if (employerRatings.length > 0) {
              const sum = employerRatings.reduce((acc, curr) => acc + curr.rating, 0)
              averageRating = sum / employerRatings.length
            }
          }
        } catch (ratingError) {
          console.error("Error fetching ratings:", ratingError)
        } finally {
          setLoadingRatings(false)
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
          comments: employerData.comments || "",
          status: employerData.status || "active",
          created_at: employerData.created_at,
          updated_at: employerData.updated_at,
          is_linked: isLinked,
          average_rating: averageRating,
          ratings: employerRatings
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

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  )

  if (error) return <Alert severity="error">{error}</Alert>
  if (!employer) return <Alert severity="error">Employer not found</Alert>

  return (
    <Box sx={{ p: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Back to Employers
      </Button>

      <Typography variant="h5" gutterBottom>
        Employer Details
      </Typography>

      <Grid container spacing={3}>
        {/* Employer Profile Card */}
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
                  {employer.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h5" align="center">
                  {employer.name}
                </Typography>
                <Typography color="text.secondary" align="center">
                  Employer
                </Typography>
                {employer.organisation_name && (
                  <Typography color="text.secondary" align="center">
                    {employer.organisation_name}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{employer.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{employer.phone}</Typography>
                </Box>

                <Box>
                  {/*<Typography variant="subtitle2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Typography>
                    {employer.average_rating ? `${employer.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                  </Typography>*/}
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
                This employer is connected to the following entities through approved requests:
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
                      Clients
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Employer Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employer ID
                  </Typography>
                  <Typography>{employer.id}</Typography>
                </Grid>
                {employer.user_id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography>{employer.user_id}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Organisation
                  </Typography>
                  <Typography>{employer.organisation_name || "N/A"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Typography>
                    {employer.average_rating ? `${employer.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                  </Typography>
                </Grid>
                {employer.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Created
                    </Typography>
                    <Typography>
                      {new Date(employer.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {employer.updated_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography>
                      {new Date(employer.updated_at).toLocaleDateString()}
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
                            {employer.average_rating !== null && (
                              <Box display="flex" alignItems="center" mb={2}>
                                <StarIcon color="warning" />
                                <Typography variant="h6" ml={0.5}>
                                  {employer.average_rating?.toFixed(1)}/5
                                </Typography>
                                <Typography variant="caption" color="text.secondary" ml={1}>
                                  ({employer.ratings?.length || 0} ratings)
                                </Typography>
                              </Box>
                            )}
          
                            {employer.ratings && employer.ratings.length > 0 ? (
                              <Stack spacing={2}>
                                {employer.ratings
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
                                
                                {employer.ratings.filter(r => r.comment).length === 0 && (
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
              {!employer.is_linked && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRequestLink}
                  disabled={!user?.id || !employer.user_id}
                  fullWidth
                >
                  Request Link to Employer
                </Button>
              )}
              {employer.is_linked && (
                <Typography color="success.main" sx={{ p: 2 }}>
                  You are already linked to this employer
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