import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleHome = {
      ADMIN: "/admin/dashboard",
      DOCTOR: "/doctor/dashboard",
      PATIENT: "/patient/dashboard",
    };
    const target = roleHome[user.role] || "/patient/dashboard";
    if (location.pathname !== target) {
      return <Navigate to={target} replace />;
    }
  }
  return children;
}
