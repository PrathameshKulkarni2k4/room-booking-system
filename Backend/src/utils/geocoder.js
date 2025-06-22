import NodeGeocoder from "node-geocoder";

const options = {
  provider: "openstreetmap",
};

const geocoder = NodeGeocoder(options);
export { geocoder };