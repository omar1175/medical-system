import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  Box,
  Chip,
} from "@mui/material";
import {
  fetchSubscriptionPlans,
  subscribe,
  fetchSubscriptionStatus,
  cancelSubscription,
} from "../../store/slices/paymentsSlice";
import PageTitle from "../../components/common/PageTitle";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function SubscriptionPlans() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscriptionPlans, currentSubscription, loading, error, success } =
    useSelector((s) => s.payments);

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  const hasActive = currentSubscription?.status === "ACTIVE";

  const handleSubscribe = (planId) => {
    dispatch(subscribe({ plan_id: planId }));
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      dispatch(cancelSubscription());
    }
  };

  if (loading && !subscriptionPlans.length) return <LoadingSpinner />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageTitle
        title="Subscription"
        subtitle="Choose a plan to continue using the platform"
      />

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error?.detail || error}</Alert>}

      {currentSubscription && (
        <Card sx={{ mb: 4, bgcolor: hasActive ? "success.light" : "error.light" }}>
          <CardContent>
            <Typography variant="h6">
              Current Status:{" "}
              <Chip
                label={currentSubscription.status}
                color={hasActive ? "success" : "error"}
              />
            </Typography>
            {currentSubscription.plan && (
              <Typography color="text.secondary">
                Plan: {currentSubscription.plan_name}
              </Typography>
            )}
            {currentSubscription.end_date && (
              <Typography color="text.secondary">
                Valid until: {new Date(currentSubscription.end_date).toLocaleDateString()}
              </Typography>
            )}
            {hasActive && (
              <Button
                color="error"
                onClick={handleCancel}
                sx={{ mt: 2 }}
              >
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!hasActive && (
        <Grid container spacing={3}>
          {subscriptionPlans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h3"
                    color="primary"
                    sx={{ my: 2, fontWeight: 700 }}
                  >
                    ${plan.price}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      /{plan.duration_days} days
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary">
                    {plan.description ||
                      `Full access for ${plan.duration_days} days`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Subscribe"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
