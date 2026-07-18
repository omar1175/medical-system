import { Button } from "@mui/material";
import { BRAND_GRADIENT } from "../../styles/gradients";

// Thin wrapper over MUI Button enforcing the brand gradient + consistent radius.
export default function ActionButton({
  children,
  variant = "contained",
  gradient = BRAND_GRADIENT,
  sx = {},
  ...rest
}) {
  if (variant === "contained") {
    return (
      <Button
        variant="contained"
        sx={{
          background: gradient,
          color: "#fff",
          fontWeight: 700,
          fontFamily: '"Montserrat", sans-serif',
          textTransform: "none",
          borderRadius: 2,
          px: 3,
          py: 1.25,
          boxShadow: "0 8px 32px rgba(23, 92, 221, 0.25)",
          "&:hover": {
            background: gradient,
            boxShadow: "0 12px 40px rgba(23, 92, 221, 0.35)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.3s ease",
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant="outlined"
      sx={{
        borderColor: "#175cdd",
        color: "#175cdd",
        fontWeight: 700,
        fontFamily: '"Montserrat", sans-serif',
        textTransform: "none",
        borderRadius: 2,
        px: 3,
        py: 1.25,
        "&:hover": { borderColor: "#0f4ba0", bgcolor: "rgba(23,92,221,0.06)" },
        transition: "all 0.3s ease",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
