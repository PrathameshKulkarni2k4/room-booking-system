import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import signupImg from "../assets/home.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/v1/users/login", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const { accessToken, user } = response.data.data;

        localStorage.setItem("usertoken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/rooms");
        }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Left Image Side */}
      <div className="hidden md:flex w-1/2 h-full">
        <img
          src={signupImg}
          alt="Signup Visual"
          className="object-cover w-full h-full rounded-r-2xl"
        />
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-[#7472E0] mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7472E0]"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
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
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer "
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
              to="/user-register"
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

export default Login;
