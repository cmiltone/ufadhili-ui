import { Module } from "vuex";

import { api } from "@/utils/axios";

type PaystackState = {
  banks: Bank[];
};

const paystack: Module<PaystackState, unknown> = {
  namespaced: true,
  state: () => ({
    banks: [],
  }),
  getters: {
    bankList: (state) => state.banks,
  },
  mutations: {
    SET_BANKS: (state, banks) => {
      state.banks = banks;
    },
  },
  actions: {
    async createRecipient(context, payload) {
      return await api
        .post(`/v1/paystack/recipient`, payload)
        .then((response) => {
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Recipient Created",
            },
            { root: true }
          );
          return response.data.user;
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
    async fetchTransaction(context, params = "") {
      return await api
        .get(`/v1/paystack/transaction${params}`)
        .then((response) => {
          return response.data.transaction;
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
    async fetchBankList(context, params = "") {
      return await api
        .get(`/v1/paystack/bank${params}`)
        .then((response) => {
          context.commit("SET_BANKS", response.data.banks);
          return response.data.banks;
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
    async deleteRecipient(context, userId) {
      return await api
        .delete(`/v1/paystack/recipient/${userId}`)
        .then((response) => {
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Recipient Deleted",
            },
            { root: true }
          );
          return response.data.user;
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

export default paystack;
