"use client"

import { useEffect, useState } from "react"
import { UsersTable, type User } from "@/components/dashboard/users/userstable"
import { CircularProgress, Alert, TextField, Box } from "@mui/material"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://ezitt.whencefinancesystem.com/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        console.log("API Response:", data)

        const usersArray = Array.isArray(data) ? data : data.users || []

        const formattedUsers: User[] = usersArray.map((user: any) => ({
          id: user.id,
          email: user.email || "",
          user_type: user.user_type || "unknown",
          first_name: user.first_name || "",
          last_name: user.last_name || "",
        }))

        setUsers(formattedUsers)
        setFilteredUsers(formattedUsers)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_type.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>

  return (
    <div>
      <h1>Users</h1>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      {filteredUsers.length > 0 ? (
        <UsersTable users={filteredUsers} />
      ) : (
        <Alert severity="info">No users found matching your search criteria.</Alert>
      )}
    </div>
  )
}