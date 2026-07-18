import { Chip } from "@mui/material";

const statusColors = {
  PENDING: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  PAID: "success",
  FAILED: "error",
  REFUNDED: "default",
};

export default function PaymentStatus({ status, size = "small" }) {
  return (
    <Chip
      label={status}
      size={size}
      color={statusColors[status] || "default"}
      variant="filled"
    />
  );
}
