import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Alert, CircularProgress, Grid, Container, ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import { Event, AttachMoney, Star, Videocam, Chat } from "@mui/icons-material";
import { fetchDoctor } from "../../store/slices/doctorsSlice";
import { createAppointment, clearAppointmentError, clearAppointmentSuccess } from "../../store/slices/appointmentsSlice";
import GradientHeader from "../../components/common/GradientHeader";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const TYPE_ICONS = {
  IN_PERSON: <Event />,
  ONLINE_CHAT: <Chat />,
  ONLINE_VIDEO: <Videocam />,
};

export default function BookAppointmentPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: doctor, loading: docLoading } = useSelector((s) => s.doctors);
  const { loading, error, success } = useSelector((s) => s.appointments);
  const [appointmentType, setAppointmentType] = useState("IN_PERSON");
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { notes: "" },
  });

  const consultationFee = appointmentType === "IN_PERSON"
    ? doctor?.consultation_fee
    : doctor?.online_consultation_fee;

  useEffect(() => {
    dispatch(clearAppointmentSuccess());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDoctor(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/patient/appointments"), 1500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const onSubmit = (data) => {
    dispatch(createAppointment({
      doctor: parseInt(id),
      appointment_type: appointmentType,
      notes: data.notes,
    }));
  };

  if (docLoading || !doctor) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader
        title="Request Appointment"
        subtitle={`with Dr. ${doctor.first_name} ${doctor.last_name} — ${doctor.specialty_detail?.name}`}
        gradient="blue"
        showBack
        onBack={() => navigate(-1)}
      />

      <Container maxWidth="lg">
        <Card sx={{ mb: 3, display: "flex", alignItems: "center", gap: 3, p: 3 }} data-aos="fade-up">
          <DoctorAvatar doctor={doctor} size={80} showStatus />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, color: "#112344" }}>
              Dr. {doctor.first_name} {doctor.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {doctor.specialty_detail?.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AttachMoney sx={{ fontSize: 16, color: "#175cdd" }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${doctor.consultation_fee} in-person
                </Typography>
              </Box>
              {doctor.online_consultation_fee > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AttachMoney sx={{ fontSize: 16, color: "#10b981" }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${doctor.online_consultation_fee} online
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} sx={{ fontSize: 14, color: s <= Math.round(doctor.rating || 0) ? "#f59e0b" : "#e2e8f0" }} />
                ))}
                <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>{doctor.rating || "—"}</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Appointment requested! The doctor will confirm your appointment soon.</Alert>}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => dispatch(clearAppointmentError())}>
            {typeof error === "string" ? error : error.detail || JSON.stringify(error)}
          </Alert>
        )}

        <Card sx={{ mb: 3 }} data-aos="fade-up" data-aos-delay="50">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, color: "#112344" }}>
              Consultation Type
            </Typography>
            <ToggleButtonGroup
              value={appointmentType}
              exclusive
              onChange={(_, val) => val && setAppointmentType(val)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="IN_PERSON" sx={{ textTransform: "none", py: 1.5 }}>
                <Event sx={{ mr: 1 }} /> In-Person
                {doctor.consultation_fee > 0 && (
                  <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, color: "#175cdd" }}>
                    (${doctor.consultation_fee})
                  </Typography>
                )}
              </ToggleButton>
              <ToggleButton value="ONLINE_CHAT" sx={{ textTransform: "none", py: 1.5 }}>
                <Chat sx={{ mr: 1 }} /> Chat
                {doctor.online_consultation_fee > 0 && (
                  <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, color: "#10b981" }}>
                    (${doctor.online_consultation_fee})
                  </Typography>
                )}
              </ToggleButton>
              <ToggleButton value="ONLINE_VIDEO" sx={{ textTransform: "none", py: 1.5 }}>
                <Videocam sx={{ mr: 1 }} /> Video
                {doctor.online_consultation_fee > 0 && (
                  <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, color: "#10b981" }}>
                    (${doctor.online_consultation_fee})
                  </Typography>
                )}
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ p: 2, bgcolor: "#f0f9ff", borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Fee: <span style={{ color: appointmentType === "IN_PERSON" ? "#175cdd" : "#10b981", fontSize: "1.2rem" }}>
                  ${consultationFee || 0}
                </span>
              </Typography>
              {appointmentType !== "IN_PERSON" && (
                <Typography variant="caption" color="text.secondary">
                  Save ${(doctor.consultation_fee || 0) - (doctor.online_consultation_fee || 0)} with online consultation
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          After you submit, the doctor will review your request and confirm an appointment time.
        </Alert>

        <Card sx={{ maxWidth: 600 }} data-aos="fade-up" data-aos-delay="200">
          <CardContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline rows={3} label="Notes (optional)" {...register("notes")} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Request Appointment"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
