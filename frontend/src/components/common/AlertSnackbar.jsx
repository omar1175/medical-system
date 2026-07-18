import { Snackbar, Alert } from "@mui/material";

const severityConfig = {
  success: {
    bg: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
    icon: null,
  },
  error: {
    bg: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)",
    icon: null,
  },
  warning: {
    bg: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
    icon: null,
  },
  info: {
    bg: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
    icon: null,
  },
};

export default function AlertSnackbar({ open, severity = "info", message, onClose }) {
  const config = severityConfig[severity] || severityConfig.info;

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          background: config.bg,
          fontWeight: 600,
          fontFamily: '"Montserrat", sans-serif',
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          borderRadius: 2,
          "& .MuiAlert-icon": {
            fontSize: "1.2rem",
          },
        }}
      >
        {typeof message === "string" ? message : JSON.stringify(message)}
      </Alert>
    </Snackbar>
  );
}
