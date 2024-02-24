import { Module } from "vuex";

import { api } from "@/utils/axios";

type TransactionState = {
  transactionPage: Page<AppTransaction>;
};

const transaction: Module<TransactionState, unknown> = {
  namespaced: true,
  state: () => ({
    transactionPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    transactionCount: 0,
  }),
  getters: {
    getTransaction: (state) => (transactionId: string) =>
      state.transactionPage.docs.find((c) => c._id === transactionId),
    transactionPage: (state) => state.transactionPage,
  },
  mutations: {
    ADD_WALLET_TRANSACTION: (state, _transaction) => {
      let idx = -1;
      state.transactionPage.docs.map((a, i) => {
        if (a._id === _transaction._id) idx = i;
      });
      if (idx === -1) state.transactionPage.docs.push(_transaction);
      else state.transactionPage.docs[idx] = _transaction;
    },
    SET_WALLET_TRANSACTION_PAGE: (state, page) => {
      state.transactionPage = page;
    },
    REMOVE_WALLET_TRANSACTION(state, _transaction) {
      let idx = -1;
      state.transactionPage.docs.map((a, i) => {
        if (a._id === _transaction._id) idx = i;
      });
      if (idx > -1) state.transactionPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async fetchTransaction(context, params = "") {
      return await api
        .get(`/v1/transaction${params}`)
        .then((response) => {
          context.commit("ADD_WALLET_TRANSACTION", response.data.transaction);
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
    async fetchTransactionList(context, params = "") {
      return await api
        .get(`/v1/transaction${params}`)
        .then((response) => {
          context.commit("SET_WALLET_TRANSACTION_PAGE", response.data.transactionPage);
          return response.data.transactionPage;
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

export default transaction;
