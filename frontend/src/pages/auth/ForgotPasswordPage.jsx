import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
} from "@mui/material";
import { LockReset as LockResetIcon } from "@mui/icons-material";
import { authService } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const email = e.target.email.value;
      await authService.requestPasswordReset(email);
      setMsg("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setErr(error.response?.data?.detail || "Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: "100%", borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#175cdd12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LockResetIcon sx={{ fontSize: 28, color: "#175cdd" }} />
            </Box>
            <Typography variant="h5" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, color: "#112344" }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Enter your email and we'll send you a reset link
            </Typography>
          </Box>

          {msg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>}
          {err && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{err}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" name="email" type="email" margin="normal" required />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ color: "#64748b" }}>
            Remember your password?{" "}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: "#175cdd" }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
