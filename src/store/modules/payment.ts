import { Module } from "vuex";

import { api } from "@/utils/axios";
import { campaignToJSON } from "./campaign";

type PaymentState = {
  paymentPage: Page<Payment>;
};

export const paymentToJSON = (payment?: Payment): Payment => ({
  _id: payment?._id ?? '',
  ref: payment?.ref ?? '',
  amount: payment?.amount ?? 0,
  currency: payment?.currency ?? 'KES',
  status: payment?.status ?? 'pending',
  techFee: payment?.techFee ?? 0,
  campaign: payment?.campaign ?? campaignToJSON(),
  paymentMethod: payment?.paymentMethod ?? 'card',
  createdAt: payment?.createdAt as Date,
  updatedAt: payment?.updatedAt as Date,
})

const payment: Module<PaymentState, unknown> = {
  namespaced: true,
  state: () => ({
    paymentPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    paymentCount: 0,
  }),
  getters: {
    getPayment: (state) => (paymentId: string) =>
      state.paymentPage.docs.find((c) => c._id === paymentId),
    paymentPage: (state) => state.paymentPage,
  },
  mutations: {
    ADD_PAYMENT: (state, _payment) => {
      let idx = -1;
      state.paymentPage.docs.map((a, i) => {
        if (a._id === _payment._id) idx = i;
      });
      if (idx === -1) state.paymentPage.docs.push(_payment);
      else state.paymentPage.docs[idx] = _payment;
    },
    SET_PAYMENT_PAGE: (state, page) => {
      state.paymentPage = page;
    },
    REMOVE_PAYMENT(state, _payment) {
      let idx = -1;
      state.paymentPage.docs.map((a, i) => {
        if (a._id === _payment._id) idx = i;
      });
      if (idx > -1) state.paymentPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async fetchPayment(context, params = "") {
      return await api
        .get(`/v1/payment${params}`)
        .then((response) => {
          context.commit("ADD_PAYMENT", response.data.payment);
          return response.data.payment;
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
    async fetchPaymentList(context, params = "") {
      return await api
        .get(`/v1/payment${params}`)
        .then((response) => {
          context.commit("SET_PAYMENT_PAGE", response.data.paymentPage);
          return response.data.paymentPage;
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

export default payment;
