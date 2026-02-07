/** Deployed Spendeka API – no need to run server locally. */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://spendeka-backend-2.onrender.com";

export { API_BASE_URL };

