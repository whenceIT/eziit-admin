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
  Grid,
  Snackbar,
  Paper,
  Avatar,
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

interface UnderwriterDetails {
  id: number
  user_id: string | null
  name: string
  email: string
  phone: string
  organisation: string | null
  float: number | null
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

interface UserRating {
  rating: number
  comment: string
  created_at: string
  rater_name: string
}

interface ConnectionCounts {
  merchants: number
  underwriters: number
  employers: number
  clients: number
}

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

export default function UnderwriterDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const underwriterId = params.id as string
  const { user } = useUser()

  const [underwriter, setUnderwriter] = useState<UnderwriterDetails | null>(null)
  const [connectionCounts, setConnectionCounts] = useState<ConnectionCounts>({
    merchants: 0,
    underwriters: 0,
    employers: 0,
    clients: 0
  })
  const [loading, setLoading] = useState(true)
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success")

  useEffect(() => {
    const fetchUnderwriterDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
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

        // Fetch all requests to count connections
        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        // Filter approved requests where this underwriter is either requester or recipient
        const underwriterRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === underwriterData.user_id) || 
          (request.recipient_id === underwriterData.user_id))
        )
        
        // Count connections by type, excluding self-connections
        const counts = {
          merchants: underwriterRequests.filter(req => 
            (req.requester_type === 'merchant' && req.requester_id !== underwriterData.user_id) || 
            (req.recipient_type === 'merchant' && req.recipient_id !== underwriterData.user_id)
          ).length,
          
          underwriters: underwriterRequests.filter(req => 
            (req.requester_type === 'underwriter' && req.requester_id !== underwriterData.user_id) || 
            (req.recipient_type === 'underwriter' && req.recipient_id !== underwriterData.user_id)
          ).length,
          
          employers: underwriterRequests.filter(req => 
            (req.requester_type === 'employer' && req.requester_id !== underwriterData.user_id) || 
            (req.recipient_type === 'employer' && req.recipient_id !== underwriterData.user_id)
          ).length,
          
          clients: underwriterRequests.filter(req => 
            (req.requester_type === 'client' && req.requester_id !== underwriterData.user_id) || 
            (req.recipient_type === 'client' && req.recipient_id !== underwriterData.user_id)
          ).length
        }

        setConnectionCounts(counts)

        let isLinked = false
        const relevantRequests = allRequests.filter((req: Request) => {
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
        
        const approvedRequest = relevantRequests.find((req: Request) => req.status === "approved")
        if (approvedRequest) {
          isLinked = true
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

        // Fetch employer name if available
        let employerName = "N/A"
        if (underwriterData.employer_id) {
          const employerResponse = await fetch(`${API_BASE_URL}/employer/${underwriterData.employer_id}`)
          if (employerResponse.ok) {
            const employerData = await employerResponse.json()
            employerName = employerData.name || `Employer ID: ${underwriterData.employer_id}`
          }
        }

        // Fetch ratings and comments
        setLoadingRatings(true)
        let averageRating = null
        let underwriterRatings: UserRating[] = []
        
        try {
          if (underwriterData.user_id) {
            const ratingsResponse = await fetch(`${API_BASE_URL}/user/${underwriterData.user_id}/ratings`)
            if (!ratingsResponse.ok) throw new Error('Failed to fetch ratings')
            
            const ratingsData = await ratingsResponse.json()
            underwriterRatings = ratingsData.ratings || []
            
            // Calculate average rating
            if (underwriterRatings.length > 0) {
              const sum = underwriterRatings.reduce((acc, curr) => acc + curr.rating, 0)
              averageRating = sum / underwriterRatings.length
            }
          }
        } catch (ratingError) {
          console.error("Error fetching ratings:", ratingError)
        } finally {
          setLoadingRatings(false)
        }

        setUnderwriter({
          id: underwriterData.id,
          user_id: underwriterData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || underwriterData.name || "N/A",
          email: userData.email || underwriterData.email || "N/A",
          phone: userData.phone || underwriterData.phone || "N/A",
          organisation: underwriterData.organisation || "N/A",
          float: underwriterData.float || 0,
          transactions: underwriterData.transactions || "N/A",
          employer: underwriterData.employer_id ? `ID: ${underwriterData.employer_id}` : "N/A",
          employer_name: employerName,
          comments: underwriterData.comments || "",
          status: underwriterData.status || "active",
          created_at: underwriterData.created_at,
          updated_at: underwriterData.updated_at,
          is_linked: isLinked,
          average_rating: averageRating,
          ratings: underwriterRatings
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
        
        const pendingRequests = allRequests.filter((req: Request) => {
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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
    <Box sx={{ p: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Back to Underwriters
      </Button>

      <Typography variant="h5" gutterBottom>
        Underwriter Details
      </Typography>

      <Grid container spacing={3}>
        {/* Underwriter Profile Card */}
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
                  {underwriter.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h5" align="center">
                  {underwriter.name}
                </Typography>
                <Typography color="text.secondary" align="center">
                  Underwriter
                </Typography>
                {underwriter.organisation && (
                  <Typography color="text.secondary" align="center">
                    {underwriter.organisation}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{underwriter.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{underwriter.phone}</Typography>
                </Box>

                <Box>
                  {/*<Typography variant="subtitle2" color="text.secondary">
                    Rating
                  </Typography>
                  <Typography>
                    {underwriter.average_rating ? `${underwriter.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                  </Typography>*/}
                </Box>

                {/*<Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Float Balance
                  </Typography>
                  <Typography>${underwriter.float?.toLocaleString() || '0'}</Typography>
                </Box>*/}
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
                This underwriter is connected to the following entities through approved requests:
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

          {/* Additional Underwriter Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Underwriter ID
                  </Typography>
                  <Typography>{underwriter.id}</Typography>
                </Grid>
                {underwriter.user_id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography>{underwriter.user_id}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Organisation
                  </Typography>
                  <Typography>{underwriter.organisation}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Typography>
                    {underwriter.average_rating ? `${underwriter.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                  </Typography>
                </Grid>
                {underwriter.created_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Created
                    </Typography>
                    <Typography>
                      {new Date(underwriter.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {underwriter.updated_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography>
                      {new Date(underwriter.updated_at).toLocaleDateString()}
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
                            {underwriter.average_rating !== null && (
                              <Box display="flex" alignItems="center" mb={2}>
                                <StarIcon color="warning" />
                                <Typography variant="h6" ml={0.5}>
                                  {underwriter.average_rating?.toFixed(1)}/5
                                </Typography>
                                <Typography variant="caption" color="text.secondary" ml={1}>
                                  ({underwriter.ratings?.length || 0} ratings)
                                </Typography>
                              </Box>
                            )}
          
                            {underwriter.ratings && underwriter.ratings.length > 0 ? (
                              <Stack spacing={2}>
                                {underwriter.ratings
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
                                
                                {underwriter.ratings.filter(r => r.comment).length === 0 && (
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
          {/* Ratings Display Section 
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ratings & Reviews
              </Typography>
              
              {loadingRatings ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                underwriter.ratings && underwriter.ratings.length > 0 ? (
                  <Stack spacing={2}>
                    {underwriter.ratings.map((rating, index) => (
                      <Paper key={index} elevation={0} sx={{ 
                        p: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1
                      }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight="bold">{rating.rater_name}</Typography>
                          <Chip 
                            label={`${rating.rating}/5`} 
                            color="primary" 
                            size="small" 
                          />
                        </Box>
                        {rating.comment && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {rating.comment}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          Rated on: {new Date(rating.created_at).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No ratings available for this underwriter
                  </Typography>
                )
              )}
            </CardContent>
          </Card>*/}

          {/* Link Button */}
          <Card sx={{ mt: 3 }}>
            <CardActions>
              {!underwriter.is_linked ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRequestLink}
                  disabled={!user?.id || !underwriter.user_id}
                  fullWidth
                >
                  Request Link to Underwriter
                </Button>
              ) : (
                <Typography color="success.main" sx={{ p: 2 }}>
                  You are already linked to this underwriter
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