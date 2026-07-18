import { Box, Container, Typography, Grid } from "@mui/material";
import {
  MedicalServices,
  LocalHospital,
  Biotech,
  Healing,
  Shield,
  Emergency,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const services = [
  {
    icon: <MedicalServices sx={{ fontSize: 40 }} />,
    title: "Primary Care",
    desc: "Comprehensive preventive care, routine check-ups, and management of common health conditions.",
  },
  {
    icon: <LocalHospital sx={{ fontSize: 40 }} />,
    title: "Emergency Services",
    desc: "24/7 emergency care with board-certified emergency physicians and advanced life-support equipment.",
  },
  {
    icon: <Biotech sx={{ fontSize: 40 }} />,
    title: "Diagnostic Imaging",
    desc: "State-of-the-art MRI, CT, ultrasound, and X-ray services with rapid results and expert interpretation.",
  },
  {
    icon: <Healing sx={{ fontSize: 40 }} />,
    title: "Surgical Services",
    desc: "Minimally invasive and traditional surgical procedures performed by experienced surgeons.",
  },
  {
    icon: <Shield sx={{ fontSize: 40 }} />,
    title: "Preventive Care",
    desc: "Health screenings, vaccinations, and wellness programs designed to keep you healthy.",
  },
  {
    icon: <Emergency sx={{ fontSize: 40 }} />,
    title: "Urgent Care",
    desc: "Walk-in urgent care for non-life-threatening conditions with minimal wait times.",
  },
];

export default function ServicesPage() {
  return (
    <Box>
      <PageTitle
        title="Services"
        subtitle="Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Services" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {services.map((s, i) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    transition: "all 0.3s",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ color: templateColors.accent, mb: 2 }}>
                    {s.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: templateFonts.heading,
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: templateColors.heading,
                      mb: 1.5,
                    }}
                  >
                    {s.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.88rem",
                      color: templateColors.default,
                      lineHeight: 1.7,
                    }}
                  >
                    {s.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
