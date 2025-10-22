import axios from "axios";

// Ganti sesuai jaringan aktif
// const API_URL = "http://10.1.51.114:5255/"; // Modem
// const API_URL = "http://10.1.5.2:5255/"; // Astra
// const API_URL = "http://10.127.212.240:5255/"; // Zidan
export const API_URL = "https://sia-pt.polytechnic.astra.ac.id/stn-air/";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const postUser = async (param, body = {}) => {
  try {
    const url = `api/${param}`;
    console.log(`📤 Sending POST to: ${API_URL}${url}`);
    console.log("📦 Request body:", body);

    const response = await apiClient.post(url, body);

    console.log("✅ API success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API call failed:", error.message);

    if (error.response) {
      console.error("📥 Server responded with:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("📡 No response received from server");
    } else {
      console.error("⚙️ Request setup error:", error.message);
    }

    throw {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};
