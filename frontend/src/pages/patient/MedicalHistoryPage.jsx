import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Divider,
  IconButton, Collapse, Alert, Container,
} from "@mui/material";
import {
  ExpandMore, ExpandLess, Medication, Science, LocalHospital,
} from "@mui/icons-material";
import {
  fetchMedicalHistory,
  fetchPatientSummary,
  clearMedicalHistoryError,
} from "../../store/slices/medicalHistorySlice";
import GradientHeader from "../../components/common/GradientHeader";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import PatientAvatar from "../../components/common/PatientAvatar";
import SectionHeader from "../../components/common/SectionHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function PatientMedicalHistoryPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list, patientSummary, listLoading, error } = useSelector(
    (s) => s.medicalHistory
  );
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    dispatch(fetchMedicalHistory());
    dispatch(fetchPatientSummary(user.id));
  }, [dispatch, user.id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearMedicalHistoryError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (listLoading && list.length === 0) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader
        title="Medical History Report"
        subtitle="Complete record of your health journey"
        gradient="blue"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <PatientAvatar patient={user} size={48} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Report generated: {dayjs().format("MMMM D, YYYY")}
            </Typography>
          </Box>
        </Box>
      </GradientHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearMedicalHistoryError())}>
          {typeof error === "string" ? error : error.detail || "An error occurred."}
        </Alert>
      )}

      <Container maxWidth="lg">
        {/* Stats */}
        {patientSummary && (
          <Grid container spacing={2.5} mb={4}>
            <Grid size={{ xs: 12, md: 4 }} data-aos="fade-up" data-aos-delay="0">
              <StatCard
                icon={<LocalHospital />}
                value={patientSummary.total_records}
                label="Total Visits"
                gradientIndex={0}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} data-aos="fade-up" data-aos-delay="100">
              <StatCard
                icon={<Medication />}
                value={patientSummary.total_prescriptions}
                label="Prescriptions"
                gradientIndex={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} data-aos="fade-up" data-aos-delay="200">
              <StatCard
                icon={<Science />}
                value={patientSummary.total_lab_tests}
                label="Lab Tests"
                gradientIndex={3}
              />
            </Grid>
          </Grid>
        )}

        {/* Medical Records Timeline */}
        <SectionHeader title="Visit History" dataAos="fade-up" />

        {list.length === 0 ? (
          <EmptyState
            image="/assets/img/health/facilities-9.webp"
            title="No medical records found"
            description="Your medical history will appear here after your consultations."
          />
        ) : (
          list.map((record) => (
            <Card key={record.id} sx={{ mb: 2 }} data-aos="fade-up">
              <CardContent sx={{ pb: "16px !important" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleExpand(record.id)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <DoctorAvatar
                      doctor={{ first_name: (record.doctor_name || "").split(" ")[0], last_name: (record.doctor_name || "").split(" ").slice(1).join(" "), id: record.doctor }}
                      size={40}
                    />
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

                  {/* Diagnosis */}
                  {record.diagnosis && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Diagnosis
                      </Typography>
                      <Typography variant="body1">{record.diagnosis}</Typography>
                    </Box>
                  )}

                  {/* Symptoms */}
                  {record.symptoms && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Symptoms
                      </Typography>
                      <Typography variant="body1">{record.symptoms}</Typography>
                    </Box>
                  )}

                  {/* Treatment Plan */}
                  {record.treatment_plan && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Treatment Plan
                      </Typography>
                      <Typography variant="body1">{record.treatment_plan}</Typography>
                    </Box>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Doctor's Notes
                      </Typography>
                      <Typography variant="body1">{record.notes}</Typography>
                    </Box>
                  )}

                  {/* Prescriptions */}
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

                  {/* Lab Tests */}
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
    </Box>
  );
}
