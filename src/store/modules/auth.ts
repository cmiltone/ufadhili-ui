import { Module } from "vuex";

import { setAuth, clearAuth } from "@/utils/auth";
import { api } from "@/utils/axios";

type AuthState = {
  user: User | undefined;
  redirectUrl: string;
};

const auth: Module<AuthState, unknown> = {
  state: {
    user: localStorage.getItem("user") != null ? JSON.parse(localStorage.getItem("user") ?? "") : undefined,
    redirectUrl: "",
  },
  getters: {
    user: (state) => state.user,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
  },
  actions: {
    async login(context, { url, data }) {
      return await api
        .post("/v1/auth/login", data)
        .then((response) => {
          if (response.status == 200) {
            const { token, user } = response.data;
            setAuth({ user, token, url: url || "/" });
          }
          return response.data.user;
        })
        .catch((error) => {
          context.dispatch("setToast", {
            title: "Login failed!",
            type: "error",
            text: error.response?.data?.error?.message,
          });
        });
    },
    setRedirectUrl(context, url) {
      context.commit("SET_REDIRECT_URL", url);
    },
    updateUserProfile(context, data) {
      api
        .put(`/v1/user/${context.state.user?._id}`, data)
        .then((response) => {
          context.commit("SET_USER", response.data.user);
          context.dispatch("setToast", {
            title: "Success",
            type: "success",
            text: "Profile updated",
          });
        })
        .catch((error) => {
          context.dispatch("setToast", {
            title: "Updating profile failed!",
            type: "error",
            text: error.response?.data?.error?.message,
          });
        });
    },
    logout(context, payload: { to: string; redirect: boolean }) {
      clearAuth(payload.to, payload.redirect);
    },
    async register(context, { url, data }) {
      return await api
        .post("/v1/auth/register", data)
        .then((response) => {
          if (response.status == 201) {
            const { token, user } = response.data;
            setAuth({ user, token, url: url || "/" });
          }
          return response.data.user;
        })
        .catch((error) => {
          context.dispatch("setToast", {
            title: "Login failed!",
            type: "error",
            text: error.response?.data?.error?.message,
          });
        });
    },
  },
};

export default auth;
