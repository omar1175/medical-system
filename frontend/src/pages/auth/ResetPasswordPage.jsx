import { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
  InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, LockReset as LockResetIcon, Lock as LockIcon } from "@mui/icons-material";
import { authService } from "../../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  if (!uid || !token) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)", p: 2 }}>
        <Card sx={{ maxWidth: 440, width: "100%", borderRadius: 4 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>Invalid or missing reset link parameters.</Alert>
            <Button variant="contained" component={RouterLink} to="/forgot-password" sx={{ mt: 1 }}>Request New Link</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const password = e.target.password.value;
      await authService.confirmPasswordReset({ uid, token, new_password: password });
      setMsg("Password reset successful! You can now sign in with your new password.");
    } catch (error) {
      setErr(error.response?.data?.detail || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)", p: 2 }}
    >
      <Card sx={{ maxWidth: 440, width: "100%", borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: "50%", bgcolor: "#175cdd12",
              display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2,
            }}>
              <LockResetIcon sx={{ fontSize: 28, color: "#175cdd" }} />
            </Box>
            <Typography variant="h5" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, color: "#112344" }}>
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Enter your new password below
            </Typography>
          </Box>

          {msg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>}
          {err && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{err}</Alert>}

          {!msg && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth label="New Password" name="password" type={showPassword ? "text" : "password"}
                margin="normal" required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </Box>
          )}

          {msg && (
            <Button variant="contained" component={RouterLink} to="/login" fullWidth sx={{ mt: 1, py: 1.5 }}>
              Go to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
