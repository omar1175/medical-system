import { Paper, Typography } from "@mui/material";

export default function AgentMessage({ role, content }) {
  return (
    <Paper
      sx={{
        px: 2,
        py: 1.2,
        borderRadius: 2,
        maxWidth: "85%",
        whiteSpace: "pre-wrap",
        ...(role === "user"
          ? {
              bgcolor: "#175cdd",
              color: "#fff",
              borderBottomRightRadius: 4,
            }
          : {
              bgcolor: "#fff",
              color: "#112344",
              borderBottomLeftRadius: 4,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }),
      }}
    >
      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
        {content}
      </Typography>
    </Paper>
  );
}
