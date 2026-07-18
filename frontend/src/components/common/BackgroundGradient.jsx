import { Box } from "@mui/material";
import { gradients } from "../../styles/gradients";

// Reusable decorative gradient + blur-blob background layer.
// Place inside a `position: relative; overflow: hidden` parent.
export default function BackgroundGradient({
  variant = "blue",
  withBlobs = true,
  opacity = 1,
  dataAos,
  sx = {},
}) {
  const background = gradients[variant] || gradients.blue;

  return (
    <Box
      data-aos={dataAos}
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        background,
        opacity,
        zIndex: 0,
        overflow: "hidden",
        ...sx,
      }}
    >
      {withBlobs && (
        <>
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.06)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: "40%",
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.04)",
            }}
          />
        </>
      )}
    </Box>
  );
}
