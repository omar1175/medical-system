import { Card, CardContent, Avatar, Typography, Box } from "@mui/material";
import { statGradients } from "../../styles/gradients";

export default function StatCard({ icon, value, label, gradientIndex = 0, gradient, onClick, active, sx = {} }) {
  const bg = gradient || statGradients[gradientIndex % statGradients.length];

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        background: bg,
        color: "#fff",
        transition: "all 0.3s ease",
        borderRadius: 3,
        "&:hover": {
          transform: onClick ? "translateY(-3px)" : "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
        ...(active ? { outline: "3px solid rgba(255,255,255,0.6)", outlineOffset: 2 } : {}),
        ...sx,
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: { xs: 2, md: 2.5 } }}>
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            width: { xs: 44, md: 52 },
            height: { xs: 44, md: 52 },
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              fontSize: { xs: "1.4rem", md: "1.8rem" },
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
