import React, { useState, useEffect } from "react";
import { HiMenu, HiX, HiUserCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("usertoken") || !!localStorage.getItem("ownertoken"));

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = (localStorage.getItem("usertoken") || localStorage.getItem("ownertoken"));
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    const interval = setInterval(checkLoginStatus, 1000);
    const handleStorageChange = () => checkLoginStatus();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleProfileNavigation = () => {
    if (localStorage.getItem("ownertoken")) {
      navigate("/owner-profile");
    } else if (localStorage.getItem("usertoken")) {
      navigate("/user-profile");
    }
  };

  return (
    <nav className="backdrop-blur-md bg-white/70 shadow-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-800">
        <h1
          className="text-2xl md:text-3xl font-extrabold tracking-wide text-[#7472E0] cursor-pointer"
          onClick={() => {
            if (localStorage.getItem("ownertoken")) {
              navigate("/owner-profile");
            } else if (localStorage.getItem("usertoken")) {
              navigate("/rooms");
            } else {
              navigate("/");
            }
          }}
        >
          ROOM<span className="text-yellow-400">BUDDY</span>
        </h1>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6 text-sm md:text-base font-medium">
          {isLoggedIn ? (
            <li>
              <button
                onClick={handleProfileNavigation}
                className="px-5 py-2 rounded-full bg-[#7472E0] text-white hover:brightness-110 shadow-md transition flex items-center gap-2"
              >
                <HiUserCircle className="text-xl" /> Profile
              </button>
            </li>
          ) : (
            <>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className="hover:text-[#7472E0] transition"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/about")}
                  className="hover:text-[#7472E0] transition"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/user-login")}
                  className="px-5 py-2 rounded-full bg-[#7472E0] text-white hover:brightness-110 shadow-md transition"
                >
                  User LogIn
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/owner-login")}
                  className="px-5 py-2 rounded-full border border-[#7472E0] text-[#7472E0] hover:bg-[#7472E0] hover:text-white transition shadow-md"
                >
                  Owner LogIn
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden gap-3">
          {isLoggedIn ? (
            <button
              onClick={handleProfileNavigation}
              className="px-5 py-2 rounded-full bg-[#7472E0] text-white hover:brightness-110 shadow-md transition flex items-center gap-2"
            >
              <HiUserCircle className="text-lg" /> Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/user-login")}
                className="text-[#7472E0] font-semibold text-sm"
              >
                User LogIn
              </button>
              <button
                onClick={() => navigate("/owner-login")}
                className="text-[#7472E0] font-semibold text-sm border px-3 py-1 rounded-full border-[#7472E0]"
              >
                Owner LogIn
              </button>
              {/* Only show hamburger when not logged in */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-3xl text-[#7472E0] z-50"
              >
                {menuOpen ? <HiX /> : <HiMenu />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu (Only if not logged in) */}
      {!isLoggedIn && menuOpen && (
        <>
          <div className="fixed top-0 right-0  w-64 bg-white shadow-lg z-[-10] mt-16 p-6 flex flex-col gap-4 text-sm font-medium text-gray-800">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/contact");
              }}
              className="hover:text-[#7472E0] text-left p-2"
            >
              Contact Us
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/about");
              }}
              className="hover:text-[#7472E0] text-left p-2"
            >
              About
            </button>
          </div>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            onClick={() => setMenuOpen(false)}
          ></div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
