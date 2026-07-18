import { Avatar, Box } from "@mui/material";
import { getDoctorImage } from "../../data/doctorImages";

const statusColors = {
  available: "#059669",
  busy: "#f59e0b",
  offline: "#94a3b8",
};

export default function DoctorAvatar({ doctor, size = 48, showStatus = false, status, sx = {} }) {
  const imgSrc = getDoctorImage(doctor);
  const dotStatus = status || doctor?.status;

  return (
    <Box sx={{ position: "relative", display: "inline-flex", ...sx }}>
      <Avatar
        src={imgSrc}
        alt={doctor?.first_name || doctor?.name || "Doctor"}
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
