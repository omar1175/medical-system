import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, InputAdornment,
  Switch, Avatar, Grid, FormControl,
  InputLabel, Select, MenuItem,
} from "@mui/material";
import {
  Search, People, AdminPanelSettings, MedicalServices, Person,
} from "@mui/icons-material";
import api from "../../services/api";
import { authService } from "../../services/authService";
import { doctorService } from "../../services/doctorService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import StatCard from "../../components/common/StatCard";
import StatusChip from "../../components/common/StatusChip";
import GradientHeader from "../../components/common/GradientHeader";
import EmptyState from "../../components/common/EmptyState";
import { getDoctorImage } from "../../data/doctorImages";
import { getPatientImage } from "../../data/patientImages";

const STAT_CARDS = [
  { key: "total", label: "Total Users", icon: <People sx={{ fontSize: 28 }} /> },
  { key: "ADMIN", label: "Admins", icon: <AdminPanelSettings sx={{ fontSize: 28 }} /> },
  { key: "DOCTOR", label: "Doctors", icon: <MedicalServices sx={{ fontSize: 28 }} /> },
  { key: "PATIENT", label: "Patients", icon: <Person sx={{ fontSize: 28 }} /> },
];

const AVATAR_COLORS = {
  ADMIN: "#dc2626",
  DOCTOR: "#175cdd",
  PATIENT: "#059669",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const fetchUsers = async (role) => {
    try {
      const params = {};
      if (role) params.role = role;
      const res = await api.get("/users/", { params });
      setUsers(res.data.results || res.data);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter]);

  const counts = useMemo(() => {
    const c = { total: users.length, ADMIN: 0, DOCTOR: 0, PATIENT: 0 };
    users.forEach((u) => { if (c[u.role] !== undefined) c[u.role]++; });
    return c;
  }, [users]);

  const handleToggleActive = async (user) => {
    try {
      const res = await authService.adminUpdateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: res.data.is_active } : u)));
      setSnack({ open: true, msg: `User ${res.data.is_active ? "activated" : "deactivated"}.`, severity: "success" });
    } catch {
      setSnack({ open: true, msg: "Failed to update user.", severity: "error" });
    }
  };

  const handleToggleApproval = async (user) => {
    if (user.role !== "DOCTOR" || !user.doctor_profile_id) return;
    try {
      const res = await doctorService.approveDoctor(user.doctor_profile_id, { is_approved: !user.doctor_is_approved });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, doctor_is_approved: res.data.is_approved } : u)));
      setSnack({ open: true, msg: `Doctor ${res.data.is_approved ? "approved" : "unapproved"}.`, severity: "success" });
    } catch {
      setSnack({ open: true, msg: "Failed to update doctor approval.", severity: "error" });
    }
  };

  const filtered = useMemo(() => users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader title="User Management" subtitle="View, approve, and manage all registered users" gradient="dark" />

      {/* Stat Cards */}
      <Grid container spacing={2.5} mb={3}>
        {STAT_CARDS.map((card, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={card.key} data-aos="fade-up" data-aos-delay={String(i * 100)}>
            <StatCard
              icon={card.icon}
              value={counts[card.key]}
              label={card.label}
              gradientIndex={i}
              onClick={() => setRoleFilter(card.key === "total" ? "" : card.key)}
              active={roleFilter === card.key || (card.key === "total" && !roleFilter)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 450 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><Search sx={{ color: "#94a3b8" }} /></InputAdornment>,
            },
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="DOCTOR">Doctor</MenuItem>
            <MenuItem value="PATIENT">Patient</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Banner */}
      <Box
        data-aos="fade-up"
        data-aos-delay="100"
        sx={{
          background: "linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #175cdd 100%)",
          borderRadius: 3,
          p: 3,
          mb: 3,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56 }}>
          <People sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 800, lineHeight: 1 }}>
            {filtered.length}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {roleFilter ? `${roleFilter.charAt(0) + roleFilter.slice(1).toLowerCase()} users` : "Total users"} found
          </Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", gap: 3 }}>
          {counts.ADMIN > 0 && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{counts.ADMIN}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Admins</Typography>
            </Box>
          )}
          {counts.DOCTOR > 0 && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{counts.DOCTOR}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Doctors</Typography>
            </Box>
          )}
          {counts.PATIENT > 0 && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{counts.PATIENT}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Patients</Typography>
            </Box>
          )}
        </Box>
      </Box>

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
              {["User", "Email", "Role", "Verified", "Active", "Approved"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#64748b", fontFamily: '"Montserrat", sans-serif', fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No users found"
                    description="Try adjusting your search or filters to find what you're looking for."
                    image="/assets/img/health/consultation-4.webp"
                    sx={{ py: 4, boxShadow: "none" }}
                  />
                </TableCell>
              </TableRow>
            ) : filtered.map((u) => {
              const userImage = u.role === "DOCTOR"
                ? getDoctorImage(u)
                : getPatientImage(u);
              return (
                <TableRow
                  key={u.id}
                  hover
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={userImage}
                        sx={{
                          width: 36,
                          height: 36,
                          border: `2px solid ${AVATAR_COLORS[u.role] || "#64748b"}`,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Montserrat", sans-serif' }}>
                          {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2">{u.email}</Typography></TableCell>
                  <TableCell>
                    <StatusChip status={u.role} type="availability" />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={u.is_email_confirmed ? "verified" : "unverified"} type="availability" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={u.is_active} onChange={() => handleToggleActive(u)} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    {u.role === "DOCTOR" ? (
                      <Switch checked={!!u.doctor_is_approved} onChange={() => handleToggleApproval(u)} color="primary" size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <AlertSnackbar open={snack.open} severity={snack.severity} message={snack.msg} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
