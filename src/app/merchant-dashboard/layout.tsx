"use client"

import type * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import GlobalStyles from "@mui/material/GlobalStyles"
import CircularProgress from "@mui/material/CircularProgress"

import { MainNav } from "@/components/dashboard/layout/main-nav"
import { SideNav } from "@/components/dashboard/layout/side-nav"
import { useUser } from "@/hooks/use-user"
import { paths } from "@/paths"

interface LayoutProps {
  children: React.ReactNode
}

export default function MerchantDashboardLayout({ children }: LayoutProps): React.JSX.Element {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(paths.auth.signIn)
    } else if (!loading && user && user.user_type !== "merchant") {
      router.push(paths.auth.signIn)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user || user.user_type !== "merchant") {
    return (
      /*return null*/
     <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        Redirecting...
      </Box>
    )
  }

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            "--MainNav-height": "56px",
            "--MainNav-zIndex": "1000",
            "--SideNav-width": "280px",
            "--SideNav-zIndex": "1100",
            "--MobileNav-width": "320px",
            "--MobileNav-zIndex": "1100",
          },
        }}
      />
      <Box
        sx={{
          bgcolor: "var(--mui-palette-background-default)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "100%",
        }}
      >
         
        <SideNav userType={user?.user_type || ''}/>
        <Box sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column", pl: { lg: "var(--SideNav-width)" } }}>
          <MainNav userType={user?.user_type || ''}/>
          <main>
            <Container maxWidth="xl" sx={{ py: "16px" }}>
              {children}
            </Container>
          </main>
        </Box>
      </Box>
    </>
  )
}

