import { Module } from "vuex";

import { api } from "@/utils/axios";

type CampaignCategoryState = {
  campaignCategoryPage: Page<CampaignCategory>;
  campaignCategoryCount: number;
};

const campaignCategory: Module<CampaignCategoryState, unknown> = {
  namespaced: true,
  state: () => ({
    campaignCategoryPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    campaignCategoryCount: 0,
  }),
  getters: {
    getCampaignCategory: (state) => (campaignCategoryId: string) =>
      state.campaignCategoryPage.docs.find((c) => c._id === campaignCategoryId),
    campaignCategoryPage: (state) => state.campaignCategoryPage,
  },
  mutations: {
    ADD_CAMPAIGN_CATEGORY: (state, _campaignCategory) => {
      let idx = -1;
      state.campaignCategoryPage.docs.map((a, i) => {
        if (a._id === _campaignCategory._id) idx = i;
      });
      if (idx === -1) state.campaignCategoryPage.docs.push(_campaignCategory);
      else state.campaignCategoryPage.docs[idx] = _campaignCategory;
    },
    SET_CAMPAIGN_CATEGORY_PAGE: (state, list) => {
      state.campaignCategoryPage = list;
    },
    REMOVE_CAMPAIGN_CATEGORY(state, _campaignCategory) {
      let idx = -1;
      state.campaignCategoryPage.docs.map((a, i) => {
        if (a._id === _campaignCategory._id) idx = i;
      });
      if (idx > -1) state.campaignCategoryPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async createCampaignCategory(context, campaignCategory) {
      return await api
        .post(`/v1/campaign-category`, campaignCategory)
        .then((response) => {
          context.commit("ADD_CAMPAIGN_CATEGORY", response.data.campaignCategory);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Campaign Category created",
            },
            { root: true }
          );
          return response.data.campaignCategory;
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
    async updateCampaignCategory(context, { id, campaignCategory}) {
      return await api
        .put(`/v1/campaign-category/${id}`, campaignCategory)
        .then((response) => {
          context.commit("ADD_CAMPAIGN_CATEGORY", response.data.campaignCategory);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Campaign Category Updated",
            },
            { root: true }
          );
          return response.data.campaignCategory;
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
    async fetchCampaignCategory(context, params = "") {
      return await api
        .get(`/v1/campaign-category${params}`)
        .then((response) => {
          context.commit("ADD_CAMPAIGN_CATEGORY", response.data.campaignCategory);
          return response.data.campaignCategory;
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
    async fetchCampaignCategoryList(context, params = "") {
      return await api
        .get(`/v1/campaign-category${params}`)
        .then((response) => {
          context.commit("SET_CAMPAIGN_CATEGORY_PAGE", response.data.campaignCategoryPage);
          return response.data.campaignCategoryPage;
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
    async deleteCampaignCategory(context, campaignCategoryId) {
      return await api
        .delete(`/v1/campaign-category/${campaignCategoryId}`)
        .then((response) => {
          context.commit("REMOVE_CAMPAIGN_CATEGORY", response.data.campaignCategory);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Campaign Category Deleted",
            },
            { root: true }
          );
          return response.data.campaignCategory;
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

export default campaignCategory;
