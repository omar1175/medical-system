import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem,
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Container,
} from "@mui/material";
import { Add, Delete, Schedule, CalendarMonth, AccessTime, ToggleOn } from "@mui/icons-material";
import {
  fetchAvailability, createAvailability, deleteAvailability,
} from "../../store/slices/doctorsSlice";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import GradientHeader from "../../components/common/GradientHeader";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import StatusChip from "../../components/common/StatusChip";
import SectionHeader from "../../components/common/SectionHeader";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AvailabilityPage() {
  const dispatch = useDispatch();
  const { availability } = useSelector((s) => s.doctors);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    dispatch(fetchAvailability());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(createAvailability(data));
    if (!result.error) {
      reset();
      setSnack({ open: true, msg: "Availability added.", severity: "success" });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteAvailability(deleteId));
      setDeleteId(null);
    }
  };

  const totalSlots = availability.length;
  const activeDays = new Set(availability.filter((a) => a.is_active).map((a) => a.day_of_week)).size;
  const hoursPerWeek = availability.reduce((sum, a) => {
    const [sh, sm] = a.start_time.split(":").map(Number);
    const [eh, em] = a.end_time.split(":").map(Number);
    return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }, 0);

  return (
    <Box>
      <GradientHeader title="Manage Availability" subtitle="Set your weekly schedule for patient appointments" gradient="blue" />

      <Container maxWidth="lg">
        {/* Summary Stats */}
        <Grid container spacing={2.5} mb={4}>
          {[
            { icon: <Schedule sx={{ fontSize: 28 }} />, value: totalSlots, label: "Total Slots" },
            { icon: <CalendarMonth sx={{ fontSize: 28 }} />, value: activeDays, label: "Active Days" },
            { icon: <AccessTime sx={{ fontSize: 28 }} />, value: `${hoursPerWeek.toFixed(1)}`, label: "Hours/Week" },
          ].map((card, i) => (
            <Grid size={{ xs: 12, sm: 4 }} key={i} data-aos="fade-up" data-aos-delay={i * 100}>
              <StatCard icon={card.icon} value={card.value} label={card.label} gradientIndex={i} />
            </Grid>
          ))}
        </Grid>

        {/* Add Form */}
        <Card sx={{ mb: 4 }} data-aos="fade-up" data-aos-delay="0">
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Schedule sx={{ color: "#175cdd" }} />
              <Typography variant="h6" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, color: "#112344" }}>
                Add Time Slot
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a day and time range to make yourself available for bookings
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth select label="Day" {...register("day_of_week", { required: true })} error={!!errors.day_of_week}>
                    {DAY_NAMES.map((d, i) => (
                      <MenuItem key={i} value={i}>{d}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField fullWidth type="time" label="Start Time" {...register("start_time", { required: true })} slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField fullWidth type="time" label="End Time" {...register("end_time", { required: true })} slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button
                    fullWidth variant="contained" type="submit"
                    sx={{
                      height: "56px",
                      background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { background: "linear-gradient(135deg, #1450b8 0%, #3d80d0 100%)" },
                    }}
                  >
                    <Add />
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Schedule Table */}
        <SectionHeader title="Your Schedule" dataAos="fade-up" />
        {availability.length === 0 ? (
          <EmptyState
            title="No availability set yet"
            description="Add your first time slot above to start accepting patient appointments."
            image="/assets/img/health/consultation-4.webp"
          />
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }} data-aos="fade-up" data-aos-delay="100">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availability.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}>
                        {DAY_NAMES[a.day_of_week]}
                      </Typography>
                    </TableCell>
                    <TableCell>{a.start_time}</TableCell>
                    <TableCell>{a.end_time}</TableCell>
                    <TableCell>
                      <StatusChip status={a.is_active ? "active" : "inactive"} type="availability" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="error" size="small" onClick={() => setDeleteId(a.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <ConfirmDialog open={!!deleteId} title="Delete Availability" message="Are you sure you want to remove this time slot?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      <AlertSnackbar open={snack.open} severity={snack.severity} message={snack.msg} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
