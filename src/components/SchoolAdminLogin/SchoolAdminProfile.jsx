import { useState, useEffect } from "react";
import { 
  FaSchool, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaUserTie, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaGlobe,
  FaCalendarAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaGraduationCap,
  FaHistory,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle
} from 'react-icons/fa';
import { toast } from "react-toastify";

export default function SchoolAdminProfile({ schoolAdminInfo, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState({
    schoolName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    principalName: "",
    website: "",
    establishedYear: "",
    schoolType: "Private",
    boardAffiliation: "CBSE",
    totalStudents: 0,
    totalTeachers: 0
  });

  // Fetch profile data from backend
  useEffect(() => {
    fetchSchoolProfile();
  }, []);

  const fetchSchoolProfile = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/school-admin/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle both response formats
        const profile = data.profile || data;
        
        setProfileData({
          schoolName: profile.schoolName || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          phone: profile.contactNumber || profile.phone || "",
          email: profile.email || "",
          principalName: profile.principalName || "",
          website: profile.website || "",
          establishedYear: profile.establishedYear || "",
          schoolType: profile.schoolType || "Private",
          boardAffiliation: profile.boardAffiliation || "CBSE",
          totalStudents: profile.totalStudents || 0,
          totalTeachers: profile.totalTeachers || 0,
          schoolCode: profile.schoolCode || "",
          status: profile.status || "pending",
          verificationStatus: profile.verificationStatus || "pending",
          registrationDate: profile.registrationDate || profile.createdAt,
          lastUpdated: profile.lastUpdated || profile.updatedAt
        });

        // Update localStorage with fresh data
        const storedInfo = JSON.parse(localStorage.getItem("schoolAdminInfo") || "{}");
        localStorage.setItem("schoolAdminInfo", JSON.stringify({
          ...storedInfo,
          ...profile
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to load school profile");
        
        // If backend doesn't have full profile yet, use basic info from login
        if (schoolAdminInfo) {
          setProfileData(prev => ({
            ...prev,
            schoolName: schoolAdminInfo.schoolName || "",
            city: schoolAdminInfo.city || "",
            email: schoolAdminInfo.email || "",
            phone: schoolAdminInfo.contactNumber || ""
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching school profile:", error);
      toast.error("Error loading school profile");
      
      // Fallback to login data if fetch fails
      if (schoolAdminInfo) {
        setProfileData(prev => ({
          ...prev,
          schoolName: schoolAdminInfo.schoolName || "",
          city: schoolAdminInfo.city || "",
          email: schoolAdminInfo.email || "",
          phone: schoolAdminInfo.contactNumber || ""
        }));
      }
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Prepare data in backend format
      const updateData = {
        schoolName: profileData.schoolName,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        contactNumber: profileData.phone,
        principalName: profileData.principalName,
        website: profileData.website,
        establishedYear: profileData.establishedYear,
        schoolType: profileData.schoolType,
        boardAffiliation: profileData.boardAffiliation,
        totalStudents: profileData.totalStudents,
        totalTeachers: profileData.totalTeachers
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/school-admin/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Profile updated successfully!");
        setIsEditing(false);
        
        // Update localStorage and parent component
        const storedInfo = JSON.parse(localStorage.getItem("schoolAdminInfo") || "{}");
        const updatedInfo = {
          ...storedInfo,
          ...data.updatedProfile
        };
        localStorage.setItem("schoolAdminInfo", JSON.stringify(updatedInfo));
        
        if (onUpdate) {
          onUpdate(data.updatedProfile);
        }
        
        // Refresh profile data
        await fetchSchoolProfile();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const schoolTypes = ["Private", "Government", "Aided", "International", "Public", "Semi-Private"];
  const boardAffiliations = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-amber-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading school profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Profile</h2>
          <p className="text-gray-600">Manage your school information</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm transition-all"
          >
            <FaEdit className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                fetchSchoolProfile(); // Reset to original data
              }}
              className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-medium shadow-sm transition-all disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Status Information */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          profileData.status === 'approved' || profileData.status === 'active'
            ? 'bg-green-100 text-green-800' 
            : profileData.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          Status: {profileData.status?.charAt(0).toUpperCase() + profileData.status?.slice(1)}
        </span>
        
        {profileData.verificationStatus && (
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            profileData.verificationStatus === 'verified'
              ? 'bg-blue-100 text-blue-800'
              : profileData.verificationStatus === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            Verification: {profileData.verificationStatus?.replace('_', ' ').toUpperCase()}
          </span>
        )}
        
        {profileData.lastUpdated && (
          <span className="flex items-center text-sm text-gray-500">
            <FaHistory className="mr-1" />
            Last updated: {formatDate(profileData.lastUpdated)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - School Overview */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="p-3 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg mr-4">
                <FaSchool className="text-amber-800 text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {profileData.schoolName || "Your School Name"}
                </h3>
                {profileData.schoolCode && (
                  <p className="text-sm text-gray-600 mt-1">
                    School Code: <span className="font-semibold">{profileData.schoolCode}</span>
                  </p>
                )}
                
                {(profileData.address || profileData.city) && (
                  <div className="flex items-center mt-2 text-gray-700">
                    <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                    <span className="text-sm">
                      {profileData.address ? `${profileData.address}, ` : ''}
                      {profileData.city}{profileData.state ? `, ${profileData.state}` : ''}
                      {profileData.pincode ? ` - ${profileData.pincode}` : ''}
                    </span>
                  </div>
                )}
                
                {profileData.principalName && (
                  <div className="flex items-center mt-2 text-gray-700">
                    <FaUserTie className="mr-2" />
                    <span className="text-sm">Principal: {profileData.principalName}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {profileData.schoolType && (
                    <span className="px-2 py-1 bg-white text-amber-700 text-xs rounded-full border border-amber-300">
                      {profileData.schoolType}
                    </span>
                  )}
                  
                  {profileData.boardAffiliation && (
                    <span className="px-2 py-1 bg-white text-purple-700 text-xs rounded-full border border-purple-300">
                      {profileData.boardAffiliation}
                    </span>
                  )}
                  
                  {profileData.establishedYear && (
                    <span className="px-2 py-1 bg-white text-blue-700 text-xs rounded-full border border-blue-300">
                      Est. {profileData.establishedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Details Card */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">School Information</h4>
                <FaBook className="text-gray-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="schoolName"
                      value={profileData.schoolName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Enter school name"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.schoolName || "Not provided"}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                    {isEditing ? (
                      <select
                        name="schoolType"
                        value={profileData.schoolType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Select Type</option>
                        {schoolTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{profileData.schoolType || "Not specified"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="establishedYear"
                        value={profileData.establishedYear}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="e.g., 1995"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.establishedYear || "Not specified"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board Affiliation</label>
                  {isEditing ? (
                    <select
                      name="boardAffiliation"
                      value={profileData.boardAffiliation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Board</option>
                      {boardAffiliations.map(board => (
                        <option key={board} value={board}>{board}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.boardAffiliation || "Not specified"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!isEditing} // Email should not be editable usually
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 bg-gray-50"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Contact Details</h4>
                <FaPhone className="text-gray-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaPhone className="mr-2" /> Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="+91 9876543210"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.phone || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaGlobe className="mr-2" /> Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.website ? (
                        <a 
                          href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-amber-600 hover:text-amber-800 underline"
                        >
                          {profileData.website}
                        </a>
                      ) : "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUserTie className="mr-2" /> Principal's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="principalName"
                      value={profileData.principalName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="Enter principal's name"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.principalName || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Additional Info */}
        <div className="space-y-6">
          {/* School Statistics */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">School Statistics</h4>
              <FaUsers className="text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                <div className="flex items-center">
                  <FaGraduationCap className="text-amber-600 mr-2" />
                  <span className="font-medium text-gray-700">Total Students</span>
                </div>
                <span className="text-2xl font-bold text-amber-700">
                  {profileData.totalStudents > 0 ? profileData.totalStudents : 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center">
                  <FaChalkboardTeacher className="text-purple-600 mr-2" />
                  <span className="font-medium text-gray-700">Total Teachers</span>
                </div>
                <span className="text-2xl font-bold text-purple-700">
                  {profileData.totalTeachers > 0 ? profileData.totalTeachers : 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center">
                  <FaBook className="text-blue-600 mr-2" />
                  <span className="font-medium text-gray-700">Classes</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">4</span>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <FaExclamationCircle className="inline mr-1" />
              Statistics will update automatically when you add students and teachers.
            </div>
          </div>

          {/* Address Details */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Address Details</h4>
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="Enter complete address"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.address || "Not provided"}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.city || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="Enter state"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.state || "Not provided"}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={profileData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="Enter pincode"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.pincode || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}