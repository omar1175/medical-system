import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid,
  Chip, Divider, Container,
} from "@mui/material";
import { Save, Phone, AttachMoney, Info, Badge, Star, WorkspacePremium } from "@mui/icons-material";
import { fetchMyProfile, updateMyProfile } from "../../store/slices/doctorsSlice";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GradientHeader from "../../components/common/GradientHeader";
import DoctorAvatar from "../../components/common/DoctorAvatar";

export default function DoctorProfilePage() {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector((s) => s.doctors);
  const { user } = useSelector((s) => s.auth);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      reset({
        bio: myProfile.bio || "",
        phone: myProfile.phone || "",
        consultation_fee: myProfile.consultation_fee || "",
        online_consultation_fee: myProfile.online_consultation_fee || "",
      });
    }
  }, [myProfile, reset]);

  const onSubmit = async (data) => {
    const result = await dispatch(updateMyProfile({
      ...data,
      consultation_fee: data.consultation_fee ? parseFloat(data.consultation_fee) : null,
      online_consultation_fee: data.online_consultation_fee ? parseFloat(data.online_consultation_fee) : null,
    }));
    if (!result.error) {
      setSnack({ open: true, msg: "Profile updated successfully.", severity: "success" });
    } else {
      setSnack({ open: true, msg: "Failed to update profile.", severity: "error" });
    }
  };

  if (loading && !myProfile) return <LoadingSpinner />;

  return (
    <Box>
      <GradientHeader title="My Profile" subtitle="Manage your professional information visible to patients" />

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }} data-aos="fade-up" data-aos-delay="0">
            <Card sx={{ overflow: "hidden" }}>
              {/* Gradient cover banner */}
              <Box sx={{ height: 100, background: "linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #175cdd 100%)", position: "relative" }}>
                <Box sx={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)" }} />
                <Box sx={{ position: "absolute", bottom: -20, left: "40%", width: 60, height: 60, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
              </Box>
              <CardContent sx={{ p: 3, textAlign: "center", mt: -6 }}>
                <DoctorAvatar
                  doctor={myProfile || user}
                  size={96}
                  showStatus
                  status={myProfile?.is_approved ? "available" : "busy"}
                  sx={{ mx: "auto", mb: 2 }}
                />
                <Typography variant="h6" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>
                  Dr. {user?.first_name || myProfile?.first_name} {user?.last_name || myProfile?.last_name}
                </Typography>
                <Chip
                  label={myProfile?.is_approved ? "Approved" : "Pending Approval"}
                  size="small"
                  sx={{
                    mt: 1,
                    mb: 1,
                    fontWeight: 600,
                    bgcolor: myProfile?.is_approved ? "#d1fae5" : "#fef3c7",
                    color: myProfile?.is_approved ? "#059669" : "#d97706",
                  }}
                />
                {/* Star rating */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 1, mb: 1 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} sx={{ fontSize: 18, color: star <= Math.round(myProfile?.rating || 0) ? "#f59e0b" : "#e2e8f0" }} />
                  ))}
                  <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: "#112344" }}>{myProfile?.rating || "—"}</Typography>
                </Box>
                {/* Experience badge */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 2 }}>
                  <WorkspacePremium sx={{ fontSize: 16, color: "#175cdd" }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#3c4049" }}>{myProfile?.years_of_experience ? `${myProfile.years_of_experience}+ years experience` : "Experience not set"}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  {user?.email}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: "left", px: 1 }}>
                  {[
                    { icon: <Badge fontSize="small" color="action" />, label: "Specialty", value: myProfile?.specialty_detail?.name || "Not assigned" },
                    { icon: <Phone fontSize="small" color="action" />, label: "Phone", value: myProfile?.phone || "Not set" },
                    { icon: <AttachMoney fontSize="small" color="action" />, label: "In-Person Fee", value: `$${myProfile?.consultation_fee || "0"}` },
                    { icon: <AttachMoney fontSize="small" color="action" />, label: "Online Fee", value: `$${myProfile?.online_consultation_fee || "0"}` },
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      {item.icon}
                      <Box>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Edit Form */}
          <Grid size={{ xs: 12, md: 8 }} data-aos="fade-up" data-aos-delay="100">
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Info sx={{ color: "#175cdd" }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, color: "#112344" }}>
                    Edit Profile
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Update your bio, contact info, and consultation fee
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth multiline rows={5}
                        label="Professional Bio"
                        placeholder="Tell patients about your experience, education, and approach to care..."
                        {...register("bio")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Phone Number" {...register("phone")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth type="number" label="Consultation Fee ($)"
                        slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                        {...register("consultation_fee")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth type="number" label="Online Consultation Fee ($)"
                        slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                        {...register("online_consultation_fee")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        variant="contained" type="submit" startIcon={<Save />} size="large"
                        sx={{
                          py: 1.2, px: 4,
                          background: "linear-gradient(135deg, #175cdd 0%, #4a90e2 100%)",
                          fontWeight: 700,
                          textTransform: "none",
                          borderRadius: 2,
                          "&:hover": { background: "linear-gradient(135deg, #1450b8 0%, #3d80d0 100%)" },
                        }}
                      >
                        Save Changes
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <AlertSnackbar open={snack.open} severity={snack.severity} message={snack.msg} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
