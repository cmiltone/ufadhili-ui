import { Module } from "vuex";

type AppState = {
  mini: boolean;
  overrideMini: boolean;
  drawer: null;
  drawerImage: boolean;
  expandedSidebar: boolean;
};
const app: Module<AppState, unknown> = {
  state: {
    mini: false,
    overrideMini: !!localStorage.getItem("override_mini"),
    drawer: null,
    drawerImage: true,
    expandedSidebar: false,
  },
  getters: {
    mini: (state) => state.mini,
    drawer: (state) => state.drawer,
    drawerImage: (state) => state.drawerImage,
    overrideMini: (state) => state.overrideMini,
    expandedSidebar: (state) => state.expandedSidebar,
  },
  mutations: {
    SET_MINI(state, mini = undefined) {
      if (mini === undefined) state.mini = !state.mini;
      else state.mini = mini;
    },
    SET_DRAWER(state, drawer) {
      state.drawer = drawer;
    },
    SET_OVERRIDE_MINI(state, o) {
      state.overrideMini = o;
    },
    SET_EXPANDED_SIDEBAR(state, s) {
      state.expandedSidebar = s;
    },
  },
  actions: {
    toggleMini(context, mini) {
      context.commit("SET_MINI", mini);
    },
    setDrawer(context, drawer) {
      context.commit("SET_DRAWER", drawer);
    },
    toggleMiniOverride(context, o) {
      context.commit("SET_OVERRIDE_MINI", o);
      if (o) localStorage.setItem("override_mini", "1");
      else localStorage.removeItem("override_mini");
    },
    expandSidebar(context, s) {
      context.commit("SET_EXPANDED_SIDEBAR", s);
    },
  },
};

export default app;
