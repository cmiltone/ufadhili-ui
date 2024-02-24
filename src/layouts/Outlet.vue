<template>
  <v-layout>
      <v-app-bar
        color="primary"
        :elevation="2" rounded
      >

        <!-- <template v-slot:prepend>
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        </template> -->

        <v-app-bar-title>Ufadhili</v-app-bar-title>
        <v-text-field prepend-icon="mdi-magnify" placeholder="Search" @keyup="search($event.target.value)"/>

        <v-spacer></v-spacer>

        <v-btn title="Login" icon @click="login">
          <v-icon>mdi-login</v-icon>
        </v-btn>
      </v-app-bar>
    <v-main scrollable style="background-color: #fbf4f4;">
      <v-progress-linear color="primary" height="4px" :active="showProgressBar" :indeterminate="true" />
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import campaignStoreModule from "@/store/modules/campaign";
import { isAuthenticated } from "@/utils/auth";

const { mapActions: campaignActions } = createNamespacedHelpers("CAMPAIGN_LIST");
export default {
    name: "Full",
    data() {
      return {
        drawer: true,
        appBarMenu: false,
      }
    },
    computed: {
      showProgressBar() {
        return this.$store.getters.loadingRequest;
      },
      user(): User {
        return this.$store.getters.user;
      },
    },
    methods: {
        ...campaignActions(["updateCampaign", "deleteCampaign", "fetchCampaignList"]),
        login() {
            if (isAuthenticated()) this.$router.push("/dashboard");
            else this.$router.push({
                path: '/auth',
                query: { redrectUrl: '/' },
            });
        },
        search(q?: string) {
            let params = `?page=1&limit=1000`;
            if (q) params += `&q=${q}`;
            this.fetchCampaignList(params);
        },
    },
    beforeCreate() {
        if (!this.$store.hasModule("CAMPAIGN_LIST")) {
            this.$store.registerModule("CAMPAIGN_LIST", campaignStoreModule);
        }
    },
    beforeUnmount() {
        this.$store.unregisterModule("CAMPAIGN_LIST");
    },
}
</script>
