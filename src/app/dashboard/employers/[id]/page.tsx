'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

export interface Employer {
  id: number;
  name: string;
  email: string;
  phone: string;
  float: number;
  ratings: number;
  employees?: number;
  merchants?: number;
  transactions?: number;
  user_id?: number;
}

export default function EmployerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployerDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://ezitt.whencefinancesystem.com/employer/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEmployer(data);
      } catch (error) {
        console.error('Error fetching employer details:', error);
        setError('Failed to load employer details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchEmployerDetails();
    }
  }, [params.id]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => router.push('/dashboard/employers')} variant="outlined">
          Back to Employers
        </Button>
      </Box>
      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : employer ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4">Employer Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Employer Number</Typography>
                  <Typography variant="body1">{employer.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Name</Typography>
                  <Typography variant="body1">{employer.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Email</Typography>
                  <Typography variant="body1">{employer.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Phone</Typography>
                  <Typography variant="body1">{employer.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">User ID</Typography>
                  <Typography variant="body1">{employer.user_id || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Employees</Typography>
                  <Typography variant="body1">{employer.employees || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Merchants</Typography>
                  <Typography variant="body1">{employer.merchants || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Transactions</Typography>
                  <Typography variant="body1">{employer.transactions || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Float</Typography>
                  <Typography variant="body1">{employer.float}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Ratings</Typography>
                  <Typography variant="body1">{employer.ratings}</Typography>
                </Grid>
              </Grid>
            </>
          ) : (
            <Alert severity="info">No employer data available.</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}