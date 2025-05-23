"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";

import { usePopover } from "@/hooks/use-popover";
import { useUser } from "@/hooks/use-user";

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";

// Define the User type
type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string; // Optional field
};

interface MainNavProps {
  userType: string;
}

export function MainNav({ userType }: MainNavProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const { user } = useUser() as { user: User | null }; // Cast the user object to the User type

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: "1px solid var(--mui-palette-divider)",
          backgroundColor: "var(--mui-palette-background-paper)",
          position: "sticky",
          top: 0,
          zIndex: "var(--MainNav-zIndex)",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between", minHeight: "64px", px: 2 }}
        >
          <Typography variant="h6" component="p">
            Welcome, {user?.first_name || "Guest"}
          </Typography>
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: "none" } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={user?.avatar || "/assets/avatar.png"}
              sx={{ cursor: "pointer" }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}