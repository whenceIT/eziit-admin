"use client"

import * as React from "react"
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Avatar,
  Rating,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  InputAdornment,
  List,
  ListItem,
  Stack,
  useTheme
} from "@mui/material"
import { useUser } from "@/hooks/use-user"
import { User } from "@/types/user"
import StarIcon from '@mui/icons-material/Star'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import { useRouter } from 'next/navigation'

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface UserRating {
  id: string
  user_id: string
  rated_user_id: string
  rating: number
  comment: string
  created_at: string
}

interface UserWithRatings extends User {
  average_rating: number
  ratings_count: number
  my_rating?: UserRating
}

export default function RatingsAndCommentsPage() {
  const { user } = useUser()
  const theme = useTheme()
  const router = useRouter()
  const [users, setUsers] = React.useState<UserWithRatings[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedUser, setSelectedUser] = React.useState<UserWithRatings | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [ratingValue, setRatingValue] = React.useState<number | null>(0)
  const [commentValue, setCommentValue] = React.useState("")
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarMessage, setSnackbarMessage] = React.useState("")
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error" | "info" | "warning">("success")
  const [userType, setUserType] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/users`)
        if (!response.ok) throw new Error("Failed to fetch users")

        const allUsers: User[] = await response.json()
        const otherUsers = allUsers.filter(u => {
          if (u.id === user.id) return false
          if (user.user_type !== 'admin' && u.user_type === 'admin') return false
          return true
        })

        const usersWithRatings = await Promise.all(
          otherUsers.map(async (u) => {
            try {
              const ratingsResponse = await fetch(`${API_BASE_URL}/user/${u.id}/ratings`)
              if (!ratingsResponse.ok) throw new Error(`Failed to fetch ratings for user ${u.id}`)

              const ratingsData = await ratingsResponse.json()
              const ratings = ratingsData.ratings || []
              const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0)
              const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0
              const myRating = ratings.find((r: any) => r.rater_id === user.id)

              return {
                ...u,
                average_rating: averageRating,
                ratings_count: ratings.length,
                my_rating: myRating ? {
                  id: myRating.id,
                  user_id: myRating.rater_id,
                  rated_user_id: u.id,
                  rating: myRating.rating,
                  comment: myRating.comment,
                  created_at: myRating.created_at
                } : undefined
              }
            } catch (err) {
              console.error(`Error fetching ratings for user ${u.id}:`, err)
              return {
                ...u,
                average_rating: 0,
                ratings_count: 0
              }
            }
          })
        )

        setUsers(usersWithRatings)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  const handleRateUser = (selectedUser: UserWithRatings) => {
    setSelectedUser(selectedUser)
    setRatingValue(selectedUser.my_rating?.rating || 0)
    setCommentValue(selectedUser.my_rating?.comment || "")
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setRatingValue(0)
    setCommentValue("")
  }

  const handleSubmitRating = async () => {
    if (!user || !selectedUser || !ratingValue) {
      setSnackbarMessage("Please provide a rating")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
      return
    }

    try {
      setSubmitting(true)
      
      const ratingData = {
        raterId: user.id,
        rateeId: selectedUser.id,
        rating: ratingValue,
        comment: commentValue
      }

      const response = await fetch(`${API_BASE_URL}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit rating")
      }

      // Refresh the user's ratings
      const ratingsResponse = await fetch(`${API_BASE_URL}/user/${selectedUser.id}/ratings`)
      if (!ratingsResponse.ok) throw new Error("Failed to fetch updated ratings")

      const ratingsData = await ratingsResponse.json()
      const ratings = ratingsData.ratings || []
      const totalRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0)
      const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0
      const myRating = ratings.find((r: any) => r.rater_id === user.id)

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id
            ? {
                ...u,
                average_rating: averageRating,
                ratings_count: ratings.length,
                my_rating: myRating ? {
                  id: myRating.id,
                  user_id: myRating.rater_id,
                  rated_user_id: u.id,
                  rating: myRating.rating,
                  comment: myRating.comment,
                  created_at: myRating.created_at
                } : undefined
              }
            : u
        )
      )

      setSnackbarMessage("Rating submitted successfully!")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
      handleCloseDialog()
    } catch (err) {
      console.error("Error submitting rating:", err)
      setSnackbarMessage(err instanceof Error ? err.message : "Failed to submit rating")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredUsers = React.useMemo(() => {
    let result = userType === "all" ? users : users.filter(u => u.user_type === userType)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(u =>
        (String(u.first_name ?? '').toLowerCase()).includes(query) ||
        (String(u.last_name ?? '').toLowerCase()).includes(query) ||
        (u.email?.toLowerCase() ?? '').includes(query)
      )
    }

    return result
  }, [users, userType, searchQuery])

  if (!user) {
    return <Alert severity="warning" sx={{ mt: 2 }}>Please log in to view and submit ratings</Alert>
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>Ratings & Comments</Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle1" gutterBottom>Filter by user type:</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {["all", "client", "merchant", "employer", "underwriter"].map(type => (
            <Chip
              key={type}
              label={type === "all" ? "All Users" : type.charAt(0).toUpperCase() + type.slice(1)}
              onClick={() => setUserType(type)}
              color={userType === type ? "primary" : "default"}
            />
          ))}
        </Stack>
      </Box>

      {filteredUsers.length === 0 ? (
        <Alert severity="info">No users found matching the selected filter</Alert>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredUsers.map((user) => (
            <ListItem key={user.id} sx={{ px: 0, py: 1 }}>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                      <Avatar 
                        sx={{ 
                          backgroundColor: theme.palette.primary.light, 
                          mr: 2, 
                          width: 40, 
                          height: 40, 
                          color: theme.palette.primary.contrastText 
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap>
                          {`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unnamed User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.user_type?.charAt(0).toUpperCase() + user.user_type?.slice(1)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating
                          value={user.average_rating}
                          precision={0.5}
                          readOnly
                          size="small"
                          emptyIcon={
                            <StarIcon
                              sx={{
                                color: theme.palette.action.disabled,
                                opacity: 0.55
                              }}
                              fontSize="inherit"
                            />
                          }
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({user.ratings_count})
                        </Typography>
                      </Box>

                      {user.my_rating && (
                        <Typography variant="body2" color="primary">
                          Your rating: {user.my_rating.rating}/5
                        </Typography>
                      )}

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleRateUser(user)}
                        sx={{ minWidth: 100 }}
                      >
                        {user.my_rating ? 'Update' : 'Rate'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {`Rate ${selectedUser?.first_name ?? ''} ${selectedUser?.last_name ?? ''}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 6 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="user-rating"
              value={ratingValue}
              onChange={(event, newValue) => setRatingValue(newValue)}
              size="large"
            />
            <TextField
              margin="dense"
              label="Comment"
              fullWidth
              multiline
              rows={4}
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitRating} 
            variant="contained"
            disabled={submitting || !ratingValue}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}