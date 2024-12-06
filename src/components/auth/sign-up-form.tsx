'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Box, Button, FormControl, FormHelperText, InputLabel, OutlinedInput, Stack, Typography, Link } from '@mui/material';
import { paths } from '@/paths';

export function SignUpForm() {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    
    password: '',
    retypePassword: '',
    terms: '',
  });

  const { signUp } = useUser();
  const router = useRouter();

  const validate = () => {
    const errors: typeof formErrors = {
      first_name: first_name ? '' : 'First name is required',
      last_name: last_name ? '' : 'Last name is required',
      email: email ? (/^\S+@\S+\.\S+$/.test(email) ? '' : 'Invalid email') : 'Email is required',
      
      password: password.length >= 6 ? '' : 'Password must be at least 6 characters',
      retypePassword: password === retypePassword ? '' : 'Passwords do not match',
      terms: termsAccepted ? '' : 'You must accept the terms and conditions',
    };

    setFormErrors(errors);

    return Object.values(errors).every((err) => !err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      await signUp(first_name, last_name, email, password, 'admin');
      router.push(paths.auth.signIn);
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign up</Typography>
        <Typography color="text.secondary" variant="body2">
          Already have an account?{' '}
          <Link href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Sign in
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <FormControl error={Boolean(formErrors.first_name)}>
            <InputLabel>First Name</InputLabel>
            <OutlinedInput
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              label="First Name"
            />
            {formErrors.first_name && <FormHelperText>{formErrors.first_name}</FormHelperText>}
          </FormControl>
          <FormControl error={Boolean(formErrors.last_name)}>
            <InputLabel>Last Name</InputLabel>
            <OutlinedInput
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              label="Last Name"
            />
            {formErrors.last_name && <FormHelperText>{formErrors.last_name}</FormHelperText>}
          </FormControl>
          <FormControl error={Boolean(formErrors.email)}>
            <InputLabel>Email Address</InputLabel>
            <OutlinedInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              type="email"
            />
            {formErrors.email && <FormHelperText>{formErrors.email}</FormHelperText>}
          </FormControl>
          

          <FormControl error={Boolean(formErrors.password)}>
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              type="password"
            />
            {formErrors.password && <FormHelperText>{formErrors.password}</FormHelperText>}
          </FormControl>
          <FormControl error={Boolean(formErrors.retypePassword)}>
            <InputLabel>Retype Password</InputLabel>
            <OutlinedInput
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
              label="Retype Password"
              type="password"
            />
            {formErrors.retypePassword && <FormHelperText>{formErrors.retypePassword}</FormHelperText>}
          </FormControl>
          <FormControl error={Boolean(formErrors.terms)}>
            <Box display="flex" alignItems="center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <Typography variant="body2">
                I have read the <Link href="#">terms and conditions</Link>
              </Typography>
            </Box>
            {formErrors.terms && <FormHelperText>{formErrors.terms}</FormHelperText>}
          </FormControl>
          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained">
            Sign Up
          </Button>
        </Stack>
      </form>
      <Typography color="warning"></Typography>
    </Stack>
  );
}
