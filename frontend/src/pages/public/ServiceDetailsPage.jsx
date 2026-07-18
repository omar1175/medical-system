import { Box, Container, Typography, Grid } from "@mui/material";
import { ArrowBack, CheckCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const features = [
  "Comprehensive diagnostic evaluation",
  "Personalized treatment plans",
  "Board-certified specialists",
  "State-of-the-art equipment",
  "Follow-up care coordination",
  "Insurance assistance",
];

export default function ServiceDetailsPage() {
  return (
    <Box>
      <PageTitle
        title="Service Details"
        subtitle="Comprehensive healthcare services tailored to your needs"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Services", path: "/services" },
          { label: "Service Details" },
        ]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Link
            to="/services"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: templateColors.accent,
              textDecoration: "none",
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            <ArrowBack sx={{ fontSize: 18 }} /> Back to Services
          </Link>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="/assets/img/health/consultation-4.webp"
                alt="Service"
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: templateColors.heading,
                  mb: 2,
                }}
              >
                Comprehensive Healthcare Services
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: templateColors.default,
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                We offer a wide range of medical services designed to meet the
                diverse needs of our patients. From preventive care to
                specialized treatments, our team is committed to providing the
                highest quality healthcare in a compassionate environment.
              </Typography>
              <Grid container spacing={1.5}>
                {features.map((f, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircle
                        sx={{ fontSize: 18, color: templateColors.accent }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: templateColors.default,
                        }}
                      >
                        {f}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
