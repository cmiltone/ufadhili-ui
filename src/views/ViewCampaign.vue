<template>
    <v-dialog v-model="donateDialog" max-width="400px">
        <payment-form v-if="campaign" :campaign="campaign" @close="closeModal" />
    </v-dialog>
    <v-dialog v-model="shareDialog" max-width="460px">
        <v-card>
            <v-card-title>Link Copied</v-card-title>
            <v-card-text>
                <p>Share the campaign with friends:</p>
                <p>{{ shareLink }}</p>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-container fluid style="
        display: flex;
        flex-wrap: wrap;
        justify-content: center;"
    >
        <v-card v-if="campaign"
            max-width="700px"
            style="margin: 10px;"
        >
            <v-toolbar color="primary">
                <v-btn icon="mdi-arrow-left" to="/" /> &nbsp; Campaign
            </v-toolbar>
            <v-img
                :src="getImage(campaign.coverImage)"
                class="align-end"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                cover
                color="primary"
                max-height="300px"
            >
                <v-card-title class="text-white">{{campaign.title}}</v-card-title>
            </v-img>

            <v-card-text>
                <p>{{ campaign.description }}</p>
                <hr>
                <p>Created by: {{ campaign.owner.fullName }} on {{ readableDate(campaign.createdAt, 'MMM Do, YYYY, h:mma') }}</p>
                <span>Target: {{ `${campaign.currency} ${numberWithCommas(campaign.target)}` }}</span> &nbsp;
                <span>Raised: {{ `${campaign.currency} ${numberWithCommas(campaign.raised)}` }}</span> &nbsp;
            </v-card-text>

            <v-card-actions>
                <v-progress-circular :rotate="360" :size="70" :width="10" :model-value="percentage" color="primary">
                    <template v-slot:default> {{ percentage }} % </template>
                </v-progress-circular>
                <v-spacer></v-spacer>

                <v-btn size="small" color="primary" variant="outlined" title="Donate" @click="donate()">
                    <v-icon>mdi-credit-card</v-icon> Donate
                </v-btn>

                <v-btn size="small" color="primary" variant="text" icon="mdi-share-variant" title="Sahre" @click="share()"></v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import campaignStoreModule from "@/store/modules/campaign";
import { readableDate, numberWithCommas } from "@/utils/filters";
import placeholderImg from "@/assets/placeholder.png";
import PaymentForm from "@/components/PaymentForm.vue";
import { isAuthenticated } from '@/utils/auth';

const { mapActions: campaignActions } = createNamespacedHelpers("VIEW_CAMPAIGN");

const API_URL = import.meta.env.VITE_API_URL;

export default {
    name: 'ViewCampaign',
    components: { PaymentForm },
    props: {
        campaignId: {
        type: String,
        required: true,
        }
    },
    data: () => ({
        placeholderImg,
        apiUr: API_URL,
        donateDialog: false,
        shareDialog: false,
        shareLink: "",
    }),
    computed: {
        user() {
            return this.$store.getters.user;
        },
        campaign(): Campaign {
            return this.$store.getters["VIEW_CAMPAIGN/getCampaign"](this.campaignId);
        },
        percentage(): number {
            return Math.ceil((this.campaign?.raised / this.campaign?.target) * 100)
        }
    },
    created() {
        this.fetchData();
    },
    methods: {
        ...campaignActions(["fetchCampaign"]),
        numberWithCommas,
        readableDate,
        fetchData() {
            this.fetchCampaign(`?campaignId=${this.campaignId}`)
        },
        getImage(filename?: string) {
            if (!filename) return this.placeholderImg;
            return `${API_URL}/v1/file/${filename}`;
        },
        donate() {
            if (!isAuthenticated()) {
                this.$store.dispatch("setToast", {
                    title: "Login to donate",
                    type: "info",
                    //text: "",
                },
                { root: true }).then(() => this.login());
                return;
            }
            this.donateDialog = true;
        },
        share() {
            this.shareDialog = true;
            this.shareLink = window.location.href;
            navigator.clipboard.writeText(window.location.href);
        },
        closeModal(saved: boolean) {
            if (saved) this.fetchData();
            this.donateDialog = false;
        },
        login() {
            this.$router.push({
                path: '/auth',
                query: { redirectUrl: `/${this.campaignId}` },
            });
        },
    },
    beforeCreate() {
        if (!this.$store.hasModule("VIEW_CAMPAIGN")) {
            this.$store.registerModule("VIEW_CAMPAIGN", campaignStoreModule);
        }
    },
    beforeUnmount() {
        this.$store.unregisterModule("VIEW_CAMPAIGN");
    }
}
</script>