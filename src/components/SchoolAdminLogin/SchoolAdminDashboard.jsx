import { useState, useEffect } from "react";
import { 
  FaHome, 
  FaSignOutAlt, 
  FaBars, 
  FaSearch, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserPlus, 
  FaDownload, 
  FaChartBar, 
  FaUserCheck, 
  FaSync, 
  FaPaperPlane,
  FaClipboardList,
  FaUsers,
  FaUserClock,
  FaEye,
  FaBook,
  FaRocket,
  FaChevronRight,
  FaFileAlt,
  FaTimes,
  FaArrowLeft,
  FaSpinner,
  FaBell // Added for notifications menu
} from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdSchool, MdGroupAdd, MdAdminPanelSettings } from 'react-icons/md';
import { HiOutlineUsers } from 'react-icons/hi';
import { Link } from "react-router-dom";
import assessalogo from "./logo.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StudentCSVUploadModal from "./StudentCSVUploadModal";
import TeacherCSVUploadModal from "./TeacherCSVUploadModal";
import UserManagement from "./UserManagement";
import SchoolAdminProfile from "./SchoolAdminProfile";
import SchoolAdminAttemptsPage from "./SchoolAdminAttemptsPage";
import SchoolAdminUploadsPage from "./SchoolAdminUploadsPage";
import SchoolAdminAssessmentDetails from "./SchoolAdminAssessmentDetails";
import SchoolAdminNotifications from "./SchoolAdminNotifications"; // ADD THIS IMPORT

// ✅ MODIFIED: Pass prop to notification bell
import SchoolAdminNotificationBell from "./SchoolAdminNotificationBell";
import SchoolAdminReports from "./SchoolAdminReports";

export default function SchoolAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolAdminInfo, setSchoolAdminInfo] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showStudentCSVModal, setShowStudentCSVModal] = useState(false);
  const [showTeacherCSVModal, setShowTeacherCSVModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // States for modals
  const [showAttemptTypeModal, setShowAttemptTypeModal] = useState(false);
  const [showAssessmentTypeModal, setShowAssessmentTypeModal] = useState(false);
  const [currentAttemptsPage, setCurrentAttemptsPage] = useState(null);
  const [currentAssessmentType, setCurrentAssessmentType] = useState(null);
  
  // States for assessment details
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [fetchingAssessmentDetails, setFetchingAssessmentDetails] = useState(false);

  // Stats structure
  const [stats, setStats] = useState({
    generatedAssessments: 0,
    activeTeachers: 0,
    inactiveTeachers: 0,
    studentAttempts: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    engagementRate: 0,
    totalAssessments: 0,
    averageScore: 0,
    students: { total: 0 },
    teachers: { total: 0 },
    schoolInfo: { name: "Your School" }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedInfo = localStorage.getItem("schoolAdminInfo");
    if (storedInfo) {
      setSchoolAdminInfo(JSON.parse(storedInfo));
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedInfo = localStorage.getItem("schoolAdminInfo");
      
      if (!token) {
        console.error("❌ No token found in localStorage");
        toast.error("Please login again");
        handleLogout();
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/school-admin/dashboard/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stats) {
        setStats({
          generatedAssessments: data.stats.generatedAssessments?.total || 0,
          activeTeachers: data.stats.generatedAssessments?.activeTeachers || 0,
          inactiveTeachers: data.stats.generatedAssessments?.inactiveTeachers || 0,
          studentAttempts: data.stats.studentAttempts?.total || 0,
          activeStudents: data.stats.studentAttempts?.activeStudents || 0,
          inactiveStudents: data.stats.studentAttempts?.inactiveStudents || 0,
          engagementRate: data.stats.analytics?.engagementRate || 0,
          totalAssessments: data.stats.analytics?.totalAssessments || 0,
          averageScore: data.stats.analytics?.averageScore || 0,
          students: { total: data.stats.students?.total || 0 },
          teachers: { total: data.stats.teachers?.total || 0 },
          schoolInfo: {
            name: data.stats.schoolInfo?.name || "Your School",
            totalStudents: data.stats.schoolInfo?.totalStudents || 0,
            totalTeachers: data.stats.schoolInfo?.totalTeachers || 0
          }
        });
      } else {
        setStats({
          generatedAssessments: 0,
          activeTeachers: 0,
          inactiveTeachers: 0,
          studentAttempts: 0,
          activeStudents: 0,
          inactiveStudents: 0,
          engagementRate: 0,
          totalAssessments: 0,
          averageScore: 0,
          students: { total: 0 },
          teachers: { total: 0 },
          schoolInfo: { name: "Your School", totalStudents: 0, totalTeachers: 0 }
        });
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };
  
  const handleStudentAttemptsClick = () => {
    setShowAttemptTypeModal(true);
  };

  const handleGeneratedAssessmentsClick = () => {
    setShowAssessmentTypeModal(true);
  };

  // Function to fetch full assessment details
  const fetchAssessmentDetails = async (assessmentId) => {
    try {
      setFetchingAssessmentDetails(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login again");
        handleLogout();
        return null;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/uploads/${assessmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to load assessment details");
      }
      
      // Validate that questions is an array
      if (!Array.isArray(data.assessment?.questions)) {
        console.warn("Questions is not an array, defaulting to empty array");
        data.assessment.questions = [];
      }
      
      return data.assessment;
    } catch (err) {
      console.error("Error fetching assessment details:", err);
      toast.error("Failed to load assessment details");
      return null;
    } finally {
      setFetchingAssessmentDetails(false);
    }
  };

  // Handle assessment preview
  const handleAssessmentPreview = async (assessmentId, assessmentType) => {
    try {
      setLoading(true);
      
      const assessmentDetails = await fetchAssessmentDetails(assessmentId);
      
      if (assessmentDetails) {
        setSelectedAssessment(assessmentDetails);
        setSelectedAssessmentId(assessmentId);
        setCurrentView("assessment-details");
      }
    } catch (error) {
      console.error("Error in preview handler:", error);
      toast.error("Failed to preview assessment");
    } finally {
      setLoading(false);
    }
  };

  // Handle back from assessment details
  const handleBackFromAssessmentDetails = () => {
    setCurrentView("uploads");
    setSelectedAssessment(null);
    setSelectedAssessmentId(null);
  };

  // Handle view all notifications
  const handleViewAllNotifications = () => {
    setCurrentView("notifications");
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // Handle back from notifications
  const handleBackFromNotifications = () => {
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("schoolAdminInfo");
      toast.success("Logged out successfully!");
      navigate("/school-admin-login");
    }
  };

  // DashboardHome component
  const DashboardHome = () => (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-gradient-to-r from-red-400 to-pink-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform cursor-pointer"
          onClick={handleGeneratedAssessmentsClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Generated Assessments</h3>
              <p className="text-2xl mt-2">{stats.generatedAssessments}</p>
            </div>
            <FaFileAlt className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Active Teachers: {stats.activeTeachers}</p>
              <p>Inactive Teachers: {stats.inactiveTeachers}</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs">
              View
            </button>
          </div>
        </div>

        <div
          className="bg-gradient-to-r from-green-400 to-lime-400 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform cursor-pointer"
          onClick={handleStudentAttemptsClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Student Attempts</h3>
              <p className="text-2xl mt-2">{stats.studentAttempts}</p>
              <p className="text-sm mt-1 opacity-90">Total attempts across all students</p>
            </div>
            <FaUsers className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Active Students: {stats.activeStudents}</p>
              <p>Inactive Students: {stats.inactiveStudents}</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs">
              View Details
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Analytics</h3>
              <p className="text-2xl mt-2">{stats.engagementRate}%</p>
              <p className="text-sm mt-1 opacity-90">Engagement Rate</p>
            </div>
            <FaClipboardList className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Assessments: {stats.totalAssessments}</p>
              <p>Avg. Score: {stats.averageScore}%</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs">
              View
            </button>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Bulk User Management</h3>
            <p className="text-gray-600 mt-1">Upload CSV files to add multiple users</p>
          </div>
         
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="border-2 border-dashed border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
            onClick={() => setShowStudentCSVModal(true)}
          >
            <div className="flex items-center mb-5">
              <div className="p-4 bg-blue-100 rounded-xl mr-4">
                <FaUserGraduate className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">Upload Students</h4>
                <p className="text-sm text-gray-600">Add multiple students via CSV</p>
              </div>
            </div>
            <p className="text-gray-500 mb-5">
              Upload student details (Name, Email, Grade) to create accounts and generate login credentials.
            </p>
            <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 font-medium transition-opacity">
              Upload Student CSV
            </button>
          </div>

          <div 
            className="border-2 border-dashed border-purple-200 rounded-xl p-6 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors"
            onClick={() => setShowTeacherCSVModal(true)}
          >
            <div className="flex items-center mb-5">
              <div className="p-4 bg-purple-100 rounded-xl mr-4">
                <FaChalkboardTeacher className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">Upload Teachers</h4>
                <p className="text-sm text-gray-600">Add multiple teachers via CSV</p>
              </div>
            </div>
            <p className="text-gray-500 mb-5">
              Upload teacher details (Name, Email, Subject) to create accounts and generate login credentials.
            </p>
            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:opacity-90 font-medium transition-opacity">
              Upload Teacher CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <FaUserCheck className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">15 Students Added</p>
                <p className="text-sm text-gray-600">Via CSV upload • Credentials sent</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">2 hours ago</span>
              <button className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                View
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <HiOutlineUsers className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">3 Teachers Added</p>
                <p className="text-sm text-gray-600">Manual entry • Credentials pending</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">1 day ago</span>
              <button className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200">
                Send Credentials
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg mr-4">
                <FaSync className="text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">5 Assessments Generated</p>
                <p className="text-sm text-gray-600">Math & Science tests created</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Yesterday</span>
              <button className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case "students":
        return <UserManagement type="students" schoolId={schoolAdminInfo?._id} onBack={() => setCurrentView("dashboard")} />;
      case "teachers":
        return <UserManagement type="teachers" schoolId={schoolAdminInfo?._id} onBack={() => setCurrentView("dashboard")} />;
      case "profile":
        return <SchoolAdminProfile 
                 schoolAdminInfo={schoolAdminInfo} 
                 onUpdate={(updatedData) => {
                   setSchoolAdminInfo(prev => ({ ...prev, ...updatedData }));
                 }}
               />;
      case "attempts":
        return <SchoolAdminAttemptsPage 
                 type={currentAttemptsPage} 
                 onBack={() => setCurrentView("dashboard")} 
               />;
      case "uploads":
        return <SchoolAdminUploadsPage 
                 onBack={() => setCurrentView("dashboard")} 
                 assessmentType={currentAssessmentType}
                 onPreviewAssessment={handleAssessmentPreview}
               />;
      case "reports":
        return (
          <div>
            <SchoolAdminReports onBack={() => setCurrentView("dashboard")} />
          </div>
        );
      case "assessment-details":
        return (
          <div>
            <button
              onClick={handleBackFromAssessmentDetails}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
            >
              <FaArrowLeft className="mr-2" />
              Back to Assessments
            </button>
            
            {fetchingAssessmentDetails ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm">
                <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
                <p className="text-gray-600">Loading assessment details...</p>
              </div>
            ) : (
              <SchoolAdminAssessmentDetails 
                assessment={selectedAssessment}
                assessmentId={selectedAssessmentId}
                onClose={handleBackFromAssessmentDetails}
              />
            )}
          </div>
        );
      case "notifications": // ✅ ADDED NOTIFICATIONS CASE
        return (
          <div>
            <button
              onClick={handleBackFromNotifications}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <SchoolAdminNotifications />
          </div>
        );
      case "dashboard":
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 bg-white text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 border-r border-gray-200 shadow-sm`}>
        <button 
          className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-gray-800 transition" 
          onClick={() => setSidebarOpen(false)}
        >
          ✖
        </button>
        
        <div className="flex justify-center mb-8">
          <img src={assessalogo} alt="Assessa Logo" className="w-32" />
        </div>

        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <MdSchool className="text-gray-600 mr-3" />
            <div>
              <p className="font-semibold text-gray-900">{schoolAdminInfo?.schoolName || "Your School"}</p>
              <p className="text-sm text-gray-600">{schoolAdminInfo?.city || "City"}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "dashboard" ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <FaHome className="text-lg" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => setCurrentView("students")}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "students" ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <FaUserGraduate className="text-lg" />
            <span className="font-medium">Students</span>
            <span className="ml-auto px-2 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs">
              {stats?.students?.total || 0}
            </span>
          </button>

          <button 
            onClick={() => setCurrentView("teachers")}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "teachers" ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <FaChalkboardTeacher className="text-lg" />
            <span className="font-medium">Teachers</span>
            <span className="ml-auto px-2 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs">
              {stats?.teachers?.total || 0}
            </span>
          </button>

          <button 
            onClick={() => setCurrentView("reports")}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${
              currentView === "reports" 
                ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaChartBar className="text-lg" />
            <span className="font-medium">Reports</span>
          </button>

          {/* ✅ ADDED NOTIFICATIONS MENU ITEM */}
          {/* <button 
            onClick={() => setCurrentView("notifications")}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "notifications" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" : "text-gray-700 hover:bg-gray-100"}`}
          >
            <FaBell className="text-lg" />
            <span className="font-medium">Notifications</span>
            <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              {stats?.notifications?.unread || 0}
            </span>
          </button> */}

          <button 
            onClick={() => setCurrentView("profile")}
            className={`group flex items-center space-x-3 py-3.5 px-4 rounded-xl w-full text-left transition-all duration-300 ${currentView === "profile" ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md" : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700"}`}
          >
            <IoPersonCircleOutline className="text-lg" />
            <span className="font-medium">My Profile</span>
          </button>
        </nav>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start md:items-center mb-8">
          <div className="flex items-center w-full md:w-auto">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="md:hidden p-3 text-gray-600 hover:text-gray-800 transition-all mr-3"
            >
              <FaBars className="text-xl" />
            </button>
            <div className="md:hidden flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search students, teachers, or uploads..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* ✅ MODIFIED: Pass onViewAllNotifications prop */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
            <SchoolAdminNotificationBell onViewAllNotifications={handleViewAllNotifications} />
            <div className="text-right">
              <p className="font-semibold text-gray-900">{schoolAdminInfo?.schoolName || "School Admin"}</p>
              <p className="text-sm text-gray-600">School Administrator</p>
            </div>
            <div className="relative">
              <IoPersonCircleOutline className="text-3xl text-gray-600" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        {currentView === "dashboard" && (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-700 mb-2">
              Welcome,{" "}
              <span className="relative inline-block">
                <span className="font-sans bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {schoolAdminInfo?.schoolName || "School Admin"}
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></span>
              </span>
              !
            </h2>
            <p className="text-lg text-gray-600">Manage students, teachers, and assessments from your school portal</p>
          </div>
        )}

        {/* Loading State */}
        {(loading || fetchingAssessmentDetails) && currentView === "dashboard" && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading dashboard stats...</span>
          </div>
        )}

        {!loading && renderContent()}
      </main>

      {/* Modals */}
      {showStudentCSVModal && (
        <StudentCSVUploadModal 
          schoolId={schoolAdminInfo?._id}
          onClose={() => setShowStudentCSVModal(false)}
          onSuccess={() => {
            fetchDashboardStats();
            setShowStudentCSVModal(false);
            toast.success("Students uploaded successfully!");
          }}
        />
      )}

      {showTeacherCSVModal && (
        <TeacherCSVUploadModal 
          schoolId={schoolAdminInfo?._id}
          onClose={() => setShowTeacherCSVModal(false)}
          onSuccess={() => {
            fetchDashboardStats();
            setShowTeacherCSVModal(false);
            toast.success("Teachers uploaded successfully!");
          }}
        />
      )}
      
      {showAttemptTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Select Attempt Type</h3>
              <p className="text-gray-600 mt-1">Choose which type of attempts to view</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    setShowAttemptTypeModal(false);
                    setCurrentAttemptsPage("standard");
                    setCurrentView("attempts");
                  }}
                  className="flex items-center justify-between p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="p-4 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                      <FaBook className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Standard Attempts</h4>
                      <p className="text-gray-600">View all standard assessment attempts</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400 group-hover:text-blue-600" />
                </button>
                
                <button
                  onClick={() => {
                    setShowAttemptTypeModal(false);
                    setCurrentAttemptsPage("sat");
                    setCurrentView("attempts");
                  }}
                  className="flex items-center justify-between p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="p-4 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                      <FaRocket className="text-purple-600 text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">SAT Attempts</h4>
                      <p className="text-gray-600">View all SAT assessment attempts</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400 group-hover:text-purple-600" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowAttemptTypeModal(false)}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showAssessmentTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Assessment Types</h3>
              <p className="text-gray-600 mt-1">Select the type of assessments you want to view</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    setShowAssessmentTypeModal(false);
                    setCurrentAssessmentType("standard");
                    setCurrentView("uploads");
                  }}
                  className="flex items-center justify-between p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="p-4 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                      <FaBook className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Standard Assessments</h4>
                      <p className="text-gray-600">View and manage regular curriculum assessments</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400 group-hover:text-blue-600" />
                </button>
                
                <button
                  onClick={() => {
                    setShowAssessmentTypeModal(false);
                    setCurrentAssessmentType("sat");
                    setCurrentView("uploads");
                  }}
                  className="flex items-center justify-between p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="p-4 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                      <FaRocket className="text-purple-600 text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">SAT Assessments</h4>
                      <p className="text-gray-600">Access specialized SAT preparation tests</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400 group-hover:text-purple-600" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowAssessmentTypeModal(false)}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}