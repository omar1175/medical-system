import { Box, Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { Home as HomeIcon } from "@mui/icons-material";
import { templateColors, templateFonts } from "../../styles/templateTheme";

export default function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: templateColors.lightBg,
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: templateFonts.heading,
              fontWeight: 900,
              fontSize: { xs: "6rem", md: "8rem" },
              color: templateColors.accent,
              lineHeight: 1,
              mb: 2,
              opacity: 0.15,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontFamily: templateFonts.heading,
              fontWeight: 800,
              fontSize: { xs: "1.5rem", md: "2rem" },
              color: templateColors.heading,
              mb: 2,
            }}
          >
            Page Not Found
          </Typography>
          <Typography
            sx={{
              fontSize: "0.95rem",
              color: templateColors.default,
              mb: 4,
              maxWidth: 450,
              mx: "auto",
            }}
          >
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{
              bgcolor: templateColors.accent,
              textTransform: "none",
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontFamily: templateFonts.heading,
              "&:hover": { bgcolor: "#1448b0" },
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
