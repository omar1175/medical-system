import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
} from "@mui/icons-material";

const controlButton = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  border: "2px solid transparent",
};

export default function CallControls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        py: 2,
      }}
    >
      <Tooltip title={isMuted ? "Unmute" : "Mute"}>
        <IconButton
          onClick={onToggleMute}
          sx={{
            ...controlButton,
            bgcolor: isMuted ? "#fee2e2" : "rgba(255,255,255,0.15)",
            color: isMuted ? "#dc2626" : "#ffffff",
            border: isMuted ? "2px solid #dc2626" : "2px solid rgba(255,255,255,0.3)",
            "&:hover": {
              bgcolor: isMuted ? "#fecaca" : "rgba(255,255,255,0.25)",
              transform: "scale(1.08)",
            },
          }}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isCameraOff ? "Turn camera on" : "Turn camera off"}>
        <IconButton
          onClick={onToggleCamera}
          sx={{
            ...controlButton,
            bgcolor: isCameraOff ? "#fee2e2" : "rgba(255,255,255,0.15)",
            color: isCameraOff ? "#dc2626" : "#ffffff",
            border: isCameraOff ? "2px solid #dc2626" : "2px solid rgba(255,255,255,0.3)",
            "&:hover": {
              bgcolor: isCameraOff ? "#fecaca" : "rgba(255,255,255,0.25)",
              transform: "scale(1.08)",
            },
          }}
        >
          {isCameraOff ? <VideocamOff /> : <Videocam />}
        </IconButton>
      </Tooltip>

      <Tooltip title="End Call">
        <IconButton
          onClick={onEndCall}
          sx={{
            ...controlButton,
            width: 64,
            height: 64,
            bgcolor: "#dc2626",
            color: "#ffffff",
            boxShadow: "0 4px 20px rgba(220,38,38,0.4)",
            "&:hover": {
              bgcolor: "#b91c1c",
              boxShadow: "0 6px 24px rgba(220,38,38,0.5)",
              transform: "scale(1.08)",
            },
          }}
        >
          <CallEnd sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
