"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Link,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material"
import { Eye as EyeIcon, EyeSlash as EyeSlashIcon } from "@phosphor-icons/react"
import { paths } from "@/paths"
import { useUser } from "@/hooks/use-user"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const user = await signIn(email, password)
      if (user.user_type === "merchant") {
        router.push(paths.dashboard.merchantOverview)
      } else {
        router.push(paths.dashboard.overview)
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Incorrect email or password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <FormControl>
            <InputLabel>Email address</InputLabel>
            <OutlinedInput
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email address"
              type="email"
            />
          </FormControl>
          <FormControl>
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                showPassword ? (
                  <EyeIcon
                    cursor="pointer"
                    fontSize="inherit"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <EyeSlashIcon
                    cursor="pointer"
                    fontSize="inherit"
                    onClick={() => setShowPassword(true)}
                  />
                )
              }
            />
          </FormControl>
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" fullWidth>
            Sign In
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

