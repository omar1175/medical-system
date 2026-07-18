import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Tooltip, Grid, Card,
  Dialog, DialogTitle, DialogContent, DialogActions, Container,
} from "@mui/material";
import { Cancel, Schedule, Videocam } from "@mui/icons-material";
import { fetchAppointments, cancelAppointment, rescheduleAppointment, clearAppointmentSuccess } from "../../store/slices/appointmentsSlice";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GradientHeader from "../../components/common/GradientHeader";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import StatusChip from "../../components/common/StatusChip";
import SectionHeader from "../../components/common/SectionHeader";

export default function PatientAppointmentsPage() {
  const dispatch = useDispatch();
  const { list: appointments, loading, success, error } = useSelector((s) => s.appointments);
  const [cancelId, setCancelId] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchAppointments(params));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    if (success) {
      setSnack({ open: true, msg: success, severity: "success" });
      dispatch(clearAppointmentSuccess());
    }
  }, [success, dispatch]);

  const handleCancel = () => {
    if (cancelId) {
      dispatch(cancelAppointment(cancelId));
      setCancelId(null);
    }
  };

  const handleReschedule = () => {
    if (rescheduleAppt && newDate) {
      dispatch(rescheduleAppointment({ id: rescheduleAppt.id, data: { scheduled_at: newDate.toISOString() } }));
      setRescheduleAppt(null);
      setNewDate(null);
    }
  };

  const upcoming = appointments.filter(
    (a) => (a.scheduled_at && dayjs(a.scheduled_at).isAfter(dayjs())) || a.status === "PENDING"
  );
  const past = appointments.filter(
    (a) => (a.scheduled_at && dayjs(a.scheduled_at).isBefore(dayjs())) || ["COMPLETED", "CANCELLED"].includes(a.status)
  );

  const statCards = [
    { label: "Total", value: appointments.length },
    { label: "Pending", value: appointments.filter(a => a.status === "PENDING").length },
    { label: "Confirmed", value: appointments.filter(a => a.status === "CONFIRMED").length },
    { label: "Cancelled", value: appointments.filter(a => a.status === "CANCELLED").length },
  ];

  if (loading && appointments.length === 0) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader title="My Appointments" subtitle="View and manage your medical appointments" />

      {/* Stat Cards */}
      <Grid container spacing={2.5} mb={4}>
        {statCards.map((card, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i} data-aos="fade-up" data-aos-delay={String(i * 100)}>
            <StatCard value={card.value} label={card.label} gradientIndex={i} />
          </Grid>
        ))}
      </Grid>

      <Container maxWidth="lg">
        {/* Upcoming */}
        <SectionHeader title="Upcoming" dataAos="fade-up" />
        {upcoming.length === 0 ? (
          <EmptyState
            image="/assets/img/health/consultation-4.webp"
            title="No upcoming appointments"
            description="Book a consultation with one of our doctors."
            actionLabel="Find Doctors"
            actionTo="/patient/doctors"
          />
        ) : (
          <Box data-aos="fade-up" data-aos-delay="0" sx={{ mb: 4, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, minWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Specialty</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcoming.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <DoctorAvatar
                            doctor={{ first_name: a.doctor_name?.split(" ")[0], last_name: a.doctor_name?.split(" ").slice(1).join(" "), id: a.doctor }}
                            size={32}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.doctor_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{a.specialty_name}</TableCell>
                      <TableCell>{a.scheduled_at ? dayjs(a.scheduled_at).format("MMM D, YYYY h:mm A") : "Time TBD"}</TableCell>
                      <TableCell>
                        <StatusChip status={a.status} type="appointment" />
                      </TableCell>
                      <TableCell align="right">
                        {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                          <>
                            {a.status === "CONFIRMED" && a.appointment_type === "ONLINE_VIDEO" && (
                              <Tooltip title="Join Video Call">
                                <Button
                                  component={RouterLink}
                                  to={`/patient/appointments/${a.id}/call`}
                                  size="small"
                                  variant="contained"
                                  startIcon={<Videocam fontSize="small" />}
                                  sx={{
                                    mr: 1,
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
                              </Tooltip>
                            )}
                            {a.status === "CONFIRMED" && (
                              <Tooltip title="Reschedule">
                                <IconButton color="primary" size="small" onClick={() => { setRescheduleAppt(a); setNewDate(dayjs(a.scheduled_at)); }}>
                                  <Schedule fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Cancel">
                              <IconButton color="error" size="small" onClick={() => setCancelId(a.id)}>
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Past */}
        <SectionHeader title="Past / Cancelled" dataAos="fade-up" />
        {past.length === 0 ? (
          <Typography color="text.secondary">No past appointments.</Typography>
        ) : (
          <Box data-aos="fade-up" data-aos-delay="0" sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, minWidth: 520 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Specialty</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {past.map((a) => (
                    <TableRow key={a.id} hover sx={{ opacity: 0.8 }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <DoctorAvatar
                            doctor={{ first_name: a.doctor_name?.split(" ")[0], last_name: a.doctor_name?.split(" ").slice(1).join(" "), id: a.doctor }}
                            size={28}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{a.doctor_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{a.specialty_name}</TableCell>
                      <TableCell>{a.scheduled_at ? dayjs(a.scheduled_at).format("MMM D, YYYY h:mm A") : "Time TBD"}</TableCell>
                      <TableCell>
                        <StatusChip status={a.status} type="appointment" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>

      <ConfirmDialog open={!!cancelId} title="Cancel Appointment" message="Are you sure you want to cancel this appointment?" onConfirm={handleCancel} onCancel={() => setCancelId(null)} />

      <Dialog open={!!rescheduleAppt} onClose={() => setRescheduleAppt(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <DateTimePicker label="New date & time" value={newDate} onChange={setNewDate} minDateTime={dayjs()} sx={{ mt: 2, width: "100%" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRescheduleAppt(null); setNewDate(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleReschedule} disabled={!newDate || newDate.isSame(dayjs(rescheduleAppt?.scheduled_at), "minute")}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar open={snack.open} severity={snack.severity} message={snack.msg} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
