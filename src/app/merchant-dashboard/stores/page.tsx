"use client";

import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { config } from "@/config";
import { StoreCard, type Store } from "@/components/dashboard/merchant/store-card";
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


export default function Page(): React.JSX.Element {
  const { user, loading } = useUser();
  const [stores, setStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchStores = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all merchants
      const merchantsResponse = await fetch(`${API_BASE_URL}/merchants`);
      if (!merchantsResponse.ok) {
        throw new Error("Failed to fetch merchants");
      }
      const merchants: Merchant[] = await merchantsResponse.json();

      // Find the merchant linked to the logged-in user
      const userMerchant = merchants.find((merchant) => merchant.user_id === user.id);

      if (!userMerchant || !userMerchant.id) {
        setStores([]); // No merchant found for this user
        return;
      }

      const merchantId = userMerchant.id;

      // Fetch all stores
      const storesResponse = await fetch(`${API_BASE_URL}/stores`);
      if (!storesResponse.ok) {
        throw new Error("Failed to fetch stores");
      }
      const storesData: Store[] = await storesResponse.json();

      // Filter stores belonging to the logged-in user's merchant
      const userStores = storesData.filter((store) => store.merchant === merchantId);

      // Format store data
      const formattedStores = userStores.map((store) => ({
        id: store.id,
        merchant: store.merchant,
        merchantName: `${user.first_name} ${user.last_name}`.trim(),
        store_code: store.store_code,
        location: store.location,
      }));

      setStores(formattedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to load stores. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStores();
    } else {
      setStores([]);
    }
  }, [fetchStores, user]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading user information...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography>Please sign in to view this page.</Typography>
        </CardContent>
      </Card>
    );
  }

  const paginatedStores = stores.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <Head>
        <title>{`Stores | Dashboard | ${config.site.name}`}</title>
      </Head>
      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="Stores"
            action={
              <Button onClick={() => router.push("/merchant-dashboard/stores/add-store")} variant="outlined">
                Add Store
              </Button>
            }
          />
          <Divider />
          <CardContent>
            {isLoading ? (
              <Typography>Loading stores...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : stores.length === 0 ? (
              <Typography>No stores found for this merchant.</Typography>
            ) : (
              <>
                <Grid container spacing={3}>
                  {paginatedStores.map((store) => (
                    <Grid key={store.id} lg={4} md={6} xs={12}>
                      <StoreCard store={store} />
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={Math.ceil(stores.length / rowsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    size="small"
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}