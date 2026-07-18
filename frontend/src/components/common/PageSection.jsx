import { Box } from "@mui/material";

export default function PageSection({
  children,
  bg = "transparent",
  padding = true,
  sx = {},
}) {
  return (
    <Box
      sx={{
        bgcolor: bg,
        py: padding ? { xs: 4, md: 5 } : 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
