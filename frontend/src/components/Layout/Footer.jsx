import { Box, Container, Typography, Grid, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  MedicalServices as MedicalIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";

const footerLinks = {
  Services: [
    { text: "General Consultation", path: "/patient/doctors" },
    { text: "Emergency Care", path: "/patient/doctors" },
    { text: "Diagnostics Lab", path: "/patient/doctors" },
    { text: "Surgery Center", path: "/patient/doctors" },
    { text: "Vaccination", path: "/patient/doctors" },
  ],
  "Quick Links": [
    { text: "About Us", path: "/#about" },
    { text: "Departments", path: "/#departments" },
    { text: "Find Doctors", path: "/patient/doctors" },
    { text: "Appointments", path: "/patient/appointments" },
    { text: "Contact Us", path: "/#cta" },
  ],
  Support: [
    { text: "Help Center", path: "/login" },
    { text: "Contact Us", path: "/#cta" },
    { text: "FAQs", path: "/login" },
    { text: "Privacy Policy", path: "/login" },
    { text: "Terms of Service", path: "/login" },
  ],
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        bgcolor: "#021418",
        color: "#fff",
        borderRadius: "20px 20px 0 0",
        overflow: "hidden",
        borderTop: "3px solid",
        borderImage: "linear-gradient(90deg, #175cdd, #4a90e2, #175cdd) 1",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MedicalIcon sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}
              >
                MediSys
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", lineHeight: 1.8, mb: 3, maxWidth: 280 }}
            >
              Professional medical appointment management system. Connecting
              patients with trusted healthcare providers.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ fontSize: 16, color: "#175cdd" }} />
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  123 Medical Center Blvd, Healthcare City
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 16, color: "#175cdd" }} />
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon sx={{ fontSize: 16, color: "#175cdd" }} />
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  contact@medisys.com
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.67 }} key={title}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#fff",
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {links.map((link) => (
                  <Typography
                    key={link.text}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: "#94a3b8",
                      fontSize: "0.82rem",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      "&:hover": { color: "#175cdd", pl: 0.5 },
                    }}
                  >
                    {link.text}
                  </Typography>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Bottom bar */}
      <Box sx={{ borderTop: "1px solid #1e293b" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              py: 2.5,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              &copy; {new Date().getFullYear()}{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#94a3b8" }}>
                MediSys
              </Box>
              . All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon].map(
                (Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{
                      color: "#64748b",
                      "&:hover": { color: "#175cdd", bgcolor: "#175cdd15" },
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </IconButton>
                )
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
