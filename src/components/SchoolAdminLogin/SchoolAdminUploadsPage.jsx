import { useState, useEffect } from "react";
import { 
  FaArrowLeft, 
  FaBook, 
  FaRocket, 
  FaSearch, 
  FaFilter,
  FaSortAmountDown,
  FaChevronDown,
  FaEye,
  FaDownload,
  FaUsers,
  FaCalendar,
  FaChartBar,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { toast } from "react-toastify";

export default function SchoolAdminUploadsPage({ 
  onBack, 
  assessmentType = "standard",
  onPreviewAssessment
}) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    subject: "all",
    difficulty: "all",
    status: "all",
    sortBy: "newest"
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(assessmentType);

  useEffect(() => {
    fetchAssessments();
  }, [filters, selectedType]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.subject !== "all") queryParams.append("subject", filters.subject);
      if (filters.difficulty !== "all") queryParams.append("difficulty", filters.difficulty);
      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.sortBy !== "newest") queryParams.append("sort", filters.sortBy);
      
      // Add assessment type to API call
      queryParams.append("type", selectedType);
      
      const queryString = queryParams.toString();
      const url = `${process.env.REACT_APP_API_URL}/api/school-admin/uploads${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      } else {
        throw new Error("Failed to fetch assessments");
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load teacher-generated assessments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      assessment.name?.toLowerCase().includes(searchLower) ||
      assessment.teacherName?.toLowerCase().includes(searchLower) ||
      assessment.subject?.toLowerCase().includes(searchLower) ||
      assessment.title?.toLowerCase().includes(searchLower)
    );
  });

  const getTypeBadge = () => {
    if (selectedType === "sat") {
      return (
        <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center shadow-sm">
          <FaRocket className="mr-1.5" /> SAT Assessment
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center shadow-sm">
          <FaBook className="mr-1.5" /> Standard Assessment
        </span>
      );
    }
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold flex items-center shadow-sm">
          <FaCheckCircle className="mr-1.5" /> Approved
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center shadow-sm">
          <FaClock className="mr-1.5" /> Pending Review
        </span>
      );
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200',
      medium: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200',
      hard: 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200',
      'very hard': 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'
    };
    
    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${colors[difficulty] || 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200'}`}>
        {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
      </span>
    );
  };

  const getSubjectIcon = (subject) => {
    const subjectLower = subject?.toLowerCase() || "";
    
    const icons = {
      math: { color: "bg-blue-100", iconColor: "text-blue-600" },
      science: { color: "bg-green-100", iconColor: "text-green-600" },
      english: { color: "bg-purple-100", iconColor: "text-purple-600" },
      history: { color: "bg-amber-100", iconColor: "text-amber-600" },
      reading: { color: "bg-indigo-100", iconColor: "text-indigo-600" },
      writing: { color: "bg-pink-100", iconColor: "text-pink-600" },
      default: { color: "bg-gray-100", iconColor: "text-gray-600" }
    };
    
    const { color, iconColor } = icons[subjectLower] || icons.default;
    
    return (
      <div className={`p-2 ${color} rounded-lg`}>
        <FaBook className={`text-xl ${iconColor}`} />
      </div>
    );
  };

  const handleExportAssessment = (assessment) => {
   const token = localStorage.getItem("token");
   const url = `${process.env.REACT_APP_API_URL}/api/school-admin/uploads/${assessment._id}/export`;

   fetch(url, {
     headers: {
       Authorization: `Bearer ${token}`
     }
   })
     .then(res => res.blob())
     .then(blob => {
       const link = document.createElement("a");
       link.href = window.URL.createObjectURL(blob);
       link.download = `${assessment.name || "assessment"}.pdf`;
       link.click();
     })
     .catch(() => toast.error("Failed to export assessment"));
 };

  // Handle preview - pass only the ID to parent
  const handlePreviewAssessment = (assessment) => {
    if (onPreviewAssessment) {
      onPreviewAssessment(assessment._id, selectedType);
    } else {
      console.warn("No preview handler provided");
      toast.error("Preview not available");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <button
              onClick={onBack}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors mb-4 font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedType === "sat" ? "SAT" : "Standard"} Generated Assessments
            </h1>
            <p className="text-gray-600 mt-2">
              Browse and manage all {selectedType === "sat" ? "SAT preparation" : "curriculum"} assessments
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              Showing <span className="text-purple-600 font-bold">{filteredAssessments.length}</span> of <span className="text-purple-600 font-bold">{assessments.length}</span> assessments
            </span>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments, teachers, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${showFilters 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm'}`}
              >
                <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="difficulty">Difficulty</option>
                </select>
                <FaSortAmountDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FaChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange("subject", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Subjects</option>
                    <option value="math">Math</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    {selectedType === "sat" && (
                      <>
                        <option value="reading">Reading</option>
                        <option value="writing">Writing</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="very hard">Very Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({ subject: "all", difficulty: "all", status: "all", sortBy: "newest" });
                      setSearchTerm("");
                    }}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-gray-300 text-7xl mb-6">
              <FaBook />
            </div>
            <h4 className="text-2xl font-semibold text-gray-700 mb-3">
              No Assessments Found
            </h4>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {searchTerm || Object.values(filters).some(f => f !== "all" && f !== "newest") 
                ? "No assessments match your search criteria. Try adjusting your filters."
                : "No assessments have been created yet."}
            </p>
            <div className="flex gap-3 justify-center">
              {searchTerm || Object.values(filters).some(f => f !== "all" && f !== "newest") ? (
                <button
                  onClick={() => {
                    setFilters({ subject: "all", difficulty: "all", status: "all", sortBy: "newest" });
                    setSearchTerm("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:opacity-90 font-medium transition-opacity"
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                onClick={onBack}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100 flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {getSubjectIcon(assessment.subject)}
                      <div className="ml-3">
                        <h3 className="font-bold text-gray-900">{assessment.name || assessment.title || "Untitled Assessment"}</h3>
                        <p className="text-sm text-gray-500">
                          {assessment.subject || "N/A"} | Grade {assessment.gradeLevel || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getDifficultyBadge(assessment.difficulty)}
                      {getStatusBadge(assessment.isApproved)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {assessment.questions || 0} questions
                      </span>
                      {assessment.timeLimit && (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {assessment.timeLimit} min
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {getTypeBadge()}
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {assessment.tags && assessment.tags.slice(0, 4).map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaUsers className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{assessment.teacherName || 'Unknown Teacher'}</p>
                        <p className="text-xs text-gray-500">{assessment.teacherEmail || ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePreviewAssessment(assessment)}
                      className="py-2.5 px-4 bg-white border border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition font-medium text-sm flex items-center justify-center"
                    >
                      <FaEye className="mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleExportAssessment(assessment)}
                      className="py-2.5 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-medium text-sm flex items-center justify-center"
                    >
                      <FaDownload className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex space-x-4">
                      <span className="flex items-center font-medium">
                        <FaUsers className="h-4 w-4 mr-1 text-purple-500" />
                        {assessment.submissionCount || 0} attempts
                      </span>
                      <span className="flex items-center font-medium">
                        <FaChartBar className="h-4 w-4 mr-1 text-purple-500" />
                        {assessment.averageScore || "N/A"}% avg
                      </span>
                    </div>
                    <span className="flex items-center">
                      <FaCalendar className="h-3 w-3 mr-1" />
                      {assessment.createdAt ? formatDate(assessment.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ASSESSAAI • Teacher-Generated Assessments
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Showing {selectedType === "sat" ? "SAT" : "Standard"} assessments created by teachers
          </p>
        </div>
      </div>
    </div>
  );
}