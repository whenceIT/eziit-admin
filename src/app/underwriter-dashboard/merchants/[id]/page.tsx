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

interface Rating {
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
  merchant_code: string
  average_rating?: number | null
  transactions: string | null
  stores: string | null
  ratings: Rating[] | null
  status: string
  underwriter_status: string
  underwriter_id: string | null
  created_at?: string
  updated_at?: string
  is_linked?: boolean
  user_rating?: number | null
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
  const { user } = useUser()

  const [merchant, setMerchant] = React.useState<MerchantDetails | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingRatings, setLoadingRatings] = React.useState(true)
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
        console.log("Merchant Data:", merchantData)

        let ratings: Rating[] = []
        let averageRating = null
        if (merchantData.user_id) {
          try {
            const ratingResponse = await fetch(`${API_BASE_URL}/user/${merchantData.user_id}/ratings`)
            if (ratingResponse.ok) {
              const ratingData = await ratingResponse.json()
              if (ratingData.ratings?.length > 0) {
                ratings = ratingData.ratings
                const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
                averageRating = sum / ratings.length
              }
            }
          } catch (err) {
            console.error("Error fetching ratings:", err)
          }
        }
        setLoadingRatings(false)

        if (!merchantData) {
          throw new Error("Received empty merchant data")
        }

        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        
        const merchantRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === merchantData.user_id) || 
          (request.recipient_id === merchantData.user_id)))
        
        const counts = {
          merchants: merchantRequests.filter(req => 
            (req.requester_type === 'merchant' && req.requester_id !== merchantData.user_id) || 
            (req.recipient_type === 'merchant' && req.recipient_id !== merchantData.user_id)
          ).length,
          
          underwriters: merchantRequests.filter(req => 
            (req.requester_type === 'underwriter' && req.requester_id !== merchantData.user_id) || 
            (req.recipient_type === 'underwriter' && req.recipient_id !== merchantData.user_id)
          ).length,
          
          employers: merchantRequests.filter(req => 
            (req.requester_type === 'employer' && req.requester_id !== merchantData.user_id) || 
            (req.recipient_type === 'employer' && req.recipient_id !== merchantData.user_id)
          ).length,
          
          clients: merchantRequests.filter(req => 
            (req.requester_type === 'client' && req.requester_id !== merchantData.user_id) || 
            (req.recipient_type === 'client' && req.recipient_id !== merchantData.user_id)
          ).length
        }

        setConnectionCounts(counts)

        // Check if already linked
        let isLinked = false
        if (user.user_type === 'underwriter') {
          const relevantRequests = allRequests.filter((req) => {
            if (req.request_type !== "underwriter-merchant") return false
            const involvesUnderwriter = 
              (req.requester_type === "underwriter" && req.requester_id === user.id) ||
              (req.recipient_type === "underwriter" && req.recipient_id === user.id)
            const involvesMerchant = 
              (req.requester_type === "merchant" && req.requester_id === merchantData.user_id) ||
              (req.recipient_type === "merchant" && req.recipient_id === merchantData.user_id)
            return involvesUnderwriter && involvesMerchant
          })

          isLinked = relevantRequests.some(req => req.status === "approved")
        }

        // Fetch user details if available
        let userData = { first_name: "", last_name: "", email: "", phone: "" }
        if (merchantData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${merchantData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        setMerchant({
          id: merchantData.id,
          user_id: merchantData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || merchantData.name || "N/A",
          email: userData.email || merchantData.email || "N/A",
          phone: userData.phone || merchantData.phone || "N/A",
          float: merchantData.float || 0,
          merchant_code: merchantData.merchant_code || "N/A",
          transactions: merchantData.transactions || "N/A",
          stores: merchantData.stores || "N/A",
          ratings: ratings,
          status: merchantData.status || "active",
          underwriter_status: merchantData.underwriter_status || "neutral",
          underwriter_id: merchantData.underwriter_id || null,
          created_at: merchantData.created_at,
          updated_at: merchantData.updated_at,
          is_linked: isLinked,
          average_rating: averageRating
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching merchant details:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchMerchantDetails()
  }, [merchantId, user?.id])

  const handleRequestLink = async () => {
    try {
      if (!user?.id || !merchant?.user_id) {
        throw new Error("Missing user or merchant ID")
      }

      // Check for existing pending requests
      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests: Request[] = await requestsResponse.json()
        const pendingRequests = allRequests.filter((req) => {
          if (req.request_type !== "underwriter-merchant" || req.status !== "pending") return false
          const involvesUnderwriter = 
            (req.requester_type === "underwriter" && req.requester_id === user.id) ||
            (req.recipient_type === "underwriter" && req.recipient_id === user.id)
          const involvesMerchant = 
            (req.requester_type === "merchant" && req.requester_id === merchant.user_id) ||
            (req.recipient_type === "merchant" && req.recipient_id === merchant.user_id)
          return involvesUnderwriter && involvesMerchant
        })
        
        if (pendingRequests.length > 0) {
          setSnackbarMessage("A pending link request already exists for this merchant")
          setSnackbarSeverity("info")
          setSnackbarOpen(true)
          return
        }
      }

      // Create new request
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          request_type: "underwriter-merchant",
          requester_type: "underwriter",
          requester_id: user.id,
          recipient_type: "merchant",
          recipient_id: merchant.user_id,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to send link request")
      }

      setSnackbarMessage("Link request sent successfully!")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
      
      // Refresh merchant data to show updated link status
      setMerchant(prev => prev ? { ...prev, is_linked: true } : null)
    } catch (error) {
      console.error("Error requesting link:", error)
      setSnackbarMessage(error instanceof Error ? error.message : "Failed to send link request")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  const handleGoBack = () => {
    router.push("/underwriter-dashboard/merchants/allmerchants")
  }

  const handleCloseSnackbar = () => setSnackbarOpen(false)

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
        {/* Merchant Profile Card */}
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
                  {merchant.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h5" align="center">
                  {merchant.name}
                </Typography>
                <Typography color="text.secondary" align="center">
                  Merchant
                </Typography>
                {/*{merchant.status && (
                  <Chip 
                    label={merchant.status} 
                    color={
                      merchant.status === 'active' ? 'success' : 
                      merchant.status === 'pending' ? 'warning' : 'error'
                    } 
                    sx={{ mt: 1 }}
                  />
                )}*/}
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
                  <Typography variant="subtitle2" color="text.secondary">
                    Merchant Code
                  </Typography>
                  <Typography>{merchant.merchant_code}</Typography>
                </Box>

                <Box>
                  {/*<Typography variant="subtitle2" color="text.secondary">
                    Float Balance
                  </Typography>*/}
                  <Typography>${merchant.float.toLocaleString()}</Typography>
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

          {/* Additional Merchant Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
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

          {/* Link Button */}
          <Card sx={{ mt: 3 }}>   
            <CardActions>
              {user?.user_type === 'underwriter' && !merchant.is_linked && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRequestLink}
                  disabled={!merchant.user_id}
                  fullWidth
                >
                  Request Link to Merchant
                </Button>
              )}
              {user?.user_type === 'underwriter' && merchant.is_linked && (
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}