import { FaSearch, FaHome, FaCheckCircle } from "react-icons/fa";

const steps = [
  {
    icon: <FaSearch size={24} />,
    title: "Search",
    description: "Find your perfect room by location, price, or amenities",
  },
  {
    icon: <FaHome size={24} />,
    title: "Choose",
    description: "Select from our verified listings",
  },
  {
    icon: <FaCheckCircle size={24} />,
    title: "Book",
    description: "Contact owner and secure your room",
  },
];

const HowItWorks = () => {
  return (
    <div className="relative bg-white py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-14">
        How It Works
      </h2>

      {/* Flow line for desktop */}
      <div className="hidden md:block absolute top-[170px] left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-1 bg-[#7472E0]/30 z-0" />

      {/* Flow line for mobile */}
      <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 top-[160px] bottom-[160px] w-1 bg-[#7472E0]/30 z-0" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-white shadow-lg rounded-xl text-center px-6 py-10"
          >
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-[#7472E0] text-white shadow-lg">
              {step.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
