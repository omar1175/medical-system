import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import {
  useTemplateColors,
  templateFonts,
  templateShadows,
} from "../../styles/templateTheme";
import { useThemeMode } from "../../context/ThemeModeContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Departments", path: "/departments" },
  { label: "Services", path: "/services" },
  { label: "Doctors", path: "/doctors" },
  {
    label: "More Pages",
    children: [
      { label: "Department Details", path: "/department-details" },
      { label: "Service Details", path: "/service-details" },
      { label: "Appointment", path: "/appointment" },
      { label: "Testimonials", path: "/testimonials" },
      { label: "FAQ", path: "/faq" },
      { label: "Gallery", path: "/gallery" },
      { label: "Terms", path: "/terms" },
      { label: "Privacy", path: "/privacy" },
    ],
  },
  { label: "Contact", path: "/contact" },
  { label: "Login", path: "/login", isButton: true },
];

export default function TemplateNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState({});
  const c = useTemplateColors();
  const { mode, toggleTheme } = useThemeMode();

  const isActive = (path) => location.pathname === path;

  const toggleMobileDropdown = (label) => {
    setMobileDropdown((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const drawerContent = (
    <Box sx={{ width: 280, height: "100%", bgcolor: c.navMobileBg }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 2,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: templateFonts.heading,
            fontWeight: 800,
            fontSize: "1.3rem",
            color: c.heading,
          }}
        >
          Clinic
        </Typography>
        <IconButton onClick={() => setMobileOpen(false)} sx={{ color: c.heading }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = mobileDropdown[item.label];
            return (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() => toggleMobileDropdown(item.label)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    "&:hover": { bgcolor: c.lightBg },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontFamily: templateFonts.nav,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: c.nav,
                      },
                    }}
                  />
                  {isOpen ? (
                    <KeyboardArrowDown sx={{ fontSize: 18 }} />
                  ) : (
                    <KeyboardArrowRight sx={{ fontSize: 18 }} />
                  )}
                </ListItemButton>
                <Collapse in={isOpen}>
                  <List disablePadding sx={{ pl: 2 }}>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        component={Link}
                        to={child.path}
                        selected={isActive(child.path)}
                        onClick={() => setMobileOpen(false)}
                          sx={{
                            borderRadius: 1.5,
                            mb: 0.3,
                            py: 1,
                            "&.Mui-selected": {
                              bgcolor: `${c.accent}12`,
                              color: c.accent,
                            },
                          }}
                      >
                        <ListItemText
                          primary={child.label}
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontFamily: templateFonts.nav,
                              fontSize: "0.85rem",
                            },
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }
          if (item.isButton) {
            return (
              <ListItemButton
                key={item.label}
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mt: 1,
                  py: 1.5,
                  bgcolor: c.accent,
                  color: "#fff",
                  textAlign: "center",
                  "&:hover": { bgcolor: c.accentHover },
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontFamily: templateFonts.nav,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    },
                  }}
                />
              </ListItemButton>
            );
          }
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
              onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.5,
                  "&.Mui-selected": {
                    bgcolor: `${c.accent}12`,
                    color: c.accent,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: "60%",
                      borderRadius: "0 4px 4px 0",
                      bgcolor: c.accent,
                    },
                  },
                  "&:hover": { bgcolor: c.lightBg },
                }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontFamily: templateFonts.nav,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ mx: 2, my: 1 }} />
      <Box sx={{ px: 3, py: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
          {[Twitter, Facebook, Instagram, LinkedIn].map((Icon, i) => (
            <IconButton
              key={i}
              size="small"
              sx={{
                color: c.default,
                "&:hover": { color: c.accent },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </IconButton>
          ))}
        </Box>
      </Box>
    </Box>
  );

  // Desktop dropdown state
  const [hoveredDropdown, setHoveredDropdown] = useState(null);

  return (
    <Box>
      {/* ═══════════ TOP BAR ═══════════ */}
      <Box
        sx={{
          bgcolor: c.darkBg,
          color: "#fff",
          py: 0.8,
          display: { xs: "none", md: "block" },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  opacity: 0.9,
                }}
              >
                <EmailIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: "0.8rem" }}>
                  contact@example.com
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  opacity: 0.9,
                }}
              >
                <PhoneIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: "0.8rem" }}>
                  +1 5589 55488 55
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                opacity: 0.7,
              }}
            >
              {[Twitter, Facebook, Instagram, LinkedIn].map((Icon, i) => (
                <Icon
                  key={i}
                  sx={{
                    fontSize: 14,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ═══════════ MAIN NAVBAR ═══════════ */}
      <Box
        sx={{
          bgcolor: c.surface,
          borderBottom: `1px solid ${c.border}`,
          boxShadow: templateShadows?.navbar || "0 2px 20px rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 1100,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
            }}
          >
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src="/assets/img/logo.webp"
                alt="Clinic"
                sx={{ height: 40, display: { xs: "none", sm: "block" } }}
              />
              <Typography
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: c.heading,
                }}
              >
                Clinic
              </Typography>
            </Box>

            {/* Desktop Nav */}
            <Box
              component="nav"
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {navItems.map((item) => {
                if (item.children) {
                  return (
                    <Box
                      key={item.label}
                      sx={{ position: "relative" }}
                      onMouseEnter={() => setHoveredDropdown(item.label)}
                      onMouseLeave={() => setHoveredDropdown(null)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.3,
                          px: 1.5,
                          py: 1,
                          cursor: "pointer",
                          borderRadius: 1,
                          fontFamily: templateFonts.nav,
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: c.nav,
                          transition: "color 0.3s",
                          "&:hover": { color: c.navHover },
                        }}
                      >
                        {item.label}
                        <KeyboardArrowDown sx={{ fontSize: 16 }} />
                      </Box>
                      {hoveredDropdown === item.label && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            minWidth: 220,
                            bgcolor: c.navDropdownBg,
                            borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            border: `1px solid ${c.border}`,
                            py: 1,
                            zIndex: 1200,
                          }}
                        >
                          {item.children.map((child) => (
                            <Box
                              key={child.path}
                              component={Link}
                              to={child.path}
                              sx={{
                                display: "block",
                                px: 2.5,
                                py: 1.2,
                                fontFamily: templateFonts.nav,
                                fontSize: "0.85rem",
                                color: c.navDropdownColor,
                                textDecoration: "none",
                                transition: "all 0.2s",
                                "&:hover": {
                                  color: c.navDropdownHover,
                                  bgcolor: c.lightBg,
                                },
                              }}
                            >
                              {child.label}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                }
                if (item.isButton) {
                  return (
                    <Box
                      key={item.label}
                      component={Link}
                      to={item.path}
                      sx={{
                        px: 2.5,
                        py: 1,
                        ml: 1,
                        bgcolor: c.accent,
                        color: "#fff",
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        fontFamily: templateFonts.nav,
                        textDecoration: "none",
                        transition: "all 0.3s",
                        "&:hover": {
                          bgcolor: c.accentHover,
                          boxShadow: "0 4px 16px rgba(23,92,221,0.3)",
                        },
                      }}
                    >
                      {item.label}
                    </Box>
                  );
                }
                return (
                  <Box
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      px: 1.5,
                      py: 1,
                      fontFamily: templateFonts.nav,
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      color: isActive(item.path)
                        ? c.accent
                        : c.nav,
                      textDecoration: "none",
                      borderRadius: 1,
                      transition: "color 0.3s",
                      position: "relative",
                      "&::after": isActive(item.path)
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: -2,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "60%",
                            height: 2,
                            bgcolor: c.accent,
                            borderRadius: 1,
                          }
                        : {},
                      "&:hover": { color: c.navHover },
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>

            {/* Theme toggle */}
            <IconButton
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              sx={{
                color: c.heading,
                border: `1px solid ${c.border}`,
                borderRadius: 2,
                p: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  color: c.accent,
                  borderColor: c.accent,
                  bgcolor: c.lightBg,
                },
              }}
            >
              {mode === "dark" ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: "none" }, color: c.heading }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { boxShadow: "0 8px 32px rgba(0,0,0,0.15)" },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
