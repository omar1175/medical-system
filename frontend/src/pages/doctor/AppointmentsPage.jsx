import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Card, CardContent,
  Grid, Container, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem,
} from "@mui/material";
import {
  CheckCircle, Cancel, Done, Event, Pending, Schedule, Videocam,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  fetchAppointments, confirmAppointment, completeAppointment, cancelAppointment,
} from "../../store/slices/appointmentsSlice";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GradientHeader from "../../components/common/GradientHeader";
import StatCard from "../../components/common/StatCard";
import PatientAvatar from "../../components/common/PatientAvatar";
import StatusChip from "../../components/common/StatusChip";
import SectionHeader from "../../components/common/SectionHeader";
import EmptyState from "../../components/common/EmptyState";

const STAT_CARDS = [
  { key: "TODAY", label: "Today", icon: <Event sx={{ fontSize: 28 }} /> },
  { key: "PENDING", label: "Pending", icon: <Pending sx={{ fontSize: 28 }} /> },
  { key: "CONFIRMED", label: "Confirmed", icon: <Schedule sx={{ fontSize: 28 }} /> },
  { key: "COMPLETED", label: "Completed", icon: <CheckCircle sx={{ fontSize: 28 }} /> },
];

export default function DoctorAppointmentsPage() {
  const dispatch = useDispatch();
  const { list: appointments, loading, error } = useSelector((s) => s.appointments);
  const [confirmAction, setConfirmAction] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [scheduleDialog, setScheduleDialog] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(dayjs().add(1, "day").hour(10).minute(0));
  const [scheduleDuration, setScheduleDuration] = useState(30);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const counts = useMemo(() => {
    const c = { total: appointments.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, TODAY: 0 };
    const todayStr = dayjs().format("YYYY-MM-DD");
    appointments.forEach((a) => {
      if (c[a.status] !== undefined) c[a.status]++;
      if (a.scheduled_at && dayjs(a.scheduled_at).format("YYYY-MM-DD") === todayStr) c.TODAY++;
    });
    return c;
  }, [appointments]);

  const today = useMemo(
    () => appointments.filter((a) => a.scheduled_at && dayjs(a.scheduled_at).isSame(dayjs(), "day")),
    [appointments]
  );
  const upcoming = useMemo(
    () => appointments.filter(
      (a) => (a.scheduled_at && dayjs(a.scheduled_at).isAfter(dayjs(), "day")) || a.status === "PENDING"
    ),
    [appointments]
  );
  const past = useMemo(
    () => appointments.filter((a) =>
      (a.scheduled_at && dayjs(a.scheduled_at).isBefore(dayjs(), "day")) || ["COMPLETED", "CANCELLED"].includes(a.status)
    ),
    [appointments]
  );

  const executeAction = async () => {
    if (!confirmAction) return;
    const { fn, payload, label } = confirmAction;
    const result = await dispatch(fn(payload));
    if (!result.error) {
      setSnack({ open: true, msg: `${label} successfully.`, severity: "success" });
    } else {
      const msg = result.error?.scheduled_at?.[0] || result.error?.detail || `Failed to ${label.toLowerCase()}.`;
      setSnack({ open: true, msg, severity: "error" });
    }
    setNotesDialogOpen(false);
    setPendingAction(null);
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleDialog) return;
    const result = await dispatch(confirmAppointment({
      id: scheduleDialog.id,
      data: {
        scheduled_at: scheduleDate.toISOString(),
        duration_minutes: scheduleDuration,
      },
    }));
    if (!result.error) {
      setSnack({ open: true, msg: "Appointment confirmed with scheduled time.", severity: "success" });
    } else {
      const msg = result.error?.scheduled_at?.[0] || result.error?.detail || "Failed to confirm.";
      setSnack({ open: true, msg, severity: "error" });
    }
    setScheduleDialog(null);
  };

  const formatTime = (a) => {
    if (!a.scheduled_at) return "Time TBD";
    return `${dayjs(a.scheduled_at).format("MMM D, YYYY h:mm A")} · ${a.duration_minutes || 30} min`;
  };

  const renderAppointmentCard = (a, showActions = true) => (
    <Card
      key={a.id}
      sx={{
        mb: 1.5,
        borderLeft: "4px solid",
        borderColor: a.status === "CONFIRMED" ? "#059669" : a.status === "PENDING" ? "#d97706" : a.status === "CANCELLED" ? "#dc2626" : "#0284c7",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, "&:last-child": { pb: 2 } }}>
        <PatientAvatar patient={{ id: a.patient_id, name: a.patient_name }} size={48} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif', color: "#112344" }}>
              {a.patient_name}
            </Typography>
            <StatusChip status={a.status} type="appointment" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {a.specialty_name} · {formatTime(a)}
          </Typography>
          {a.notes && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {a.notes}
            </Typography>
          )}
        </Box>
        {showActions && (
          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            {a.status === "PENDING" && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CheckCircle fontSize="small" />}
                  onClick={() => {
                    setScheduleDate(a.scheduled_at ? dayjs(a.scheduled_at) : dayjs().add(1, "day").hour(10).minute(0));
                    setScheduleDuration(a.duration_minutes || 30);
                    setScheduleDialog(a);
                  }}
                  sx={{
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { background: "linear-gradient(135deg, #047857 0%, #059669 100%)" },
                  }}
                >
                  Confirm
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Cancel fontSize="small" />}
                  onClick={() => setConfirmAction({ fn: cancelAppointment, payload: a.id, label: "Appointment rejected" })}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    "&:hover": { borderColor: "#b91c1c", bgcolor: "#fef2f2" },
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {a.status === "CONFIRMED" && (
              <>
                {a.appointment_type === "ONLINE_VIDEO" && (
                  <Button
                    size="small"
                    variant="contained"
                    component={RouterLink}
                    to={`/doctor/appointments/${a.id}/call`}
                    startIcon={<Videocam fontSize="small" />}
                    sx={{
                      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      "&:hover": { background: "linear-gradient(135deg, #047857 0%, #059669 100%)" },
                    }}
                  >
                    Join Call
                  </Button>
                )}
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Done fontSize="small" />}
                  onClick={() => setConfirmAction({ fn: completeAppointment, payload: a.id, label: "Appointment completed" })}
                  sx={{
                    background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { background: "linear-gradient(135deg, #1450b8 0%, #3d80d0 100%)" },
                  }}
                >
                  Complete
                </Button>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <GradientHeader title="My Appointments" subtitle="Manage your patient appointments" gradient="dark" />

        <Container maxWidth="lg">
          <Grid container spacing={2.5} mb={4}>
            {STAT_CARDS.map((card, idx) => (
              <Grid size={{ xs: 6, md: 3 }} key={card.key} data-aos="fade-up" data-aos-delay={idx * 100}>
                <StatCard icon={card.icon} value={counts[card.key]} label={card.label} gradientIndex={idx} />
              </Grid>
            ))}
          </Grid>

          {today.length > 0 && (
            <Box sx={{ mb: 3 }} data-aos="fade-up" data-aos-delay="0">
              <SectionHeader title="Today" sx={{ mb: 2 }} />
              {today.map((a) => renderAppointmentCard(a))}
            </Box>
          )}

          {upcoming.length > 0 && (
            <Box sx={{ bgcolor: "#f4f8ff", borderRadius: 3, py: 3, px: { xs: 2, md: 3 }, mb: 3 }} data-aos="fade-up" data-aos-delay="100">
              <SectionHeader title="Upcoming" sx={{ mb: 2 }} />
              {upcoming.map((a) => renderAppointmentCard(a))}
            </Box>
          )}

          {past.length > 0 && (
            <Box sx={{ mb: 3 }} data-aos="fade-up" data-aos-delay="200">
              <SectionHeader title="Past & Completed" sx={{ mb: 2 }} />
              {past.map((a) => renderAppointmentCard(a, false))}
            </Box>
          )}

          {appointments.length === 0 && (
            <EmptyState
              title="No appointments yet"
              description="Appointments will appear here once patients book with you."
              image="/assets/img/health/consultation-4.webp"
            />
          )}
        </Container>

        <ConfirmDialog open={!!confirmAction} title="Confirm Action" message="Are you sure you want to proceed?" onConfirm={executeAction} onCancel={() => setConfirmAction(null)} />

        <Dialog open={!!scheduleDialog} onClose={() => setScheduleDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
            Schedule Appointment
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set the date and time for this appointment with {scheduleDialog?.patient_name}.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={scheduleDate}
                onChange={(val) => val && setScheduleDate(val)}
                disablePast
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
              <TextField
                fullWidth
                select
                label="Duration"
                value={scheduleDuration}
                onChange={(e) => setScheduleDuration(parseInt(e.target.value))}
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={45}>45 minutes</MenuItem>
                <MenuItem value={60}>60 minutes</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setScheduleDialog(null)} sx={{ textTransform: "none", fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleScheduleConfirm}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              }}
            >
              Confirm & Schedule
            </Button>
          </DialogActions>
        </Dialog>

        <AlertSnackbar open={snack.open} severity={snack.severity} message={snack.msg} onClose={() => setSnack({ ...snack, open: false })} />
      </Box>
    </LocalizationProvider>
  );
}
