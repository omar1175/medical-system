import { Box, Container, Typography } from "@mui/material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

export default function PrivacyPage() {
  return (
    <Box>
      <PageTitle
        title="Privacy Policy"
        subtitle="How we protect and handle your personal information"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Privacy" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: templateColors.heading,
                  mb: 1,
                }}
              >
                Section {i}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: templateColors.default,
                  lineHeight: 1.8,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </Box>
          ))}
        </Container>
      </Box>
    </Box>
  );
}
