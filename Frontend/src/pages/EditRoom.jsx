import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;

const EditRoom = () => {
  const { roomId } = useParams(); // Extract roomId from URL params
  const [status, setStatus] = useState("Available");
  const [price, setPrice] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [message, setMessage] = useState("");

  const availableFacilities = [
    "Wi-Fi", "Hot Water", "Kitchen", "Parking", "Attach Bathroom", 
    "Balcony", "Bed", "Chair", "Desk", "Wardrobe"
  ];

  // Fetch room data when component mounts
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${BASE}/api/v1/rooms/${roomId}`, {
          withCredentials: true,
        });
        const room = res.data.data;
        setStatus(room.status);
        setPrice(room.price);
        setFacilities(room.facilities);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Update Room
  const updateRoom = async () => {
    try {
      const res = await axios.patch(
        `${BASE}/api/v1/rooms/${roomId}`,
        { price, status, facilities },
        { withCredentials: true }
      );
      setMessage("Room updated successfully");
      console.log("Updated room:", res.data);
    } catch (err) {
      console.error("Error updating room:", err);
      setMessage("Failed to update room");
    }
  };

  // Handle facility change (Checkbox)
  const handleFacilityChange = (facility) => {
    setFacilities((prevFacilities) =>
      prevFacilities.includes(facility)
        ? prevFacilities.filter((f) => f !== facility)
        : [...prevFacilities, facility]
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-[#7472E0]">Edit Room</h2>

      {message && (
        <div className="mb-4 text-sm text-green-600 font-medium">{message}</div>
      )}

      {/* Status */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
        </select>
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Price (₹)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Facilities */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Facilities</label>
        <div className="grid grid-cols-2 gap-4">
          {availableFacilities.map((facility) => (
            <div key={facility} className="flex items-center">
              <input
                type="checkbox"
                id={facility}
                checked={facilities.includes(facility)}
                onChange={() => handleFacilityChange(facility)}
                className="mr-2"
              />
              <label htmlFor={facility} className="text-sm">{facility}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Update Button */}
      <button
        onClick={updateRoom}
        className="mt-4 bg-[#7472E0] text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        Update Room
      </button>
    </div>
  );
};

export default EditRoom;
