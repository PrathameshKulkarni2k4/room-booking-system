import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const BASE = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("ownertoken");
  return {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

const OwnerProfile = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchOwnerProfile = async () => {
    try {
      const res = await axios.get(`${BASE}/api/v1/owner/profile`, getAuthHeaders());
      if (res.data.success) {
        const { owner, notifications } = res.data.data;
        setOwnerData(owner);
        setNotifications(notifications);
        setUnreadCount(notifications.length);
      }
    } catch (error) {
      console.error("Error fetching owner profile:", error);
    }
  };

  useEffect(() => {
    fetchOwnerProfile();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNewNotification);
    return () => socket.off("new-notification", handleNewNotification);
  }, [socket]);

  const handleInputChange = (e) => {
    setOwnerData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateOwnerDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(
        `${BASE}/api/v1/owner/profile`,
        {
          fullName: ownerData.fullName,
          username: ownerData.username,
          phoneNo: ownerData.phoneNo,
        },
        getAuthHeaders()
      );
      setMessage(res.data.message);
      setError("");
      setEditMode(false);
      fetchOwnerProfile();
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE}/api/v1/rooms/${roomId}`, getAuthHeaders());
      setOwnerData((prevData) => ({
        ...prevData,
        rooms: prevData.rooms.filter((room) => room._id !== roomId),
      }));
      setMessage("Room deleted successfully!");
    } catch (error) {
      console.error("Failed to delete room:", error);
      setError("Failed to delete room.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE}/api/v1/owner/logout`, {}, getAuthHeaders());
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to log out.");
    }
  };

  if (!ownerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6 relative">

        {/* Top Right Actions: Notifications and Logout */}
        <div className="absolute right-0 top-0 flex items-center space-x-4 pr-4">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setUnreadCount(0);
            }}
            className="relative p-3 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200"
            aria-label="Notifications"
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-16 mt-3 w-80 bg-white shadow-xl rounded-lg z-20 max-h-96 overflow-y-auto border border-gray-200">
              <div className="p-4 font-semibold text-gray-700 flex justify-between items-center border-b border-gray-100">
                <span>Notifications</span>
                <button
                  className={`text-xs text-indigo-600 hover:underline ${isClearing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isClearing}
                  onClick={async () => {
                    setIsClearing(true);
                    try {
                      await axios.delete("/api/v1/owner/notifications/clear", {
                        withCredentials: true,
                      });
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
                notifications.map((note, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (note._id) {
                        navigate(`/notifications/${note._id}`);
                      }
                      setShowNotifications(false);
                    }}
                  >
                    <p className="text-sm text-gray-700">{note.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400">No notifications yet.</div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 flex items-center space-x-2"
          >
            <FaSignOutAlt className="w-4 h-4" /> Log Out
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-10 pt-16">
          <h2 className="text-4xl font-bold text-indigo-700 mb-2">Owner Profile</h2>
          <p className="text-gray-600">Manage your property listings and profile information.</p>
        </div>

        {/* Alert Messages - This is where the magic happens */}
        {(message || error) && (
          <div className={`mb-6 p-4 rounded-lg font-medium ${message ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} transition-opacity duration-500 ease-out opacity-100`}>
            {message || error}
          </div>
        )}


        {/* Owner Info (Display/Edit) */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="fullName"
                    value={ownerData.fullName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-base text-gray-900 px-4 py-2 bg-gray-50 rounded-md border border-gray-200 flex items-center space-x-2">
                    <FaUser className="text-gray-500" /> <span>{ownerData.fullName || 'N/A'}</span>
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={ownerData.username}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-base text-gray-900 px-4 py-2 bg-gray-50 rounded-md border border-gray-200 flex items-center space-x-2">
                    <FaUser className="text-gray-500" /> <span>{ownerData.username || 'N/A'}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <p className="text-base text-gray-900 px-4 py-2 bg-gray-50 rounded-md border border-gray-200 flex items-center space-x-2">
                  <FaEnvelope className="text-gray-500" /> <span>{ownerData.email || 'N/A'}</span>
                </p>
              </div>

              {/* Phone No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phoneNo"
                    value={ownerData.phoneNo}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-base text-gray-900 px-4 py-2 bg-gray-50 rounded-md border border-gray-200 flex items-center space-x-2">
                    <FaPhoneAlt className="text-gray-500" /> <span>{ownerData.phoneNo || 'N/A'}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons for Owner Info */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  setEditMode(!editMode);
                  if (editMode) {
                    fetchOwnerProfile();
                  }
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-200"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>

              {editMode && (
                <button
                  onClick={handleUpdateOwnerDetails}
                  className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mb-6 flex items-center justify-between pt-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
            <FaHome className="text-indigo-600 text-2xl" /> <span>Listed Properties</span>
          </h3>
          <Link
            to="/add-room"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition duration-200 text-base font-semibold shadow-md"
          >
            <FaPlus className="w-4 h-4" /> <span>Add New Room</span>
          </Link>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerData.rooms.length > 0 ? (
            ownerData.rooms.map((room) => (
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

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/edit-room/${room._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-2 text-indigo-600 text-sm font-medium hover:underline hover:text-indigo-700 transition duration-200"
                  >
                    <FaEdit /> <span>Edit Details</span>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room._id);
                    }}
                    className="inline-flex items-center space-x-2 text-red-500 hover:text-red-600 text-sm font-medium transition duration-200"
                  >
                    <FaTrash /> <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              <FaHome className="mx-auto mb-4 text-gray-300 text-6xl" />
              <p className="text-lg italic">No rooms listed yet. Click "Add New Room" to get started!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerProfile;
