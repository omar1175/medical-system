import { Box, Chip } from "@mui/material";
import {
  FiberManualRecord,
} from "@mui/icons-material";
import { CONNECTION_STATES } from "../../hooks/useWebRTC";

const STATUS_CONFIG = {
  [CONNECTION_STATES.IDLE]: { label: "Initializing...", color: "#9ca3af", bgColor: "#f3f4f6" },
  [CONNECTION_STATES.CONNECTING]: { label: "Connecting...", color: "#d97706", bgColor: "#fef3c7" },
  [CONNECTION_STATES.WAITING]: { label: "Waiting for participant...", color: "#d97706", bgColor: "#fef3c7" },
  [CONNECTION_STATES.CONNECTED]: { label: "Connected", color: "#059669", bgColor: "#d1fae5" },
  [CONNECTION_STATES.DISCONNECTED]: { label: "Disconnected", color: "#dc2626", bgColor: "#fee2e2" },
  [CONNECTION_STATES.FAILED]: { label: "Connection failed", color: "#dc2626", bgColor: "#fee2e2" },
  [CONNECTION_STATES.ENDED]: { label: "Call ended", color: "#6b7280", bgColor: "#f3f4f6" },
};

export default function ConnectionStatus({ connectionState }) {
  const config = STATUS_CONFIG[connectionState] || STATUS_CONFIG[CONNECTION_STATES.IDLE];

  return (
    <Chip
      icon={
        <FiberManualRecord
          sx={{
            fontSize: 10,
            color: `${config.color} !important`,
            animation: connectionState === "CONNECTED" ? "none" : "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.3 },
              "100%": { opacity: 1 },
            },
          }}
        />
      }
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgColor,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        border: `1px solid ${config.color}30`,
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
}
