import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import { ArrowBack, Star, WorkOutlined, MedicalServices } from "@mui/icons-material";
import { fetchSpecialties } from "../../store/slices/doctorsSlice";
import { doctorService } from "../../services/doctorService";
import PageTitle from "../../components/common/PageTitle";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const SPECIALTY_IMAGES = {
  cardiology: "/assets/img/health/cardiology-1.webp",
  dermatology: "/assets/img/health/dermatology-1.webp",
  "general-practice": "/assets/img/health/consultation-4.webp",
  neurology: "/assets/img/health/neurology-4.webp",
  orthopedics: "/assets/img/health/orthopedics-1.webp",
  pediatrics: "/assets/img/health/pediatrics-3.webp",
  psychiatry: "/assets/img/health/neurology-2.webp",
  radiology: "/assets/img/health/laboratory-3.webp",
  "general-surgery": "/assets/img/health/surgery-2.webp",
  urology: "/assets/img/health/maternal-2.webp",
};

export default function DepartmentDetailsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const slug = params.get("dept");
  const { specialties, loading: specLoading } = useSelector((s) => s.doctors);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const specialty = specialties.find((s) => s.slug === slug) || null;

  useEffect(() => {
    if (specialties.length === 0) {
      dispatch(fetchSpecialties());
    }
  }, [specialties.length]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (slug) {
      setLoading(true);
      doctorService
        .list({ specialty: slug })
        .then((res) => setDoctors(res.data.results || res.data))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (specLoading || loading) return <LoadingSpinner />;

  if (!specialty) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" gutterBottom>Department not found</Typography>
        <Button variant="outlined" onClick={() => navigate("/departments")}>
          Browse Departments
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageTitle
        title={specialty.name}
        subtitle={specialty.description || "Comprehensive medical care in this specialty"}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Departments", path: "/departments" },
          { label: specialty.name },
        ]}
      />
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "#f4f8ff" }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/departments")}
            sx={{ mb: 3, textTransform: "none", fontWeight: 600, color: templateColors.accent }}
          >
            Back to Departments
          </Button>

          {/* Department Info Card */}
          <Card sx={{ mb: 4, overflow: "hidden" }} data-aos="fade-up">
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
              <Box
                sx={{
                  width: { xs: "100%", md: "40%" },
                  minHeight: 250,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={SPECIALTY_IMAGES[slug] || "/assets/img/health/consultation-4.webp"}
                  alt={specialty.name}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box sx={{ p: { xs: 3, md: 4 }, flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: templateFonts.heading,
                    fontWeight: 800,
                    color: templateColors.heading,
                    mb: 2,
                  }}
                >
                  {specialty.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: templateColors.default,
                    lineHeight: 1.8,
                    mb: 3,
                  }}
                >
                  {specialty.description || "Our department provides comprehensive care with experienced specialists and state-of-the-art facilities."}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<MedicalServices sx={{ fontSize: 16 }} />}
                    label={`${specialty.doctor_count || doctors.length} ${specialty.doctor_count === 1 ? "Doctor" : "Doctors"}`}
                    sx={{
                      bgcolor: `${templateColors.accent}12`,
                      color: templateColors.accent,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Doctors in this department */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: templateFonts.heading,
              fontWeight: 700,
              color: templateColors.heading,
              mb: 3,
            }}
            data-aos="fade-up"
          >
            Our {specialty.name} Specialists
          </Typography>

          {doctors.length === 0 ? (
            <EmptyState
              image="/assets/img/health/consultation-4.webp"
              title="No doctors available"
              description="There are currently no doctors in this department."
            />
          ) : (
            <Grid container spacing={3}>
              {doctors.map((doc, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id} data-aos="zoom-in" data-aos-delay={String(i * 80)}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <DoctorAvatar doctor={doc} size={90} showStatus />
                    <Typography
                      sx={{
                        fontFamily: templateFonts.heading,
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: templateColors.heading,
                        mt: 1.5,
                      }}
                    >
                      {doc.full_name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, my: 0.5 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} sx={{ fontSize: 14, color: s <= Math.round(doc.rating || 0) ? "#f59e0b" : "#e2e8f0" }} />
                      ))}
                      <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600, color: "#64748b" }}>
                        {doc.rating || "—"}
                      </Typography>
                    </Box>
                    {doc.years_of_experience > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                        <WorkOutlined sx={{ fontSize: 14, color: "#94a3b8" }} />
                        <Typography variant="caption" color="text.secondary">
                          {doc.years_of_experience} years exp.
                        </Typography>
                      </Box>
                    )}
                    <Typography sx={{ fontSize: "0.8rem", color: templateColors.default, fontWeight: 600, mb: 1 }}>
                      ${doc.consultation_fee}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/patient/doctors/${doc.id}`)}
                      sx={{
                        mt: "auto",
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        bgcolor: templateColors.accent,
                        "&:hover": { bgcolor: "#1448b0" },
                      }}
                    >
                      View Profile
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
