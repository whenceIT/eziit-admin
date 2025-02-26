"use client";

import type * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Storefront as StoreIcon } from "@phosphor-icons/react";


import { config } from "@/config";
import { useUser } from "@/hooks/use-user";

const API_BASE_URL = "https://ezitt.whencefinancesystem.com";

// Define types
type Merchant = {
  id: number;
  user_id: string;
  merchant_code: string;
  transactions: any;
  stores: any;
  ratings: any;
  comments: any;
  clients: any;
  employers: any;
  status: any;
};



export default function AddStorePage(): React.JSX.Element {
  const { user } = useUser()
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateStoreCode = () => {
    return `STR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    if (!user) {
      setError("You must be logged in to add a store.")
      setIsLoading(false)
      return
    }

    try {
      const merchantResponse = await fetch(`${API_BASE_URL}/merchants`)
      if (!merchantResponse.ok) {
        throw new Error("Failed to fetch merchants")
      }
      const merchants: Merchant[] = await merchantResponse.json()

      const userMerchant = merchants.find((merchant) => merchant.user_id === user.id)

      if (!userMerchant || !userMerchant.id) {
        throw new Error("No merchant account found for this user")
      }

      const merchantId = userMerchant.id
      const storeCode = generateStoreCode()

      const response = await fetch(`${API_BASE_URL}/create_store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant: merchantId,
          store_code: storeCode,
          location: location,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add store")
      }

      setSuccess("Store added successfully!")
      setTimeout(() => {
        router.push("/merchant-dashboard/stores")
      }, 2000)
    } catch (error) {
      console.error("Error adding store:", error)
      setError("Failed to add store. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography>Please sign in to add a store.</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Head>
        <title>{`Add Store | Dashboard | ${config.site.name}`}</title>
      </Head>
      <Card>
        <CardHeader
          avatar={<StoreIcon size={24} />}
          title="Add New Store"
          subheader="Create a new store for your merchant account"
        />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                onChange={(e) => setLocation(e.target.value)}
                required
                value={location}
                helperText="Enter the physical location of the store"
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <StoreIcon />}
                >
                  {isLoading ? "Adding Store..." : "Add Store"}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </>
  )
}