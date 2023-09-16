import {
  Avatar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../hooks/auth";
import { User } from "../types/user";

function Nav(): React.JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getAvatarImage = (user: User) => {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  };

  const getInviteUrl = (clientId: string) => {
    return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=2147601408&scope=applications.commands+bot`;
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Avatar
            alt="Mr. Whale"
            sx={{ display: { xs: "none", md: "flex" }, mr: 2 }}
            component={RouterLink}
            to="/"
            src="/src/assets/mrwhale_avatar.png"
          />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
              fontFamily: "Luckiest Guy",
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            MR. WHALE
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem
                component="a"
                href={getInviteUrl("414497162261430272")}
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center">Invite</Typography>
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/commands"
                onClick={handleCloseNavMenu}
              >
                <Typography textAlign="center">Commands</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Avatar
            alt="Mr. Whale"
            sx={{ display: { xs: "flex", md: "none" }, mr: 2 }}
            component={RouterLink}
            to="/"
            src="/src/assets/mrwhale_avatar.png"
          />
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "Luckiest Guy",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            MR. WHALE
          </Typography>

          <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Button
              component="a"
              color="inherit"
              href={getInviteUrl("414497162261430272")}
              sx={{ my: 1, mx: 1.5 }}
            >
              Invite
            </Button>
            <Button
              component={RouterLink}
              color="inherit"
              to="/commands"
              sx={{ my: 1, mx: 1.5 }}
            >
              Commands
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user && isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.username} src={getAvatarImage(user)} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/dashboard"
                    onClick={handleCloseUserMenu}
                  >
                    <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component="a"
                  href="/authorize/login"
                  color="secondary"
                  variant="outlined"
                  sx={{ my: 1, mx: 1.5 }}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Nav;
