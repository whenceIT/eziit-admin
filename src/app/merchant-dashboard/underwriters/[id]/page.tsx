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
  Grid,
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
} from "@mui/icons-material"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Request {
  id: string
  user_id: string
  request_type: string
  requester_type: string
  requester_id: number
  recipient_type: string
  recipient_id: number
  status: string
  created_at: string
  updated_at: string
}

interface UserRating {
  rating: number
  comment: string
  created_at: string
  rater_name: string
}

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

export default function UnderwriterDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const underwriterId = params.id as string
  const { user } = useUser()
  const [underwriter, setUnderwriter] = React.useState<UnderwriterDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingRatings, setLoadingRatings] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error" | "info">("success")
  const [connectionCounts, setConnectionCounts] = React.useState<ConnectionCounts>({
    merchants: 0,
    underwriters: 0,
    employers: 0,
    clients: 0
  })

  React.useEffect(() => {
    const fetchUnderwriterDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        const underwriterResponse = await fetch(`${API_BASE_URL}/underwriter/${underwriterId}`)
        if (!underwriterResponse.ok) {
          throw new Error(`Failed to fetch underwriter details: ${underwriterResponse.statusText}`)
        }

        const underwriterData = await underwriterResponse.json()
        console.log("Underwriter Data:", underwriterData)

        if (!underwriterData) {
          throw new Error("Received empty underwriter data")
        }

        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        const underwriterRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === underwriterData.user_id) || 
          (request.recipient_id === underwriterData.user_id)))
        
      
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
          if (req.request_type !== "merchant-underwriter") return false
          
          const involvesUser = 
            (req.requester_type === "merchant" && req.requester_id === Number(user.id)) || 
            (req.recipient_type === "merchant" && req.recipient_id === Number(user.id))
            
          const involvesUnderwriter = 
            (req.requester_type === "underwriter" && req.requester_id === underwriterData.user_id) || 
            (req.recipient_type === "underwriter" && req.recipient_id === underwriterData.user_id)
            
          return involvesUser && involvesUnderwriter
        })
        
        const approvedRequest = relevantRequests.find(req => req.status === "approved")
        if (approvedRequest) {
          isLinked = true
        }

        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (underwriterData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${underwriterData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
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
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          organisation_name: underwriterData.organisation_name || "N/A",
          float: underwriterData.float || 0,
          merchants: underwriterData.merchants || "N/A",
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
        
        const pendingRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "merchant-underwriter") return false
          if (req.status !== "pending") return false
          
          const involvesUser = 
            (req.requester_type === "merchant" && req.requester_id === Number (user.id)) || 
            (req.recipient_type === "merchant" && req.recipient_id === Number (user.id))
            
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
    router.push("/merchant-dashboard/underwriters/allunderwriters")
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
  if (!underwriter) return <Alert severity="error">Underwriter not found</Alert>

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
                {underwriter.organisation_name && (
                  <Typography color="text.secondary" align="center">
                    {underwriter.organisation_name}
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
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Typography>
                    {underwriter.average_rating ? `${underwriter.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                  </Typography>
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
                  <Typography>{underwriter.organisation_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employer
                  </Typography>
                  <Typography>{underwriter.employer_name || "N/A"}</Typography>
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

          {/* Ratings Display Section */}
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
          </Card>

          {/* Link Button */}
          <Card sx={{ mt: 3 }}>
            <CardActions>
              {!underwriter.is_linked && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRequestLink}
                  disabled={!user?.id || !underwriter.user_id}
                  fullWidth
                >
                  Request Link to Underwriter
                </Button>
              )}
              {underwriter.is_linked && (
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