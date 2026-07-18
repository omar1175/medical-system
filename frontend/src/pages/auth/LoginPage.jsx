import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  MedicalServices as MedicalIcon,
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { login, clearError } from "../../store/slices/authSlice";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (!result.error) {
      const role = result.payload?.role;
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "DOCTOR") navigate("/doctor/dashboard");
      else navigate("/patient/dashboard");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      sx={{
        background: "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "60%",
          height: "200%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "40%",
          height: "150%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.02)",
        },
      }}
    >
      {/* Left decorative panel */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ maxWidth: 420, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 4,
            }}
          >
            <MedicalIcon sx={{ fontSize: 40, color: "#fff" }} />
          </Box>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Welcome to MediSys
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            Your trusted medical appointment platform. Connect with
            experienced healthcare providers and manage your health journey.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
            {[
              { num: "50+", label: "Doctors" },
              { num: "10K+", label: "Patients" },
              { num: "24/7", label: "Support" },
            ].map((stat) => (
              <Box key={stat.label} textAlign="center">
                <Typography
                  variant="h4"
                  sx={{ color: "#fff", fontWeight: 800, fontFamily: '"Montserrat", sans-serif' }}
                >
                  {stat.num}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, lg: "0 0 480px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Mobile logo */}
            <Box
              sx={{
                display: { xs: "flex", lg: "none" },
                alignItems: "center",
                gap: 1.5,
                mb: 3,
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MedicalIcon sx={{ color: "#fff", fontSize: 22 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 800, color: "#112344" }}
              >
                MediSys
              </Typography>
            </Box>

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
                <LoginIcon sx={{ fontSize: 28, color: "#175cdd" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  color: "#112344",
                }}
              >
                Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Enter your credentials to access your account
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: 2 }}
                onClose={() => dispatch(clearError())}
              >
                {typeof error === "string" ? error : error.detail || JSON.stringify(error)}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="Username"
                type="text"
                margin="normal"
                {...register("username", { required: "Username is required" })}
                error={!!errors.username}
                helperText={errors.username?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message}
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

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1rem" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{ fontWeight: 600, color: "#175cdd" }}
                >
                  Create Account
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{ color: "#64748b", fontSize: "0.85rem" }}
                >
                  Forgot password?
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
