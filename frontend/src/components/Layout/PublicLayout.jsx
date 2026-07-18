import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TemplateNavbar from "./TemplateNavbar";
import TemplateFooter from "./TemplateFooter";

export default function PublicLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TemplateNavbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <TemplateFooter />
    </Box>
  );
}
