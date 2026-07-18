import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 700,
          color: "#112344",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#fef3c7",
          }}
        >
          <Warning sx={{ color: "#d97706", fontSize: 22 }} />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <DialogContentText sx={{ color: "#3c4049", fontSize: "0.95rem" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: "#cbd5e1",
            color: "#3c4049",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
            "&:hover": { background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)", boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)" },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
