import { Avatar, Box } from "@mui/material";
import { getPatientImage } from "../../data/patientImages";

const statusColors = {
  available: "#059669",
  busy: "#f59e0b",
  offline: "#94a3b8",
};

export default function PatientAvatar({ patient, size = 48, showStatus = false, status, sx = {} }) {
  const imgSrc = getPatientImage(patient);
  const dotStatus = status || patient?.status;

  return (
    <Box sx={{ position: "relative", display: "inline-flex", ...sx }}>
      <Avatar
        src={imgSrc}
        alt={patient?.first_name || patient?.name || "Patient"}
        sx={{
          width: size,
          height: size,
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />
      {showStatus && dotStatus && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: "50%",
            bgcolor: statusColors[dotStatus] || statusColors.offline,
            border: "2px solid #fff",
          }}
        />
      )}
    </Box>
  );
}
