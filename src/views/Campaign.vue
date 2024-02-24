<template>
  <v-sheet v-if="campaign">
  <v-dialog
    v-model="widthdrawDialog"
    transition="dialog-bottom-transition"
    persistent
    width="auto"
  >
    <payout-form :campaign="campaign" @close="closeModal" />
  </v-dialog>
    <p class="text-subtitle-2 text-center">{{ campaign.title }}</p>
    <p class="text-subtitle-2 text-center">Created: {{ readableDate(campaign.createdAt, 'MMM Do, YYYY') }}</p>
    <v-card v-if="campaign">
      <v-card-title>Balances</v-card-title>
      <v-card-text>
        <p>Raised Amount: {{ campaign.currency + ' ' + campaign.raised.toLocaleString() }}</p>
        <p>Available balance: {{ campaign.currency + ' ' + campaign.current.toLocaleString() }}</p>
        <p>Target: {{ campaign.currency + ' ' + campaign.target.toLocaleString() }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="outlined" v-if="campaign.current" @click="widthdrawDialog = true">Withdraw</v-btn>
      </v-card-actions>
    </v-card>
    <v-tabs v-model="tab" bg-color="green">
      <v-tab value="transactions">Transactions</v-tab>
      <v-tab value="payouts">Payouts</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="transactions">
        <transaction-list :campaignId="campaign._id" />
      </v-window-item>
      <v-window-item value="payouts">
        <payout-list :campaignId="campaign._id" />
      </v-window-item>
    </v-window>
  </v-sheet>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import campaignStoreModule from "@/store/modules/campaign";
import { readableDate } from "@/utils/filters";
import avatar from "@/assets/avatar.png";
import TransactionList from '@/components/TransactionList.vue';
import PayoutForm from '@/components/PayoutForm.vue';
import PayoutList from '@/components/PayoutList.vue';
import paystackStoreModule from "@/store/modules/paystack";

const { mapActions: campaignActions } = createNamespacedHelpers("USER_DATA");
const { mapActions: paystackActions } = createNamespacedHelpers("PAYSTACK");

export default {
  components: { TransactionList, PayoutList, PayoutForm },
  name: 'Campaign',
  props: {
    campaignId: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    avatar,
    tab: 'transactions',
    widthdrawDialog: false,
  }),
  computed: {
    campaign(): Campaign {
      return this.$store.getters["USER_DATA/getCampaign"](this.campaignId);
    }
  },
  created() {
    this.fetchCampaign(`?campaignId=${this.campaignId}`);
  },
  methods: {
    ...campaignActions(["fetchCampaign"]),
    ...paystackActions(["deleteRecipient"]),
    readableDate,
    closeModal() {
        this.fetchCampaign(`?campaignId=${this.campaignId}`);
        this.widthdrawDialog = false;
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule("USER_DATA")) {
      this.$store.registerModule("USER_DATA", campaignStoreModule);
    }
    if (!this.$store.hasModule("PAYSTACK")) {
      this.$store.registerModule("PAYSTACK", paystackStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("USER_DATA");
    this.$store.unregisterModule("PAYSTACK");
  }
}
</script>