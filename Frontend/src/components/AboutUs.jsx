import React from "react";
import { FaUsers, FaHome, FaHeart, FaUserCircle } from "react-icons/fa";

const AboutUs = () => {
  const cofoundersAndDevelopers = [
    { name: "Prathamesh Kulkarni", role: "Co-founder & Developer" },
    { name: "Akash Kumbhar", role: "Co-founder & Developer" },
    { name: "Rugved Kumbhar", role: "Co-founder & Developer" },
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Connecting You to Your Perfect Room Buddy
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          At Room Buddy, we believe that finding the right roommate can
          transform your living experience. We're passionate about creating a
          platform that makes this process easy, safe, and even enjoyable.
        </p>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {[
            {
              icon: <FaUsers size={28} />,
              title: "Our Community",
              desc: "We foster a vibrant community of individuals seeking compatible roommates. Our platform empowers you to connect with others who share your lifestyle and preferences.",
            },
            {
              icon: <FaHome size={28} />,
              title: "Simple & Secure",
              desc: "Our intuitive interface makes it easy to browse profiles, send messages, and find potential roommates. We prioritize your safety with secure communication and verification processes.",
            },
            {
              icon: <FaHeart size={28} />,
              title: "Built with Care",
              desc: "Room Buddy is built with you in mind. We're constantly working to improve our platform and provide you with the best possible experience in your roommate search.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-[#7472E0] text-white flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-[#F9F9FF] rounded-xl p-8 mb-16 shadow-inner max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h3>
          <p className="text-lg text-gray-600">
            Our mission is to simplify the process of finding compatible
            roommates, fostering positive living environments, and building
            lasting connections. We believe that everyone deserves a comfortable
            and harmonious home.
          </p>
        </div>

        {/* Team Members */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Meet the Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {cofoundersAndDevelopers.map((member, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition"
              >
                <div className="w-20 h-20 rounded-full bg-[#A89BFF] text-white flex items-center justify-center mb-4">
                  <FaUserCircle size={40} />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-1">
                  {member.name}
                </h4>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
