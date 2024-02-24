<template>
  <v-sheet class="pa-2">
    <v-row>
      <v-col>
        <h3>System Summary</h3>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col
        cols="auto"
      >
        <v-card
          class="mx-auto ma-2"
          width="250"
          color="primary"
          :variant="`outlined`"
        >
          <v-card-item>
            <div>
              <div class="text-h6 mb-1">
                {{ campaignCount }}
              </div>
              <div class="text-caption">Campaigns</div>
            </div>
          </v-card-item>

          <v-card-actions>
            <v-btn to="/campaigns">
              View
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>
<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import campaignStoreModule from "@/store/modules/campaign";

const { mapActions: campaignActions, mapGetters: campaignGetters } = createNamespacedHelpers("CAMPAIGN_LIST");

export default {
  name: "Dashboard",
  data: () => ({
    campaignCount: 0
  }),
  computed: {
    ...campaignGetters(["campaignPage"]),
    user(): User {
      return this.$store.getters.user;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    ...campaignActions(["fetchCampaignCount"]),
    fetchData() {
      let params = ``;
      if (!this.user.role.includes('admin')) params += `?ownerId=${this.user._id}`
      this.fetchCampaignCount(params).then((data) => {
        if (data) {
          this.campaignCount = data;
        }
      });
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule("CAMPAIGN_LIST")) {
      this.$store.registerModule("CAMPAIGN_LIST", campaignStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("CAMPAIGN_LIST");
  }
}
</script>