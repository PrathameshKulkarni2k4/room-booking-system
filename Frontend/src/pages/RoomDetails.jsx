import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketContext } from "../context/SocketContext.jsx";
import {
  FaMapMarkerAlt,
  FaUserCircle,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaPhoneAlt,
} from "react-icons/fa";

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({ comment: "", rating: 5 });
  const socket = useContext(SocketContext);

  const usertoken = localStorage.getItem("usertoken");
  const isOwner = !!localStorage.getItem("ownertoken");

  useEffect(() => {
    fetchRoomDetails();
    checkBookingStatus();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      const res = await axios.get(`/api/v1/rooms/${id}`);
      setRoom(res.data.data);
    } catch (error) {
      console.error("Error fetching room data", error);
      toast.error("Failed to load room details.");
    } finally {
      setLoading(false);
    }
  };

  const checkBookingStatus = async () => {
    if (!usertoken || isOwner) return;
    try {
      const res = await axios.get(`/api/v1/booking/user-booking/${id}`, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      });
      setHasBooked(res.data.data.booked);
    } catch (error) {
      setHasBooked(false);
    }
  };

  const renderFacility = (label, isAvailable) => (
    <div className="flex items-center gap-2 text-gray-700">
      {isAvailable ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-red-400" />
      )}
      <span>{label}</span>
    </div>
  );

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      if (!usertoken) {
        toast.error("You must be logged in to book a room.");
        return;
      }

      const res = await axios.post(
        `/api/v1/booking/create-booking/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success("Room booked successfully!");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book room.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleUnbook = async () => {
    try {
      const res = await axios.delete(`/api/v1/booking/unbook/${id}`, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      });

      if (res.status === 200) {
        toast.success("Room unbooked successfully!");
        setHasBooked(false);
      }
    } catch (error) {
      console.error("Unbooking error:", error);
      toast.error("Failed to unbook room.");
    }
  };

  const submitFeedback = async () => {
    try {
      await axios.post(
        `/api/v1/rooms/${id}/feedback`,
        feedback,
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );
      toast.success("Feedback submitted!");
      setShowFeedbackForm(false);
      fetchRoomDetails();
    } catch (error) {
      toast.error("Failed to submit feedback.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!room)
    return <div className="p-8 text-center text-gray-700">Room not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-[#7472E0] mb-4">{room.name}</h2>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="rounded-lg overflow-hidden mb-6 shadow-lg"
      >
        {room.images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`Room image ${index + 1}`}
              className="w-full h-[400px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <p className="text-gray-600 text-lg mb-4">Price: ₹{room.price}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-[#7472E0] mb-2">Address</h3>
          <p className="flex items-center gap-2 text-gray-700">
            <FaMapMarkerAlt className="text-[#7472E0]" />
            {room.address}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-[#7472E0] mb-2">
            Owner Info
          </h3>
          {room.owner ? (
            <>
              <p className="flex items-center gap-2 text-gray-700">
                <FaUserCircle className="text-[#7472E0]" />
                <strong>Name:</strong> {room.owner.fullName || room.owner.username}
              </p>
              <p className="flex items-center gap-2  text-sm text-gray-600">
                <FaPhoneAlt className="text-[#7472E0]" />
                <strong>Mobile No :</strong> {room.owner.phoneNo}
              </p>
            </>
          ) : (
            <p className="text-gray-600 italic">Owner info not available</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-[#7472E0] mb-2">
            Room Status
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${room.status === "Available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
              }`}
          >
            {room.status}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-[#7472E0] mb-2">Rating</h3>
          <p className="flex items-center text-yellow-500">
            <FaStar className="mr-2" />
            <span className="text-gray-800">{room.rating} / 5</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-[#7472E0] mb-4">
          Facilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {room.facilities.map((facility, index) =>
            renderFacility(facility, true)
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="text-center mt-8">
          {room.status === "Available" && !hasBooked && (
            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="px-6 py-3 bg-[#7472E0] hover:bg-[#5b59c7] text-white rounded-full font-semibold text-lg transition duration-300"
            >
              {bookingLoading ? "Booking..." : "Book Now"}
            </button>
          )}
          {hasBooked && (
            <button
              onClick={handleUnbook}
              className="ml-4 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-semibold text-lg transition duration-300"
            >
              Unbook
            </button>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h3 className="text-xl font-semibold text-[#7472E0] mb-4">Feedback</h3>
        {room.feedback.length ? (
          room.feedback.map((fb, idx) => (
            <div key={idx} className="border-b pb-4 mb-4">
              <p className="text-sm text-gray-600">By: {fb.user.username}</p>
              <p className="text-gray-800">{fb.comment}</p>
              <p className="text-yellow-500 flex items-center">
                <FaStar className="mr-1" />
                {fb.rating} / 5
              </p>
              <p className="text-xs text-gray-500">
                {new Date(fb.date).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 italic">No feedback yet</p>
        )}

        {!isOwner && usertoken && hasBooked && (
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="mt-4 px-4 py-2 bg-[#7472E0] text-white rounded"
          >
            Add Feedback
          </button>
        )}

        {showFeedbackForm && (
          <div className="mt-4">
            <textarea
              className="w-full p-2 border rounded mb-2"
              placeholder="Write your feedback"
              value={feedback.comment}
              onChange={(e) =>
                setFeedback({ ...feedback, comment: e.target.value })
              }
            />
            <input
              type="number"
              max={5}
              min={1}
              value={feedback.rating}
              onChange={(e) =>
                setFeedback({ ...feedback, rating: parseInt(e.target.value) })
              }
              className="w-20 p-2 border rounded mb-2"
            />
            <button
              onClick={submitFeedback}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>


    </div>
  );
};

export default RoomDetails;
