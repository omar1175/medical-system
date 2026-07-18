import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  Box, Typography, Card, CardContent, Avatar, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Divider,
  IconButton, Collapse, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Container,
} from "@mui/material";
import {
  ExpandMore, ExpandLess, Medication, Science, Event,
  LocalHospital, Add, Delete, Save,
} from "@mui/icons-material";
import {
  fetchMedicalHistory,
  fetchPatientSummary,
  createMedicalRecord,
  clearMedicalHistorySuccess,
  clearMedicalHistoryError,
} from "../../store/slices/medicalHistorySlice";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GradientHeader from "../../components/common/GradientHeader";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import api from "../../services/api";

export default function DoctorPatientMedicalHistoryPage() {
  const { patientId } = useParams();
  const dispatch = useDispatch();
  const { list, patientSummary, listLoading, createLoading, error, success } = useSelector(
    (s) => s.medicalHistory
  );
  const [expandedId, setExpandedId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({
    patient: patientId,
    appointment: "",
    diagnosis: "",
    symptoms: "",
    treatment_plan: "",
    notes: "",
    prescriptions: [],
    lab_tests: [],
  });

  useEffect(() => {
    dispatch(fetchMedicalHistory({ patient_id: patientId }));
    dispatch(fetchPatientSummary(patientId));
    api.get(`/patients/${patientId}/`).then((res) => setPatient(res.data)).catch(() => {});
  }, [dispatch, patientId]);

  useEffect(() => {
    if (success) {
      setSnack({ open: true, msg: success, severity: "success" });
      dispatch(clearMedicalHistorySuccess());
      setDialogOpen(false);
      resetForm();
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const msg = typeof error === "string" ? error : error.detail || JSON.stringify(error);
      setSnack({ open: true, msg, severity: "error" });
      dispatch(clearMedicalHistoryError());
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setForm({
      patient: patientId,
      appointment: "",
      diagnosis: "",
      symptoms: "",
      treatment_plan: "",
      notes: "",
      prescriptions: [],
      lab_tests: [],
    });
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const addPrescription = () => {
    setForm((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medication_name: "", dosage: "", frequency: "", duration: "", notes: "" },
      ],
    }));
  };

  const removePrescription = (idx) => {
    setForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== idx),
    }));
  };

  const updatePrescription = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addLabTest = () => {
    setForm((prev) => ({
      ...prev,
      lab_tests: [
        ...prev.lab_tests,
        { test_name: "", result: "", normal_range: "", test_date: dayjs().format("YYYY-MM-DD"), notes: "" },
      ],
    }));
  };

  const removeLabTest = (idx) => {
    setForm((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.filter((_, i) => i !== idx),
    }));
  };

  const updateLabTest = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.map((lt, i) =>
        i === idx ? { ...lt, [field]: value } : lt
      ),
    }));
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      appointment: form.appointment || null,
      prescriptions: form.prescriptions.filter((p) => p.medication_name),
      lab_tests: form.lab_tests.filter((lt) => lt.test_name),
    };
    dispatch(createMedicalRecord(data));
  };

  if (listLoading && list.length === 0) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader
        title="Patient Medical Records"
        subtitle={patient ? `${patient.first_name || ""} ${patient.last_name || ""} — ${patient.email || ""}` : `Patient #${patientId}`}
        gradient="blue"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            New Record
          </Button>
        }
      />

      <Container maxWidth="lg">
        {/* Stats */}
        {patientSummary && (
          <Grid container spacing={2.5} mb={4}>
            {[
              { icon: <LocalHospital sx={{ fontSize: 28 }} />, value: patientSummary.total_records, label: "Total Visits" },
              { icon: <Medication sx={{ fontSize: 28 }} />, value: patientSummary.total_prescriptions, label: "Prescriptions" },
              { icon: <Science sx={{ fontSize: 28 }} />, value: patientSummary.total_lab_tests, label: "Lab Tests" },
            ].map((card, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <StatCard icon={card.icon} value={card.value} label={card.label} gradientIndex={i} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Records */}
        <SectionHeader title="Visit History" dataAos="fade-up" />

        {list.length === 0 ? (
          <EmptyState
            title="No medical records yet"
            description="Create the first record for this patient."
            actionLabel="New Record"
            actionTo="#"
            image="/assets/img/health/laboratory-3.webp"
          />
        ) : (
        list.map((record) => (
          <Card key={record.id} sx={{ mb: 2 }}>
            <CardContent sx={{ pb: "16px !important" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onClick={() => toggleExpand(record.id)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.light", color: "primary.contrastText" }}>
                    <Event />
                  </Avatar>
                  <Box>
                    <Typography fontWeight={600}>
                      Visit — {dayjs(record.created_at).format("MMMM D, YYYY")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dr. {record.doctor_name || "Unknown"}
                      {record.specialty_name ? ` · ${record.specialty_name}` : ""}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {record.prescriptions?.length > 0 && (
                    <Chip
                      icon={<Medication sx={{ fontSize: 16 }} />}
                      label={`${record.prescriptions.length} Rx`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {record.lab_tests?.length > 0 && (
                    <Chip
                      icon={<Science sx={{ fontSize: 16 }} />}
                      label={`${record.lab_tests.length} Tests`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                  <IconButton size="small">
                    {expandedId === record.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedId === record.id} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 2 }} />

                {record.diagnosis && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Diagnosis</Typography>
                    <Typography variant="body1">{record.diagnosis}</Typography>
                  </Box>
                )}
                {record.symptoms && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Symptoms</Typography>
                    <Typography variant="body1">{record.symptoms}</Typography>
                  </Box>
                )}
                {record.treatment_plan && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Treatment Plan</Typography>
                    <Typography variant="body1">{record.treatment_plan}</Typography>
                  </Box>
                )}
                {record.notes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
                    <Typography variant="body1">{record.notes}</Typography>
                  </Box>
                )}

                {record.prescriptions?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Medication fontSize="small" /> Prescriptions
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Medication</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Dosage</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.prescriptions.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{p.medication_name}</TableCell>
                              <TableCell>{p.dosage}</TableCell>
                              <TableCell>{p.frequency}</TableCell>
                              <TableCell>{p.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {record.lab_tests?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Science fontSize="small" /> Lab Tests
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Normal Range</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {record.lab_tests.map((lt) => (
                            <TableRow key={lt.id}>
                              <TableCell>{lt.test_name}</TableCell>
                              <TableCell>{lt.result || "—"}</TableCell>
                              <TableCell>{lt.normal_range || "—"}</TableCell>
                              <TableCell>{dayjs(lt.test_date).format("MMM D, YYYY")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Collapse>
            </CardContent>
          </Card>
        ))
      )}

      </Container>

      {/* Create Record Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Medical Record</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Diagnosis"
            fullWidth
            multiline
            rows={2}
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Symptoms"
            fullWidth
            multiline
            rows={2}
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Treatment Plan"
            fullWidth
            multiline
            rows={2}
            value={form.treatment_plan}
            onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Prescriptions */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Medication fontSize="small" /> Prescriptions
            </Typography>
            <Button size="small" startIcon={<Add />} onClick={addPrescription}>
              Add
            </Button>
          </Box>
          {form.prescriptions.map((p, idx) => (
            <Card key={idx} variant="outlined" sx={{ mb: 1, p: 2 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Medication"
                      size="small"
                      fullWidth
                      value={p.medication_name}
                      onChange={(e) => updatePrescription(idx, "medication_name", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Dosage"
                      size="small"
                      fullWidth
                      value={p.dosage}
                      onChange={(e) => updatePrescription(idx, "dosage", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Frequency"
                      size="small"
                      fullWidth
                      value={p.frequency}
                      onChange={(e) => updatePrescription(idx, "frequency", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Duration"
                      size="small"
                      fullWidth
                      value={p.duration}
                      onChange={(e) => updatePrescription(idx, "duration", e.target.value)}
                    />
                  </Grid>
                </Grid>
                <IconButton color="error" onClick={() => removePrescription(idx)} size="small" sx={{ mt: 0.5 }}>
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Lab Tests */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Science fontSize="small" /> Lab Tests
            </Typography>
            <Button size="small" startIcon={<Add />} onClick={addLabTest}>
              Add
            </Button>
          </Box>
          {form.lab_tests.map((lt, idx) => (
            <Card key={idx} variant="outlined" sx={{ mb: 1, p: 2 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Test Name"
                      size="small"
                      fullWidth
                      value={lt.test_name}
                      onChange={(e) => updateLabTest(idx, "test_name", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Result"
                      size="small"
                      fullWidth
                      value={lt.result}
                      onChange={(e) => updateLabTest(idx, "result", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Normal Range"
                      size="small"
                      fullWidth
                      value={lt.normal_range}
                      onChange={(e) => updateLabTest(idx, "normal_range", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Test Date"
                      type="date"
                      size="small"
                      fullWidth
                      value={lt.test_date}
                      onChange={(e) => updateLabTest(idx, "test_date", e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                </Grid>
                <IconButton color="error" onClick={() => removeLabTest(idx)} size="small" sx={{ mt: 0.5 }}>
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={createLoading}>
            Save Record
          </Button>
        </DialogActions>
      </Dialog>

      <AlertSnackbar
        open={snack.open}
        severity={snack.severity}
        message={snack.msg}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </Box>
  );
}
