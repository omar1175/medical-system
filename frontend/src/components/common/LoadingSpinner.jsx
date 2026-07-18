import { Box, Typography, CircularProgress } from "@mui/material";

export default function LoadingSpinner({ fullPage = false, message = "Loading..." }) {
  if (fullPage) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f4f8ff 0%, #e8f0fe 100%)",
        }}
        role="status"
        aria-label="Loading"
      >
        <Box sx={{ position: "relative", mb: 3 }}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: "#175cdd" }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt=""
              sx={{ width: 28, height: 28, opacity: 0.7 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </Box>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "#3c4049",
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}
      role="status"
      aria-label="Loading"
    >
      <CircularProgress size={36} thickness={4} sx={{ color: "#175cdd" }} />
    </Box>
  );
}
