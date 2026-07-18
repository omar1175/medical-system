import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { fetchPayments } from "../../store/slices/paymentsSlice";
import PaymentStatus from "../../components/payments/PaymentStatus";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

export default function PaymentHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { payments, loading, error } = useSelector((s) => s.payments);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageTitle title="Payment History" />
      {error && <Alert severity="error">{error.detail || "Failed to load payments"}</Alert>}
      {payments.length === 0 ? (
        <EmptyState title="No Payments Yet" description="Your payment history will appear here after your doctor requests payment for an appointment." />
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>#{p.id}</TableCell>
                  <TableCell>{p.doctor_name}</TableCell>
                  <TableCell>${p.amount}</TableCell>
                  <TableCell>
                    <PaymentStatus status={p.status} />
                  </TableCell>
                  <TableCell>
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleDateString()
                      : new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/patient/payments/${p.id}`)}
                    >
                      View
                    </Button>
                    {p.checkout_url && p.status === "PENDING" && (
                      <Button
                        size="small"
                        variant="contained"
                        href={p.checkout_url}
                        target="_blank"
                        sx={{ ml: 1 }}
                      >
                        Pay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
