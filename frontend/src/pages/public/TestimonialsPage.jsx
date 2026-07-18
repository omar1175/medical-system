import { Box, Container, Typography, Grid, Avatar } from "@mui/material";
import { FormatQuote } from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const testimonials = [
  {
    name: "Alice Wilson",
    role: "Patient",
    text: "The care I received was exceptional. The doctors took time to explain everything and made me feel comfortable throughout my treatment.",
    avatar: "/assets/img/person/person-1.webp",
  },
  {
    name: "Bob Jones",
    role: "Patient",
    text: "I've been coming to this clinic for years. The staff is friendly, appointments are on time, and the quality of care is outstanding.",
    avatar: "/assets/img/person/person-2.webp",
  },
  {
    name: "Carol Ramirez",
    role: "Patient",
    text: "After struggling with my condition for months, the specialists here finally gave me a proper diagnosis and effective treatment plan.",
    avatar: "/assets/img/person/person-3.webp",
  },
  {
    name: "David Lee",
    role: "Patient",
    text: "The telemedicine option is incredibly convenient. I can consult with my doctor from home without having to take time off work.",
    avatar: "/assets/img/person/person-4.webp",
  },
];

export default function TestimonialsPage() {
  return (
    <Box>
      <PageTitle
        title="Testimonials"
        subtitle="What our patients say about us"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Testimonials" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {testimonials.map((t, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    position: "relative",
                    height: "100%",
                  }}
                >
                  <FormatQuote
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      fontSize: 48,
                      color: `${templateColors.accent}15`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      color: templateColors.default,
                      lineHeight: 1.8,
                      mb: 3,
                      fontStyle: "italic",
                    }}
                  >
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={t.avatar}
                      alt={t.name}
                      sx={{ width: 48, height: 48 }}
                    >
                      {t.name[0]}
                    </Avatar>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: templateFonts.heading,
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: templateColors.heading,
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: templateColors.accent,
                        }}
                      >
                        {t.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
