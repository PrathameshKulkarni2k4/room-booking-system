import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaDiscord,
  FaPinterest,
} from "react-icons/fa";
import { SiX } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-5 gap-10 text-sm">
        {/* Services */}
        <div>
          <h4 className="text-white font-semibold mb-4">SERVICES</h4>
          <ul className="space-y-2">
            <li><a href="#">Find Rooms</a></li>
            <li><a href="#">Post Your Room</a></li>
            <li><a href="#">Roommate Finder</a></li>
            <li><a href="#">Verified Listings</a></li>
            <li><a href="#">Mobile App</a></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-white font-semibold mb-4">INFORMATION</h4>
          <ul className="space-y-2">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Guidelines</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">LEGAL</h4>
          <ul className="space-y-2">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">License Agreement</a></li>
            <li><a href="#">Report a Listing</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">SUPPORT</h4>
          <ul className="space-y-2">
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Live Chat</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white font-semibold mb-4">SOCIAL MEDIA</h4>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="bg-white text-blue-600 p-2 rounded-full">
              <FaFacebookF />
            </a>
            <a href="#" className="bg-white text-black p-2 rounded-full">
              <SiX />
            </a>
            <a href="#" className="bg-white text-pink-600 p-2 rounded-full">
              <FaInstagram />
            </a>
            <a href="#" className="bg-white text-red-600 p-2 rounded-full">
              <FaPinterest />
            </a>
            <a href="#" className="bg-white text-blue-800 p-2 rounded-full">
              <FaLinkedinIn />
            </a>
            <a href="#" className="bg-white text-red-700 p-2 rounded-full">
              <FaYoutube />
            </a>
            <a href="#" className="bg-white text-indigo-500 p-2 rounded-full">
              <FaDiscord />
            </a>
          </div>
          
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">RoomBuddy</h1>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Room Finder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
