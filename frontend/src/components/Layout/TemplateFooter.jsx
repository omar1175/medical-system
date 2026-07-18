import {
  Box,
  Container,
  Typography,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
} from "@mui/icons-material";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const footerNav = {
  Studio: [
    "Our Story",
    "Design Process",
    "Portfolio",
    "Case Studies",
    "Awards",
  ],
  Services: [
    "Brand Identity",
    "Web Design",
    "Mobile Apps",
    "Digital Strategy",
    "Consultation",
  ],
  Resources: [
    "Design Blog",
    "Style Guide",
    "Free Assets",
    "Tutorials",
    "Inspiration",
  ],
  Connect: [
    "Start Project",
    "Schedule Call",
    "Join Newsletter",
    "Follow Updates",
    "Partnership",
  ],
};

export default function TemplateFooter() {
  return (
    <Box
      component="footer"
      id="footer"
      sx={{
        bgcolor: "#11262a",
        color: "rgba(255,255,255,0.8)",
        pt: 6,
        pb: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer */}
        <Grid container spacing={4} sx={{ alignItems: "start", mb: 4 }}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${templateColors.accent}, #4a90e2)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}
                >
                  C
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  color: "#fff",
                }}
              >
                Clinic
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                mb: 3,
                maxWidth: 400,
              }}
            >
              Crafting exceptional digital experiences through thoughtful design
              and innovative solutions that elevate your brand presence.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                {
                  icon: <LocationIcon sx={{ fontSize: 16 }} />,
                  text: "123 Creative Boulevard, Design District, NY 10012",
                },
                {
                  icon: <PhoneIcon sx={{ fontSize: 16 }} />,
                  text: "+1 (555) 987-6543",
                },
                {
                  icon: <EmailIcon sx={{ fontSize: 16 }} />,
                  text: "hello@designstudio.com",
                },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Box sx={{ color: templateColors.accent, display: "flex" }}>
                    {item.icon}
                  </Box>
                  <Typography
                    sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Navigation Columns */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Grid container spacing={3}>
              {Object.entries(footerNav).map(([title, links]) => (
                <Grid size={{ xs: 6, sm: 3 }} key={title}>
                  <Typography
                    sx={{
                      fontFamily: templateFonts.heading,
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
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {links.map((link) => (
                      <MuiLink
                        key={link}
                        href="#!"
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                          transition: "color 0.3s",
                          "&:hover": { color: templateColors.accent },
                        }}
                      >
                        {link}
                      </MuiLink>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            pt: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}
            >
              ©{" "}
              <Box component="span" sx={{ color: "#fff" }}>
                Clinic
              </Box>
              . All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, ml: { md: 3 } }}>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (text) => (
                  <MuiLink
                    key={text}
                    href="#!"
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.78rem",
                      textDecoration: "none",
                      "&:hover": { color: templateColors.accent },
                    }}
                  >
                    {text}
                  </MuiLink>
                ),
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}
            >
              Designed by BootstrapMade
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[Twitter, Facebook, Instagram, LinkedIn].map((Icon, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      bgcolor: templateColors.accent,
                      borderColor: templateColors.accent,
                      color: "#fff",
                    },
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <Icon sx={{ fontSize: 15 }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography
            sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}
          >
            Designed by{" "}
            <MuiLink
              href="https://bootstrapmade.com/"
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              BootstrapMade
            </MuiLink>
            . Distributed by{" "}
            <MuiLink
              href="https://themewagon.com"
              target="_blank"
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              ThemeWagon
            </MuiLink>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
