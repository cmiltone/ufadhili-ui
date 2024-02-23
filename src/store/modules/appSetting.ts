import { Module } from "vuex";

import { api } from "@/utils/axios";

type AppSettingState = {
  appSetting: AppSetting | undefined;
};

const appSetting: Module<AppSettingState, unknown> = {
  namespaced: true,
  state: () => ({
    appSetting: undefined,
  }),
  getters: {
    appSetting: (state) => state.appSetting,
  },
  mutations: {
    SET_SETTING: (state, _appSetting) => {
      state.appSetting = _appSetting;
    },
  },
  actions: {
    async saveAppSetting(context, payload) {
      return await api
        .post(`/v1/app-setting`, payload)
        .then((response) => {
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Settings Saved",
            },
            { root: true }
          );
          context.commit('SET_SETTING', response.data.appSetting);
          return response.data.appSetting;
        })
        .catch((error) => {
          context.dispatch(
            "setToast",
            {
              title: "Request failed!",
              type: "error",
              text: error.response?.data?.error?.message,
            },
            { root: true }
          );
        });
    },
    async fetchAppSetting(context) {
      return await api
        .get(`/v1/app-setting`)
        .then((response) => {
          context.commit('SET_SETTING', response.data.appSetting);
          return response.data.appSetting;
        })
        .catch((error) => {
          context.dispatch(
            "setToast",
            {
              title: "Request failed!",
              type: "error",
              text: error.response?.data?.error?.message,
            },
            { root: true }
          );
        });
    },
  },
};

export default appSetting;
