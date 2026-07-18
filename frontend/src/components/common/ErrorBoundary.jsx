import { Component } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #021418 0%, #0c1445 50%, #1a237e 100%)",
            color: "#fff",
            textAlign: "center",
            px: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: "rgba(220, 38, 38, 0.1)",
              mb: 4,
            }}
          >
            <ErrorIcon sx={{ fontSize: 56, color: "#f87171", opacity: 0.9 }} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700,
              mb: 1.5,
              color: "#f4f8ff",
            }}
          >
            Something Went Wrong
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              mb: 4,
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Please try again.
          </Typography>

          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              color: "#fff",
              fontWeight: 700,
              fontFamily: '"Montserrat", sans-serif',
              textTransform: "none",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(220, 38, 38, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
                boxShadow: "0 12px 40px rgba(220, 38, 38, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
