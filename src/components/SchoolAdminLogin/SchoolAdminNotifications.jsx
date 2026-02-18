import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaFileAlt, 
  FaCheckCircle,
  FaFilter,
  FaArrowLeft,
  FaSearch,
  FaTimes,
  FaTrash,
  FaSchool,
  FaUserCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Helper function to clean text (fix spacing issues in acronyms)
const cleanText = (text) => {
  if (!text) return '';
  
  // Common acronyms that might have spacing issues
  const acronyms = {
    'S\\s+A\\s+T': 'SAT',
    'A\\s+C\\s+T': 'ACT',
    'G\\s+R\\s+E': 'GRE',
    'T\\s+O\\s+E\\s+F\\s+L': 'TOEFL',
    'I\\s+E\\s+L\\s+T\\s+S': 'IELTS',
    'C\\s+B\\s+S\\s+E': 'CBSE',
    'I\\s+C\\s+S\\s+E': 'ICSE',
    'N\\s+C\\s+E\\s+R\\s+T': 'NCERT',
    'P\\s+D\\s+F': 'PDF',
    'J\\s+P\\s+G': 'JPG',
    'P\\s+N\\s+G': 'PNG',
    'U\\s+R\\s+L': 'URL'
  };
  
  let cleaned = text;
  
  // Replace all problematic acronyms
  Object.entries(acronyms).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern, 'gi');
    cleaned = cleaned.replace(regex, replacement);
  });
  
  // Also fix single letters with spaces: "S A T" -> "SAT"
  cleaned = cleaned.replace(/([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3');
  cleaned = cleaned.replace(/([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3$4');
  cleaned = cleaned.replace(/([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3$4$5');
  
  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

const SchoolAdminNotifications = ({ onBack }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page, filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        unreadOnly: (filter === 'unread').toString()
      });
      
      if (typeFilter !== 'all') {
        queryParams.append('type', typeFilter);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/notifications?${queryParams}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Clean titles and messages before setting state
        const cleanedNotifications = (data.notifications || []).map(notification => ({
          ...notification,
          title: cleanText(notification.title),
          message: cleanText(notification.message),
          // Also clean data fields if needed
          data: notification.data ? {
            ...notification.data,
            // Clean any string values in data
            ...Object.fromEntries(
              Object.entries(notification.data).map(([key, value]) => [
                key,
                typeof value === 'string' ? cleanText(value) : value
              ])
            )
          } : {}
        }));
        
        const groupedNotifications = groupNotificationsByEntity(cleanedNotifications);
        setNotifications(groupedNotifications);
        setUnreadCount(data.unreadCount || 0);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        toast.error(data.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const groupNotificationsByEntity = (notifs) => {
    const grouped = {};
    
    notifs.forEach(notification => {
      const key = notification.relatedUserId || notification._id;
      
      if (!grouped[key]) {
        grouped[key] = {
          ...notification,
          relatedNotifications: [notification]
        };
      } else {
        grouped[key].relatedNotifications.push(notification);
        
        if (notification.type === 'credentials_resent') {
          grouped[key].type = 'credentials_resent';
          grouped[key].title = 'Credentials Updated';
          grouped[key].message = `Login credentials updated for ${notification.data?.studentEmail || notification.data?.teacherEmail}`;
        }
      }
    });
    
    return Object.values(grouped);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/notifications/${id}/read`,
        {
          method: 'PATCH',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/notifications/mark-all-read`,
        {
          method: 'PATCH',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success(data.message || 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/notifications/${id}`,
        {
          method: 'DELETE',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_student_added':
        return <FaUserGraduate className="text-green-500 text-lg" />;
      case 'new_teacher_added':
        return <FaChalkboardTeacher className="text-blue-500 text-lg" />;
      case 'assessment_generated':
        return <FaFileAlt className="text-purple-500 text-lg" />;
      case 'assessment_attempted':
        return <FaCheckCircle className="text-orange-500 text-lg" />;
      case 'credentials_resent':
        return <FaUserCheck className="text-teal-500 text-lg" />;
      case 'feedback_sent':
        return <FaSchool className="text-indigo-500 text-lg" />;
      default:
        return <FaBell className="text-gray-500 text-lg" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return 'Recently';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm === '') return true;
    
    const searchLower = cleanText(searchTerm).toLowerCase();
    return (
      cleanText(notification.title).toLowerCase().includes(searchLower) ||
      cleanText(notification.message).toLowerCase().includes(searchLower) ||
      (notification.data?.studentEmail?.toLowerCase().includes(searchLower)) ||
      (notification.data?.teacherEmail?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Manage your school activity notifications</p>
          </div>
          
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            )}
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center shadow-sm"
              >
                <FaCheck className="mr-2" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <FaFilter className="text-gray-500 mr-2" />
                <span className="font-medium text-gray-700 mr-3">Filters:</span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setFilter('all');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setFilter('unread');
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Unread
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-3">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="new_student_added">New Students</option>
                  <option value="new_teacher_added">New Teachers</option>
                  <option value="assessment_generated">Assessments Generated</option>
                  <option value="assessment_attempted">Assessments Attempted</option>
                  <option value="credentials_resent">Credentials Resent</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* List Header */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">
              {filter === 'unread' ? 'Unread Notifications' : 'All Notifications'}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredNotifications.length} found)
              </span>
            </h3>
            <div className="text-sm text-gray-500">
              {unreadCount > 0 && (
                <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <FaBell className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600 mb-6">You're all caught up!</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`p-6 transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex items-start">
                  {/* Icon */}
                  <div className="p-3 rounded-lg bg-white border border-gray-200 mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {notification.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {!notification.read && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Unread
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{formatDate(notification.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center px-3 py-1 bg-green-50 rounded-lg"
                            title="Mark as read"
                          >
                            <FaCheck className="mr-1" />
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center px-3 py-1 bg-red-50 rounded-lg"
                          title="Delete notification"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{notification.message}</p>
                    
                    {/* Details Section */}
                    {notification.data && Object.keys(notification.data).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3 text-sm">Details:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(notification.data).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-gray-700 capitalize">
                                {cleanText(key.replace(/([A-Z])/g, ' $1').trim())}:
                              </span>
                              <span className="text-gray-600 ml-2">
                                {typeof value === 'string' ? cleanText(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Related Notifications (if any) */}
                    {notification.relatedNotifications && notification.relatedNotifications.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">
                          Related updates for this user:
                        </p>
                        <div className="space-y-2">
                          {notification.relatedNotifications.slice(1).map((related, idx) => (
                            <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              • {cleanText(related.message)} ({formatDate(related.createdAt)})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolAdminNotifications;