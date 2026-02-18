import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaFileAlt, 
  FaCheckCircle,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SchoolAdminNotificationBell = ({ onViewAllNotifications }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔔 Fetching notifications...');
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/notifications?limit=10`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('🔔 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔔 Notifications data:', data);
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        console.log(`🔔 Loaded ${data.notifications?.length || 0} notifications`);
      } else {
        console.error('🔔 API Error:', data.message);
        toast.error('Failed to load notifications');
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      toast.error('Failed to load notifications. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/notifications/unread-count`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
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

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    } else {
      fetchUnreadCount();
    }
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [showNotifications]);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_student_added':
        return <FaUserGraduate className="text-green-500 text-sm" />;
      case 'new_teacher_added':
        return <FaChalkboardTeacher className="text-blue-500 text-sm" />;
      case 'assessment_generated':
        return <FaFileAlt className="text-purple-500 text-sm" />;
      case 'assessment_attempted':
        return <FaCheckCircle className="text-orange-500 text-sm" />;
      default:
        return <FaBell className="text-gray-500 text-sm" />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'new_student_added':
        return 'bg-green-50 border-green-100';
      case 'new_teacher_added':
        return 'bg-blue-50 border-blue-100';
      case 'assessment_generated':
        return 'bg-purple-50 border-purple-100';
      case 'assessment_attempted':
        return 'bg-orange-50 border-orange-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  const formatTime = (dateString) => {
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
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Recently';
    }
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    if (onViewAllNotifications) {
      onViewAllNotifications();
    } else {
      // Fallback: Show in console
      console.log('View all notifications clicked');
      toast.info(`You have ${notifications.length} notifications, ${unreadCount} unread`);
    }
  };

  const handleViewDetails = (notification) => {
    setShowNotifications(false);
    console.log('View details for:', notification);
    
    // Show toast with details for now
    toast.info(`Notification: ${notification.title}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Notifications Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">Recent activities in your school</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <FaCheck className="mr-1" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 text-sm mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <FaBell className="text-3xl text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900">No notifications</h4>
                  <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b hover:bg-gray-50 ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg bg-white border mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs">
                            <span className={`px-2 py-1 rounded-full ${notification.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {notification.priority || 'medium'}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Mark read
                              </button>
                            )}
                            
                            {(notification.relatedAssessmentId || notification.relatedUserId) && (
                              <button
                                onClick={() => handleViewDetails(notification)}
                                className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center"
                              >
                                View
                                <FaExternalLinkAlt className="ml-1 text-xs" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {notifications.length} notifications
                </div>
                <button
                  onClick={handleViewAllNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  View All Notifications
                  <FaExternalLinkAlt className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SchoolAdminNotificationBell;