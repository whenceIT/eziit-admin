"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress, Container, Typography, Card, CardContent, Button } from "@mui/material";

interface Request {
  id: string;
  requester_type: string;
  request_type: string;
  status: string;
  created_at: string;
  details?: string; 
}

export default function PendingRequestDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return; 
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://ezitt.whencefinancesystem.com/requests/${id}`); 
        if (!response.ok) throw new Error("Failed to fetch request details");
        
        const data: Request = await response.json();
        setRequest(data);
      } catch (error) {
        console.error("Error fetching request details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading request details...</Typography>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Request not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Card sx={{ mt: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h5">Request Details</Typography>
          <Typography>ID: {request.id}</Typography>
          <Typography>Requester Type: {request.requester_type}</Typography>
          <Typography>Request Type: {request.request_type}</Typography>
          <Typography>Status: {request.status}</Typography>
          <Typography>Created At: {new Date(request.created_at).toLocaleString()}</Typography>
          {request.details && <Typography>Details: {request.details}</Typography>}

          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => router.back()} 
          >
            Back to Requests
          </Button>
        </CardContent>
      </Card>
    </Container>

  );
}
