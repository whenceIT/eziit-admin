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
import { Client } from '@/components/dashboard/client/clients-table';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://ezitt.whencefinancesystem.com/employer/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClient(data);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError('Failed to load client details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchClientDetails();
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: 'approved' | 'declined') => {
    try {
      setStatusUpdateMessage(null);
      const response = await fetch(`https://ezitt.whencefinancesystem.com/edit-client-status/${params.id}`, {
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
      
      // Update the local merchant state with new status
      if (client) {
        setClient({ ...client, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating client status:', error);
      setError('Failed to update merchant status. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => router.push('/dashboard/clients')} variant="outlined">
          Back to Clients
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
          ) : client ? (
            <>
              {statusUpdateMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {statusUpdateMessage}
                </Alert>
              )}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Client Details</Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mr: 1 }}
                    onClick={() => handleStatusChange('approved')}
                    disabled={client.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleStatusChange('declined')}
                    disabled={client.status === 'declined'}
                  >
                    Decline
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Client Number</Typography>
                  <Typography variant="body1">{client.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Chip
                    label={client.status}
                    color={
                      client.status === 'approved'
                        ? 'success'
                        : client.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Grid>
                {/*<Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Transactions</Typography>
                  <Typography variant="body1">{client.transactions}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Ratings</Typography>
                  <Typography variant="body1">{client.ratings}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Comments</Typography>
                  <Typography variant="body1">{client.float}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Float</Typography>
                  <Typography variant="body1">{client.comments}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Employers</Typography>
                  <Typography variant="body1">{client.employer}</Typography>
                </Grid>*/}
              </Grid>
            </>
          ) : (
            <Alert severity="info">No client data available.</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

