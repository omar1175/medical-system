import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MedicalServices as MedicalIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  CardMembership as SubscriptionIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { logout } from "../../store/slices/authSlice";
import { fetchConversations } from "../../store/slices/chatSlice";
import TemplateNavbar from "./TemplateNavbar";
import Footer from "./Footer";
import { getDoctorImage } from "../../data/doctorImages";
import { getPatientImage } from "../../data/patientImages";
import { useTemplateColors } from "../../styles/templateTheme";
import ChatWidget from "../chat/ChatWidget";

const DRAWER_WIDTH = 260;
const NAVBAR_HEIGHT_DESKTOP = 116; // topbar (40) + branding navbar (76)
const NAVBAR_HEIGHT_MOBILE = 76;   // branding navbar only

const patientNav = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/patient/dashboard" },
  { text: "Find Doctors", icon: <SearchIcon />, path: "/patient/doctors" },
  { text: "My Appointments", icon: <EventIcon />, path: "/patient/appointments" },
  { text: "Payments", icon: <PaymentIcon />, path: "/patient/payments" },
  { text: "Messages", icon: <ChatIcon />, path: "/patient/chat" },
  { text: "Profile", icon: <PersonIcon />, path: "/patient/profile" },
];

const doctorNav = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/doctor/dashboard" },
  {
    text: "Availability",
    icon: <ScheduleIcon />,
    path: "/doctor/availability",
  },
  { text: "Appointments", icon: <EventIcon />, path: "/doctor/appointments" },
  { text: "Subscription", icon: <SubscriptionIcon />, path: "/doctor/subscription" },
  { text: "Messages", icon: <ChatIcon />, path: "/doctor/chat" },
  { text: "Profile", icon: <PersonIcon />, path: "/doctor/profile" },
];

const adminNav = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Specialties", icon: <CategoryIcon />, path: "/admin/specialties" },
  { text: "Appointments", icon: <EventIcon />, path: "/admin/appointments" },
];

function getNavItems(role) {
  if (role === "ADMIN") return adminNav;
  if (role === "DOCTOR") return doctorNav;
  return patientNav;
}

function getRoleDashboard(role) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "DOCTOR") return "/doctor/dashboard";
  return "/patient/dashboard";
}

function getRoleLabel(role) {
  if (role === "ADMIN") return "Administrator";
  if (role === "DOCTOR") return "Doctor";
  return "Patient";
}

function getRoleColor(role) {
  if (role === "ADMIN") return "#dc2626";
  if (role === "DOCTOR") return "#175cdd";
  return "#059669";
}

function getUserPhoto(user) {
  if (!user) return null;
  if (user.role === "DOCTOR") return getDoctorImage(user.username);
  if (user.role === "PATIENT") return getPatientImage(user.username);
  return null;
}

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageKey, setPageKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations } = useSelector((s) => s.chats);

  const navbarHeight = isMobile ? NAVBAR_HEIGHT_MOBILE : NAVBAR_HEIGHT_DESKTOP;

  const c = useTemplateColors();
  const navItems = getNavItems(user?.role);
  const userPhoto = getUserPhoto(user);

  useEffect(() => {
    setPageKey((k) => k + 1);
  }, [location.pathname]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: c.border,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(23, 92, 221, 0.3)",
          }}
        >
          <MedicalIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "c.heading",
              lineHeight: 1.2,
            }}
          >
            MediSys
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "c.default",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            Medical System
          </Typography>
        </Box>
      </Box>

      {/* User info */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          src={userPhoto || undefined}
          sx={{
            width: 42,
            height: 42,
            fontSize: 16,
            fontWeight: 700,
            background: userPhoto ? "transparent" : `linear-gradient(135deg, ${getRoleColor(user?.role)} 0%, ${getRoleColor(user?.role)}99 100%)`,
            color: "#fff",
          }}
        >
          {!userPhoto && (user?.first_name?.[0] || user?.username?.[0] || "U")}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "c.heading",
              fontFamily: '"Montserrat", sans-serif',
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.first_name || user?.username}
          </Typography>
          <Chip
            label={getRoleLabel(user?.role)}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 600,
              bgcolor: `${getRoleColor(user?.role)}15`,
              color: getRoleColor(user?.role),
              border: `1px solid ${getRoleColor(user?.role)}30`,
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ mx: 2, borderColor: c.border }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 1.5, px: 1.5, overflow: "auto" }}>
        <Typography
          sx={{
            px: 1.5,
            mb: 1,
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "c.muted",
            fontFamily: '"Montserrat", sans-serif',
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Navigation
        </Typography>
        <List disablePadding>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <ListItemButton
                key={item.path}
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: 2,
                  py: 1.2,
                  position: "relative",
                  "&.Mui-selected": {
                    bgcolor: "#175cdd12",
                    color: "#175cdd",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: "60%",
                      borderRadius: "0 4px 4px 0",
                      bgcolor: "#175cdd",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "#175cdd",
                    },
                    "& .MuiListItemText-primary": {
                      color: "#175cdd",
                      fontWeight: 600,
                    },
                  },
                  "&:hover": {
                    bgcolor: "#175cdd08",
                  },
                  "& .MuiListItemIcon-root": {
                    minWidth: 40,
                    color: "c.muted",
                  },
                  "& .MuiListItemText-primary": {
                    fontSize: "0.88rem",
                    fontWeight: 500,
                    fontFamily: '"Montserrat", sans-serif',
                    color: "c.default",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Bottom section */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderTop: "1px solid",
          borderColor: c.border,
        }}
      >
        <Box
          onClick={handleLogout}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.2,
            borderRadius: 2,
            cursor: "pointer",
            color: "c.muted",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#fee2e220",
              color: "#dc2626",
              "& .MuiListItemIcon-root": { color: "#dc2626" },
            },
            "& .MuiListItemIcon-root": {
              minWidth: 40,
              color: "inherit",
            },
            "& .MuiListItemText-primary": {
              fontSize: "0.88rem",
              fontWeight: 500,
              fontFamily: '"Montserrat", sans-serif',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: c.lightBg }}>
      {/* Template Navbar at top */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300 }}>
        <TemplateNavbar />
      </Box>

      {/* Sidebar */}
      <Box
        component="nav"
          sx={{
            width: { md: DRAWER_WIDTH },
            boxSizing: "border-box",
            top: `${navbarHeight}px`,
            height: `calc(100vh - ${navbarHeight}px)`,
            borderRight: `1px solid ${c.border}`,
            bgcolor: c.surface,
          }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              top: `${navbarHeight}px`,
              height: `calc(100vh - ${navbarHeight}px)`,
              borderRight: `1px solid ${c.border}`,
              bgcolor: "#ffffff",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* App Bar (top bar inside the main area) */}
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: `${navbarHeight}px`,
          left: { md: `${DRAWER_WIDTH}px` },
          right: 0,
          height: 56,
          bgcolor: c.surface,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          px: { xs: 2, md: 3 },
        }}
      >
        <IconButton
          edge="start"
          onClick={handleDrawerToggle}
          aria-label="Open navigation menu"
          sx={{ mr: 1.5, display: { md: "none" }, color: "c.heading" }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => navigate(getRoleDashboard(user?.role))}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(23, 92, 221, 0.25)",
            }}
          >
            <MedicalIcon sx={{ color: "#fff", fontSize: 18 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              fontSize: "1rem",
              color: "c.heading",
              display: { xs: "none", sm: "block" },
            }}
          >
            MediSys
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Account">
          <IconButton
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
            aria-label="User menu"
          >
            <Avatar
              src={userPhoto || undefined}
              sx={{
                width: 34,
                height: 34,
                fontSize: 13,
                fontWeight: 700,
                background: userPhoto ? "transparent" : `linear-gradient(135deg, ${getRoleColor(user?.role)} 0%, ${getRoleColor(user?.role)}99 100%)`,
                color: "#fff",
              }}
            >
              {!userPhoto && (user?.first_name?.[0] || user?.username?.[0] || "U")}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: `1px solid ${c.border}`,
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${c.borderSoft}` }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "c.heading",
                fontFamily: '"Montserrat", sans-serif',
              }}
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "c.muted" }}>
              {user?.email}
            </Typography>
          </Box>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(getRoleDashboard(user?.role));
            }}
            sx={{ py: 1.5, fontFamily: '"Montserrat", sans-serif' }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Dashboard
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              color: "#dc2626",
              fontFamily: '"Montserrat", sans-serif',
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#dc2626" }} />
            </ListItemIcon>
            Sign Out
          </MenuItem>
        </Menu>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: `${navbarHeight + 56}px`,
          minHeight: `calc(100vh - ${navbarHeight + 56}px)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, animation: "fadeSlideIn 0.3s ease-out", "@keyframes fadeSlideIn": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } } }} key={pageKey}>
          <Outlet />
        </Box>
        <Footer />
        <ChatWidget />
      </Box>
    </Box>
  );
}
