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
import { Merchant } from '@/components/dashboard/merchant/merchants-table';

export default function MerchantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchantDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://ezitt.whencefinancesystem.com/merchant/${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMerchant(data);
      } catch (error) {
        console.error('Error fetching merchant details:', error);
        setError('Failed to load merchant details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMerchantDetails();
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: 'approved' | 'declined') => {
    try {
      setStatusUpdateMessage(null);
      const response = await fetch(`https://ezitt.whencefinancesystem.com/edit-merchant-status/${params.id}`, {
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
      if (merchant) {
        setMerchant({ ...merchant, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating merchant status:', error);
      setError('Failed to update merchant status. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => router.push('/dashboard/merchants')} variant="outlined">
          Back to Merchants
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
          ) : merchant ? (
            <>
              {statusUpdateMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {statusUpdateMessage}
                </Alert>
              )}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Merchant Details</Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mr: 1 }}
                    onClick={() => handleStatusChange('approved')}
                    disabled={merchant.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleStatusChange('declined')}
                    disabled={merchant.status === 'declined'}
                  >
                    Decline
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Merchant Code</Typography>
                  <Typography variant="body1">{merchant.merchant_code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Status</Typography>
                  <Chip
                    label={merchant.status}
                    color={
                      merchant.status === 'approved'
                        ? 'success'
                        : merchant.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Transactions</Typography>
                  <Typography variant="body1">{merchant.transactions}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Stores</Typography>
                  <Typography variant="body1">{merchant.stores}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Ratings</Typography>
                  <Typography variant="body1">{merchant.ratings}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Comments</Typography>
                  <Typography variant="body1">{merchant.comments}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Clients</Typography>
                  <Typography variant="body1">{merchant.clients}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Employers</Typography>
                  <Typography variant="body1">{merchant.employers}</Typography>
                </Grid>
              </Grid>
            </>
          ) : (
            <Alert severity="info">No merchant data available.</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

