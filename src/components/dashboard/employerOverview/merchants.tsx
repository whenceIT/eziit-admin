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
//import { StorefrontIcon } from "@phosphor-icons/react/dist/ssr/Storefront"

import { useUser } from "@/hooks/use-user"

const API_BASE_URL = "https://ezitt.whencefinancesystem.com"

interface Employer {
  id: number
  user_id: string
  status: string | null
  clients: { id: number }[]
}

interface Merchant {
  id: number
  user_id: string
  status: string | null
  underwriter_status: string
  merchant_code: string
  clients: { id: number }[]
  employers: { id: number }[]
}

export interface TotalMerchantsProps {
  diff?: number
  trend: "up" | "down"
  sx?: SxProps
  title?: string
}

export function TotalMerchants({ sx }: TotalMerchantsProps): React.JSX.Element {
  const [totalMerchants, setTotalMerchants] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()

  React.useEffect(() => {
    if (!user) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    const fetchMerchantsCount = async () => {
      try {
        setLoading(true)

        // Step 1: Fetch employer details using the logged-in user's ID
        const employerRes = await fetch(`${API_BASE_URL}/employers?user_id=${user.id}`)

        if (!employerRes.ok) {
          throw new Error(`Failed to fetch employer data: ${employerRes.statusText}`)
        }

        const employerData: Employer[] = await employerRes.json()

        if (!employerData || employerData.length === 0) {
          setTotalMerchants(0)
          setLoading(false)
          return
        }

        const employerId = employerData[0].id // Get the employer ID

        // Step 2: Fetch all merchants
        const merchantsRes = await fetch(`${API_BASE_URL}/merchants`)

        if (!merchantsRes.ok) {
          throw new Error(`Failed to fetch merchants: ${merchantsRes.statusText}`)
        }

        const allMerchants: Merchant[] = await merchantsRes.json()

        // Step 3: Filter merchants that have this employer in their employers array
        const employerMerchants = allMerchants.filter((merchant) => {
          // Check if employers exists and is an array
          if (!merchant.employers || !Array.isArray(merchant.employers)) {
            return false
          }

          // Now safely check if this employer is in the array
          return merchant.employers.some((emp) => emp && typeof emp === "object" && emp.id === employerId)
        })

        // Set the count of merchants
        setTotalMerchants(employerMerchants.length)
      } catch (err) {
        console.error("Error fetching merchants count:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchMerchantsCount()
  }, [user])

  //const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon
  //const trendColor = trend === "up" ? "var(--mui-palette-success-main)" : "var(--mui-palette-error-main)"

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Merchants
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : (
                <Typography variant="h4">{totalMerchants}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-success-main)", height: "56px", width: "56px" }}>
              {/*<StorefrontIcon fontSize="var(--icon-fontSize-lg)" />*/}
            </Avatar>
          </Stack>
          
        </Stack>
      </CardContent>
    </Card>
  )
}

