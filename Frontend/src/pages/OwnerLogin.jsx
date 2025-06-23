import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import loginImage from "../assets/home.png"; // Image
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Importing the eye icons
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE = import.meta.env.VITE_API_BASE_URL;

const OwnerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        password: formData.password,
      };

      // Determine whether user entered email or username
      if (formData.identifier.includes("@")) {
        payload.email = formData.identifier;
      } else {
        payload.username = formData.identifier;
      }

      const response = await axios.post(`${BASE}/api/v1/owner/login`, payload);

      if (response.status === 200) {
        const { accessToken, user } = response.data.data;

        localStorage.setItem("ownertoken", accessToken);
        localStorage.setItem("owner", JSON.stringify(user));

        toast.success("Owner login successful!");
        navigate("/owner-profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed! Try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Left Image Section */}
      <div className="hidden md:flex w-1/2 h-full">
        <img
          src={loginImage}
          alt="Login"
          className="w-full h-full object-contain rounded-r-2xl"
        />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-[#7472E0] mb-6">
            Owner Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7472E0]"
              type="text"
              name="identifier"
              placeholder="Username or Email"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <input
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7472E0]"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => !formData.password && setPasswordFocused(false)}
                required
              />
              {(passwordFocused || formData.password) && (
                <div
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#7472E0] text-white font-semibold rounded-xl hover:bg-[#5e5ccd] transition"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <Link
              to="/owner-register"
              className="text-[#7472E0] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default OwnerLogin;
