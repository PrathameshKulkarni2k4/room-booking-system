import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useSocket } from "../context/SocketContext.jsx";
import {
  FaEdit,
  FaPlus,
  FaHome,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaTrash,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";

const BASE = import.meta.env.VITE_API_BASE_URL;

const UserProfile = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNo: "",
  });

  

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [allocatedRooms, setAllocatedRooms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userRooms, setUserRooms] = useState([]);


  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${BASE}/api/v1/users/profile`, {
        withCredentials: true,
      });
      console.log(BASE);
      if (res.data.success) {
        const { user, notifications } = res.data.data;
        setUserData(user);
        setNotifications(notifications);
        setUnreadCount(notifications.length);
        setAllocatedRooms(res.data.data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchAllocatedRooms = async () => {
    try {
      const response = await axios.get(`${BASE}/api/v1/booking/user-rooms`, {
        withCredentials: true,
      });

      console.log(response);
      setAllocatedRooms(response.data.data || []);
      setUserRooms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching allocated rooms:", error);
      if (error.response && error.response.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Failed to fetch allocated rooms.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserProfile();
    fetchAllocatedRooms();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNewNotification);
    return () => socket.off("new-notification", handleNewNotification);
  }, [socket]);

  const handleInputChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`${BASE}/api/v1/users/profile`, userData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      setMessage(res.data.message);
      setError("");
      setEditMode(false);
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `${BASE}/api/v1/users/profile/password`,
        passwordData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage(res.data.message);
      setError("");
      setPasswordData({ oldPassword: "", newPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Password change failed");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE}/api/v1/users/logout`, {}, { withCredentials: true });
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6 relative">
        {/* Top Actions */}
        <div className="absolute right-0 top-0 flex items-center space-x-4 pr-4">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setUnreadCount(0);
            }}
            className="relative p-3 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-16 mt-3 w-80 bg-white shadow-xl rounded-lg z-20 max-h-96 overflow-y-auto border border-gray-200">
              <div className="p-4 font-semibold text-gray-700 flex justify-between items-center border-b">
                <span>Notifications</span>
                <button
                  className={`text-xs text-indigo-600 hover:underline ${isClearing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={isClearing}
                  onClick={async () => {
                    setIsClearing(true);
                    try {
                      await axios.delete(
                        "/api/v1/users/notifications/clear",
                        {
                          withCredentials: true,
                        }
                      );
                      setNotifications([]);
                      setUnreadCount(0);
                      setShowNotifications(false);
                    } catch (error) {
                      console.error("Failed to clear notifications:", error);
                    } finally {
                      setIsClearing(false);
                    }
                  }}
                >
                  {isClearing ? "Clearing..." : "Clear All"}
                </button>
              </div>
              {notifications.length > 0 ? (
                notifications.map((note, i) => (
                  <div
                    key={i}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => {
                      if (note._id) navigate(`/notifications/${note._id}`);
                      setShowNotifications(false);
                    }}
                  >
                    <p className="text-sm">{note.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400">
                  No notifications yet.
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
          >
            Log Out
          </button>
        </div>

        {/* Header */}
        <div className="pt-16 mb-10">
          <h2 className="text-4xl font-bold text-indigo-700">User Profile</h2>
        </div>

        {(message || error) && (
          <div
            className={`mt-24 p-4 rounded-lg font-medium ${message
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {message || error}
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-24">
          <h3 className="text-2xl font-bold mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["fullName", "username", "phoneNo"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold mb-2 capitalize">
                  {field === "phoneNo" ? "Phone Number" : field}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name={field}
                    value={userData[field]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 border rounded-md">
                    {userData[field] || "N/A"}
                  </p>
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <p className="px-4 py-2 bg-gray-50 border rounded-md">
                {userData.email}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={() => {
                setEditMode(!editMode);
                if (editMode) fetchUserProfile();
              }}
              className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-100"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
            {editMode && (
              <button
                onClick={handleUpdateProfile}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Change Password</h3>
          <div className="mb-6">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-6 py-2 border text-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-semibold mb-2">
                  Old Password
                </label>
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <div
                  className="absolute right-3 top-9 cursor-pointer"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <div
                  className="absolute right-3 top-9 cursor-pointer"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff /> : <Eye />}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Allocated Rooms */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Allocated Rooms</h3>





          {/* Allocated rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRooms.length > 0 ? (
              userRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => navigate(`/rooms/${room._id}`)}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition duration-200 relative cursor-pointer group"
                >
                  <h4 className="text-xl font-semibold text-indigo-700 mb-2 group-hover:text-indigo-800 transition duration-200">{room.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-gray-700">Location:</span> {room.address}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium text-gray-700">Price:</span> ₹{room.price}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-10">
                <FaHome className="mx-auto mb-4 text-gray-300 text-6xl" />
                <p className="text-lg italic">No rooms listed yet. </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
