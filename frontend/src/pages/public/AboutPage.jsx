import { Box, Container, Typography, Grid } from "@mui/material";
import {
  Favorite as HeartIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const values = [
  {
    icon: <HeartIcon sx={{ fontSize: 32 }} />,
    title: "Compassion",
    desc: "Providing care with empathy and understanding for every patient's unique needs and circumstances.",
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 32 }} />,
    title: "Excellence",
    desc: "Maintaining the highest standards of medical care through continuous learning and innovation.",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 32 }} />,
    title: "Integrity",
    desc: "Building trust through honest communication and ethical practices in all our interactions.",
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 32 }} />,
    title: "Innovation",
    desc: "Embracing cutting-edge technology and treatments to improve patient outcomes.",
  },
];

const certifications = [
  "/assets/img/clients/clients-1.webp",
  "/assets/img/clients/clients-2.webp",
  "/assets/img/clients/clients-3.webp",
  "/assets/img/clients/clients-4.webp",
  "/assets/img/clients/clients-5.webp",
];

export default function AboutPage() {
  return (
    <Box>
      <PageTitle
        title="About"
        subtitle="Odio et unde deleniti. Deserunt numquam exercitationem. Officiis quo odio sint voluptas consequatur ut a odio voluptatem."
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "About" }]}
      />

      {/* About Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box data-aos="fade-right">
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: templateFonts.heading,
                    fontWeight: 800,
                    fontSize: { xs: "1.8rem", md: "2.2rem" },
                    color: templateColors.heading,
                    mb: 2,
                  }}
                >
                  Compassionate Care for Every Family
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1.05rem",
                    color: templateColors.default,
                    lineHeight: 1.8,
                    mb: 2,
                  }}
                >
                  For over two decades, we have been dedicated to providing
                  exceptional healthcare services to our community. Our
                  commitment goes beyond medical treatment—we believe in
                  building lasting relationships with our patients and their
                  families.
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: templateColors.default,
                    lineHeight: 1.8,
                    mb: 4,
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </Typography>

                {/* Stats */}
                <Grid container spacing={3}>
                  {[
                    { value: "15,000+", label: "Patients Treated" },
                    { value: "25+", label: "Years Experience" },
                    { value: "50+", label: "Medical Specialists" },
                  ].map((stat, i) => (
                    <Grid size={{ xs: 4 }} key={i}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontFamily: templateFonts.heading,
                            fontWeight: 800,
                            fontSize: { xs: "1.5rem", md: "2rem" },
                            color: templateColors.accent,
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: templateColors.default,
                            fontWeight: 500,
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  position: "relative",
                  "& img": { borderRadius: 3, width: "100%", height: "auto" },
                }}
                data-aos="fade-left"
              >
                <Box
                  component="img"
                  src="/assets/img/health/facilities-6.webp"
                  alt="Healthcare facility"
                  sx={{ borderRadius: 3, width: "100%" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -20,
                    right: -20,
                    width: { xs: "40%", md: "35%" },
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    border: "4px solid #fff",
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/img/health/staff-8.webp"
                    alt="Medical team"
                    sx={{ width: "100%", display: "block" }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Core Values */}
          <Box sx={{ mt: { xs: 6, md: 10 } }}>
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: { xs: "1.6rem", md: "2rem" },
                  color: templateColors.heading,
                  mb: 1,
                }}
              >
                Our Core Values
              </Typography>
              <Typography
                sx={{
                  color: templateColors.default,
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                These principles guide everything we do in our commitment to
                exceptional healthcare
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {values.map((v, i) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "all 0.3s",
                      height: "100%",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: `${templateColors.accent}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        color: templateColors.accent,
                      }}
                    >
                      {v.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: templateFonts.heading,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: templateColors.heading,
                        mb: 1,
                      }}
                    >
                      {v.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        color: templateColors.default,
                        lineHeight: 1.7,
                      }}
                    >
                      {v.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Certifications */}
          <Box sx={{ mt: { xs: 6, md: 10 } }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: templateFonts.heading,
                  fontWeight: 800,
                  fontSize: { xs: "1.6rem", md: "2rem" },
                  color: templateColors.heading,
                  mb: 1,
                }}
              >
                Accreditations & Certifications
              </Typography>
              <Typography
                sx={{
                  color: templateColors.default,
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                Recognized by leading healthcare organizations for our
                commitment to quality care
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ justifyContent: "center" }}>
              {certifications.map((src, i) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      textAlign: "center",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt="Certification"
                      sx={{
                        maxWidth: "100%",
                        height: 60,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
