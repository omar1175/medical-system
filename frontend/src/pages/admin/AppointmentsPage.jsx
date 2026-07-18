import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TextField, InputAdornment,
  Grid, Avatar,
} from "@mui/material";
import {
  Search, Event, Pending, CheckCircle, Cancel,
} from "@mui/icons-material";
import { fetchAppointments } from "../../store/slices/appointmentsSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatCard from "../../components/common/StatCard";
import StatusChip from "../../components/common/StatusChip";
import GradientHeader from "../../components/common/GradientHeader";
import EmptyState from "../../components/common/EmptyState";
import dayjs from "dayjs";

const STAT_CARDS = [
  { key: "total", label: "Total", icon: <Event sx={{ fontSize: 28 }} /> },
  { key: "PENDING", label: "Pending", icon: <Pending sx={{ fontSize: 28 }} /> },
  { key: "CONFIRMED", label: "Confirmed", icon: <CheckCircle sx={{ fontSize: 28 }} /> },
  { key: "CANCELLED", label: "Cancelled", icon: <Cancel sx={{ fontSize: 28 }} /> },
];

export default function AdminAppointmentsPage() {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((s) => s.appointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 12;

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const counts = useMemo(() => {
    const c = { total: appointments.length, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointments.forEach((a) => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [appointments]);

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patient_name?.toLowerCase().includes(q) ||
          a.doctor_name?.toLowerCase().includes(q) ||
          a.specialty_name?.toLowerCase().includes(q) ||
          String(a.id).includes(q)
      );
    }
    return list;
  }, [appointments, statusFilter, search]);

  const paginated = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const isPast = (dt) => dayjs(dt).isBefore(dayjs());

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader title="Appointments Overview" subtitle="Monitor and manage all appointments across the platform" gradient="dark" />

      {/* Stat Cards */}
      <Grid container spacing={2.5} mb={3}>
        {STAT_CARDS.map((card, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={card.key} data-aos="fade-up" data-aos-delay={String(i * 100)}>
            <StatCard
              icon={card.icon}
              value={counts[card.key]}
              label={card.label}
              gradientIndex={i}
              onClick={() => setStatusFilter(card.key === "total" ? "" : card.key)}
              active={statusFilter === card.key || (card.key === "total" && !statusFilter)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <TextField
        placeholder="Search by patient, doctor, specialty, or ID..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        sx={{ mb: 3, maxWidth: 500 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><Search sx={{ color: "#94a3b8" }} /></InputAdornment>,
          },
        }}
      />

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              {["ID", "Patient", "Doctor", "Specialty", "Date & Time", "Duration", "Status"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#64748b", fontFamily: '"Montserrat", sans-serif', fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="No appointments found"
                    description="Try adjusting your search or filters to see more results."
                    image="/assets/img/health/consultation-4.webp"
                    sx={{ py: 4, boxShadow: "none" }}
                  />
                </TableCell>
              </TableRow>
            ) : paginated.map((a) => (
              <TableRow
                key={a.id}
                hover
                sx={{
                  opacity: isPast(a.scheduled_at) && a.status !== "COMPLETED" ? 0.7 : 1,
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748b" }}>#{a.id}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={`/assets/img/person/person-${['m','f'][a.patient_name?.charCodeAt(0) % 2 || 0]}-${(a.patient_name?.charCodeAt(1) || 5) % 13 + 1}.webp`}
                      sx={{
                        width: 32,
                        height: 32,
                        border: "2px solid #059669",
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{a.patient_name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={`/assets/img/health/staff-${(a.doctor_name?.charCodeAt(0) || 1) % 11 + 1}.webp`}
                      sx={{
                        width: 32,
                        height: 32,
                        border: "2px solid #175cdd",
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{a.doctor_name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={a.specialty_name || "—"} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{dayjs(a.scheduled_at).format("MMM D, YYYY")}</Typography>
                  <Typography variant="caption" color="text.secondary">{dayjs(a.scheduled_at).format("h:mm A")}</Typography>
                </TableCell>
                <TableCell>{a.duration_minutes} min</TableCell>
                <TableCell>
                  <StatusChip status={a.status} type="appointment" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <Chip
              key={i}
              label={i + 1}
              onClick={() => setPage(i)}
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.85rem",
                height: 36,
                borderRadius: 2,
                bgcolor: page === i ? "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)" : "#f1f5f9",
                color: page === i ? "#fff" : "#64748b",
                border: page === i ? "none" : "1px solid #e2e8f0",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: page === i ? "linear-gradient(135deg, #0f4ba0 0%, #3a7bd5 100%)" : "#e2e8f0",
                  transform: "translateY(-1px)",
                  boxShadow: page === i ? "0 4px 12px rgba(23,92,221,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
