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
    <v-card>
      <v-card-actions>
        <v-btn color="red" variant="outlined" v-if="user.paystackRecipientCode" @click="delRecipientDialog = true">Delete Paystack Recipient</v-btn>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import userStoreModule from "@/store/modules/user";
import { readableDate } from "@/utils/filters";
import avatar from "@/assets/avatar.png";
import paystackStoreModule from "@/store/modules/paystack";

const { mapActions: userActions } = createNamespacedHelpers("USER_DATA");
const { mapActions: paystackActions } = createNamespacedHelpers("PAYSTACK");

export default {
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