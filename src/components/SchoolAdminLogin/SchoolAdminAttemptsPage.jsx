import { useState, useEffect } from "react";
import { 
  FaArrowLeft, 
  FaFileAlt, 
  FaBook, 
  FaRocket, 
  FaUser, 
  FaCalendar, 
  FaClock, 
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function SchoolAdminAttemptsPage({ type, onBack }) {
  const [attemptsData, setAttemptsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    averageScore: 0,
    totalStudents: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempts();
    fetchStats();
  }, [type]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/attempts?type=${type}&limit=50`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAttemptsData(data.attempts || []);
      }
    } catch (error) {
      console.error("Error fetching attempts:", error);
      toast.error("Failed to load assessment attempts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/attempts/stats`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (type === "standard") {
          setStats({
            total: data.stats.standard?.totalAttempts || 0,
            averageScore: data.stats.standard?.averageScore || 0,
            totalStudents: data.stats.standard?.uniqueStudents || 0
          });
        } else if (type === "sat") {
          setStats({
            total: data.stats.sat?.totalAttempts || 0,
            averageScore: data.stats.sat?.averageScore || 0,
            totalStudents: data.stats.sat?.uniqueStudents || 0
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeTaken = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const toggleAttemptDetails = (attemptId) => {
    setExpandedAttemptId(expandedAttemptId === attemptId ? null : attemptId);
  };

  const filteredAttempts = attemptsData.filter(attempt => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      attempt.studentName.toLowerCase().includes(searchLower) ||
      attempt.studentEmail.toLowerCase().includes(searchLower) ||
      attempt.assessmentName.toLowerCase().includes(searchLower) ||
      attempt.subject.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {type === "standard" ? "Standard" : "SAT"} Assessment Attempts
            </h1>
            <p className="text-gray-600 mt-2">
              View all attempts made by students from your school
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search students or assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-200 rounded-lg mr-4">
                <FaFileAlt className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-200 rounded-lg mr-4">
                <FaChartLine className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-200 rounded-lg mr-4">
                <FaUser className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading assessment attempts...</p>
          <p className="text-gray-500">Fetching data from CSV-uploaded students</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-300 text-7xl mb-6">
            {type === "standard" ? "" : ""}
          </div>
          <h4 className="text-2xl font-semibold text-gray-700 mb-3">
            No {type === "standard" ? "Standard" : "SAT"} Attempts Found
          </h4>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Students from your school haven't attempted any {type === "standard" ? "standard" : "SAT"} assessments yet.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <div key={attempt._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
              {/* Attempt Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleAttemptDetails(attempt._id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start mb-3">
                      <div className={`p-3 rounded-lg mr-4 ${type === "sat" ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        {type === "sat" ? (
                          <FaRocket className="text-purple-600 text-xl" />
                        ) : (
                          <FaBook className="text-blue-600 text-xl" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {attempt.assessmentName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium capitalize">{attempt.difficulty}</span>
                          <span className="text-gray-400">•</span>
                          <span>{attempt.subject}</span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center">
                            <FaUser className="mr-1" /> {attempt.studentName}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center">
                            <FaCalendar className="mr-1" /> {formatDate(attempt.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {attempt.score}<span className="text-gray-500">/{attempt.totalMarks}</span>
                      </div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-700">
                        {attempt.percentage}%
                      </div>
                      <div className="text-sm text-gray-600">Percentage</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${attempt.proctoringMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {attempt.proctoringMode === 'real' ? 'Proctored' : 'Test Mode'}
                      </span>
                      <button className="text-gray-500 hover:text-gray-700">
                        {expandedAttemptId === attempt._id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedAttemptId === attempt._id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-white p-5 rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <FaUser className="mr-2 text-blue-600" />
                          Student Details
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{attempt.studentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{attempt.studentEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Class:</span>
                            <span className="font-medium">{attempt.studentClass}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <FaClock className="mr-2 text-green-600" />
                          Performance Metrics
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time Taken:</span>
                            <span className="font-medium">{formatTimeTaken(attempt.timeTaken)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Submission Date:</span>
                            <span className="font-medium">{formatDate(attempt.submittedAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Assessment Mode:</span>
                            <span className={`px-2 py-1 rounded text-xs ${attempt.proctoringMode === 'real' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {attempt.proctoringMode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <FaFileAlt className="mr-2 text-purple-600" />
                        Assessment Details
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assessment Type:</span>
                          <span className={`px-2 py-1 rounded text-xs ${type === 'sat' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{attempt.subject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="font-medium capitalize">{attempt.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Score:</span>
                          <span className="font-medium">{attempt.score}/{attempt.totalMarks} ({attempt.percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Results Count */}
      {!loading && filteredAttempts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            Showing {filteredAttempts.length} of {attemptsData.length} attempts
            {searchTerm && ` filtered by "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  );
}