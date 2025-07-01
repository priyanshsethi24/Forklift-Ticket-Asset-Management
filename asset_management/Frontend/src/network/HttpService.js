import axios from "axios";
import { getData } from "../utils/localStorageHandler";
// import { baseURL } from './baseUrl'

// Creating axios instance
const http = axios.create({
  // baseURL: baseURL,
  // headers: {
  //     "Content-Type": "application/json"
  // }
});

http.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
http.defaults.headers.common["Content-Type"] = "application/json";

// Optionally add token dynamically if needed
const attachAuthToken = (config) => {
  const token = getData("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Request Interceptor
http.interceptors.request.use(
  (config) => {
    if (config.withAuth) {
      attachAuthToken(config);
    }
    if (config.formData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default http;

