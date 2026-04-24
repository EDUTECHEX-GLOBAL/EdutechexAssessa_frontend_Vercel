import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import Home from "./pages/Home";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading, SetassessaData } from "./redux/rootSlice";
import Admin from "./pages/Admin";
import Login from "./pages/Admin/Login";
import TryforFree from "./components/Tryforfree/TryforFree";
import StudyAssistant from "./components/StudyAssistant/Studyassistant";
import StudyRecommendation from "./components/StudyRecommendation/StudyRecommendation";
import Customcursor from "./components/Customcursor/Customcursor";
import StudentLogin from "./components/StudentLogin/StudentLogin.jsx";
import TeacherLogin from "./components/TeacherLogin/TeacherLogin.jsx";
import AdminPanelLogin from "./components/AdminPanelLogin/AdminPanelLogin.jsx";
import StudentDashboard from "./components/StudentLogin/StudentDashboard";
import TeacherDashboard from "./components/TeacherLogin/TeacherDashboard";
import AdminDashboard from "./components/AdminPanelLogin/AdminDashboard";
import ProblemsolvingAgent from "./components/StudentLogin/ProblemsolvingAgent.jsx";
import AssessmentLibrary from "./components/TeacherLogin/AssessmentLibrary.jsx";
import AssessmentsPage from "./components/StudentLogin/AssessmentsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherManagement from "./components/AdminPanelLogin/TeacherManagement";
import StudentManagement from "./components/AdminPanelLogin/StudentManagement";
import AdminSatAttempts from "./components/AdminPanelLogin/AdminSatAttempts";
import AdminStandardAttempts from "./components/AdminPanelLogin/AdminStandardAttempts";

import ReviewAssessmentPage from "./components/TeacherLogin/ReviewAssessmentPage";

import DashboardHome from "./components/AdminPanelLogin/DashboardHome";
import ApprovalRequests from "./components/AdminPanelLogin/ApprovalRequests";
import StandardGeneratedAssessmentsPage from "./components/AdminPanelLogin/StandardGeneratedAssessmentsPage";
import SatGeneratedAssessmentsPage from "./components/AdminPanelLogin/SatGeneratedAssessmentsPage";
import AdminNotificationsPage from "./components/AdminPanelLogin/AdminNotificationsPage";
import SatAssessmentPreviewPage from "./components/AdminPanelLogin/SatAssessmentPreviewPage.jsx";
import StandardAssessmentPreviewPage from "./components/AdminPanelLogin/StandardAssessmentPreviewPage";
import SchoolAdminLogin from "./components/SchoolAdminLogin/SchoolAdminLogin";
import SchoolAdminDashboard from "./components/SchoolAdminLogin/SchoolAdminDashboard";
import SchoolAdminAssessmentDetails from "./components/SchoolAdminLogin/SchoolAdminAssessmentDetails";

import DiscoverPage from "./pages/DiscoverPage";
import VisionPage from "./pages/VisionPage";
import FeaturesPage from "./pages/FeaturesPage";
import TeamPage from "./pages/TeamPage";
import PricingPage from "./pages/PricingPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";

function App() {
  const { assessaData, reloadData } = useSelector((state) => state.root);
  const dispatch = useDispatch();

  const getassessaData = async () => {
    try {
      dispatch(ShowLoading()); // ✅ Show loading before fetch starts
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/assessa/get-assessa-data`
      );
      dispatch(SetassessaData(response.data));
      dispatch(HideLoading());
    } catch (error) {
      console.error("Error fetching Assessa data:", error);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    if (!assessaData || reloadData) {
      getassessaData();
    }
  }, [assessaData, reloadData]);

  return (
    <BrowserRouter>
      <Customcursor />
      <Routes>
        {/* Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Try for free */}
        <Route path="/choose-role" element={<TryforFree />} />

        <Route path="/study-assistant" element={<StudyAssistant />} />
        <Route path="/study-recommendation" element={<StudyRecommendation />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/problemsolving-agent" element={<ProblemsolvingAgent />} />

        {/* SEO pages */}
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* School Admin Flow */}
        <Route path="/school-admin-login" element={<SchoolAdminLogin />} />

        <Route
          path="/school-admin-dashboard"
          element={
            <ProtectedRoute role="schoolAdmin">
              <SchoolAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment-library"
          element={
            <ProtectedRoute role="teacher">
              <AssessmentLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments-page"
          element={
            <ProtectedRoute role="student">
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard/review/:assessmentId"
          element={
            <ProtectedRoute role="teacher">
              <ReviewAssessmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="approvals" element={<ApprovalRequests />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="standard-generated-assessments" element={<StandardGeneratedAssessmentsPage />} />
          <Route path="sat-generated-assessments" element={<SatGeneratedAssessmentsPage />} />
          <Route path="attempts/standard" element={<AdminStandardAttempts />} />
          <Route path="attempts/sat" element={<AdminSatAttempts />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="assessment-preview/:assessmentId" element={<SatAssessmentPreviewPage />} />
          <Route path="standard-assessment-preview/:assessmentId" element={<StandardAssessmentPreviewPage />} />
        </Route>

        {/* Login Pages */}
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/adminpanel-login" element={<AdminPanelLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;