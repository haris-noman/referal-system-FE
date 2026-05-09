import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SubmitReferralPage from "./pages/SubmitReferralPage";
import TrackingPage from "./pages/TrackingPage";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="submit" element={<SubmitReferralPage />} />
          <Route path="tracking" element={<TrackingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
