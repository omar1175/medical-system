import { Box, Typography, Button } from "@mui/material";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  dataAos,
  sx = {},
}) {
  const center = align === "center";

  return (
    <Box
      data-aos={dataAos}
      sx={{
        mb: 4,
        textAlign: align,
        ...sx,
      }}
    >
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#175cdd",
            display: "inline-block",
            mb: 1,
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: center,
          justifyContent: center ? "center" : "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: align }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 800,
              color: "#112344",
              fontSize: { xs: "1.6rem", md: "2rem" },
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: "#3c4049",
                mt: 1,
                maxWidth: center ? 620 : 560,
                mx: center ? "auto" : 0,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ flexShrink: 0 }}>
            {typeof action === "string" ? (
              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: "#175cdd",
                  color: "#175cdd",
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                {action}
              </Button>
            ) : (
              action
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
