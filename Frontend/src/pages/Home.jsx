import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import HowItWorks from "../components/HowItWorks";
import FAQ from "../components/FAQ";
import ContactUs from "../components/ContactUs";
import heroImage from "../assets/homeroom.avif";

const Home = () => {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white py-32 px-6"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Find the perfect place at the{" "}
            <span className="text-yellow-400">best price</span>
          </h2>
          <p className="mt-4 text-lg text-gray-200">
            Explore our curated list of rooms, flats, and roommates today!
          </p>
        </div>
      </section>

      {/* Other Sections */}
      <HowItWorks />
      <FAQ />
      <ContactUs />
    </div>
  );
};

export default Home;
