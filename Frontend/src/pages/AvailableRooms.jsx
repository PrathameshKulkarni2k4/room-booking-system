// ✅ FIXED CODE FOR FILTERS IN NEARBY ROOMS

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaStar, FaWifi, FaShower, FaUtensils,
  FaTv, FaCar, FaBed, FaChair,
} from "react-icons/fa";
import RoomFinderLoader from "../components/RoomFinderLoader";

const BASE = import.meta.env.VITE_API_BASE_URL;

const facilityIcons = {
  "Wi-Fi": <FaWifi title="Wi-Fi" />, "Hot Water": <FaShower title="Hot Water" />, "Kitchen": <FaUtensils title="Kitchen" />,
  "Parking": <FaCar title="Parking" />, "Attach Bathroom": <FaShower title="Attach Bathroom" />, "Balcony": <FaTv title="Balcony" />,
  "Bed": <FaBed title="Bed" />, "Chair": <FaChair title="Chair" />, "Desk": <FaChair title="Desk" />, "Wardrobe": <FaChair title="Wardrobe" />
};
const allFacilities = Object.keys(facilityIcons);

const AvailableRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [nearbyRooms, setNearbyRooms] = useState([]);
  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [tempMinPrice, setTempMinPrice] = useState(1000);
  const [tempMaxPrice, setTempMaxPrice] = useState(10000);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [tempSelectedFacilities, setTempSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNearbyRooms, setShowNearbyRooms] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {
        minPrice,
        maxPrice,
        ...(selectedFacilities.length && { facilities: selectedFacilities.join(",") })
      };
      const response = await axios.get(`${BASE}/api/v1/rooms/available`, { params });
      setRooms(response.data.data || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyRooms = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your device.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const params = {
            latitude,
            longitude,
            radius: 5000,
            minPrice,
            maxPrice,
            ...(selectedFacilities.length && { facilities: selectedFacilities.join(",") })
          };
          const response = await axios.get(`${BASE}/api/v1/rooms/nearby`, { params });
          setNearbyRooms(response.data.data || []);
        } catch (err) {
          console.error("Error fetching nearby rooms:", err);
          setError("Failed to load nearby rooms.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Location access denied. Please allow it and try again.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    showNearbyRooms ? fetchNearbyRooms() : fetchRooms();
  }, [minPrice, maxPrice, selectedFacilities, showNearbyRooms]);

  const handleMinPriceChange = (e) => {
    setTempMinPrice(Math.min(Number(e.target.value), maxPrice));
  };

  const handleMaxPriceChange = (e) => {
    setTempMaxPrice(Math.max(Number(e.target.value), minPrice));
  };

  const handleFacilityChange = (facility) => {
    setTempSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleRoomClick = (id) => {
    navigate(`/rooms/${id}`);
  };

  const applyFilters = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setSelectedFacilities(tempSelectedFacilities);
  };

  const resetFilters = () => {
    const defaultMin = 1000, defaultMax = 10000;
    setTempMinPrice(defaultMin);
    setTempMaxPrice(defaultMax);
    setTempSelectedFacilities([]);
    setMinPrice(defaultMin);
    setMaxPrice(defaultMax);
    setSelectedFacilities([]);
  };

  return (
    <div className="px-4 py-10 bg-gray-50 min-h-screen">
      {loading ? (
        <RoomFinderLoader />
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10 max-w-8xl mx-auto px-4 lg:px-14">
          {/* Filter Panel */}
          <div className="w-full lg:w-[260px] bg-white rounded-xl shadow p-5 shrink-0 h-fit">
            <h3 className="text-xl font-semibold text-[#7472E0] mb-4">Filters</h3>

            {/* Price Sliders */}
            {["Min", "Max"].map((type, i) => (
              <div className="mb-4" key={type}>
                <label className="block font-medium text-gray-700 mb-1">{type} Price</label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={i === 0 ? tempMinPrice : tempMaxPrice}
                  onChange={i === 0 ? handleMinPriceChange : handleMaxPriceChange}
                  className="w-full accent-[#7472E0]"
                />
                <span className="block text-[#7472E0] font-semibold mt-1">
                  Rs. {i === 0 ? tempMinPrice : tempMaxPrice}
                </span>
              </div>
            ))}

            {/* Facilities */}
            <div className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">Facilities</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {allFacilities.map((facility) => (
                  <label key={facility} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tempSelectedFacilities.includes(facility)}
                      onChange={() => handleFacilityChange(facility)}
                      className="accent-[#7472E0]"
                    />
                    {facility}
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button onClick={applyFilters} className="flex-1 bg-[#7472E0] text-white py-2 px-4 rounded-lg hover:bg-[#5e5bcf] transition">Apply Filters</button>
              <button onClick={resetFilters} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">Reset</button>
            </div>

            {/* Toggle Nearby */}
            <div className="mt-6">
              <button
                onClick={() => setShowNearbyRooms(!showNearbyRooms)}
                className={`w-full ${showNearbyRooms ? "bg-gray-400" : "bg-[#7472E0]"} text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition`}
              >
                {showNearbyRooms ? "Back to All Rooms" : "Show Nearby Rooms"}
              </button>
            </div>
          </div>

          {/* Room Results */}
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold text-[#7472E0] mb-6 text-center">
              {showNearbyRooms ? "Nearby Rooms" : "Available Rooms"}
            </h2>

            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {(showNearbyRooms ? nearbyRooms : rooms).map((room) => (
                <div
                  key={room._id}
                  className="bg-white shadow rounded-2xl overflow-hidden relative cursor-pointer transition hover:scale-[1.01]"
                  onClick={() => handleRoomClick(room._id)}
                >
                  <img src={room.images?.[0] || "/default-room.jpg"} alt={room.name} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                    <div className="flex items-center text-sm text-[#7472E0] mb-2">
                      <FaMapMarkerAlt className="mr-1" /> {room.address}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[#7472E0] mb-3">
                      {room.facilities?.map((f) => (
                        <div key={f} title={f}>{facilityIcons[f] || <span>{f}</span>}</div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-bold text-[#7472E0]">Rs. {room.price} <span className="text-sm text-gray-500">/month</span></span>
                      <span className="flex items-center gap-1 text-sm text-yellow-500"><FaStar />{room.rating || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {(showNearbyRooms ? nearbyRooms : rooms).length === 0 && (
              <p className="text-center text-gray-500 mt-10">No rooms found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRooms;
