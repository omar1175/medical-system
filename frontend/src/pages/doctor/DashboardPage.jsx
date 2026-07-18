import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Button, Chip, Divider,
} from "@mui/material";
import { Event, Schedule, Person } from "@mui/icons-material";
import { fetchAppointments } from "../../store/slices/appointmentsSlice";
import AgentWidget from "../../components/agent/AgentWidget";
import dayjs from "dayjs";

export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { list: appointments } = useSelector((s) => s.appointments);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const today = dayjs().startOf("day");
  const todayAppts = appointments.filter(
    (a) => dayjs(a.scheduled_at).isSame(today, "day") && a.status !== "CANCELLED"
  );
  const pending = appointments.filter((a) => a.status === "PENDING");
  const upcoming = appointments.filter(
    (a) => dayjs(a.scheduled_at).isAfter(dayjs()) && a.status !== "CANCELLED"
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, Dr. {user?.first_name || user?.username}
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Manage your schedule and appointments
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card><CardContent>
            <Typography variant="h3" color="primary">{todayAppts.length}</Typography>
            <Typography color="text.secondary">Today's Appointments</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card><CardContent>
            <Typography variant="h3" color="warning.main">{pending.length}</Typography>
            <Typography color="text.secondary">Pending Approval</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card><CardContent>
            <Typography variant="h3" color="success.main">{upcoming.length}</Typography>
            <Typography color="text.secondary">Upcoming</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card><CardContent>
            <Typography variant="h3">{appointments.length}</Typography>
            <Typography color="text.secondary">Total Appointments</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea onClick={() => navigate("/doctor/availability")} sx={{ p: 3 }}>
              <CardContent>
                <Schedule color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Manage Availability</Typography>
                <Typography variant="body2" color="text.secondary">
                  Set your weekly schedule
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea onClick={() => navigate("/doctor/appointments")} sx={{ p: 3 }}>
              <CardContent>
                <Event color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Appointments</Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage appointments
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardActionArea onClick={() => navigate("/doctor/profile")} sx={{ p: 3 }}>
              <CardContent>
                <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">My Profile</Typography>
                <Typography variant="body2" color="text.secondary">
                  Edit your information
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {todayAppts.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" gutterBottom>Today's Schedule</Typography>
          {todayAppts.map((a) => (
            <Card key={a.id} sx={{ mb: 1 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography fontWeight={600}>{a.patient_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(a.scheduled_at).format("h:mm A")} - {a.duration_minutes} min
                  </Typography>
                </Box>
                <Chip label={a.status} size="small" color={a.status === "CONFIRMED" ? "success" : "warning"} />
              </CardContent>
            </Card>
          ))}
        </>
      )}
      <AgentWidget />
    </Box>
  );
}
