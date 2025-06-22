import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"
import axios from "axios";

const Notification = () => {
  const { notificationId } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotification = async () => {
    try {
      const res = await axios.get(`/api/v1/owner/notifications/${notificationId}`, {
        withCredentials: true,
      });
      setNotification(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notification.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, [notificationId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!notification) return <p>No notification found.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-2">📢 Notification Details</h2>
      <p className="text-gray-700 mb-4">{notification.message}</p>

      <div className="text-sm text-gray-600 mb-2">
        <strong>Type:</strong> {notification.type}
      </div>

      {notification.room && (
        <div className="text-sm text-gray-600">
          <strong>Room ID:</strong> {notification.room._id}
        </div>
      )}
      {notification.booking && (
        <div className="text-sm text-gray-600">
          <strong>Booking ID:</strong> {notification.booking._id}
        </div>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <strong>Created:</strong>{" "}
        {new Date(notification.createdAt).toLocaleString()}
      </div>

      {notification.type === "booking" && notification.booking && (
        <div className="mt-4 flex gap-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={async () => {
              try {
                await axios.patch(
                  `/api/v1/booking/${notification.booking._id}`,
                  {
                    status: "approved",
                    notificationId: notification._id,
                  },
                  { withCredentials: true }
                );
                toast.success("Booking approved and user notified.");
                navigate(-1);
              } catch (err) {
                toast.error("Failed to approve booking.");
                console.error(err);
              }
            }}
          >
            ✅ Approve
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={async () => {
              try {
                await axios.patch(
                  `/api/v1/booking/${notification.booking._id}`,
                  {
                    status: "rejected",
                    notificationId: notification._id,
                  },
                  { withCredentials: true }
                );
                toast.success("Booking rejected and user notified.");
                navigate(-1);
              } catch (err) {
                toast.error("Failed to reject booking.");
                console.error(err);
              }
            }}
          >
            ❌ Reject
          </button>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ⬅ Go Back
      </button>
    </div>
  );
};

export default Notification;
