import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, TextField, InputAdornment,
  List, ListItemButton, ListItemAvatar, ListItemText, Divider, Alert, Container, Button,
} from "@mui/material";
import { Search, ArrowForward } from "@mui/icons-material";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GradientHeader from "../../components/common/GradientHeader";
import PatientAvatar from "../../components/common/PatientAvatar";
import EmptyState from "../../components/common/EmptyState";

export default function PatientSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setLoading(true);
        api
          .get("/patients/search/", { params: { search: query } })
          .then((res) => {
            const data = res.data.results || res.data;
            setPatients(Array.isArray(data) ? data : []);
            setError(null);
          })
          .catch(() => {
            setError("Failed to search patients.");
            setPatients([]);
          })
          .finally(() => setLoading(false));
      } else {
        setPatients([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Box>
      <GradientHeader title="Patient Records" subtitle="Search for a patient to view their medical history" gradient="blue" />

      <Container maxWidth="lg">
        {/* Search Box */}
        <Card sx={{ mb: 4, bgcolor: "#f4f8ff", border: "none" }} data-aos="fade-up">
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#175cdd" }} />
                    </InputAdornment>
                  ),
                }}
                autoFocus
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && <LoadingSpinner />}

        {!loading && query.trim().length >= 2 && patients.length === 0 && (
          <EmptyState
            title="No patients found"
            description="Try a different search term."
            image="/assets/img/health/consultation-4.webp"
          />
        )}

        {patients.length > 0 && (
          <Card data-aos="fade-up" data-aos-delay="100">
            <List disablePadding>
              {patients.map((patient, idx) => (
                <Box key={patient.id}>
                  {idx > 0 && <Divider />}
                  <ListItemButton
                    onClick={() => navigate(`/doctor/medical-history/${patient.id}`)}
                    sx={{ py: 2, transition: "all 0.2s ease", "&:hover": { bgcolor: "#f4f8ff" } }}
                  >
                    <ListItemAvatar>
                      <PatientAvatar patient={patient} size={44} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600} sx={{ fontFamily: '"Montserrat", sans-serif' }}>
                          {patient.first_name} {patient.last_name}
                        </Typography>
                      }
                      secondary={patient.email}
                    />
                    <ArrowForward sx={{ color: "#175cdd" }} />
                  </ListItemButton>
                </Box>
              ))}
            </List>
          </Card>
        )}

        {query.trim().length < 2 && !loading && (
          <EmptyState
            title="Search for a patient"
            description="Type at least 2 characters to search by name or email."
            image="/assets/img/health/consultation-4.webp"
          />
        )}
      </Container>
    </Box>
  );
}
