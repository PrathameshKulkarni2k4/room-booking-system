import React, { useState } from "react";
import axios from "axios";

const AddRoom = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [createdRoom, setCreatedRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableFacilities = [
    "Wi-Fi",
    "Hot Water",
    "Kitchen",
    "Parking",
    "Attach Bathroom",
    "Balcony",
    "Bed",
    "Chair",
    "Desk",
    "Wardrobe"
  ];

  const handleFacilityChange = (e) => {
    const { value, checked } = e.target;
    setFacilities((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("price", price);
    formData.append("facilities", JSON.stringify(facilities));
    images.forEach((image) => formData.append("images", image));

    // Get token from localStorage
    const token = localStorage.getItem("ownertoken");
    console.log("this is owenr token : ",token);
    
    try {
      const response = await axios.post(
        "/api/v1/rooms/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`, // Add token to request headers
          },
        }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setCreatedRoom(response.data.data);
        setName("");
        setAddress("");
        setPrice("");
        setFacilities([]);
        setImages([]);
      } else {
        setMessage("Failed to create room.");
      }
    } catch (error) {
      console.log(error);
    
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message); // Show server error
      } else {
        setMessage("An error occurred while creating the room."); // Fallback
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Add New Room</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Room Name"
          required
          className="w-full p-2 border"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          required
          className="w-full p-2 border"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          required
          min="0"
          className="w-full p-2 border"
        />

        <div className="grid grid-cols-2 gap-2">
          {availableFacilities.map((facility) => (
            <label key={facility} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={facility}
                checked={facilities.includes(facility)}
                onChange={handleFacilityChange}
              />
              <span>{facility}</span>
            </label>
          ))}
        </div>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {createdRoom && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Created Room Details</h3>
          <p><strong>Name:</strong> {createdRoom.name}</p>
          <p><strong>Address:</strong> {createdRoom.address}</p>
          <p><strong>Price:</strong> ₹{createdRoom.price}</p>
          <p><strong>Status:</strong> {createdRoom.status}</p>
          <p><strong>Rating:</strong> {createdRoom.rating}</p>
          <p><strong>Facilities:</strong> {createdRoom.facilities.join(", ")}</p>
          <p><strong>Coordinates:</strong> [{createdRoom.location.coordinates.join(", ")}]</p>
          <div className="flex gap-4 mt-2 flex-wrap">
            {createdRoom.images.map((imgUrl, idx) => (
              <img key={idx} src={imgUrl} alt="Room" className="h-20 rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRoom;
