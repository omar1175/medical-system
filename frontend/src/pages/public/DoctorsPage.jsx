import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination,
} from "@mui/material";
import { Search as SearchIcon, Star, WorkOutlined } from "@mui/icons-material";
import { fetchDoctors, fetchSpecialties } from "../../store/slices/doctorsSlice";
import PageTitle from "../../components/common/PageTitle";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { templateColors, templateFonts } from "../../styles/templateTheme";

export default function DoctorsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: doctors, specialties, loading, count } = useSelector(
    (s) => s.doctors,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDoctors({ page, search: searchTerm || undefined, specialty: specialtyFilter || undefined }));
  }, [dispatch, page, specialtyFilter]);

  const handleSearch = () => {
    setPage(1);
    dispatch(fetchDoctors({ page: 1, search: searchTerm || undefined, specialty: specialtyFilter || undefined }));
  };

  return (
    <Box>
      <PageTitle
        title="Our Doctors"
        subtitle="Meet our team of experienced and compassionate medical professionals"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Doctors" }]}
      />
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: "#f4f8ff" }}>
        <Container maxWidth="lg">
          {/* Search & Filter Bar */}
          <Box
            data-aos="fade-up"
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              bgcolor: "#fff",
              borderRadius: 3,
              p: 2,
              mb: 4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <TextField
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              sx={{
                flex: 1,
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  "&:hover fieldset": { borderColor: templateColors.accent },
                  "&.Mui-focused fieldset": { borderColor: templateColors.accent },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              label="Specialty"
              value={specialtyFilter}
              onChange={(e) => {
                setSpecialtyFilter(e.target.value);
                setPage(1);
              }}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                },
              }}
            >
              <MenuItem value="">All Specialties</MenuItem>
              {specialties.map((sp) => (
                <MenuItem key={sp.id} value={sp.slug}>
                  {sp.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: templateColors.accent,
                px: 3,
                "&:hover": { bgcolor: "#1448b0" },
              }}
            >
              Search
            </Button>
          </Box>

          {loading ? (
            <LoadingSpinner />
          ) : doctors.length === 0 ? (
            <EmptyState
              image="/assets/img/health/consultation-4.webp"
              title="No doctors found"
              description="Try adjusting your search or filter criteria."
            />
          ) : (
            <>
              <Grid container spacing={3}>
                {doctors.map((doc, i) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doc.id} data-aos="zoom-in" data-aos-delay={String(i * 80)}>
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
                      <DoctorAvatar doctor={doc} size={110} showStatus />
                      <Typography
                        sx={{
                          fontFamily: templateFonts.heading,
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: templateColors.heading,
                          mt: 1.5,
                        }}
                      >
                        {doc.full_name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: templateColors.accent,
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {doc.specialty_name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            sx={{
                              fontSize: 16,
                              color: s <= Math.round(doc.rating || 0) ? "#f59e0b" : "#e2e8f0",
                            }}
                          />
                        ))}
                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600, color: "#64748b" }}>
                          {doc.rating || "—"}
                        </Typography>
                      </Box>
                      {doc.years_of_experience > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                          <WorkOutlined sx={{ fontSize: 14, color: "#94a3b8" }} />
                          <Typography variant="caption" color="text.secondary">
                            {doc.years_of_experience} years experience
                          </Typography>
                        </Box>
                      )}
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: templateColors.default,
                          mb: 1,
                          fontWeight: 600,
                        }}
                      >
                        ${doc.consultation_fee} in-person
                        {doc.online_consultation_fee > 0 && (
                          <span> · ${doc.online_consultation_fee} online</span>
                        )}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, lineHeight: 1.6, fontSize: "0.8rem", flex: 1 }}
                      >
                        {doc.bio?.substring(0, 100) || "Experienced medical professional."}
                        {doc.bio?.length > 100 ? "..." : ""}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/patient/doctors/${doc.id}`)}
                          sx={{
                            flex: 1,
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            borderColor: templateColors.accent,
                            color: templateColors.accent,
                            fontSize: "0.8rem",
                            "&:hover": { borderColor: "#1448b0", bgcolor: "#175cdd08" },
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/patient/doctors/${doc.id}/book`)}
                          sx={{
                            flex: 1,
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            bgcolor: templateColors.accent,
                            fontSize: "0.8rem",
                            "&:hover": { bgcolor: "#1448b0" },
                          }}
                        >
                          Book Now
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {count > 9 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={Math.ceil(count / 9)}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}
