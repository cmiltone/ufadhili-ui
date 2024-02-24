<template>
    <v-dialog v-model="shareDialog" max-width="460px">
        <v-card>
            <v-card-title>Link Copied</v-card-title>
            <v-card-text>
                <p>Share the campaign with friends:</p>
                <p>{{ shareLink }}</p>
            </v-card-text>
        </v-card>
    </v-dialog>
    <div
      class="mx-auto"
      style="max-width: 1000px; margin: '10px auto'"
    >
      <h3 aligh="center">Donate funds to campaigns you care about.</h3>
      <v-container fluid style="
            display: flex;
            flex-wrap: wrap;
            justify-content: center;"
        >
            <v-card
                v-for="campaign in campaignPage.docs"
                :key="campaign._id"
                width="400px"
                style="margin: 10px;"
            >
              <v-img
                :src="getImage(campaign.coverImage)"
                class="align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                cover
                height="200px"
                color="primary"
              >
                <v-card-title class="text-white">{{campaign.title}}</v-card-title>
              </v-img>

                <v-card-text>
                    <span>Target: {{ `${campaign.currency} ${numberWithCommas(campaign.target)}` }}</span> &nbsp;
                    <span>Raised: {{ `${campaign.currency} ${numberWithCommas(campaign.raised)}` }}</span>
                </v-card-text>
  
              <v-card-actions>
                <v-spacer></v-spacer>
  
                <v-btn size="small" color="primary" variant="text" title="View" :to="`/${campaign._id}`">View</v-btn>
  
                <v-btn size="small" color="primary" variant="text" icon="mdi-share-variant" title="Sahre" @click="share(campaign)"></v-btn>
              </v-card-actions>
            </v-card>
      </v-container>
    </div>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import campaignStoreModule from "@/store/modules/campaign";
import { readableDate, numberWithCommas } from "@/utils/filters";
import placeholderImg from "@/assets/placeholder.png";

const API_URL = import.meta.env.VITE_API_URL;

const { mapActions: campaignActions, mapGetters: campaignGetters } = createNamespacedHelpers("CAMPAIGN_LIST");

export default {
    name: 'Landing',
    data: () => ({
        placeholderImg,
        apiUr: API_URL,
        campaign: undefined as undefined | Campaign,
        donateDialog: false,
        shareDialog: false,
        shareLink: "",
    }),
    created() {
        this.fetchData();
    },
    computed: {
        ...campaignGetters(["campaignPage"]),
    },
    methods: {
        ...campaignActions(["updateCampaign", "deleteCampaign", "fetchCampaignList"]),
        readableDate,
        numberWithCommas,
        getImage(filename: string) {
            if (!filename) return this.placeholderImg;
            return `${API_URL}/v1/file/${filename}`;
        },
        fetchData(q?: string) {
            let params = `?page=1&limit=1000`;
            if (q) params += `&q=${q}`;
            this.fetchCampaignList(params);
        },
        search(q: string) {
            if (q) this.fetchData(q);
        },
        share(campaign: Campaign) {
            this.shareDialog = true;
            this.shareLink = window.location.href + `${campaign._id}`;
            navigator.clipboard.writeText(window.location.href + `${campaign._id}`);
        },
    },
    beforeCreate() {
        if (!this.$store.hasModule("CAMPAIGN_LIST")) {
            this.$store.registerModule("CAMPAIGN_LIST", campaignStoreModule);
        }
    },
    beforeUnmount() {
        //this.$store.unregisterModule("CAMPAIGN_LIST");
    }
  }
</script>