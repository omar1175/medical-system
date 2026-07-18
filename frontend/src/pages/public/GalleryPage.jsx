import { Box, Container, Typography, Grid } from "@mui/material";
import PageTitle from "../../components/common/PageTitle";

const images = Array.from(
  { length: 8 },
  (_, i) => `/assets/img/gallery/gallery-${i + 1}.webp`,
);

export default function GalleryPage() {
  return (
    <Box>
      <PageTitle
        title="Gallery"
        subtitle="Necessitatibus eius consequatur ex aliquid fuga"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Gallery" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {images.map((src, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": { transform: "scale(1.03)" },
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
