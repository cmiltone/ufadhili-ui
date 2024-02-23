import { createStore } from "vuex";

import modules from "./modules";


type Toast = {
  title: string;
  type: string;
  text: string;
  show: boolean;
  timeout: number;
};

const initToast = (): Toast => {
  return {
    title: "",
    type: "",
    text: "",
    show: false,
    timeout: 1500,
  };
};

export default createStore({
  state: () => ({
    toast: initToast(),
    loadingRequest: false,
  }),
  getters: {
    toast: (state) => state.toast,
    loadingRequest: (state) => state.loadingRequest,
  },
  mutations: {
    SET_TOAST(state, toast) {
      // show toast
      state.toast.show = true;
      state.toast.title = toast.title;
      state.toast.text = toast.text;
      state.toast.type = toast.type;
      state.toast.timeout = toast.timeout || 1500;
    },
    HIDE_TOAST(state) {
      state.toast.show = false;
      state.toast = initToast();
    },
    SET_LOADING_REQUEST(state, loading) {
      state.loadingRequest = loading;
    },
  },
  actions: {
    setToast: (context, toast) => {
      context.commit("SET_TOAST", toast);
    },
    hideToast: (context) => {
      context.commit("HIDE_TOAST");
    },
    setLoadingRequest: (context, loading) => {
      context.commit("SET_LOADING_REQUEST", loading);
    },
  },
  modules,
});
