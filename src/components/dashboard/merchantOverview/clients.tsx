"use client"

import * as React from "react"
import Avatar from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import type { SxProps } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import { ArrowDown as ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown"
import { ArrowUp as ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp"
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users"
import { useUser } from "@/hooks/use-user"

interface Client {
  id: number
  user_id: string | null
  // Add other relevant fields
}

interface Merchant {
  id: number
  user_id: string | null
  clients: Client[] | null
  // Add other relevant fields
}

async function fetchMerchantClients(merchantId: string): Promise<number> {
  console.log("Fetching clients for merchant:", merchantId)
  const response = await fetch(`https://ezitt.whencefinancesystem.com/merchant/${merchantId}`)
  if (!response.ok) {
    console.error("Failed to fetch merchant data")
    throw new Error("Failed to fetch merchant data")
  }
  const merchantData: Merchant = await response.json()
  const clientCount = merchantData.clients?.length || 0
  console.log("Fetched client count:", clientCount)
  return clientCount
}

export interface TotalCustomersProps {
  diff?: number
  trend: "up" | "down"
  sx?: SxProps
  title: string;
}

export function TotalCustomers({ diff, trend, sx }: TotalCustomersProps): React.JSX.Element {
  const [totalClients, setTotalClients] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()

  React.useEffect(() => {
    const countClients = async () => {
      if (!user) {
        console.log("User object is null or undefined")
        setError("User not authenticated")
        setLoading(false)
        return
      }

      if (user.user_type !== "merchant") {
        console.log("User is not a merchant")
        setError("Invalid user type")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching clients for merchant ID:", user.id)
        const count = await fetchMerchantClients(user.id)
        setTotalClients(count)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching clients:", err)
        setError("Failed to count clients")
        setLoading(false)
      }
    }

    if (user) {
      countClients()
    }
  }, [user])

  const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon
  const trendColor = trend === "up" ? "var(--mui-palette-success-main)" : "var(--mui-palette-error-main)"

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Clients
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : (
                <Typography variant="h4">{totalClients}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-success-main)", height: "56px", width: "56px" }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff && !loading && !error ? (
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

