import React, { useEffect, useState } from 'react';
import loaderGif from '../assets/loadertest.gif';

const RoomFinderLoader = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000); // Show for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <img src={loaderGif} alt="Loading..." className="w-46 h-46" />
    </div>
  );
};

export default RoomFinderLoader;
