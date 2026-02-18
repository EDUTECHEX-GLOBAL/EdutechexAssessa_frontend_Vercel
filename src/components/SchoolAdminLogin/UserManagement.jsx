import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserManagement = ({ type, schoolId, onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [type, schoolId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/${type}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        let usersData = [];
        if (type === "students" && data.students) {
          usersData = data.students;
        } else if (type === "teachers" && data.teachers) {
          usersData = data.teachers;
        } else if (data.data) {
          usersData = data.data;
        } else if (Array.isArray(data)) {
          usersData = data;
        }
        
        const transformedUsers = usersData.map(user => ({
          _id: user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          status: user.status || 'pending',
          grade: user.grade || user.class || 'N/A',
          subject: user.subject || user.selectedSubjects?.[0] || 'N/A',
          phone: user.phone || 'N/A',
          createdAt: user.createdAt || new Date().toISOString(),
          mainUserId: user.mainUserId
        }));
        
        setUsers(transformedUsers);
      } else {
        toast.error(`Error fetching ${type}: ${data?.message || 'Unknown error'}`);
        setUsers([]);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${type}:`, error);
      toast.error(`Failed to load ${type}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/${type}/${userId}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchUsers();
      } else {
        toast.error(data?.message || `Failed to update status`);
      }
    } catch (error) {
      console.error(`Error toggling status:`, error);
      toast.error(`Error updating status`);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/school-admin/${type}/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`${type.slice(0, -1)} deleted successfully`);
        setDeleteConfirm(null);
        fetchUsers();
      } else {
        toast.error(data?.message || `Failed to delete`);
      }
    } catch (error) {
      console.error(`Error deleting:`, error);
      toast.error(`Error deleting`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const pending = users.filter(u => u.status === 'pending' || u.status === 'creation').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    
    return { total, active, pending, inactive };
  };

  const stats = getStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch(status) {
        case 'active': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'inactive': return 'bg-rose-50 text-rose-700 border border-rose-200';
        case 'pending':
        case 'creation': return 'bg-amber-50 text-amber-700 border border-amber-200';
        case 'approved': return 'bg-blue-50 text-blue-700 border border-blue-200';
        default: return 'bg-slate-50 text-slate-700 border border-slate-200';
      }
    };

    const displayText = status === 'creation' ? 'Pending' : status?.charAt(0).toUpperCase() + status?.slice(1);

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {displayText}
      </span>
    );
  };

  const getTypeColor = () => {
    return type === "students" 
      ? "text-blue-700" 
      : "text-purple-700";
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-800 mb-4 flex items-center text-sm font-medium group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Back to Dashboard
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${getTypeColor()}`}>
              {type === "students" ? "Student" : "Teacher"} Management
            </h1>
            <p className="text-slate-600 mt-2 text-sm">
              Manage and monitor all {type} in your institution
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards with Light Classy Background Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Card - Light Blue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-medium text-blue-700 mb-1">Total {type}</div>
            <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs text-blue-600 mt-2">All registered {type}</div>
          </div>
        </div>
        
        {/* Active Card - Light Green */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-medium text-emerald-700 mb-1">Active {type}</div>
            <div className="text-3xl font-bold text-slate-800">{stats.active}</div>
            <div className="text-xs text-emerald-600 mt-2">Currently active</div>
          </div>
        </div>
        
        {/* Pending Card - Light Amber/Orange */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-medium text-amber-700 mb-1">Pending Approval</div>
            <div className="text-3xl font-bold text-slate-800">{stats.pending}</div>
            <div className="text-xs text-amber-600 mt-2">Awaiting approval</div>
          </div>
        </div>
        
        {/* Inactive Card - Light Rose/Red */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-medium text-rose-700 mb-1">Inactive {type}</div>
            <div className="text-3xl font-bold text-slate-800">{stats.inactive}</div>
            <div className="text-xs text-rose-600 mt-2">Currently inactive</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={`Search ${type} by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[180px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="creation">Creation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-3 text-sm">Loading {type}...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-300 text-5xl mb-4">📋</div>
            <p className="text-slate-600 font-medium">No {type} found</p>
            {searchTerm && (
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria</p>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-800">{filteredUsers.length}</span> of <span className="font-semibold text-slate-800">{users.length}</span> {type}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      EMAIL
                    </th>
                    {type === "students" && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        GRADE
                      </th>
                    )}
                    {type === "teachers" && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        SUBJECT
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      CREATED
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{user.email}</div>
                      </td>
                      {type === "students" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
                            {user.grade}
                          </div>
                        </td>
                      )}
                      {type === "teachers" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 inline-block">
                            {user.subject}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${user.status === "active" 
                              ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {user.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="px-4 py-2 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <span className="text-rose-600 font-bold text-xl">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Confirm Delete</h3>
                  <p className="text-slate-600 text-sm">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">You are about to delete:</div>
                <div className="font-bold text-slate-900 text-lg">{deleteConfirm.name}</div>
                <div className="text-sm text-slate-600">{deleteConfirm.email}</div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm._id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700 font-medium transition-colors shadow-md"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;