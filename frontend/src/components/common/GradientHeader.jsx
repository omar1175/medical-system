import { Box, Typography, Button } from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import BackgroundGradient from "./BackgroundGradient";

export default function GradientHeader({
  title,
  subtitle,
  gradient = "blue",
  showBack = false,
  onBack,
  action,
  children,
  sx = {},
}) {
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        mb: 4,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        ...sx,
      }}
    >
      <BackgroundGradient variant={gradient} />

      {showBack && (
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          sx={{
            mb: 1.5,
            color: "rgba(255,255,255,0.8)",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          Back
        </Button>
      )}

      <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              mb: subtitle ? 0.5 : 0,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>

      {children && (
        <Box sx={{ position: "relative", zIndex: 1, mt: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
