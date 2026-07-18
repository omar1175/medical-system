import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  CheckCircle as CheckIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";
import { fetchDoctors, fetchSpecialties } from "../../store/slices/doctorsSlice";
import { appointmentService } from "../../services/appointmentService";

export default function AppointmentPage() {
  const dispatch = useDispatch();
  const { list: allDoctors, specialties, loading: doctorsLoading } = useSelector((s) => s.doctors);
  const { user, token } = useSelector((s) => s.auth);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchSpecialties());
    dispatch(fetchDoctors());
  }, [dispatch]);

  const filteredDoctors = allDoctors.filter((d) => {
    if (!selectedSpecialty) return true;
    return (d.specialty_name || "").toLowerCase() === selectedSpecialty.toLowerCase();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Please log in to book an appointment.");
      return;
    }
    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      setError("Please select a date and time.");
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    const doctor = filteredDoctors.find((d) => String(d.id) === String(selectedDoctor));
    const specialtyId = doctor?.specialty || selectedSpecialty || undefined;

    setSubmitting(true);
    try {
      await appointmentService.create({
        doctor: Number(selectedDoctor),
        specialty: specialtyId && !isNaN(Number(specialtyId)) ? Number(specialtyId) : undefined,
        scheduled_at: scheduledAt,
        duration_minutes: 30,
        appointment_type: "IN_PERSON",
        notes: notes || "",
      });
      setSuccess(true);
      setSelectedSpecialty("");
      setSelectedDoctor("");
      setScheduledDate("");
      setScheduledTime("");
      setNotes("");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.scheduled_at?.[0] ||
        err.response?.data?.doctor?.[0] ||
        "Failed to book appointment. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { icon: <CalendarIcon sx={{ fontSize: 32, color: templateColors.accent }} />, title: "Select Service", desc: "Choose the medical service you need" },
    { icon: <ClockIcon sx={{ fontSize: 32, color: templateColors.accent }} />, title: "Pick Date & Time", desc: "Select your preferred appointment slot" },
    { icon: <CheckIcon sx={{ fontSize: 32, color: templateColors.accent }} />, title: "Confirm Details", desc: "Provide your information and confirm" },
  ];

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Box>
      <PageTitle
        title="Appointment"
        subtitle="Book your medical appointment in just a few simple steps"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Appointment" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          {/* Steps */}
          <Grid container spacing={2} sx={{ mb: 5 }}>
            {steps.map((step, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    transition: "all 0.3s",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(0,0,0,0.1)" },
                  }}
                >
                  <Box sx={{ mb: 1.5 }}>{step.icon}</Box>
                  <Typography
                    sx={{
                      fontFamily: templateFonts.heading,
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: templateColors.heading,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: templateColors.default }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <Typography
              sx={{
                fontFamily: templateFonts.heading,
                fontWeight: 700,
                fontSize: "1.3rem",
                color: templateColors.heading,
                mb: 3,
                textAlign: "center",
              }}
            >
              Schedule Your Appointment
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {!token && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                You need to <strong>log in</strong> as a patient to book an appointment.
              </Alert>
            )}

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Specialty"
                  variant="outlined"
                  size="small"
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setSelectedDoctor("");
                  }}
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {specialties.map((s) => (
                    <MenuItem key={s.id} value={s.name}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Doctor"
                  variant="outlined"
                  size="small"
                  required
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <MenuItem value="">
                    {doctorsLoading ? "Loading..." : "Select Doctor"}
                  </MenuItem>
                  {filteredDoctors.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: templateColors.accent }} />
                        <span>{d.full_name}</span>
                        <Chip
                          label={d.specialty_name}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            bgcolor: `${templateColors.accent}10`,
                            color: templateColors.accent,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  variant="outlined"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: minDate }}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time"
                  variant="outlined"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Appointment Type"
                  variant="outlined"
                  size="small"
                  defaultValue="IN_PERSON"
                >
                  <MenuItem value="IN_PERSON">In-Person Visit</MenuItem>
                  <MenuItem value="TELEHEALTH">Telehealth / Video</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Describe your symptoms or reason for visit (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CalendarIcon />}
                  sx={{
                    bgcolor: templateColors.accent,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#1448b0" },
                    "&.Mui-disabled": { bgcolor: `${templateColors.accent}60` },
                  }}
                >
                  {submitting ? "Booking..." : "Book Appointment Now"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Emergency info */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              bgcolor: "#fff3cd",
              border: "1px solid #ffc107",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <PhoneIcon sx={{ color: "#856404" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "#856404" }}>
              For medical emergencies, please call <strong>911</strong> or go to the nearest
              emergency room.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          Appointment booked successfully! Check your email for confirmation.
        </Alert>
      </Snackbar>
    </Box>
  );
}
