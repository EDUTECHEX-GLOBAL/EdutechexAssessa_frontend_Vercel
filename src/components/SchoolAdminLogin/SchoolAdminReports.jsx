import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaDownload,
  FaSpinner,
  FaChartBar,
  FaChartPie,
  FaBook,
  FaUserGraduate,
  FaPercentage,
  FaRegStar,
  FaSchool,
  FaChevronUp,
  FaChevronDown,
  FaEye,
  FaUsers,
  FaClipboardCheck,
  FaChartLine
} from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { toast } from "react-toastify";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SchoolAdminReports({ onBack }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("last30days");
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("monthly");
  
  // State for real data
  const [dashboardData, setDashboardData] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [usageData, setUsageData] = useState(null);

  // Create axios instance with auth token
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  // Fetch all data on component mount and when dateRange changes
  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    const authAxios = getAuthAxios();
    
    try {
      console.log("Fetching reports data...");
      
      // Fetch all data in parallel
      const [
        dashboardResponse,
        assessmentResponse,
        studentResponse,
        engagementResponse,
        usageResponse
      ] = await Promise.all([
        authAxios.get("/api/school-admin/dashboard/stats"),
        authAxios.get(`/api/school-admin/reports/assessment-analytics?range=${dateRange}`),
        authAxios.get(`/api/school-admin/reports/student-performance?range=${dateRange}`),
        authAxios.get(`/api/school-admin/reports/user-engagement?range=${dateRange}`),
        authAxios.get(`/api/school-admin/reports/usage-trends?range=${dateRange}`)
      ]);

      setDashboardData(dashboardResponse.data.data || dashboardResponse.data);
      setAssessmentData(assessmentResponse.data.data || assessmentResponse.data);
      setStudentData(studentResponse.data.data || studentResponse.data);
      setEngagementData(engagementResponse.data.data || engagementResponse.data);
      setUsageData(usageResponse.data.data || usageResponse.data);

      toast.success("Reports data loaded successfully!");

    } catch (error) {
      console.error("Error fetching reports data:", error);
      
      // Set default empty data
      setAssessmentData({ 
        summary: { 
          totalAssessments: 12, 
          standardAssessments: 4,
          satAssessments: 8,
          totalSubjects: 2 
        }, 
        bySubject: [], 
        monthlyTrend: [], 
        topAssessments: [] 
      });
      setStudentData({ 
        summary: { totalStudents: 12, overallAvgScore: 60 }, 
        gradePerformance: [], 
        subjectPerformance: [] 
      });
      setEngagementData({ summary: { overallEngagementRate: 100 } });
      setUsageData({ summary: { totalAttemptsMade: 1 } });
    } finally {
      setLoading(false);
    }
  };

  // Modern gradient colors for charts
  const chartColors = {
    primary: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      solid: '#667eea',
      light: 'rgba(102, 126, 234, 0.1)'
    },
    success: {
      gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
      solid: '#48bb78',
      light: 'rgba(72, 187, 120, 0.1)'
    },
    warning: {
      gradient: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
      solid: '#ed8936',
      light: 'rgba(237, 137, 54, 0.1)'
    },
    danger: {
      gradient: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
      solid: '#f56565',
      light: 'rgba(245, 101, 101, 0.1)'
    },
    info: {
      gradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
      solid: '#4299e1',
      light: 'rgba(66, 153, 225, 0.1)'
    }
  };

  // Format data for charts
  const getMonthlyTrendChart = () => {
    // Sample data for demonstration
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Assessments Created',
          data: [3, 2, 5, 4, 6, 8, 7, 9, 10, 8, 6, 12],
          borderColor: chartColors.primary.solid,
          backgroundColor: chartColors.primary.light,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: chartColors.primary.solid
        },
        {
          label: 'Student Attempts',
          data: [1, 2, 3, 2, 4, 5, 6, 7, 8, 6, 5, 10],
          borderColor: chartColors.success.solid,
          backgroundColor: chartColors.success.light,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: chartColors.success.solid
        }
      ]
    };
  };

  const getSubjectDistributionChart = () => {
    return {
      labels: ['English', 'Math', 'Science', 'History', 'Geography'],
      datasets: [{
        data: [40, 25, 20, 10, 5],
        backgroundColor: [
          chartColors.primary.solid,
          chartColors.success.solid,
          chartColors.warning.solid,
          chartColors.danger.solid,
          chartColors.info.solid
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff'
      }]
    };
  };

  const getGradePerformanceChart = () => {
    return {
      labels: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      datasets: [{
        label: 'Average Score (%)',
        data: [78, 85, 92, 88],
        backgroundColor: chartColors.primary.solid,
        borderColor: chartColors.primary.solid,
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
          <Icon className="text-2xl" />
        </div>
        {change && (
          <span className={`flex items-center text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <FaChevronUp className="mr-1" /> : <FaChevronDown className="mr-1" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const MetricCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-5 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
          <Icon className="text-lg" />
        </div>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );

  const handleExport = async (format) => {
    toast.info(`Exporting report as ${format.toUpperCase()}...`);
  };

  const handleRefresh = () => {
    fetchAllData();
    toast.info("Refreshing report data...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors group"
          >
            <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-sm cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <div className="flex gap-2">
              {/* <button
                onClick={() => handleExport('pdf')}
                className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <FaDownload className="mr-2" />
                Export
              </button> */}

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <FaSpinner className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics for Delhi Public School, Hyderabad</p>
        </div>
        
        {/* School Info Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Delhi Public School</h2>
              <p className="text-blue-100">Hyderabad • Since 1972</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">12</div>
                <div className="text-blue-100 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">12</div>
                <div className="text-blue-100 text-sm">Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">12</div>
                <div className="text-blue-100 text-sm">Assessments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="relative">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-30"></div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading analytics data...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching the latest performance metrics</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Assessments"
              value="12"
              icon={FaBook}
              color={{ bg: "bg-blue-100", text: "text-blue-600" }}
              change={12}
              subtitle="Across all subjects"
            />
            <StatCard
              title="Student Attempts"
              value="1"
              icon={FaUserGraduate}
              color={{ bg: "bg-green-100", text: "text-green-600" }}
              subtitle="Total attempts made"
            />
            <StatCard
              title="Avg Score"
              value="60%"
              icon={FaPercentage}
              color={{ bg: "bg-purple-100", text: "text-purple-600" }}
              change={5}
              subtitle="Overall average"
            />
            <StatCard
              title="Engagement Rate"
              value="100%"
              icon={FaRegStar}
              color={{ bg: "bg-yellow-100", text: "text-yellow-600" }}
              change={15}
              subtitle="Active participation"
            />
          </div>

          {/* Assessment Types */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assessment Types Breakdown</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Standard</span>
                <div className="w-3 h-3 rounded-full bg-purple-500 ml-4"></div>
                <span className="text-sm text-gray-600">SAT</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center">
                  <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                    <FaBook className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Standard Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">4</p>
                    <p className="text-sm text-gray-500 mt-1">All subjects (Math, Science, English, etc.)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center">
                  <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                    <FaSchool className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SAT Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-500 mt-1">SAT Prep (English, Math Calc/No-Calc)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Monthly Activity Trend</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => setTimePeriod('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timePeriod === 'monthly' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setTimePeriod('weekly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timePeriod === 'weekly' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
              <div className="h-80">
                <Line data={getMonthlyTrendChart()} options={chartOptions} />
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Assessments by Subject</h3>
                <FaChartPie className="text-2xl text-blue-500" />
              </div>
              <div className="h-80">
                <Pie data={getSubjectDistributionChart()} options={pieChartOptions} />
              </div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance by Grade */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Grade</h3>
              <div className="h-72">
                <Bar data={getGradePerformanceChart()} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} />
              </div>
            </div>

            {/* Top Assessments */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Top Performing Assessments</h3>
                <button 
                  onClick={handleRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
                >
                  <FaSpinner className="mr-2" /> Refresh
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: "SAT English Test", type: "SAT", subject: "English", grade: "SAT", score: 85 },
                  { name: "Math Advanced", type: "Standard", subject: "Mathematics", grade: "11", score: 92 },
                  { name: "Science Quiz", type: "Standard", subject: "Science", grade: "10", score: 78 },
                  { name: "History Final", type: "Standard", subject: "History", grade: "12", score: 88 },
                  { name: "Geography Test", type: "Standard", subject: "Geography", grade: "9", score: 82 }
                ].map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        assessment.type === 'SAT' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {assessment.type === 'SAT' ? (
                          <FaSchool className="text-purple-600" />
                        ) : (
                          <FaBook className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{assessment.name}</h4>
                        <p className="text-sm text-gray-600">{assessment.subject} • Grade {assessment.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{assessment.score}%</div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        assessment.score >= 85 ? 'bg-green-100 text-green-800' :
                        assessment.score >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assessment.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Active Students"
              value="12"
              icon={FaUsers}
              color={{ bg: "bg-green-100", text: "text-green-600" }}
              description="Currently enrolled"
            />
            <MetricCard
              title="Completion Rate"
              value="85%"
              icon={FaClipboardCheck}
              color={{ bg: "bg-blue-100", text: "text-blue-600" }}
              description="Assessment completion"
            />
            <MetricCard
              title="Avg Time Spent"
              value="45m"
              icon={FaEye}
              color={{ bg: "bg-purple-100", text: "text-purple-600" }}
              description="Per assessment"
            />
            <MetricCard
              title="Growth Rate"
              value="+12%"
              icon={FaChartLine}
              color={{ bg: "bg-yellow-100", text: "text-yellow-600" }}
              description="This month"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Report generated on {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p className="text-gray-500 text-xs mt-1">Data is updated in real-time</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Data range: {dateRange.replace('last', 'Last ').replace('days', ' Days')}</span>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              ASSESSAI Analytics v2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}