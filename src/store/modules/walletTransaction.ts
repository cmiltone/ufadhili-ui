import { Module } from "vuex";

import { api } from "@/utils/axios";

type WalletTransactionState = {
  walletTransactionPage: Page<WalletTransaction>;
};

export const walletTransactionToJSON = (walletTransaction?: WalletTransaction): WalletTransaction => ({
  _id: walletTransaction?._id ?? '',
  user: walletTransaction?.user ?? '',
  amount: walletTransaction?.amount ?? 0,
  currency: walletTransaction?.currency ?? 'KES',
  walletBalance: walletTransaction?.walletBalance ?? 0,
  type: walletTransaction?.type ?? 'payin',
  createdAt: walletTransaction?.createdAt as Date,
  updatedAt: walletTransaction?.updatedAt as Date,
})

const walletTransaction: Module<WalletTransactionState, unknown> = {
  namespaced: true,
  state: () => ({
    walletTransactionPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    walletTransactionCount: 0,
  }),
  getters: {
    getWalletTransaction: (state) => (walletTransactionId: string) =>
      state.walletTransactionPage.docs.find((c) => c._id === walletTransactionId),
    walletTransactionPage: (state) => state.walletTransactionPage,
  },
  mutations: {
    ADD_WALLET_TRANSACTION: (state, _walletTransaction) => {
      let idx = -1;
      state.walletTransactionPage.docs.map((a, i) => {
        if (a._id === _walletTransaction._id) idx = i;
      });
      if (idx === -1) state.walletTransactionPage.docs.push(_walletTransaction);
      else state.walletTransactionPage.docs[idx] = _walletTransaction;
    },
    SET_WALLET_TRANSACTION_PAGE: (state, page) => {
      // list.docs = list.docs.map((c: WalletTransaction) => walletTransactionToJSON(c));
      state.walletTransactionPage = page;
    },
    REMOVE_WALLET_TRANSACTION(state, _walletTransaction) {
      let idx = -1;
      state.walletTransactionPage.docs.map((a, i) => {
        if (a._id === _walletTransaction._id) idx = i;
      });
      if (idx > -1) state.walletTransactionPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async fetchWalletTransaction(context, params = "") {
      return await api
        .get(`/v1/wallet-transaction${params}`)
        .then((response) => {
          context.commit("ADD_WALLET_TRANSACTION", response.data.walletTransaction);
          return response.data.walletTransaction;
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
    async fetchWalletTransactionList(context, params = "") {
      return await api
        .get(`/v1/wallet-transaction${params}`)
        .then((response) => {
          context.commit("SET_WALLET_TRANSACTION_PAGE", response.data.walletTransactionPage);
          return response.data.walletTransactionPage;
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

export default walletTransaction;
