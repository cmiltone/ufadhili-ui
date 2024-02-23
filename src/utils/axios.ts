import store from "@/store";
import axios from "axios";
// import swal from "sweetalert2";

import { clearAuth, getAuthToken, isAuthenticated, setAuth } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
});

api.interceptors.request.use(
  (config) => {
    if (isAuthenticated()) {
      config.headers["Authorization"] = `Bearer ${getAuthToken()}`;
    }
    store.dispatch("setLoadingRequest", true);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const token: string = response.headers["authorization"]?.split(" ")[1];

    if (token) setAuth({ token }, false);
    store.dispatch("setLoadingRequest", false);
    return response;
  },
  (err) => {
    console.log("api error: ", err.response);
    if (err.response.status === 401 && !!getAuthToken()) {
      // swal.fire("please_login_again", err.response.data.error.message, "error");
      // setTimeout(() => {
      //   clearAuth(`${location.pathname}`);
      // }, 5000);
      clearAuth(`${location.pathname}`);
    }
    store.dispatch("setLoadingRequest", false);
    return Promise.reject(err);
  }
);
