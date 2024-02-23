import { Module } from "vuex";

import { api } from "@/utils/axios";
import { userToJSON } from "./user";

type CampaignState = {
  campaignPage: Page<Campaign>;
  campaignCount: number;
};

export const campaignToJSON = (campaign?: Campaign): Campaign => ({
  _id: campaign?._id ?? '',
  name: campaign?.title ?? '',
  owner: campaign?.owner ?? userToJSON(),
  description: campaign?.description ?? '',
  status: campaign?.status ?? 'active',
  target: campaign?.target ?? { amount: 0, currency: 'KES' },
  createdAt: campaign?.createdAt,
  updatedAt: campaign?.updatedAt,
})

const campaign: Module<CampaignState, unknown> = {
  namespaced: true,
  state: () => ({
    campaignPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    campaignCount: 0,
  }),
  getters: {
    getCampaign: (state) => (campaignId: string) =>
      state.campaignPage.docs.find((c) => c._id === campaignId),
    campaignPage: (state) => state.campaignPage,
  },
  mutations: {
    ADD_CAMPAIGN: (state, _campaign) => {
      let idx = -1;
      state.campaignPage.docs.map((a, i) => {
        if (a._id === _campaign._id) idx = i;
      });
      if (idx === -1) state.campaignPage.docs.push(_campaign);
      else state.campaignPage.docs[idx] = _campaign;
    },
    SET_CAMPAIGN_PAGE: (state, list) => {
      list.docs = list.docs.map((c: Campaign) => campaignToJSON(c));
      state.campaignPage = list;
    },
    REMOVE_CAMPAIGN(state, _campaign) {
      let idx = -1;
      state.campaignPage.docs.map((a, i) => {
        if (a._id === _campaign._id) idx = i;
      });
      if (idx > -1) state.campaignPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async createCampaign(context, campaign) {
      return await api
        .post(`/v1/campaign/`, campaign)
        .then((response) => {
          context.commit("ADD_CAMPAIGN", response.data.campaign);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Campaign Created",
            },
            { root: true }
          );
          return response.data.campaign;
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
    async updateCampaign(context, { id, campaign}) {
      return await api
        .put(`/v1/campaign/${id}`, campaign)
        .then((response) => {
          context.commit("ADD_CAMPAIGN", response.data.campaign);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Campaign Updated",
            },
            { root: true }
          );
          return response.data.campaign;
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
    async fetchCampaign(context, params = "") {
      return await api
        .get(`/v1/campaign${params}`)
        .then((response) => {
          context.commit("ADD_CAMPAIGN", response.data.campaign);
          return response.data.campaign;
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
    async fetchCampaignList(context, params = "") {
      return await api
        .get(`/v1/campaign${params}`)
        .then((response) => {
          context.commit("SET_CAMPAIGN_PAGE", response.data.campaignPage);
          return response.data.campaignPage;
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
    async deleteCampaign(context, campaignId) {
      return await api
        .delete(`/v1/campaign/${campaignId}`)
        .then((response) => {
          context.commit("REMOVE_CAMPAIGN", response.data.campaign);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Campaign Deleted",
            },
            { root: true }
          );
          return response.data.campaign;
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

export default campaign;
