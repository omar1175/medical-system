import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import { LocationOn, Phone, Email, AccessTime } from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const contactInfo = [
  {
    icon: <LocationOn />,
    title: "Location",
    text: "123 Creative Boulevard, Design District, NY 10012",
  },
  { icon: <Phone />, title: "Phone", text: "+1 (555) 987-6543" },
  { icon: <Email />, title: "Email", text: "contact@clinic.com" },
  {
    icon: <AccessTime />,
    title: "Hours",
    text: "Mon-Fri: 8AM-8PM, Sat: 9AM-5PM",
  },
];

export default function ContactPage() {
  return (
    <Box>
      <PageTitle
        title="Contact"
        subtitle="Necessitatibus eius consequatur ex aliquid fuga"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 5 }}>
              {contactInfo.map((info, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ color: templateColors.accent, mt: 0.5 }}>
                    {info.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: templateFonts.heading,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: templateColors.heading,
                      }}
                    >
                      {info.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: templateColors.default,
                      }}
                    >
                      {info.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: templateFonts.heading,
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: templateColors.heading,
                    mb: 3,
                  }}
                >
                  Send a Message
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Email"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Subject"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: templateColors.accent,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 4,
                        "&:hover": { bgcolor: "#1448b0" },
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
