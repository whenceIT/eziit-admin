"use client";

import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  organisation_name: string | null;
  user_type: string;
  email: string;
}

export interface PendingRequest {
  id: number;
  user_id: string;
  request_type: string;
  requester_type: string;
  requester_id: string;
  recipient_type: string;
  recipient_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PendingRequests(): React.JSX.Element {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [approving, setApproving] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, UserDetails | null>>({});
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/requests/pending/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch pending requests");
        
        const data = await response.json();
        setRequests(data.pending_requests || []);
        setFilteredRequests(data.pending_requests || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  
useEffect(() => {
  if (requests.length === 0 || fetchingUsers) return;

  const fetchRequesterDetails = async () => {
    const requesterIds = new Set<string>();
    requests.forEach(request => {
      requesterIds.add(request.requester_id);
    });

    const idsToFetch = Array.from(requesterIds).filter(id => !userCache[id]);
    
    if (idsToFetch.length === 0) return;
    
    setFetchingUsers(true);
    
    try {
  
      for (const userId of idsToFetch) {
        try {
          console.log(`Fetching user details for ID: ${userId}`);
          const response = await fetch(`${API_BASE_URL}/user/${userId}`);
          
          if (!response.ok) {
            console.warn(`Failed to fetch user ${userId}: ${response.status}`);
      
            setUserCache(prev => ({ ...prev, [userId]: null }));
            continue;
          }
          
          const userData = await response.json();
          console.log(`User data received for ${userId}:`, userData);
         
          const userInfo = userData.user || userData;
          
          if (userInfo && userInfo.first_name) {
            setUserCache(prev => ({
              ...prev,
              [userId]: {
                id: userId,
                first_name: userInfo.first_name || '',
                last_name: userInfo.last_name || '',
                organisation_name: userInfo.organisation_name || null,
                user_type: userInfo.user_type || '',
                email: userInfo.email || ''
              }
            }));
          } else {
            console.warn(`Invalid user data format for ${userId}:`, userData);
            setUserCache(prev => ({ ...prev, [userId]: null }));
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          setUserCache(prev => ({ ...prev, [userId]: null }));
        }
      }
    } finally {
      setFetchingUsers(false);
    }
  };

  fetchRequesterDetails();
}, [requests, userCache, fetchingUsers]);

  const handleFilterChange = (event: any) => {
    const value = event.target.value as string;
    setFilter(value);
    setFilteredRequests(
      value ? requests.filter((req) => req.requester_type === value) : requests
    );
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleApproveClick = (request: PendingRequest) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !user?.id) return;
    
    setApproving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/requests/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          request_id: selectedRequest.id,
          recipient_id: user.id 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve request');
      }
      
      const updatedRequests = requests.filter(req => req.id !== selectedRequest.id);
      setRequests(updatedRequests);
      setFilteredRequests(
        filter ? updatedRequests.filter((req) => req.requester_type === filter) : updatedRequests
      );
      
      const requesterName = formatUserName(selectedRequest.requester_id);
      setActionSuccess(`Request from ${requesterName} has been approved successfully!`);
      
      setOpenDialog(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while approving the request');
    } finally {
      setApproving(false);
    }
  };

  const formatUserName = (userId: string): string => {
    const userDetails = userCache[userId];
    
    if (!userDetails) {
      return "Loading...";
    }
    
    if (userDetails.first_name && userDetails.last_name) {
      return `${userDetails.first_name} ${userDetails.last_name}`;
    }
    
    if (userDetails.first_name) {
      return userDetails.first_name;
    }
    
    return userDetails.email || userId.substring(0, 8) + '...';
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Pending Requests
      </Typography>
      
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Filter by Requester Type</InputLabel>
        <Select 
          value={filter} 
          onChange={handleFilterChange}
          label="Filter by Requester Type"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="client">Clients</MenuItem>
          <MenuItem value="merchant">Merchants</MenuItem>
          <MenuItem value="underwriter">Underwriters</MenuItem>
        </Select>
      </FormControl>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Requestor Type</TableCell>
              <TableCell>Requestor Name</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((request) => {
                  const requesterDetails = userCache[request.requester_id];
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.requester_type} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {requesterDetails ? 
                          `${requesterDetails.first_name} ${requesterDetails.last_name}` : 
                          "Loading..."}
                      </TableCell>
                      <TableCell>
                        {requesterDetails?.organisation_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          color={request.status === 'pending' ? 'warning' : 'success'} 
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          onClick={() => handleApproveClick(request)}
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No pending requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRequests.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve the request from {selectedRequest ? 
              formatUserName(selectedRequest.requester_id) : ''}?
            This will establish a relationship between you and the requester.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={approving}>Cancel</Button>
          <Button 
            onClick={handleApproveRequest} 
            color="success" 
            variant="contained"
            disabled={approving}
          >
            {approving ? <CircularProgress size={24} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}