import { Module } from "vuex";

import { api } from "@/utils/axios";

type UserState = {
  userPage: Page<User>;
};


export const userToJSON = (user?: User): User => ({
  _id: user?._id ?? '',
  fullName: user?.fullName ?? '',
  dob: user?.dob ?? new Date(),
  status: user?.status ?? 'active',
  role: user?.role ?? ['default'],
  avatarUrl: user?.avatarUrl ?? '',
  gender: user?.gender ?? 'male',
  phone: user?.phone ?? '',
  email: user?.email ?? '',
  createdAt: user?.createdAt,
  updatedAt: user?.updatedAt,
})

const user: Module<UserState, unknown> = {
  namespaced: true,
  state: () => ({
    userPage: {
      docs: [],
      limit: 0,
      page: 0,
      pages: 0,
      sort: "",
      total: 0,
    },
    userCount: 0,
    userAggregate: [],
    users: [],
  }),
  getters: {
    getUser: (state) => (userId: string) =>
      state.userPage.docs.find((c) => c._id === userId),
    userPage: (state) => state.userPage,
  },
  mutations: {
    ADD_USER: (state, _user) => {
      let idx = -1;
      state.userPage.docs.map((a, i) => {
        if (a._id === _user._id) idx = i;
      });
      if (idx === -1) state.userPage.docs.push(_user);
      else state.userPage.docs[idx] = _user;
    },
    SET_USER_PAGE: (state, list) => {
      state.userPage = list;
    },
    REMOVE_USER(state, _user) {
      let idx = -1;
      state.userPage.docs.map((a, i) => {
        if (a._id === _user._id) idx = i;
      });
      if (idx > -1) state.userPage.docs.splice(idx, 1);
    },
  },
  actions: {
    async updateUser(context, { id, user}) {
      return await api
        .put(`/v1/user/${id}`, user)
        .then((response) => {
          context.commit("ADD_USER", response.data.user);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "User Updated",
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
    async fetchUser(context, params = "") {
      return await api
        .get(`/v1/user${params}`)
        .then((response) => {
          context.commit("ADD_USER", response.data.user);
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
    async fetchUserList(context, params = "") {
      return await api
        .get(`/v1/user${params}`)
        .then((response) => {
          context.commit("SET_USER_PAGE", response.data.userPage);
          return response.data.userPage;
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
    async deleteUser(context, userId) {
      return await api
        .delete(`/v1/user/${userId}`)
        .then((response) => {
          context.commit("REMOVE_USER", response.data.user);
          context.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "User Deleted",
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

export default user;
