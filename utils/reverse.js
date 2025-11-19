// utils/reverseGeocode.js
// Centralized reverse geocoding logic
// Uses OpenCage Data API as an example; you can swap providers if needed

const REVERSE_GEOCODE_API_KEY = "9dc40444099a4267b071fee1b2b3a3aa"; // Replace with your key

export const reverseGeocode = async (latitude, longitude) => {
  if (!latitude || !longitude) return { city: "Unknown", country: "Unknown" };

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${REVERSE_GEOCODE_API_KEY}`
    );
    const data = await response.json();
    const place = data.results[0]?.components;

    const city =
      place?.city || place?.town || place?.village || place?.state || "Unknown";
    const country = place?.country || "Unknown";

    return { city, country };
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return { city: "Unknown", country: "Unknown" };
  }
};
