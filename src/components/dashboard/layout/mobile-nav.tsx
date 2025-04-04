"use client"

import type React from "react"
import { useState } from "react"
import RouterLink from "next/link"
import { usePathname } from "next/navigation"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Collapse from "@mui/material/Collapse"
import { CaretDown, CaretUp } from "@phosphor-icons/react"

import type { NavItemConfig } from "@/types/nav"
import { paths } from "@/paths"
import { isNavItemActive } from "@/lib/is-nav-item-active"
import { Logo } from "@/components/core/logo"
import { useUser } from "@/hooks/use-user"

import { adminNavItems, merchantNavItems, employerNavItems, underwriterNavItems } from "./config"
import { navIcons } from "./nav-icons"

export interface MobileNavProps {
  onClose?: () => void
  open?: boolean
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname()
  const { user } = useUser()

  // Determine navItems based on user type
  const navItems =
    user?.user_type === "merchant"
      ? merchantNavItems
      : user?.user_type === "employer"
      ? employerNavItems
      : user?.user_type === "underwriter"
      ? underwriterNavItems
      : adminNavItems

  return (
    <Drawer
      PaperProps={{
        sx: {
          "--MobileNav-background": "#5C5346",
          "--MobileNav-color": "var(--mui-palette-common-white)",
          "--NavItem-color": "var(--mui-palette-neutral-300)",
          "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
          "--NavItem-active-background": "#CBA328",
          "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
          "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
          "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
          "--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
          "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
          bgcolor: "var(--MobileNav-background)",
          color: "var(--MobileNav-color)",
          display: "flex",
          flexDirection: "column",
          maxWidth: "100%",
          scrollbarWidth: "none",
          width: "var(--MobileNav-width)",
          zIndex: "var(--MobileNav-zIndex)",
          "&::-webkit-scrollbar": { display: "none" },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 1 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: "inline-flex", justifyContent: "center" }}>
          <Logo color="light" height={70} width={90} />
        </Box>
      </Stack>
      <Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
        {renderNavItems({ pathname, items: navItems, onClose })}
      </Box>
    </Drawer>
  )
}

function renderNavItems({
  items = [],
  pathname,
  onClose,
}: { items?: NavItemConfig[]; pathname: string; onClose?: () => void }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    acc.push(<NavItem pathname={pathname} onClose={onClose} {...curr} />)
    return acc
  }, [])

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  )
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string
  items?: NavItemConfig[]
  onClose?: () => void
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  items,
  onClose,
}: NavItemProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const active = isNavItemActive({ disabled, external, href, matcher, pathname })
  const Icon = icon ? navIcons[icon] : null

  const handleClick = () => {
    if (items) {
      setOpen(!open)
    } else if (href && onClose) {
      onClose()
    }
  }

  return (
    <li>
      <Box
        onClick={handleClick}
        {...(href && !items
          ? {
              component: external ? "a" : RouterLink,
              href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : { role: "button" })}
        sx={{
          alignItems: "center",
          borderRadius: 1,
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),
          ...(active && { bgcolor: "var(--NavItem-active-background)", color: "var(--NavItem-active-color)" }),
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
          {Icon ? (
            <Icon
              fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{ color: "inherit", fontSize: "0.875rem", fontWeight: 500, lineHeight: "28px" }}
          >
            {title}
          </Typography>
        </Box>
        {items && (open ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />)}
      </Box>
      {items && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0, pl: 2 }}>
            {items.map((item) => (
              <NavItem pathname={pathname} onClose={onClose} {...item} />
            ))}
          </Stack>
        </Collapse>
      )}
    </li>
  )
}