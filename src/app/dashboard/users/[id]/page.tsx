"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Divider,
  Box,
  Stack,
  Grid,
  Paper,
  Avatar,
} from "@mui/material"
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from "@mui/icons-material"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface UserRating {
  rating: number
  comment: string
  created_at: string
  rater_name: string
}

interface UserDetails {
  id: string
  email: string
  user_type: string
  first_name: string
  last_name: string
  phone?: string
  status?: string
  created_at?: string
  updated_at?: string
  average_rating?: number | null
  ratings?: UserRating[]
}

interface ConnectionCounts {
  merchants: number
  underwriters: number
  employers: number
  clients: number
}

interface Request {
  id: string
  request_type: string
  requester_type: string
  requester_id: string
  recipient_type: string
  recipient_id: string
  status: string
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [user, setUser] = React.useState<UserDetails | null>(null)
  const [connectionCounts, setConnectionCounts] = React.useState<ConnectionCounts>({
    merchants: 0,
    underwriters: 0,
    employers: 0,
    clients: 0
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [loadingRatings, setLoadingRatings] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user details
        const userResponse = await fetch(`${API_BASE_URL}/user/${userId}`)
        if (!userResponse.ok) throw new Error('Failed to fetch user details')
        const userData = await userResponse.json()

        // Fetch all approved requests involving this user
        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        // Filter approved requests where this user is either requester or recipient
        const userRequests: Request[] = allRequests.filter((request: Request) => 
          request.status === 'approved' && 
          ((request.requester_id === userId) || (request.recipient_id === userId))
        )

        // Count connections by type, excluding self-connections
        const counts: ConnectionCounts = {
          merchants: userRequests.filter((req: Request) => 
            (req.requester_type === 'merchant' && req.requester_id !== userId) || 
            (req.recipient_type === 'merchant' && req.recipient_id !== userId)
          ).length,
          
          underwriters: userRequests.filter((req: Request) => 
            (req.requester_type === 'underwriter' && req.requester_id !== userId) || 
            (req.recipient_type === 'underwriter' && req.recipient_id !== userId)
          ).length,
          
          employers: userRequests.filter((req: Request) => 
            (req.requester_type === 'employer' && req.requester_id !== userId) || 
            (req.recipient_type === 'employer' && req.recipient_id !== userId)
          ).length,
          
          clients: userRequests.filter((req: Request) => 
            (req.requester_type === 'client' && req.requester_id !== userId) || 
            (req.recipient_type === 'client' && req.recipient_id !== userId)
          ).length
        }

        setConnectionCounts(counts)
        
        // Now fetch ratings separately
        setLoadingRatings(true)
        try {
          const ratingsResponse: Response = await fetch(`${API_BASE_URL}/user/${userId}/ratings`)
          if (!ratingsResponse.ok) throw new Error('Failed to fetch ratings')
          
          const ratingsData: { ratings: UserRating[] } = await ratingsResponse.json()
          const userRatings: UserRating[] = ratingsData.ratings || []
          
          // Calculate average rating
          let averageRating: number | null = null
          if (userRatings.length > 0) {
            const sum: number = userRatings.reduce((acc: number, curr: UserRating) => acc + curr.rating, 0)
            averageRating = sum / userRatings.length
          }

          setUser({
            ...userData,
            average_rating: averageRating,
            ratings: userRatings,
            phone: userData.phone || "N/A",
            status: userData.status || "active"
          })
        } catch (ratingError) {
          console.error("Error fetching ratings:", ratingError)
          setUser({
            ...userData,
            average_rating: null,
            ratings: [],
            phone: userData.phone || "N/A",
            status: userData.status || "active"
          })
        } finally {
          setLoadingRatings(false)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
        setLoadingRatings(false)
      }
    }

    fetchData()
  }, [userId])

  const handleGoBack = () => router.push("/dashboard/users")

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  )

  if (error) return <Alert severity="error">{error}</Alert>
  if (!user) return <Alert severity="error">User not found</Alert>

  return (
    <Box sx={{ p: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Back to Users
      </Button>

      <Typography variant="h5" gutterBottom>
        User Details
      </Typography>

      <Grid container spacing={3}>
        {/* User Profile Card */}
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
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </Avatar>
                <Typography variant="h5" align="center">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography color="text.secondary" align="center">
                  {user.user_type}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{user.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{user.phone}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography color={user.status === 'active' ? 'success.main' : 'error.main'}>
                    {user.status}
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
                This user is connected to the following entities through approved requests:
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

          {/* Additional User Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography>{user.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography>
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* User Ratings and Comments Section */}
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
                  {user.average_rating !== null && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <StarIcon color="warning" />
                      <Typography variant="h6" ml={0.5}>
                        {user.average_rating?.toFixed(1)}/5
                      </Typography>
                      <Typography variant="caption" color="text.secondary" ml={1}>
                        ({user.ratings?.length || 0} ratings)
                      </Typography>
                    </Box>
                  )}

                  {user.ratings && user.ratings.length > 0 ? (
                    <Stack spacing={2}>
                      {user.ratings
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
                      
                      {user.ratings.filter(r => r.comment).length === 0 && (
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
        </Grid>
      </Grid>
    </Box>
  )
}