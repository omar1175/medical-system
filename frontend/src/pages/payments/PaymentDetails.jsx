import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { fetchPayment } from "../../store/slices/paymentsSlice";
import PaymentStatus from "../../components/payments/PaymentStatus";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function PaymentDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPayment, loading, error } = useSelector((s) => s.payments);

  useEffect(() => {
    dispatch(fetchPayment(id));
  }, [dispatch, id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">Failed to load payment</Alert>;
  if (!currentPayment) return null;

  const p = currentPayment;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <PageTitle title="Payment Details" />
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="h5">
                ${p.amount} {p.currency}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <PaymentStatus status={p.status} size="medium" />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Doctor
              </Typography>
              <Typography>{p.doctor_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Patient
              </Typography>
              <Typography>{p.patient_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Appointment ID
              </Typography>
              <Typography>#{p.appointment_id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Paid At
              </Typography>
              <Typography>
                {p.paid_at
                  ? new Date(p.paid_at).toLocaleString()
                  : "Not yet paid"}
              </Typography>
            </Grid>
            {p.receipt_url && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  href={p.receipt_url}
                  target="_blank"
                >
                  View Receipt
                </Button>
              </Grid>
            )}
            {p.checkout_url && p.status === "PENDING" && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  href={p.checkout_url}
                  target="_blank"
                >
                  Pay Now
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
