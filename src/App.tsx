import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import SubmitReferralPage from "./pages/SubmitReferralPage";
import TrackingPage from "./pages/TrackingPage";
import SupportEmailPage from "./pages/support/SupportEmailPage";
import ContactNumberPage from "./pages/support/ContactNumberPage";
import FaqPage from "./pages/support/FaqPage";
import SendMessagePage from "./pages/support/SendMessagePage";
import SubmitTicketPage from "./pages/support/SubmitTicketPage";
import ResponseStatusPage from "./pages/support/ResponseStatusPage";
import SettingsPage from "./pages/settings/SettingsPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import Layout from "./components/layout/Layout";

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="submit" element={<SubmitReferralPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<Navigate to="/support/email" replace />} />
            <Route path="support/email" element={<SupportEmailPage />} />
            <Route path="support/contact" element={<ContactNumberPage />} />
            <Route path="support/faq" element={<FaqPage />} />
            <Route path="support/send-message" element={<SendMessagePage />} />
            <Route path="support/submit-ticket" element={<SubmitTicketPage />} />
            <Route path="support/response-status" element={<ResponseStatusPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
