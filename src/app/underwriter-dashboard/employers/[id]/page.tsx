"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "@mui/material";
//import Grid from "@mui/material/Unstable_Grid2";
import { useUser } from "@/hooks/use-user";
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from "@mui/icons-material"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

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

interface EmployerDetails {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  phone: string;
  float: number;
  merchants: string | null
  transactions: string | null
  ratings: number | null;
  reviews: Rating[] | null
  comments: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  is_linked?: boolean
  user_rating?: number | null
}

interface Rating {
  rating: number
  comment: string
  created_at: string
  rater_name: string
}

interface UserRatings {
  rateeId: string
  total: number
  ratings: Rating[]
}

interface ConnectionCounts {
  merchants: number
  underwriters: number
  employers: number
  clients: number
}

export default function EmployerDetails(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const employerId = params.id as string;
  const { user } = useUser();
  const [employer, setEmployer] = React.useState<EmployerDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<AlertSeverity>("success");
  const [connectionCounts, setConnectionCounts] = React.useState<ConnectionCounts>({
        merchants: 0,
        underwriters: 0,
        employers: 0,
        clients: 0
      })

  React.useEffect(() => {
    const fetchEmployerDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        // Fetch employer details
        const employerResponse = await fetch(`${API_BASE_URL}/employer/${employerId}`)
        if (!employerResponse.ok) {
          throw new Error(`Failed to fetch employer details: ${employerResponse.statusText}`)
        }

        const employerData = await employerResponse.json()
        console.log("Employer Data:", employerData)

        // Fetch user ratings
        let userRating = null
        let userRatingsData: UserRatings | null = null

        if (employerData.user_id) {
          const ratingResponse = await fetch(`${API_BASE_URL}/user/${employerData.user_id}/ratings`)
          if (ratingResponse.ok) {
            userRatingsData = await ratingResponse.json()
            // Calculate average rating if ratings exist
            if ((userRatingsData?.ratings ?? []).length > 0) {
              const sum = (userRatingsData?.ratings ?? []).reduce((acc, curr) => acc + curr.rating, 0)
              userRating = userRatingsData ? sum / userRatingsData.ratings.length : null
            }
          }
        }


        if (!employerData) {
          throw new Error("Received empty employer data")
        }

        // Fetch all requests to count connections
        const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
        if (!requestsResponse.ok) throw new Error('Failed to fetch connections')
        const allRequests: Request[] = await requestsResponse.json()
        
        // Filter approved requests where this client is either requester or recipient
        const employerRequests = allRequests.filter(request => 
          request.status === 'approved' && 
          ((request.requester_id === employerData.user_id) || 
          (request.recipient_id === employerData.user_id)))
        
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


        // Check relationship status
        let isLinked = false

        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
          if (requestsResponse.ok) {
            const allRequests: Request[] = await requestsResponse.json()
            
            const relevantRequests = allRequests.filter((req: Request) => {
              if (req.request_type !== "underwriter-employer") return false
              
              const involvesUnderwriter = 
                (req.requester_type === "underwriter" && req.requester_id === user.id) || 
                (req.recipient_type === "underwriter" && req.recipient_id === user.id)
                
              const involvesEmployer = 
                (req.requester_type === "employer" && req.requester_id === employerData.user_id) || 
                (req.recipient_type === "employer" && req.recipient_id === employerData.user_id)
                
              return involvesUnderwriter && involvesEmployer
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
        if (employerData.user_id) {
          const userResponse = await fetch(`${API_BASE_URL}/user/${employerData.user_id}`)
          if (userResponse.ok) {
            userData = await userResponse.json()
          }
        }

        // Fetch employer details
        let employerName = "N/A"
        if (employerData.employer_id) {
          const employerResponse = await fetch(`${API_BASE_URL}/employer/${employerData.employer_id}`)
          if (employerResponse.ok) {
            const employerData = await employerResponse.json()
            employerName = employerData.name || `Employer ID: ${employerData.employer_id}`
          }
        }

        setEmployer({
          id: employerData.id,
          user_id: employerData.user_id,
          name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          float: employerData.float || 0,
          merchants: employerData.merchants || "N/A",
          transactions: employerData.transactions || "N/A",
          //employer: employerData.employer_id ? `ID: ${employerData.employer_id}` : "N/A",
          //employer_name: employerName,
          user_rating: userRating,
          ratings: employerData.ratings || 0,
          reviews: userRatingsData?.ratings || null,
          comments: employerData.comments || "",
          status: employerData.status || "active",
          created_at: employerData.created_at,
          updated_at: employerData.updated_at,
          is_linked: isLinked
        })

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employer details:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchEmployerDetails();
  }, [employerId, user?.id]);

  const handleRequestLink = async () => {
    try {
      if (!user?.id) {
        throw new Error("Merchant not authenticated")
      }

      if (!employer?.user_id) {
        throw new Error("Client has no associated user ID")
      }

      // Check for existing pending requests
      const requestsResponse = await fetch(`${API_BASE_URL}/requests`)
      if (requestsResponse.ok) {
        const allRequests: Request[] = await requestsResponse.json()
        
        const pendingRequests = allRequests.filter((req: Request) => {
          if (req.request_type !== "underwriter-employer") return false
          if (req.status !== "pending") return false
        
          const involvesUnderwriter = 
            (req.requester_type === "underwriter" && req.requester_id === user.id) || 
            (req.recipient_type === "underwriter" && req.recipient_id === user.id)
            
          const involvesEmployer = 
            (req.requester_type === "employer" && Number(req.requester_id) === Number(employer.user_id))|| 
            (req.recipient_type === "employer" && Number(req.recipient_id) === Number(employer.user_id))
            
          return involvesUnderwriter && involvesEmployer
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
        request_type: "underwriter-employer",
        requester_type: "underwriter",
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

      //here
      
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
    router.push("/underwriter-dashboard/employers/allemployers");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!employer) return <Alert severity="error">Employer not found</Alert>;

  return (
        <Box sx={{ p: 1 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mb: 1 }}
          >
            Back 
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
                        Status
                      </Typography>
                      <Typography 
                        color={employer.status === 'active' ? 'success.main' : 'error.main'}
                      >
                        {employer.status}
                      </Typography>*/}
                    </Box>
    
                    <Box>
                      {/*<Typography variant="subtitle2" color="text.secondary">
                        Float Balance
                      </Typography>
                      <Typography>${employer.float}</Typography>*/}
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
                    </Grid>
                </CardContent>
              </Card>
                    {/* Ratings and Comments Section */}
                              <Card sx={{ mt: 3 }}>
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    Ratings & Comments
                                  </Typography>
                                  
                                  {loading ? (
                                    <Box display="flex" justifyContent="center" py={4}>
                                      <CircularProgress />
                                    </Box>
                                  ) : (
                                    <>
                                      {employer.user_rating !== null && (
                                        <Box display="flex" alignItems="center" mb={2}>
                                          <StarIcon color="warning" />
                                          <Typography variant="h6" ml={0.5}>
                                            {employer.user_rating?.toFixed(1)}/5
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" ml={1}>
                                            ({employer.reviews?.length || 0} ratings)
                                          </Typography>
                                        </Box>
                                      )}
                    
                                      {employer.reviews && employer.reviews.length > 0 ? (
                                        <Stack spacing={2}>
                                          {employer.reviews
                                            .filter(review => review.comment) // Only show reviews with comments
                                            .map((review, index) => (
                                              <Paper key={index} elevation={2} sx={{ p: 2 }}>
                                                <Box display="flex" justifyContent="space-between">
                                                  <Typography fontWeight="bold">
                                                    {review.rater_name}
                                                  </Typography>
                                                  <Box display="flex" alignItems="center">
                                                    <StarIcon color="warning" fontSize="small" />
                                                    <Typography ml={0.5}>{review.rating}/5</Typography>
                                                  </Box>
                                                </Box>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                  {review.comment}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                                  {new Date(review.created_at).toLocaleString()}
                                                </Typography>
                                              </Paper>
                                            ))}
                                          
                                          {employer.reviews.filter(r => r.comment).length === 0 && (
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
                      You are already linked to this Employer
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
  {/*return (
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
                </Stack>
              </Grid>

              <Grid xs={12} md={6}>
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
                You are already linked to this Employer
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
  );
}*/}