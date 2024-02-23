<template>
  <v-sheet v-if="user">
    <v-dialog
      v-model="delRecipientDialog"
      transition="dialog-bottom-transition"
      width="auto"
    >
      <v-card v-if="user">
        <v-toolbar color="red" title="Delete User!" />
        <v-card-text>
          <p>Confirm to Delete this User's Paystack Transfer Recipient</p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="green" variant="text" @click="delRecipientDialog = false">
            Cancel
          </v-btn>
          <v-btn
            variant="text"
            color="red"
            @click="delRecipient"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <p class="text-subtitle-2 text-center">
      <v-avatar v-if="user.avatarUrl" :image="user.avatarUrl" size="100"/>
      <v-avatar v-else :image="avatar"  height="50px" />
    </p>
    <p class="text-subtitle-2 text-center">{{ user.fullName }}</p>
    <p v-if="user.dob" class="text-subtitle-2 text-center">Born {{ readableDate(user.dob, 'MMM Do, YYYY') }}</p>
    <v-card v-if="user.wallet">
      <v-card-title>Available Balance</v-card-title>
      <v-card-text>{{ user.wallet.currency + ' ' + user.wallet.amount.toLocaleString() }}</v-card-text>
      <v-card-actions>
        <v-btn color="red" variant="outlined" v-if="user.wallet.recipientCode" @click="delRecipientDialog = true">Delete Paystack Recipient</v-btn>
      </v-card-actions>
    </v-card>
    <v-tabs v-model="tab" bg-color="green">
      <v-tab value="transactions">Transactions</v-tab>
      <v-tab value="payouts">Payouts</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="transactions">
        <wallet-transaction-list :userId="user._id" />
      </v-window-item>
      <v-window-item value="payouts">
        <payout-list :userId="user._id" />
      </v-window-item>
    </v-window>
  </v-sheet>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import userStoreModule from "@/store/modules/user";
import { readableDate } from "@/utils/filters";
import avatar from "@/assets/avatar.png";
import WalletTransactionList from '@/components/WalletTransactionList.vue';
import PayoutList from '@/components/PayoutList.vue';
import paystackStoreModule from "@/store/modules/paystack";

const { mapActions: userActions } = createNamespacedHelpers("USER_DATA");
const { mapActions: paystackActions } = createNamespacedHelpers("PAYSTACK");

export default {
  components: { WalletTransactionList, PayoutList },
  name: 'EditUser',
  props: {
    userId: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    avatar,
    tab: 'transactions',
    delRecipientDialog: false,
  }),
  computed: {
    user(): User {
      return this.$store.getters["USER_DATA/getUser"](this.userId);
    }
  },
  created() {
    this.fetchUser(`?userId=${this.userId}`);
  },
  methods: {
    ...userActions(["fetchUser"]),
    ...paystackActions(["deleteRecipient"]),
    readableDate,
    delRecipient() {
      this.deleteRecipient(this.user._id).then((user) => {
        if (user) {
          this.fetchUser(`?userId=${this.user._id}`);
          this.delRecipientDialog = false;
        }
      })
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule("USER_DATA")) {
      this.$store.registerModule("USER_DATA", userStoreModule);
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