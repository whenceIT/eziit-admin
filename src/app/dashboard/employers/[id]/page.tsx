'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Employer } from '@/components/dashboard/employer/employers-table';

export default function EmployerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

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

  const handleStatusChange = async (newStatus: 'approved' | 'declined') => {
    try {
      setStatusUpdateMessage(null);
      const response = await fetch(`https://ezitt.whencefinancesystem.com/edit-employer-status/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();
      setStatusUpdateMessage(result.message || 'Status updated successfully');
      
      // Update the local employer state with new status
      if (employer) {
        setEmployer({ ...employer, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating employer status:', error);
      setError('Failed to update employer status. Please try again.');
    }
  };

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
              {statusUpdateMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {statusUpdateMessage}
                </Alert>
              )}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Employer Details</Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mr: 1 }}
                    onClick={() => handleStatusChange('approved')}
                    disabled={employer.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleStatusChange('declined')}
                    disabled={employer.status === 'declined'}
                  >
                    Decline
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Employer Number</Typography>
                  <Typography variant="body1">{employer.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Chip
                    label={employer.status}
                    color={
                      employer.status === 'approved'
                        ? 'success'
                        : employer.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">ID</Typography>
                  <Typography variant="body1">{employer.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Users Id</Typography>
                  <Typography variant="body1">{employer.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Employees</Typography>
                  <Typography variant="body1">{employer.employees}</Typography>
                </Grid>
                
            
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Merchants</Typography>
                  <Typography variant="body1">{employer.merchants}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Transactions</Typography>
                  <Typography variant="body1">{employer.transactions}</Typography>
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

