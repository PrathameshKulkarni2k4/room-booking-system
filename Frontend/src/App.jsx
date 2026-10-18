import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";

import Home from "./pages/Home";
import Login from "./pages/Login";
import OwnerLogin from "./pages/OwnerLogin";
import AvailableRooms from "./pages/AvailableRooms";
import RoomDetails from "./pages/RoomDetails";
import UserProfile from "./pages/UserProfile";
import AddRoom from "./pages/AddRoom";
import EditRoom from "./pages/EditRoom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import PrivateRoute from "./pages/PrivateRoute";
import Signup from "./pages/Signup";
import OwnerProfile from "./pages/OwnerProfile";
import OwnerSignup from "./pages/OwnerSignup";
import Notification from "./pages/Notification";

// Import your SocketProvider
import { SocketProvider } from "./context";
import RoomFinderLoader from "./components/RoomFinderLoader";

const App = () => {
  return (
    <SocketProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/l" element={<RoomFinderLoader />} />
          <Route path="/user-login" element={<Login />} />
          <Route path="/user-register" element={<Signup />} />
          <Route path="/owner-login" element={<OwnerLogin />} />
          <Route path="/owner-register" element={<OwnerSignup />} />

          {/* Public Routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />

          {/* Protected Routes — seeker (user) */}
          <Route
            path="/rooms"
            element={
              <PrivateRoute role="user">
                <AvailableRooms />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <PrivateRoute role="user">
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* Protected Routes — owner */}
          <Route
            path="/owner-profile"
            element={
              <PrivateRoute role="owner">
                <OwnerProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-room"
            element={
              <PrivateRoute role="owner">
                <AddRoom />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-room/:roomId"
            element={
              <PrivateRoute role="owner">
                <EditRoom />
              </PrivateRoute>
            }
          />

          {/* Protected Routes — any signed-in account */}
          <Route
            path="/notifications/:notificationId"
            element={
              <PrivateRoute>
                <Notification />
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </SocketProvider>
  );
};

export default App;
