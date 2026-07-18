import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import PageTitle from "../../components/common/PageTitle";
import { templateColors, templateFonts } from "../../styles/templateTheme";

const faqs = [
  {
    q: "How do I book an appointment?",
    a: "You can book an appointment by browsing our doctors page, selecting your preferred doctor, and choosing an available time slot. You'll need to create an account first.",
  },
  {
    q: "What insurance plans do you accept?",
    a: "We accept most major insurance plans including Blue Cross, Aetna, Cigna, UnitedHealthcare, and Medicare. Please contact our billing department for specific coverage questions.",
  },
  {
    q: "Can I cancel or reschedule an appointment?",
    a: "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time without any penalty. Please log into your account to manage appointments.",
  },
  {
    q: "What should I bring to my first appointment?",
    a: "Please bring your ID, insurance card, list of current medications, and any relevant medical records from previous providers.",
  },
  {
    q: "Do you offer telemedicine consultations?",
    a: "Yes, we offer virtual consultations for follow-up visits and certain types of appointments. You can select this option when booking.",
  },
  {
    q: "How do I get my prescription refilled?",
    a: "You can request a prescription refill through your patient portal or by calling our pharmacy line. Please allow 48 hours for processing.",
  },
];

export default function FAQPage() {
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (_, isExpanded) =>
    setExpanded(isExpanded ? panel : false);

  return (
    <Box>
      <PageTitle
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our services"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "FAQ" }]}
      />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          {faqs.map((faq, i) => (
            <Accordion
              key={i}
              expanded={expanded === i}
              onChange={handleChange(i)}
              sx={{
                mb: 1.5,
                borderRadius: "12px !important",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMore sx={{ color: templateColors.accent }} />
                }
                sx={{ px: 3, py: 1 }}
              >
                <Typography
                  sx={{
                    fontFamily: templateFonts.heading,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: templateColors.heading,
                  }}
                >
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography
                  sx={{
                    fontSize: "0.88rem",
                    color: templateColors.default,
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>
    </Box>
  );
}
