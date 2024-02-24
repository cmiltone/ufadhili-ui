import { Module } from "vuex";

import { api } from "@/utils/axios";

type PayoutState = {
  payoutPage: Page<Payout>;
};

export const payoutToJSON = (payout?: Payout): Payout => ({
  _id: payout?._id ?? '',
  user: payout?.user ?? '',
  amount: payout?.amount ?? 0,
  currency: payout?.currency ?? 'KES',
  paymentMethod: payout?.paymentMethod ?? 'mobile_money',
  ref: payout?.ref ?? '',
  status: payout?.status ?? 'pending',
  createdAt: payout?.createdAt,
  updatedAt: payout?.updatedAt,
})

const payout: Module<PayoutState, unknown> = {
  namespaced: true,
  state: () => ({
    payoutPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    payoutCount: 0,
  }),
  getters: {
    getPayout: (state) => (payoutId: string) =>
      state.payoutPage.docs.find((c) => c._id === payoutId),
    payoutPage: (state) => state.payoutPage,
  },
  mutations: {
    ADD_PAYOUT: (state, _payout) => {
      let idx = -1;
      state.payoutPage.docs.map((a, i) => {
        if (a._id === _payout._id) idx = i;
      });
      if (idx === -1) state.payoutPage.docs.push(_payout);
      else state.payoutPage.docs[idx] = _payout;
    },
    SET_PAYOUT_PAGE: (state, page) => {
      // list.docs = list.docs.map((c: Payout) => payoutToJSON(c));
      state.payoutPage = page;
    },
    REMOVE_PAYOUT(state, _payout) {
      let idx = -1;
      state.payoutPage.docs.map((a, i) => {
        if (a._id === _payout._id) idx = i;
      });
      if (idx > -1) state.payoutPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async initiatePayout(context, payout) {
      return await api
        .post(`/v1/payout/initiate`, payout)
        .then((response) => {
          if (response.data.payout)
            context.dispatch(
              "setToast",
              {
                title: "Success!",
                type: "success",
                text: "Payout Initiated",
              },
              { root: true }
            );
          else
            context.dispatch(
              "setToast",
              {
                title: "Request Failed!",
                type: "error",
                text: "Payout initiation Failed",
              },
              { root: true }
            );
          return response.data.payout;
        })
        .catch((error) => {
          context.dispatch(
            "setToast",
            {
              title: "Request failed!",
              type: "error",
              timeout: 3000,
              text: error.response?.data?.error?.message,
            },
            { root: true }
          );
        });
    },
    async updatePayout(context, { id, payout}) {
      return await api
        .put(`/v1/payout/${id}`, payout)
        .then((response) => {
          context.commit("ADD_PAYOUT", response.data.payout);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Payout Updated",
            },
            { root: true }
          );
          return response.data.payout;
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
    async fetchPayout(context, params = "") {
      return await api
        .get(`/v1/payout${params}`)
        .then((response) => {
          context.commit("ADD_PAYOUT", response.data.payout);
          return response.data.payout;
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
    async fetchPayoutList(context, params = "") {
      return await api
        .get(`/v1/payout${params}`)
        .then((response) => {
          context.commit("SET_PAYOUT_PAGE", response.data.payoutPage);
          return response.data.payoutPage;
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
    async deletePayout(context, payoutId) {
      return await api
        .delete(`/v1/payout/${payoutId}`)
        .then((response) => {
          context.commit("REMOVE_PAYOUT", response.data.payout);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Payout Deleted",
            },
            { root: true }
          );
          return response.data.payout;
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
    async convert(context, params = "") {
      return await api
        .get(`/v1/payment/convert${params}`)
        .then((response) => {
          return response.data.amount;
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

export default payout;
