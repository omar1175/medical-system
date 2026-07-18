import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  description = "",
  actionLabel,
  actionTo,
  image = "/assets/img/health/consultation-4.webp",
  sx = {},
}) {
  const navigate = useNavigate();

  return (
    <Box
      data-aos="fade-up"
      sx={{
        textAlign: "center",
        py: 6,
        px: 3,
        borderRadius: 3,
        bgcolor: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          overflow: "hidden",
          mx: "auto",
          mb: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        <img
          src={image}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </Box>
      {icon && (
        <Box sx={{ color: "#cbd5e1", mb: 1 }}>{icon}</Box>
      )}
      <Typography
        variant="h6"
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          color: "#112344",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: "auto" }}>
          {description}
        </Typography>
      )}
      {actionLabel && actionTo && (
        <Button
          variant="contained"
          onClick={() => navigate(actionTo)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
