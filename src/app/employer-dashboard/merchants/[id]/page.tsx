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
  Grid,
  Stack,
  Snackbar,
  Paper,
  Avatar,
} from "@mui/material"
import { useUser as useUserHook } from "@/hooks/use-user"
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

export default function MerchantDetails(): React.JSX.Element {
  const params = useParams()
  const router = useRouter()
  const merchantId = params.id as string
  const { user } = useUserHook()
  const [merchant, setMerchant] = React.useState<MerchantDetails | null>(null)
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
    const fetchMerchantDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        // Fetch merchant details
        const merchantResponse = await fetch(`${API_BASE_URL}/merchant/${merchantId}`)
        if (!merchantResponse.ok) {
          throw new Error(`Failed to fetch merchant details: ${merchantResponse.statusText}`)
        }
        const merchantData = await merchantResponse.json()

        if (!merchantData) {
          throw new Error("Received empty merchant data")
        }

        // Fetch all requests to get connections
        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()

        // Filter approved requests involving this merchant
        const merchantUserId = merchantData.user_id
        const userRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === merchantUserId) || (request.recipient_id === merchantUserId))
        )

        // Count connections by type, excluding self-connections
        const counts = {
          merchants: userRequests.filter(req => 
            (req.requester_type === 'merchant' && req.requester_id !== merchantUserId) || 
            (req.recipient_type === 'merchant' && req.recipient_id !== merchantUserId)
          ).length,
          
          underwriters: userRequests.filter(req => 
            (req.requester_type === 'underwriter' && req.requester_id !== merchantUserId) || 
            (req.recipient_type === 'underwriter' && req.recipient_id !== merchantUserId)
          ).length,
          
          employers: userRequests.filter(req => 
            (req.requester_type === 'employer' && req.requester_id !== merchantUserId) || 
            (req.recipient_type === 'employer' && req.recipient_id !== merchantUserId)
          ).length,
          
          clients: userRequests.filter(req => 
            (req.requester_type === 'client' && req.requester_id !== merchantUserId) || 
            (req.recipient_type === 'client' && req.recipient_id !== merchantUserId)
          ).length
        }

        setConnectionCounts(counts)


        let isLinked = false
        if (user.user_type === 'employer') {
          const relevantRequests = allRequests.filter((req: Request) => {
            if (req.request_type !== "employer-merchant") return false
            
            const involvesEmployer = 
              (req.requester_type === "employer" && req.requester_id === user.id) || 
              (req.recipient_type === "employer" && req.recipient_id === user.id)
              
            const involvesMerchant = 
              (req.requester_type === "merchant" && req.requester_id === merchantData.user_id) || 
              (req.recipient_type === "merchant" && req.recipient_id === merchantData.user_id)
              
            return involvesEmployer && involvesMerchant
          })
          
          isLinked = relevantRequests.some(req => req.status === "approved")
        }

        
        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (merchantData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${merchantData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

       
        let employerName = "N/A"
        if (merchantData.employer_id) {
          const employerResponse = await fetch(`${API_BASE_URL}/employer/${merchantData.employer_id}`)
          if (employerResponse.ok) {
            const employerData = await employerResponse.json()
            employerName = employerData.name || `Employer ID: ${merchantData.employer_id}`
          }
        }

        setLoadingRatings(true)
        let averageRating = null
        let merchantRatings: UserRating[] = []
        
        try {
          if (merchantData.user_id) {
            const ratingsResponse = await fetch(`${API_BASE_URL}/user/${merchantData.user_id}/ratings`)
            if (!ratingsResponse.ok) throw new Error('Failed to fetch ratings')
            
            const ratingsData = await ratingsResponse.json()
            merchantRatings = ratingsData.ratings || []
            
           
            if (merchantRatings.length > 0) {
              const sum = merchantRatings.reduce((acc, curr) => acc + curr.rating, 0)
              averageRating = sum / merchantRatings.length
            }
          }
        } catch (ratingError) {
          console.error("Error fetching ratings:", ratingError)
        } finally {
          setLoadingRatings(false)
        }

        setMerchant({
          id: merchantData.id,
          user_id: merchantData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          float: merchantData.float || 0,
          merchants: merchantData.merchants || "N/A",
          transactions: merchantData.transactions || "N/A",
          employer: merchantData.employer_id ? `ID: ${merchantData.employer_id}` : "N/A",
          employer_name: employerName,
          comments: merchantData.comments || "",
          status: merchantData.status || "active",
          created_at: merchantData.created_at,
          updated_at: merchantData.updated_at,
          is_linked: isLinked,
          average_rating: averageRating,
          ratings: merchantRatings
        })
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching merchant details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchMerchantDetails()
  }, [merchantId, user?.id, user?.user_type])

  const handleRequestLink = async () => {
    try {
      if (!user?.id) {
        throw new Error("Merchant not authenticated")
      }

      if (!merchant?.user_id) {
        throw new Error("Merchant has no associated user ID")
      }

      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests: Request[] = await requestsResponse.json()
        
        const pendingRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "employer-merchant") return false
          if (req.status !== "pending") return false
        
          const involvesEmployer = 
            (req.requester_type === "employer" && req.requester_id === user.id) || 
            (req.recipient_type === "employer" && req.recipient_id === user.id)
            
          const involvesMerchant = 
            (req.requester_type === "merchant" && req.requester_id === merchant.user_id) || 
            (req.recipient_type === "merchant" && req.recipient_id === merchant.user_id)
            
          return involvesEmployer && involvesMerchant
        })
        
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this merchant")
          setSnackbarSeverity("info")
          setSnackbarOpen(true)
          return
        }
      }

     
      const requestPayload = {
        user_id: user.id,
        request_type: "employer-merchant",
        requester_type: "employer",
        requester_id: user.id,
        recipient_type: "merchant",
        recipient_id: merchant.user_id 
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
    router.push("/employer-dashboard/merchants/allmerchants")
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
  if (!merchant) return <Alert severity="error">Merchant not found</Alert>

  return (
    <Box sx={{ p: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 1 }}
      >
        Back to Merchants
      </Button>

      <Typography variant="h5" gutterBottom>
        Merchant Details
      </Typography>

      <Grid container spacing={3}>
        
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
                  {merchant.name.split(' ').map(n => n.charAt(0)).join('')}
                </Avatar>
                <Typography variant="h5" align="center">
                  {merchant.name}
                </Typography>
                <Typography color="text.secondary" align="center">
                  Merchant
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{merchant.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{merchant.phone}</Typography>
                </Box>

                <Box>
                  {/*<Typography variant="subtitle2" color="text.secondary">
                    Rating
                  </Typography>
                  <Typography>
                    {merchant.average_rating ? `${merchant.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                  </Typography>*/}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connections
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This merchant is connected to the following entities through approved requests:
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

          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Merchant ID
                  </Typography>
                  <Typography>{merchant.id}</Typography>
                </Grid>
                {merchant.user_id && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography>{merchant.user_id}</Typography>
                  </Grid>
                )}
              </Grid>



              
            </CardContent>
          
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
                              {merchant.average_rating !== null && (
                                <Box display="flex" alignItems="center" mb={2}>
                                  <StarIcon color="warning" />
                                  <Typography variant="h6" ml={0.5}>
                                    {merchant.average_rating?.toFixed(1)}/5
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" ml={1}>
                                    ({merchant.ratings?.length || 0} ratings)
                                  </Typography>
                                </Box>
                              )}
            
                              {merchant.ratings && merchant.ratings.length > 0 ? (
                                <Stack spacing={2}>
                                  {merchant.ratings
                                    .filter(rating => rating.comment) 
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
                                  
                                  {merchant.ratings.filter(r => r.comment).length === 0 && (
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
          </Card>
            <Card sx={{ mt: 3 }}>   
            <CardActions>
              {user?.user_type === 'employer' && !merchant.is_linked && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRequestLink}
                  disabled={!merchant.user_id}
                >
                  Request Link to Merchant
                </Button>
              )}
              {user?.user_type === 'employer' && merchant.is_linked && (
                <Typography color="success.main" sx={{ p: 2 }}>
                  You are already linked to this merchant
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

{/*function useUser(): { user: any } {
  throw new Error("Function not implemented.")
}*/}
