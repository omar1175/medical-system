import { Chip } from "@mui/material";

// Template-aligned palette (matches theme.js + Clinic tokens)
const COLORS = {
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  info: "#0284c7",
  brand: "#175cdd",
  neutral: "#64748b",
};

// Appointment status → { label, color }
const APPOINTMENT_STATUS = {
  CONFIRMED: { label: "Confirmed", color: "success" },
  PENDING: { label: "Pending", color: "warning" },
  CANCELLED: { label: "Cancelled", color: "error" },
  COMPLETED: { label: "Completed", color: "info" },
  NO_SHOW: { label: "No Show", color: "neutral" },
};

// Doctor availability → { label, color }
const AVAILABILITY_STATUS = {
  available: { label: "Available", color: "success" },
  busy: { label: "Busy", color: "warning" },
  offline: { label: "Offline", color: "neutral" },
  active: { label: "Active", color: "success" },
  inactive: { label: "Inactive", color: "neutral" },
  admin: { label: "Admin", color: "error" },
  doctor: { label: "Doctor", color: "brand" },
  patient: { label: "Patient", color: "success" },
  verified: { label: "Verified", color: "success" },
  unverified: { label: "Unverified", color: "warning" },
};

function resolve(status, type) {
  if (type === "availability") return AVAILABILITY_STATUS[status];
  if (type === "appointment") return APPOINTMENT_STATUS[status];
  // Auto-detect by key
  if (APPOINTMENT_STATUS[status]) return APPOINTMENT_STATUS[status];
  if (AVAILABILITY_STATUS[status]) return AVAILABILITY_STATUS[status];
  return null;
}

export default function StatusChip({
  status,
  type,
  label,
  size = "small",
  variant = "filled",
  sx = {},
  ...rest
}) {
  const match = resolve(status, type);
  const text = label ?? match?.label ?? (status ? String(status) : "Unknown");
  const colorKey = match?.color ?? "neutral";
  const hex = COLORS[colorKey];

  const filled = variant === "filled";

  return (
    <Chip
      label={text}
      size={size}
      sx={{
        fontWeight: 700,
        fontFamily: '"Montserrat", sans-serif',
        borderRadius: 8,
        textTransform: "capitalize",
        bgcolor: filled ? hex : `${hex}14`,
        color: filled ? "#fff" : hex,
        border: filled ? "none" : `1px solid ${hex}40`,
        ...sx,
      }}
      {...rest}
    />
  );
}
