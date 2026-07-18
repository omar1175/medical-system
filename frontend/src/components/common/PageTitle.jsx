import { Box, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import {
  pageTitleStyles,
  templateFonts,
  useTemplateColors,
} from "../../styles/templateTheme";

export default function PageTitle({ title, subtitle, breadcrumbs = [] }) {
  const c = useTemplateColors();
  return (
    <Box>
      {/* Page Title Section */}
      <Box sx={pageTitleStyles.wrapper}>
        <Container maxWidth="lg">
          <Typography sx={pageTitleStyles.title}>{title}</Typography>
          {subtitle && (
            <Typography sx={pageTitleStyles.subtitle}>{subtitle}</Typography>
          )}
        </Container>
      </Box>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Box
          sx={{
            bgcolor: c.lightBg,
            borderBottom: `1px solid ${c.border}`,
            py: 1.5,
          }}
        >
          <Container maxWidth="lg">
            <Box
              component="ol"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.875rem",
                m: 0,
                p: 0,
                listStyle: "none",
              }}
            >
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <Box
                    component="li"
                    key={i}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    {i > 0 && (
                      <Typography sx={{ color: c.muted, mx: 0.5 }}>
                        /
                      </Typography>
                    )}
                    {crumb.path && !isLast ? (
                      <Box
                        component={Link}
                        to={crumb.path}
                        sx={{
                          color: c.accent,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {crumb.label}
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          color: isLast ? c.default : c.accent,
                          fontSize: "0.875rem",
                          fontFamily: templateFonts.default,
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
}
