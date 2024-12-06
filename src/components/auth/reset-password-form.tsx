/*'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Typography, Stack, Alert } from '@mui/material';
import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (success) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Password Reset Successful</Typography>
        <Typography>
          Your password has been successfully reset. You can now sign in with your new password.
        </Typography>
        <Button variant="contained" onClick={() => router.push(paths.auth.signIn)}>
          Go to Sign In
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4">Reset Password</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="New Password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            value={password}
            required
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            value={confirmPassword}
            required
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button type="submit" variant="contained" fullWidth size="large">
            Reset Password
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}*/