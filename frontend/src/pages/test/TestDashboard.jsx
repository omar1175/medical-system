import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Videocam,
  Chat,
  Event,
  Login,
  ContentCopy,
  CheckCircle,
} from "@mui/icons-material";
import { login } from "../../store/slices/authSlice";

const TEST_ACCOUNTS = [
  {
    label: "Patient",
    username: "test_patient",
    password: "testpass123",
    role: "PATIENT",
    color: "#059669",
    appointmentsPath: "/patient/appointments",
    chatPath: "/patient/chat",
    appointmentId: null, // will be set after seed
  },
  {
    label: "Doctor",
    username: "test_doctor",
    password: "doctor123",
    role: "DOCTOR",
    color: "#175cdd",
    appointmentsPath: "/doctor/appointments",
    chatPath: "/doctor/chat",
    appointmentId: null,
  },
];

export default function TestDashboard() {
  const navigate = useNavigate();
  const useDispatch_ = useDispatch();
  const [activeLogin, setActiveLogin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [appointmentId, setAppointmentId] = useState("");

  const handleLogin = async (account) => {
    setLoading(true);
    setError(null);
    setActiveLogin(account.label);
    try {
      const result = await useDispatch_(login({
        username: account.username,
        password: account.password,
      }));
      if (login.fulfilled.match(result)) {
        navigate(account.appointmentsPath);
      } else {
        setError(`Login failed for ${account.label}. Make sure you ran seed_test_data.`);
      }
    } catch {
      setError("Login failed. Is the backend running?");
    } finally {
      setLoading(false);
      setActiveLogin(null);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f8ff",
        py: 6,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              color: "#112344",
              mb: 1,
            }}
          >
            Feature Test Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test video call, chat, and appointments independently
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Test Accounts */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                mb: 3,
                color: "#112344",
              }}
            >
              Quick Login
            </Typography>
            <Grid container spacing={3}>
              {TEST_ACCOUNTS.map((account) => (
                <Grid size={{ xs: 12, md: 6 }} key={account.label}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: `${account.color}30`,
                      "&:hover": { borderColor: account.color, boxShadow: 2 },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <Chip
                          label={account.label}
                          size="small"
                          sx={{
                            bgcolor: `${account.color}15`,
                            color: account.color,
                            fontWeight: 700,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {account.username}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <TextField
                          size="small"
                          value={account.username}
                          InputProps={{ readOnly: true }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          value={account.password}
                          InputProps={{ readOnly: true }}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          size="small"
                          onClick={() => handleCopy(`${account.username} / ${account.password}`, account.label)}
                          sx={{ minWidth: "auto", px: 1 }}
                        >
                          {copied === account.label ? (
                            <CheckCircle fontSize="small" color="success" />
                          ) : (
                            <ContentCopy fontSize="small" />
                          )}
                        </Button>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Login />}
                        loading={activeLogin === account.label && loading}
                        onClick={() => handleLogin(account)}
                        sx={{
                          background: `linear-gradient(135deg, ${account.color} 0%, ${account.color}cc 100%)`,
                          py: 1.2,
                          fontWeight: 700,
                          "&:hover": { background: `linear-gradient(135deg, ${account.color}dd 0%, ${account.color} 100%)` },
                        }}
                      >
                        Login as {account.label}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Feature Test Links */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                mb: 3,
                color: "#112344",
              }}
            >
              Direct Feature Links
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Login first, then use these links. Or open the links in a new tab after logging in.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { borderColor: "#059669", boxShadow: 2 },
                    transition: "all 0.2s",
                  }}
                  onClick={() => navigate("/patient/appointments")}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Event sx={{ fontSize: 40, color: "#059669", mb: 1 }} />
                    <Typography fontWeight={700}>Appointments</Typography>
                    <Typography variant="caption" color="text.secondary">
                      View & manage appointments
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { borderColor: "#175cdd", boxShadow: 2 },
                    transition: "all 0.2s",
                  }}
                  onClick={() => navigate("/patient/chat")}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Chat sx={{ fontSize: 40, color: "#175cdd", mb: 1 }} />
                    <Typography fontWeight={700}>Chat</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Real-time messaging
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    "&:hover": { borderColor: "#dc2626", boxShadow: 2 },
                    transition: "all 0.2s",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Videocam sx={{ fontSize: 40, color: "#dc2626", mb: 1 }} />
                    <Typography fontWeight={700}>Video Call</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Enter appointment ID:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Appointment ID"
                        value={appointmentId}
                        onChange={(e) => setAppointmentId(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        disabled={!appointmentId}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patient/appointments/${appointmentId}/call`);
                        }}
                      >
                        Join
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                mb: 2,
                color: "#112344",
              }}
            >
              Testing Instructions
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#059669", mb: 1 }}>
                Video Call Test
              </Typography>
              <Box component="ol" sx={{ pl: 3, m: 0 }}>
                <li>Run <code>python manage.py seed_test_data</code></li>
                <li>Login as Patient (test_patient)</li>
                <li>Go to Appointments → click "Join Call" on the seeded appointment</li>
                <li>Open a new tab → Login as Doctor (test_doctor)</li>
                <li>Go to Appointments → click "Join Call"</li>
                <li>Both tabs connected via WebRTC</li>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#175cdd", mb: 1 }}>
                Chat Test
              </Typography>
              <Box component="ol" sx={{ pl: 3, m: 0 }}>
                <li>Login as Patient → go to Messages</li>
                <li>Open a new tab → Login as Doctor → go to Messages</li>
                <li>Select the conversation → send messages</li>
                <li>Messages appear in real-time on both tabs</li>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#d97706", mb: 1 }}>
                Reset Test Data
              </Typography>
              <Box sx={{ fontFamily: "monospace", bgcolor: "#f8fafc", p: 2, borderRadius: 1 }}>
                python manage.py seed_test_data --flush
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
