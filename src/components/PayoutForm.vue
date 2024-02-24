<template>
  <v-form ref="form" v-if="recipientCode" @submit.prevent="payout">
    <v-card width="390px">
      <v-toolbar color="primary" title="Payout" />
      <v-card-text>
        <v-text-field v-model.number="amount" label="Amount to Withdraw" type="number"
          :prefix="campaign?.currency ?? 'KES'" placeholder="e.g 1000" :rules="amountRules" />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="secondary" type="button" @click="$emit('close', false)">
          Close
        </v-btn>
        <v-btn color="primary" v-if="!loading" type="submit" :disabled="loading"> Withdraw </v-btn>
        <v-progress-circular v-else :active="loading" :indeterminate="true" color="primary" />
      </v-card-actions>
    </v-card>
  </v-form>

  <v-card v-else width="390px">
    <v-toolbar color="primary" title="Payout" />
    <v-tabs v-model="tab">
      <v-tab value="mobile_money">Mobile Money</v-tab>
      <v-tab value="card">Card</v-tab>
    </v-tabs>
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="mobile_money">
          <v-select v-model="bankCode" item-value="code" item-title="name" label="Select Provider"
            placeholder="Select Mobile money services provider" :items="bankList" />
          <v-card v-if="bankCode">
            <v-card-text>
              <v-text-field v-model="accountNumber" label="Phone Number" prefix="+254" :rules="getRules('Phone')" />
              <v-text-field v-model.number="amount" type="number" label="Amount to Withdraw"
                :prefix="campaign?.currency ?? 'KES'" placeholder="e.g 1000" :rules="amountRules" />
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn color="secondary" @click="$emit('close', false)">
                Close
              </v-btn>
              <v-btn color="primary" :disabled="!accountNumber || !amount" @click="payoutByMobileMoney"> Withdraw </v-btn>
            </v-card-actions>
          </v-card>
        </v-window-item>
        <v-window-item value="card">
          <v-card v-if="!user?.paystackRecipientCode">
            <v-card-text>
              <v-text-field v-model.number="amount" type="number" label="Amount to Widthdraw"
                :prefix="campaign?.currency ?? 'KES'" placeholder="e.g 1000" :rules="amountRules" />
              <p>
                A one-time Authorization fee of {{ campaign?.currency + ' ' + Math.floor(authAmount) }} (USD {{ fee }})
                will be charged to initiate payout.
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn color="secondary" variant="outlined" @click="$emit('close', false)">
                Cancel
              </v-btn>
              <paystack-checkout v-if="amount"
                buttonClass="v-btn v-theme--light text-primary v-btn--density-default v-btn--size-default v-btn--variant-outlined"
                buttonText="Accept and Withdraw" :amount="authAmount * 100" :email="user.email"
                :firstname="user.fullName.split(' ')[0]" :lastname="user.fullName.split(' ')[1]" :reference="reference"
                @onSuccess="paystackCallback" @onCancel="paystackCancelled" :currency="campaign?.currency ?? 'KES'"
                :apiKey="appSetting.payStackPublicKey" :embed="false" />
              <v-btn v-else variant="outlined" disabled density="default" size="default" text="primary"
                theme="light">Accept and Widthdraw</v-btn>
            </v-card-actions>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import payoutStoreModule from "@/store/modules/payout";
import appSettingStoreModule from '@/store/modules/appSetting';
import paystackStoreModule from "@/store/modules/paystack";
import PaystackCheckout from './PaystackCheckout.vue';
import { PropType } from 'vue';

const { mapActions: payoutActions } = createNamespacedHelpers("PAYOUT");
const { mapActions: paystackActions } = createNamespacedHelpers("PAYSTACK");
const { mapActions: settingActions, mapGetters: settingGetters } = createNamespacedHelpers("APP_SETTING");
export default {
  name: 'PayoutForm',
  components: { PaystackCheckout },
  props: {
    campaign: {
      type: Object as PropType<Campaign>,
      required: true,
    }
  },
  data: () => ({
    tab: 'card',
    accountNumber: '',
    bankCode: '',
    amount: 0,
    authAmount: 0,
    reference: '',
    authCode: '',
    fee: 1,
    bankList: [] as Bank[],
    payoutId: "",
    loading: false,
  }),
  computed: {
    ...settingGetters(["appSetting"]),
    user(): User {
      return this.$store.getters.user;
    },
    amountRules() {
      return [
        (val: number) => {
          if (val <= 0) return 'Amount should be more than Zero';

          const bal = Math.floor(this.campaign?.current ?? 0);
          const currency = this.campaign?.currency ?? 'KES';

          if (val > bal) return `Amount must not exceed your current campaing balance of ${currency} ${bal.toLocaleString()}`;

          return true;
        }
      ]
    },
    recipientCode() {
      return this.user?.paystackRecipientCode ?? '';
    }
  },
  watch: {
    tab: "fetchBanks",
  },
  created() {
    this.getAmount();
    this.reference = `ref_${Date.now()}`;
    this.$store.dispatch('fetchAuthUser');
    this.fetchAppSetting();
  },
  methods: {
    ...payoutActions(["convert", "initiatePayout", "fetchPayout"]),
    ...paystackActions(["fetchTransaction", "createRecipient", "fetchBankList"]),
    ...settingActions(["fetchAppSetting"]),
    getRules(field: string) {
      return [
        (value: string) => {
          if (value) return true

          return `This ${field} is required`;
        }
      ];
    },
    paystackCallback(res: any) {
      this.fetchTransaction(`?id=${res.transaction}`).then((transaction) => {
        if (transaction) {
          this.authCode = transaction.authorization.authorization_codeUser;
          const payload: any = {
            userId: this.user._id,
            type: this.tab,
            authorizationCode: transaction.authorization.authorization_code,
          };
          this.createRecipient(payload).then((user) => {
            if (user) {
              this.$store.dispatch('fetchAuthUser');
              this.payoutByCard();
            }
          })
        }
      });
    },
    paystackCancelled() {
      console.log("cancelled");
    },
    payoutByCard() {
      this.initiatePayout({
        amount: this.amount,
        currency: this.campaign?.currency ?? 'KES',
        campaignId: this.campaign._id,
      }).then((res) => {
        if (res) {
          this.$emit('close', true);
        }
      });
    },
    async payoutByMobileMoney() {
      const payload: any = {
        userId: this.user._id,
        type: 'mobile_money',
        accountNumber: `0${this.accountNumber}`,
        bankCode: this.bankCode,
      };

      if (!this.user.paystackRecipientCode) {
        const user = await this.createRecipient(payload)
        if (user) {
          this.$store.dispatch('fetchAuthUser');
        }
      }

      await this.doPayout()
    },
    fetchBanks() {
      if (this.tab === 'mobile_money') {
        this.fetchBankList(`?currency=${this.campaign?.currency}&type=mobile_money`).then((banks) => {
          this.bankList = banks;
        });
      }
    },
    async payout() {
      const { valid } = await (this.$refs as { form: any }).form.validate();

      if (!valid) return;
      await this.doPayout();
    },
    async doPayout() {
      this.loading = true;
      this.initiatePayout({
        amount: this.amount,
        currency: this.campaign?.currency ?? 'KES',
        campaignId: this.campaign._id,
      }).then((res) => {
        if (res) {
          this.payoutId = res._id
          this.checkPayout();
        }
      })
    },
    async checkPayout() {
      const payout = await this.fetchPayout(`?payoutId=${this.payoutId}`);

      if (payout.status === 'paid') {
        this.loading = false;
        this.$store.dispatch(
          "setToast",
          {
            title: "Success!",
            type: "success",
            text: "Withdrawal Completed",
          },
          { root: true }
        ).then(() => this.$emit('close', true))
      } else {
        setTimeout(() => { this.checkPayout(); }, 5000);
      }
    },
    getAmount() {
      if (this.campaign) {
        this.convert(`?amount=${this.fee}&from=USD&to=${this.campaign.currency}`).then((amount) => {
          this.authAmount = amount;
        });
      }
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule("PAYOUT")) {
      this.$store.registerModule("PAYOUT", payoutStoreModule);
    }
    if (!this.$store.hasModule("PAYSTACK")) {
      this.$store.registerModule("PAYSTACK", paystackStoreModule);
    }
    if (!this.$store.hasModule("APP_SETTING")) {
      this.$store.registerModule("APP_SETTING", appSettingStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("PAYOUT");
    this.$store.unregisterModule("PAYSTACK");
    this.$store.unregisterModule("APP_SETTING");
  },
}
</script>

<style scoped>
.paystack-btn {
  color: red;
}
</style>