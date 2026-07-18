import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container, Grid, Typography, Button } from "@mui/material";
import {
  Shield as ShieldIcon,
  AccessTime as ClockIcon,
  Star as StarIcon,
  PlayCircle as PlayIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowIcon,
  Favorite as HeartIcon,
  Biotech as BiotechIcon,
  People as PeopleIcon,
  MedicalServices as MedicalIcon,
  Healing as SurgeryIcon,
  Security as ShieldPlusIcon,
  Science as ActivityIcon,
  Star as StarFillIcon,
  StarHalf as StarHalfIcon,
  VerifiedUser as AwardIcon,
  Search as SearchIcon,
  Shield as ShieldCheckIcon,
  CalendarMonth as CalendarIcon,
  Emergency as EmergencyIcon,
  LocalHospital as CapsuleIcon,
} from "@mui/icons-material";
import { templateColors, templateFonts } from "../../styles/templateTheme";
import { getDoctorImage } from "../../data/doctorImages";
import { fetchDoctors, fetchSpecialties } from "../../store/slices/doctorsSlice";
import { adminService } from "../../services/adminService";
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

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
      {Array(full)
        .fill(null)
        .map((_, i) => (
          <StarFillIcon key={`f${i}`} sx={{ fontSize: 13, color: "#f59e0b" }} />
        ))}
      {half && <StarHalfIcon sx={{ fontSize: 13, color: "#f59e0b" }} />}
      {Array(empty)
        .fill(null)
        .map((_, i) => (
          <StarIcon key={`e${i}`} sx={{ fontSize: 13, opacity: 0.3 }} />
        ))}
    </Box>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const { list: doctors, specialties, loading } = useSelector((s) => s.doctors);
  const [searchName, setSearchName] = useState("");
  const [searchSpec, setSearchSpec] = useState("");
  const [stats, setStats] = useState({ total_doctors: 0, total_patients: 0 });

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchSpecialties());
    adminService.getStats().then((r) => setStats(r.data)).catch(() => {});
  }, [dispatch]);

  const filteredDoctors = doctors.filter((d) => {
    const matchName =
      !searchName ||
      (d.full_name || "").toLowerCase().includes(searchName.toLowerCase());
    const matchSpec =
      !searchSpec ||
      (d.specialty_name || "").toLowerCase().includes(searchSpec);
    return matchName && matchSpec;
  });

  return (
    <Box>
      {/* ═══════════ HERO ═══════════ */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: templateColors.lightBg,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box>
                <Box
                  sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}
                >
                  {["Accredited", "24/7 Emergency", "4.9/5 Rating"].map(
                    (badge, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 2,
                          py: 0.8,
                          borderRadius: 6,
                          bgcolor: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: templateColors.default,
                        }}
                      >
                        {i === 0 && (
                          <ShieldCheckIcon
                            sx={{ fontSize: 14, color: templateColors.accent }}
                          />
                        )}
                        {i === 1 && (
                          <ClockIcon
                            sx={{ fontSize: 14, color: templateColors.accent }}
                          />
                        )}
                        {i === 2 && (
                          <StarIcon sx={{ fontSize: 14, color: "#f59e0b" }} />
                        )}
                        {badge}
                      </Box>
                    ),
                  )}
                </Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: templateFonts.heading,
                    fontWeight: 900,
                    fontSize: { xs: "2rem", md: "3rem" },
                    color: templateColors.heading,
                    lineHeight: 1.2,
                    mb: 2,
                  }}
                >
                  Excellence in{" "}
                  <Box component="span" sx={{ color: templateColors.accent }}>
                    Healthcare
                  </Box>{" "}
                  With Compassionate Care
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    color: templateColors.default,
                    lineHeight: 1.7,
                    mb: 4,
                    maxWidth: 540,
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
                <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
                  {[
                    { value: stats.total_patients || 0, suffix: "+", label: "Patients Treated" },
                    { value: stats.total_doctors || 0, suffix: "+", label: "Medical Experts" },
                    { value: stats.total_specialties || 0, suffix: "+", label: "Specialties" },
                  ].map((stat, i) => (
                    <Box key={i} sx={{ textAlign: "center" }}>
                      <Typography
                        sx={{
                          fontFamily: templateFonts.heading,
                          fontWeight: 800,
                          fontSize: "1.5rem",
                          color: templateColors.accent,
                        }}
                      >
                        <AnimatedCounter
                          end={stat.value}
                          suffix={stat.suffix}
                        />
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: templateColors.default,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    startIcon={<CalendarIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: templateColors.accent,
                      fontFamily: templateFonts.heading,
                      "&:hover": { bgcolor: "#1448b0" },
                    }}
                  >
                    Book Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PlayIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: templateColors.default,
                      color: templateColors.default,
                      fontFamily: templateFonts.heading,
                      "&:hover": {
                        borderColor: templateColors.accent,
                        color: templateColors.accent,
                      },
                    }}
                  >
                    Watch Our Story
                  </Button>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "#dc262615",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#dc2626",
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: templateColors.default,
                      }}
                    >
                      Emergency Hotline
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: templateColors.heading,
                      }}
                    >
                      +1 (555) 911-2468
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src="/assets/img/health/staff-10.webp"
                  alt="Healthcare"
                  sx={{
                    width: "100%",
                    borderRadius: 4,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 2,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${templateColors.accent}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: templateColors.accent,
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: templateColors.default,
                      }}
                    >
                      Next Available
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: templateColors.heading,
                      }}
                    >
                      Today 2:30 PM
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ HOME ABOUT ═══════════ */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ position: "relative" }}>
                <Box
                  component="img"
                  src="/assets/img/health/facilities-9.webp"
                  alt="Facility"
                  sx={{ width: "100%", borderRadius: 3 }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -15,
                    right: -15,
                    bgcolor: templateColors.accent,
                    color: "#fff",
                    p: 2.5,
                    borderRadius: 3,
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(23,92,221,0.3)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: templateFonts.heading,
                      fontWeight: 900,
                      fontSize: "1.5rem",
                    }}
                  >
                    25+
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem" }}>
                    Years of Trusted Care
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  color: templateColors.heading,
                  mb: 2,
                }}
              >
                Compassionate Care, Advanced Medicine
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: templateColors.default,
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                For over two decades, we've been dedicated to providing
                exceptional healthcare that combines cutting-edge medical
                technology with the personal touch our patients deserve.
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: templateColors.default,
                  lineHeight: 1.8,
                  mb: 4,
                }}
              >
                Our multidisciplinary team of specialists works collaboratively
                to ensure every patient receives comprehensive care tailored to
                their unique needs.
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                  { value: 15000, label: "Patients Served" },
                  { value: 25, label: "Years of Excellence" },
                  { value: 50, label: "Medical Specialists" },
                ].map((stat, i) => (
                  <Grid size={{ xs: 4 }} key={i}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: templateFonts.heading,
                          fontWeight: 800,
                          fontSize: "1.3rem",
                          color: templateColors.accent,
                        }}
                      >
                        <AnimatedCounter end={stat.value} />
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: templateColors.default,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button
                component={RouterLink}
                to="/about"
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: templateColors.accent,
                  fontFamily: templateFonts.heading,
                  "&:hover": { bgcolor: "#1448b0" },
                }}
              >
                Learn More About Us
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ FEATURED DEPARTMENTS ═══════════ */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: templateColors.lightBg }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: templateFonts.heading,
                fontWeight: 800,
                fontSize: { xs: "1.6rem", md: "2rem" },
                color: templateColors.heading,
                mb: 1,
              }}
            >
              Featured Departments
            </Typography>
            <Typography
              sx={{ color: templateColors.default, maxWidth: 600, mx: "auto" }}
            >
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {specialties.slice(0, 2).map((dept, i) => (
              <Grid size={{ xs: 12, lg: 6 }} key={dept.id}>
                <Box
                  sx={{
                    display: "flex",
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.3s",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={() => window.location.href = `/department-details?dept=${dept.slug}`}
                >
                  <Box
                    sx={{
                      width: "40%",
                      minHeight: 250,
                      position: "relative",
                      overflow: "hidden",
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
                        color: "#fff",
                        fontSize: 40,
                      }}
                    >
                      {i === 0 ? <HeartIcon /> : <BiotechIcon />}
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
                        fontSize: "1.1rem",
                        color: templateColors.heading,
                        mb: 1.5,
                      }}
                    >
                      {dept.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: templateColors.default,
                        lineHeight: 1.7,
                        mb: 2,
                      }}
                    >
                      {dept.description || "Comprehensive medical care in this specialty."}
                    </Typography>
                    {dept.doctor_count > 0 && (
                      <Typography variant="caption" sx={{ color: templateColors.accent, fontWeight: 600, mb: 1 }}>
                        {dept.doctor_count} {dept.doctor_count === 1 ? "doctor" : "doctors"} available
                      </Typography>
                    )}
                    <RouterLink
                      to={`/department-details?dept=${dept.slug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: templateColors.accent,
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        textDecoration: "none",
                      }}
                    >
                      Explore Department <ArrowIcon sx={{ fontSize: 16 }} />
                    </RouterLink>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {[
              {
                icon: <ShieldPlusIcon />,
                title: "Orthopedic Surgery",
                items: [
                  "Sports Medicine",
                  "Joint Replacement",
                  "Spine Surgery",
                ],
              },
              {
                icon: <PeopleIcon />,
                title: "Pediatric Care",
                items: [
                  "Neonatal Intensive Care",
                  "Developmental Pediatrics",
                  "Pediatric Surgery",
                ],
              },
              {
                icon: <ActivityIcon />,
                title: "Cancer Treatment",
                items: [
                  "Precision Medicine",
                  "Immunotherapy",
                  "Radiation Oncology",
                ],
              },
            ].map((dept, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    transition: "all 0.3s",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ color: templateColors.accent, mb: 1.5 }}>
                    {dept.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: templateFonts.heading,
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: templateColors.heading,
                      mb: 1,
                    }}
                  >
                    {dept.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      color: templateColors.default,
                      mb: 1.5,
                    }}
                  >
                    Comprehensive care with advanced treatment options.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}
                  >
                    {dept.items.map((item, j) => (
                      <Typography
                        key={j}
                        sx={{
                          fontSize: "0.8rem",
                          color: templateColors.default,
                        }}
                      >
                        • {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ FIND A DOCTOR ═══════════ */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: templateFonts.heading,
                fontWeight: 800,
                fontSize: { xs: "1.6rem", md: "2rem" },
                color: templateColors.heading,
                mb: 1,
              }}
            >
              Find A Doctor
            </Typography>
            <Typography
              sx={{ color: templateColors.default, maxWidth: 600, mx: "auto" }}
            >
              Search through our comprehensive directory of experienced medical
              professionals
            </Typography>
          </Box>

          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              mb: 5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: templateFonts.heading,
                fontWeight: 700,
                fontSize: "1.2rem",
                color: templateColors.heading,
                mb: 0.5,
              }}
            >
              Find Your Perfect Healthcare Provider
            </Typography>
            <Typography
              sx={{ fontSize: "0.85rem", color: templateColors.default, mb: 3 }}
            >
              Search through our comprehensive directory of experienced medical
              professionals
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#fff",
                  minWidth: 250,
                }}
              >
                <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Enter doctor name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "0.88rem",
                    width: "100%",
                    fontFamily: templateFonts.default,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#fff",
                  minWidth: 200,
                }}
              >
                <MedicalIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                <select
                  value={searchSpec}
                  onChange={(e) => setSearchSpec(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "0.88rem",
                    width: "100%",
                    fontFamily: templateFonts.default,
                    bgcolor: "transparent",
                  }}
                >
                  <option value="">All Specialties</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Box>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: templateColors.accent,
                  "&:hover": { bgcolor: "#1448b0" },
                }}
              >
                Find Doctors
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {loading ? (
              <Grid size={{ xs: 12 }}>
                <Typography
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: templateColors.default,
                  }}
                >
                  Loading doctors...
                </Typography>
              </Grid>
            ) : filteredDoctors.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Typography
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: templateColors.default,
                  }}
                >
                  No doctors found matching your search criteria.
                </Typography>
              </Grid>
            ) : (
              filteredDoctors.map((doc, i) => {
                const rating = doc.rating || 0;
                return (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doc.id}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "#fff",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Box
                        sx={{ position: "relative", display: "inline-block" }}
                      >
                        <Box
                          component="img"
                          src={getDoctorImage(doc)}
                          alt={doc.full_name}
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "3px solid",
                            borderColor: `${templateColors.accent}20`,
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: templateFonts.heading,
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          color: templateColors.heading,
                          mt: 1.5,
                        }}
                      >
                        {doc.full_name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          color: templateColors.accent,
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {doc.specialty_name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <StarRating rating={rating} />
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: templateColors.default,
                          }}
                        >
                          {rating > 0 ? `${rating} rating` : "New"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          component={RouterLink}
                          to={`/patient/doctors/${doc.id}`}
                          variant="outlined"
                          size="small"
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderColor: templateColors.accent,
                            color: templateColors.accent,
                            "&:hover": { borderColor: "#1448b0" },
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          component={RouterLink}
                          to={`/patient/doctors/${doc.id}/book`}
                          variant="contained"
                          size="small"
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: templateColors.accent,
                            "&:hover": { bgcolor: "#1448b0" },
                          }}
                        >
                          Book Now
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ CTA ═══════════ */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: templateColors.darkBg,
          color: "#fff",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                  color: "#fff",
                  mb: 2,
                }}
              >
                Excellence in Medical Care, Every Day
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  endIcon={<ArrowIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    bgcolor: templateColors.accent,
                    "&:hover": { bgcolor: "#1448b0" },
                  }}
                >
                  Schedule Consultation
                </Button>
                <Button
                  component={RouterLink}
                  to="/services"
                  variant="outlined"
                  endIcon={<ArrowIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "#fff",
                    "&:hover": { borderColor: "#fff" },
                  }}
                >
                  Explore Services
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                component="img"
                src="/assets/img/health/facilities-9.webp"
                alt="Medical Excellence"
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
