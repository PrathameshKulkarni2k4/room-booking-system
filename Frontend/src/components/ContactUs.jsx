import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaClock,
  FaHeadset
} from "react-icons/fa";

const ContactUs = () => {
  return (
    <section className="py-20 px-4 bg-white w-full">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 w-full items-center justify-center">
        {/* Contact Info */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 rounded-xl shadow-lg space-y-6">
          <div className="flex items-start gap-4">
            <FaMapMarkerAlt className="text-[#7472E0] text-xl mt-1" />
            <div>
              <h3 className="font-semibold">Our Location</h3>
              <p className="text-gray-600">123 Room Finder Street, Boston, MA 02108</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaPhone className="text-[#7472E0] text-xl mt-1 transform -scale-x-100" />
            <div>
              <h3 className="font-semibold">Phone Number</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaWhatsapp className="text-[#25D366] text-xl mt-1" />
            <div>
              <h3 className="font-semibold">WhatsApp</h3>
              <p className="text-gray-600">+1 (555) 765-4321</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaEnvelope className="text-[#7472E0] text-xl mt-1" />
            <div>
              <h3 className="font-semibold">Email Address</h3>
              <p className="text-gray-600">info@roomfinder.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaClock className="text-[#7472E0] text-xl mt-1" />
            <div>
              <h3 className="font-semibold">Support Hours</h3>
              <p className="text-gray-600">Mon - Fri, 9:00 AM - 6:00 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaHeadset className="text-[#7472E0] text-xl mt-1" />
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-gray-600">Available in-app or on our Help Center</p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
              <a key={idx} href="#" className="p-2 bg-white rounded-full text-[#7472E0] shadow hover:bg-[#7472E0] hover:text-white transition">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        {/* <div className="w-full md:w-1/2 bg-gray-50 p-8 rounded-xl shadow-lg">
          <form>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#7472E0] outline-none"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#7472E0] outline-none"
              required
            />
            <input
              type="text"
              placeholder="Subject"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#7472E0] outline-none"
              required
            />
            <textarea
              placeholder="Your Message"
              className="w-full p-3 border rounded-lg mb-4 h-28 focus:ring-2 focus:ring-[#7472E0] outline-none"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-[#7472E0] text-white p-3 rounded-lg hover:bg-[#5f5dc7] transition"
            >
              Send Message
            </button>
          </form>
        </div> */}
      </div>
    </section>
  );
};

export default ContactUs;
