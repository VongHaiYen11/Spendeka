const API_BASE_URL =
  // For Expo Go on a real device, set EXPO_PUBLIC_API_BASE_URL to
  // "http://<YOUR_LAN_IP>:4000" (e.g. "http://192.168.1.23:4000") so the
  // phone can reach your local Node/Express server.
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

export { API_BASE_URL };

