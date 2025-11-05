import axios from "axios";

//API DIISI SESUAI IP DI KOMPUTER

//WIFI Modem
// const API_URL = "http://10.1.51.114:5255/";

//WIFI Astra
//export const API_URL = "http://172.20.10.4:5255/";

// WIFI Zidan
//export const API_URL = "http://10.127.212.240:5255/";

export const API_URL = "https://sia-pt.polytechnic.astra.ac.id/stn-air/";

// Wifi Daffa
//export const API_URL = "http://192.168.1.16:5255/";

// Wifi Irham
//export const API_URL = "http://192.168.1.16:5255/";

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
    console.log("🔍 API Request to:", `api/${param}`, "with body:", body);
    const response = await apiClient.post(`api/${param}`, body);
    console.log("✅ API success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API call failed:", error.message);
    console.error("Code:", error.code);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    throw error;
  }
};

export const postUserArray = async (param, body = {}) => {
  try {
    const response = await apiClient.post(`api/${param}`, body);
    let data = response.data;

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
        console.log("✅ API success:", data);
      } catch (parseError) {
        console.error("Error parsing data:", parseError);
        return "ERROR";
      }
    }

    if (data === null || data === undefined) {
      return [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === "object") {
      return [data];
    }

    console.error("❌ API response is not an array:", data);
    return "ERROR";
  } catch (error) {
    console.error("❌ API call failed:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    return "ERROR";
  }
};
