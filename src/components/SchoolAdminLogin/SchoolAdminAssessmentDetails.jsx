import { useState, useEffect } from "react";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaBook,
  FaUsers,
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaGraduationCap,
  FaCalendar,
  FaTag,
  FaStar,
  FaQuestionCircle,
  FaRocket // Added this import
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function SchoolAdminAssessmentDetails({ 
  assessment: propAssessment, 
  assessmentId, 
  onClose 
}) {
  const [assessment, setAssessment] = useState(propAssessment);
  const [loading, setLoading] = useState(!propAssessment);
  const [error, setError] = useState(null);
  
  // If assessment is passed as prop, don't fetch
  // If only ID is passed, fetch the assessment
  useEffect(() => {
    if (propAssessment) {
      setAssessment(propAssessment);
      setLoading(false);
      return;
    }
    
    if (!assessmentId) {
      setError("No assessment ID provided");
      setLoading(false);
      return;
    }
    
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
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
          throw new Error(data.message || "Failed to load assessment");
        }
        
        // Validate that questions is an array
        if (!Array.isArray(data.assessment?.questions)) {
          console.warn("Questions is not an array, defaulting to empty array:", data.assessment?.questions);
          data.assessment.questions = [];
        }
        
        setAssessment(data.assessment);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching assessment:", err);
        toast.error("Failed to load assessment details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [assessmentId, propAssessment]);

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const assessmentIdToExport = assessment?._id || assessmentId;
      
      if (!assessmentIdToExport) {
        toast.error("No assessment ID available for export");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/uploads/${assessmentIdToExport}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${assessment?.name || "assessment"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Assessment exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export assessment");
    }
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <FaClock className="mr-1.5 h-3.5 w-3.5" />
          Pending Review
        </span>
      );
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-emerald-100 text-emerald-800',
      medium: 'bg-amber-100 text-amber-800',
      hard: 'bg-orange-100 text-orange-800',
      'very hard': 'bg-red-100 text-red-800'
    };
    
    const displayName = difficulty ? 
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 
      "Unknown";
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[difficulty] || 'bg-gray-100 text-gray-800'}`}>
        {displayName}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === "sat") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <FaRocket className="mr-1.5 h-3.5 w-3.5" />
          SAT Assessment
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <FaBook className="mr-1.5 h-3.5 w-3.5" />
          Standard Assessment
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If we're in inline mode (onClose provided), don't show full page layout
  if (onClose) {
    // Inline mode - just show the content without outer container
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <FaQuestionCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Assessment</h2>
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      );
    }

    if (!assessment) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <FaQuestionCircle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">Assessment Not Found</h2>
          <p className="text-yellow-600 mb-4">The requested assessment could not be found.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header with close button for inline mode */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{assessment.name || assessment.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {getTypeBadge(assessment.type)}
              {getStatusBadge(assessment.isApproved)}
              {getDifficultyBadge(assessment.difficulty)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-1"
            title="Close"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Basic info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <span className="flex items-center">
              <FaBook className="mr-2" />
              {assessment.subject || "No Subject"}
            </span>
            <span className="flex items-center">
              <FaGraduationCap className="mr-2" />
              Grade {assessment.gradeLevel || "N/A"}
            </span>
            <span className="flex items-center">
              <FaClock className="mr-2" />
              {assessment.timeLimit || 30} minutes
            </span>
            <span className="flex items-center">
              <FaCalendar className="mr-2" />
              {formatDate(assessment.createdAt)}
            </span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <FaQuestionCircle className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{assessment.questionCount || assessment.questions?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <FaFileAlt className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Marks</p>
                  <p className="text-2xl font-bold text-gray-900">{assessment.totalMarks || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <FaUsers className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{assessment.statistics?.totalAttempts || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-lg mr-4">
                  <FaChartBar className="text-amber-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">{assessment.statistics?.bestScore || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-blue-600" />
              Teacher Information
            </h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold text-lg">
                  {assessment.teacher?.name?.charAt(0) || "T"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{assessment.teacher?.name || "Unknown Teacher"}</p>
                <p className="text-gray-600 text-sm">{assessment.teacher?.email || "No email available"}</p>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Questions Preview</h2>
              <p className="text-gray-600 text-sm">
                Showing all {assessment.questions?.length || 0} questions
              </p>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {assessment.questions && assessment.questions.length > 0 ? (
                assessment.questions.map((question, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-lg mr-3">
                            Q{index + 1}
                          </span>
                          <span className="text-sm text-gray-500">
                            {question.type?.toUpperCase() || "MCQ"} • {question.marks || 1} mark{question.marks !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-medium text-gray-900 mb-3">
                          {question.questionText || "No question text"}
                        </h4>
                        
                        {question.passage && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                            <p className="text-gray-700 italic">{question.passage}</p>
                          </div>
                        )}
                        
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`flex items-center p-3 rounded-lg border ${
                                question.correctAnswer === optIndex 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                  question.correctAnswer === optIndex 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className={`${
                                  question.correctAnswer === optIndex 
                                    ? 'text-green-700 font-medium' 
                                    : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {question.correctAnswer === optIndex && (
                                  <span className="ml-auto text-sm text-green-600 font-medium">
                                    ✓ Correct Answer
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {!question.options && question.correctAnswer && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-700 mb-1">Correct Answer:</p>
                            <p className="text-green-800 font-medium">{question.correctAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FaBook className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Questions Available</h3>
                  <p className="text-gray-500">This assessment doesn't have any questions yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Export button */}
          {/* <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleExportPDF}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Export Assessment as PDF
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  // Original standalone page mode (for direct route access)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <FaQuestionCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Assessment</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Return to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <FaQuestionCircle className="text-yellow-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-700 mb-2">Assessment Not Found</h2>
            <p className="text-yellow-600 mb-4">The requested assessment could not be found or you don't have permission to view it.</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
            >
              Return to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original standalone page rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Assessments
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{assessment.name || assessment.title}</h1>
                {getTypeBadge(assessment.type)}
                {getStatusBadge(assessment.isApproved)}
                {getDifficultyBadge(assessment.difficulty)}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <FaBook className="mr-2" />
                  {assessment.subject || "No Subject"}
                </span>
                <span className="flex items-center">
                  <FaGraduationCap className="mr-2" />
                  Grade {assessment.gradeLevel || "N/A"}
                </span>
                <span className="flex items-center">
                  <FaClock className="mr-2" />
                  {assessment.timeLimit || 30} minutes
                </span>
                <span className="flex items-center">
                  <FaCalendar className="mr-2" />
                  {formatDate(assessment.createdAt)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium shadow-md hover:shadow-lg transition-all"
            >
              <FaDownload />
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <FaQuestionCircle className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{assessment.questionCount || assessment.questions?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <FaFileAlt className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900">{assessment.totalMarks || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{assessment.statistics?.totalAttempts || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg mr-4">
                <FaChartBar className="text-amber-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Score</p>
                <p className="text-2xl font-bold text-gray-900">{assessment.statistics?.bestScore || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaGraduationCap className="mr-2 text-blue-600" />
            Teacher Information
          </h3>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-lg">
                {assessment.teacher?.name?.charAt(0) || "T"}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{assessment.teacher?.name || "Unknown Teacher"}</p>
              <p className="text-gray-600 text-sm">{assessment.teacher?.email || "No email available"}</p>
            </div>
          </div>
        </div>

        {/* Tags & Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {assessment.tags && assessment.tags.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaTag className="mr-2 text-purple-600" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {assessment.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {assessment.rating && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaStar className="mr-2 text-amber-600" />
                Rating
              </h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900 mr-4">
                  {assessment.rating.average?.toFixed(1) || "0.0"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(assessment.rating.average || 0)
                            ? "text-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Based on {assessment.rating.count || 0} ratings
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Questions Preview</h2>
            <p className="text-gray-600 text-sm">
              Showing all {assessment.questions?.length || 0} questions
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {assessment.questions && assessment.questions.length > 0 ? (
              assessment.questions.map((question, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-lg mr-3">
                          Q{index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {question.type?.toUpperCase() || "MCQ"} • {question.marks || 1} mark{question.marks !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 mb-3">
                        {question.questionText || "No question text"}
                      </h4>
                      
                      {question.passage && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                          <p className="text-gray-700 italic">{question.passage}</p>
                        </div>
                      )}
                      
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`flex items-center p-3 rounded-lg border ${
                              question.correctAnswer === optIndex 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                question.correctAnswer === optIndex 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className={`${
                                question.correctAnswer === optIndex 
                                  ? 'text-green-700 font-medium' 
                                  : 'text-gray-700'
                              }`}>
                                {option}
                              </span>
                              {question.correctAnswer === optIndex && (
                                <span className="ml-auto text-sm text-green-600 font-medium">
                                  ✓ Correct Answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!question.options && question.correctAnswer && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-700 mb-1">Correct Answer:</p>
                          <p className="text-green-800 font-medium">{question.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <FaBook className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Questions Available</h3>
                <p className="text-gray-500">This assessment doesn't have any questions yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ASSESSAAI • Assessment Details View
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Assessment ID: {assessment._id}
          </p>
        </div>
      </div>
    </div>
  );
}