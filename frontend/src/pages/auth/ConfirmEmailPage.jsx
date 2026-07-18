import { useEffect } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Card, CardContent, Typography, Button, CircularProgress } from "@mui/material";
import { CheckCircle, Error, MedicalServices as MedicalIcon } from "@mui/icons-material";
import { confirmEmail } from "../../store/slices/authSlice";

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { loading, emailConfirmed, error } = useSelector((s) => s.auth);
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    if (uid && token) {
      dispatch(confirmEmail({ uid, token }));
    }
  }, [dispatch, uid, token]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f4ba0 0%, #175cdd 50%, #4a90e2 100%)",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: "100%", borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#175cdd12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MedicalIcon sx={{ fontSize: 28, color: "#175cdd" }} />
            </Box>
          </Box>

          {!uid || !token ? (
            <>
              <Error sx={{ fontSize: 64, color: "#dc2626", mb: 2 }} />
              <Typography variant="h5" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, mb: 1 }}>
                Invalid Link
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                This confirmation link is invalid or has expired.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/resend-email" sx={{ py: 1.5 }}>
                Resend Email
              </Button>
            </>
          ) : loading ? (
            <CircularProgress size={48} sx={{ my: 4, color: "#175cdd" }} />
          ) : emailConfirmed ? (
            <>
              <CheckCircle sx={{ fontSize: 64, color: "#059669", mb: 2 }} />
              <Typography variant="h5" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, mb: 1 }}>
                Email Confirmed!
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Your email has been verified. You can now sign in to your account.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/login" sx={{ py: 1.5 }}>
                Go to Sign In
              </Button>
            </>
          ) : (
            <>
              <Error sx={{ fontSize: 64, color: "#dc2626", mb: 2 }} />
              <Typography variant="h5" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, mb: 1 }}>
                Confirmation Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {error ? (typeof error === "string" ? error : error.detail || "Something went wrong") : "Something went wrong."}
              </Typography>
              <Button variant="contained" component={RouterLink} to="/resend-email" sx={{ py: 1.5 }}>
                Resend Email
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
