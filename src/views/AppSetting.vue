<template>
  <v-form ref="form" method="POST" @submit.prevent="save">
    <v-card width="auto" max-width="700px" class="ma-auto">
      <v-toolbar color="primary" title="App Settings" />
      <v-card-text>
        <v-text-field
          v-model="techFeePercentage"
          :rules="getRules('Tech Fee Percentage')"
          label="Tech Fee Percentage"
          suffix="%"
          placeholder="e.g 10"
        />

        <v-text-field
          v-model="adminEmail"
          :rules="getRules('Admin Email')"
          label="Admin Email"
          placeholder="e.g admin@fanikiwa.net"
        />

        <v-text-field
          v-model="payStackSecretKey"
          :rules="getRules('Paystack Secret Key')"
          label="Paystack Secret Key"
          :type="showPaystackSecretKey ? 'text' : 'password'"
          placeholder="e.g sk_test_xxxxxxx..."
          :append-inner-icon="showPaystackSecretKey ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPaystackSecretKey = !showPaystackSecretKey"
        />

        <v-text-field
          v-model="payStackPublicKey"
          :rules="getRules('Paystack Public Key')"
          :type="showPaystackPublicKey ? 'text' : 'password'"
          label="Paystack Public Key"
          placeholder="e.g pk_test_xxxxx...."
          :append-inner-icon="showPaystackPublicKey ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPaystackPublicKey = !showPaystackPublicKey"
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn type="button" color="secondary" variant="outlined" @click="$router.back()">Back</v-btn>
        <v-btn color="primary" type="submit" variant="outlined">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import appSettingStoreModule from "@/store/modules/appSetting";

const { mapActions: settingsActions, mapGetters: settingsGetters } = createNamespacedHelpers("APP_SETTING");

export default {
  name: 'AppSetting',
  data: () => ({
    showPaystackPublicKey: false,
    showPaystackSecretKey: false,
    techFeePercentage: 0,
    adminEmail: '',
    payStackSecretKey: '',
    payStackPublicKey: '',

  }),
  computed: {
    ...settingsGetters(["appSetting"]),
  },
  created() {
    this.fetchAppSetting().then((setting) => {
      if (setting) {
        this.techFeePercentage = setting.techFeePercentage;
        this.payStackPublicKey = setting.payStackPublicKey;
        this.payStackSecretKey = setting.payStackSecretKey;
        this.adminEmail = setting.adminEmail;
      }
    });
  },
  methods: {
    ...settingsActions(["saveAppSetting", "fetchAppSetting"]),
    getRules(field: string): any[] {
      return [
        (v: string) =>
          !!v || `${field} field is required`,
      ];
    },
    async save() {
      const { valid } = await (this.$refs as { form: any }).form.validate();

      if (!valid) return;

      this.saveAppSetting({
        techFeePercentage: this.techFeePercentage,
        adminEmail: this.adminEmail,
        payStackPublicKey: this.payStackPublicKey,
        payStackSecretKey: this.payStackSecretKey,
      });
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule("APP_SETTING")) {
      this.$store.registerModule("APP_SETTING", appSettingStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("APP_SETTING");
  }
}
</script>