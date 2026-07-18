import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Favorite as HeartIcon,
  Biotech as BiotechIcon,
  Healing as SurgeryIcon,
  People as PeopleIcon,
  Science as ActivityIcon,
  MedicalServices as MedicalIcon,
  ArrowForward as ArrowIcon,
  Psychology as PsychiatryIcon,
  Visibility as OphthalmologyIcon,
  Wc as UrologyIcon,
  Medication as GeneralIcon,
  Mic as ENTIcon,
} from "@mui/icons-material";
import { fetchSpecialties } from "../../store/slices/doctorsSlice";
import { adminService } from "../../services/adminService";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { templateColors, templateFonts } from "../../styles/templateTheme";
import StatCard from "../../components/common/StatCard";
import AnimatedCounter from "../../components/common/AnimatedCounter";

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

const SPECIALTY_ICONS = {
  cardiology: <HeartIcon />,
  dermatology: <ActivityIcon />,
  "general-practice": <GeneralIcon />,
  neurology: <BiotechIcon />,
  orthopedics: <SurgeryIcon />,
  pediatrics: <PeopleIcon />,
  psychiatry: <PsychiatryIcon />,
  radiology: <OphthalmologyIcon />,
  "general-surgery": <SurgeryIcon />,
  urology: <UrologyIcon />,
};

export default function DepartmentsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { specialties, loading } = useSelector((s) => s.doctors);
  const [stats, setStats] = React.useState({ total_doctors: 0, total_specialties: 0 });

  React.useEffect(() => {
    dispatch(fetchSpecialties());
    adminService.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, [dispatch]);

  return (
    <Box>
      <PageTitle
        title="Departments"
        subtitle="Explore our comprehensive range of medical specialties"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Departments" }]}
      />

      {/* Stats */}
      <Box sx={{ py: { xs: 3, md: 4 }, bgcolor: "#f4f8ff" }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5} data-aos="fade-up">
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard icon={<MedicalIcon sx={{ fontSize: 28 }} />} value={<AnimatedCounter end={stats.total_specialties || specialties.length} />} label="Specialties" gradientIndex={0} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard icon={<PeopleIcon sx={{ fontSize: 28 }} />} value={<AnimatedCounter end={stats.total_doctors} />} label="Doctors" gradientIndex={1} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          {loading ? (
            <LoadingSpinner />
          ) : specialties.length === 0 ? (
            <EmptyState
              image="/assets/img/health/consultation-4.webp"
              title="No departments found"
              description="Check back later for available departments."
            />
          ) : (
            <Grid container spacing={4}>
              {specialties.map((dept, i) => (
                <Grid size={{ xs: 12, md: 6 }} key={dept.id} data-aos="fade-up" data-aos-delay={String(i * 100)}>
                  <Box
                    sx={{
                      display: "flex",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      bgcolor: "#fff",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      },
                    }}
                    onClick={() => navigate(`/department-details?dept=${dept.slug}`)}
                  >
                    <Box
                      sx={{
                        width: "40%",
                        minHeight: 220,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box
                        component="img"
                        src={SPECIALTY_IMAGES[dept.slug] || "/assets/img/health/consultation-4.webp"}
                        alt={dept.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: `${templateColors.accent}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box sx={{ color: "#fff", fontSize: 40 }}>
                          {SPECIALTY_ICONS[dept.slug] || <MedicalIcon />}
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 3,
                        width: "60%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: templateFonts.heading,
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          color: templateColors.heading,
                          mb: 1,
                        }}
                      >
                        {dept.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: templateColors.default,
                          lineHeight: 1.7,
                          mb: 1.5,
                        }}
                      >
                        {dept.description || "Comprehensive medical care in this specialty."}
                      </Typography>
                      {dept.doctor_count > 0 && (
                        <Typography variant="caption" sx={{ color: templateColors.accent, fontWeight: 600, mb: 1 }}>
                          {dept.doctor_count} {dept.doctor_count === 1 ? "doctor" : "doctors"} available
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: templateColors.accent,
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          mt: "auto",
                        }}
                      >
                        View Details <ArrowIcon sx={{ fontSize: 16 }} />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
