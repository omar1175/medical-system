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
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  MedicalServices as MedicalIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import {
  register as registerUser,
  clearError,
} from "../../store/slices/authSlice";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (!result.error) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)",
        }}
      >
        <Card
          sx={{
            maxWidth: 440,
            width: "100%",
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <PersonAddIcon sx={{ fontSize: 36, color: "#059669" }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                mb: 1,
              }}
            >
              Registration Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Please check your email to confirm your account before signing in.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{ py: 1.5, px: 4 }}
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      sx={{
        background:
          "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)",
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
            Join MediSys Today
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
          >
            Create your account and start booking appointments with top-rated
            healthcare professionals in your area.
          </Typography>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, lg: "0 0 520px" },
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
            maxWidth: 480,
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
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
                <PersonAddIcon sx={{ fontSize: 28, color: "#175cdd" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  color: "#112344",
                }}
              >
                Create Account
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Fill in your details to get started
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: 2 }}
                onClose={() => dispatch(clearError())}
              >
                {typeof error === "string"
                  ? error
                  : error.detail || JSON.stringify(error)}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              </Box>

              <TextField
                fullWidth
                label="Username"
                margin="normal"
                {...register("username", { required: "Username is required" })}
                error={!!errors.username}
                helperText={errors.username?.message}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
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
                select
                label="I am a"
                margin="normal"
                defaultValue="PATIENT"
                {...register("role", { required: "Role is required" })}
                error={!!errors.role}
                helperText={errors.role?.message}
              >
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Password"
                margin="normal"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
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
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                margin="normal"
                type="password"
                {...register("password2", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                error={!!errors.password2}
                helperText={errors.password2?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
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
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </Box>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ color: "#64748b" }}
            >
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ fontWeight: 600, color: "#175cdd" }}
              >
                Sign In
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
