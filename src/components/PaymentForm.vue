<template>
  <div style="margin: '10px auto' max-width: 400px">
    <v-card width="390px">
        <v-toolbar color="primary" title="Make donatio to Campaign" />
        <v-tabs v-model="tab">
            <v-tab value="mobile_money">Mobile Money</v-tab>
            <v-tab value="card">Card</v-tab>
        </v-tabs>
        <v-card-text>
          <v-window v-model="tab">
            <v-window-item value="mobile_money">
              <v-card>
                <v-card-text>
                    <v-text-field
                        v-model="accountNumber"
                        label="Phone Number"
                        prefix="+254"
                        :rules="getRules('Phone')"
                    />
                    <v-text-field
                        v-model.number="amount"
                        type="number"
                        label="Amount to Donate"
                        :prefix="campaign?.currency ?? 'KES'"
                        placeholder="e.g 1000"
                        :rules="amountRules"
                    />
                    <span v-if="amount > 0">
                        A transaction fee of 1.5% (KES {{ Math.ceil(amount * 1.5/100) }}) will be charged.
                    </span>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn color="secondary" variant="outlined" @click="$emit('close', false)">
                        Close
                    </v-btn>
                  <v-btn v-if="!loading" color="primary" variant="outlined" :disabled="!accountNumber || !amount" @click="paymentByMobileMoney"> Donate </v-btn>
                  <v-progress-circular v-else indeterminate color="primary" />
                </v-card-actions>
              </v-card>
            </v-window-item>
            <v-window-item value="card">
                <v-card>
                    <v-card-text>
                        <v-text-field
                            v-model.number="amount"
                            type="number"
                            label="Amount to Donate"
                            :prefix="campaign?.currency ?? 'KES'"
                            placeholder="e.g 1000"
                            :rules="amountRules"
                        />
                        <span v-if="amount > 0">
                            A transaction fee of 2.9% (KES {{ Math.ceil(amount * 2.9/100) }}) will be charged.
                        </span>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn color="secondary" variant="outlined" @click="$emit('close', false)">
                        Cancel
                        </v-btn> &nbsp;
                        <v-progress-circular v-if="loading" indeterminate color="primary" />
                        <div v-else>
                            <paystack-checkout
                                v-if="amount > 0"
                                buttonClass="v-btn v-theme--light text-primary v-btn--density-default v-btn--size-default v-btn--variant-outlined"
                                buttonText="Donate"
                                :amount="cardAmount"
                                :email="user.email"
                                :firstname="user.fullName.split(' ')[0]"
                                :lastname="user.fullName.split(' ')[1]"
                                :reference="reference"
                                @onSuccess="paystackCallback"
                                @onCancel="paystackCancelled"
                                :currency="campaign?.currency ?? 'KES'"
                                :embed="false"
                                :apiKey="appSetting.payStackPublicKey"
                            />
                        </div>
                    </v-card-actions>
                </v-card>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { createNamespacedHelpers } from 'vuex';

import paymentStoreModule from "@/store/modules/payment";
import appSettingStoreModule from '@/store/modules/appSetting';
import PaystackCheckout from './PaystackCheckout.vue';

const { mapActions: paymentActions } = createNamespacedHelpers("PAYMENT");
const { mapActions: settingActions, mapGetters: settingGetters } = createNamespacedHelpers("APP_SETTING");
export default {
  name: 'PaymentForm',
  components: { PaystackCheckout },
  props: {
    campaign: {
      type: Object as PropType<Campaign>,
      required: true,
    }
  },
  data: () => ({
    tab: 'mobile_money',
    accountNumber: '',
    bankCode: 'MPESA',
    amount: 0,
    reference: '',
    authCode: '',
    fee: 1,
    bankList: [] as Bank[],
    paymentId: "",
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
          if (val <= 0) return 'Amount must be 1 or more';

          return true;
        }
      ]
    },
    recipientCode() {
      return this.user.paystackRecipientCode ?? '';
    },
    cardAmount(): number {
        return Math.ceil(this.amount * 2.9/100 + this.amount ) * 100
    }
  },
  created() {
    this.fetchAppSetting();
    this.reference = `ref_${Date.now()}`;
  },
  methods: {
    ...paymentActions(["payByMobile", "payByCard", "fetchPayment"]),
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
        if (!res)return;
        console.log("res: ", res);
        this.payByCard({
            userId: this.user._id,
            amount: this.amount,
            reference: this.reference,
            campaignId: this.campaign._id,
        }).then((res) => {
            if (res) {
                this.paymentId = res._id
                this.checkPayment();
            }
        });
    },
    paystackCancelled() {
      console.log("cancelled");
    },
    async paymentByMobileMoney() {
        this.loading = true;
        this.payByMobile({
            userId: this.user._id,
            campaignId: this.campaign._id,
            provider: 'mpesa',
            phone: `+254${this.accountNumber}`,
            amount: this.amount,
        }).then((res) => {
            if (res) {
                this.paymentId = res._id
                this.checkPayment();
            }
        })
    },
    async checkPayment() {
      const payment = await this.fetchPayment(`?paymentId=${this.paymentId}`);

      if (payment.status === 'paid') {
        this.loading = false;
        this.$store.dispatch(
            "setToast",
            {
              title: "Success!",
              type: "success",
              text: "Donation Made Successfully. Thank You",
            },
            { root: true }
          ).then(() => this.$emit('close', true))
      } else {
        setTimeout(() => {this.checkPayment();}, 5000);
      }
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule("PAYMENT")) {
      this.$store.registerModule("PAYMENT", paymentStoreModule);
    }
    if (!this.$store.hasModule("APP_SETTING")) {
      this.$store.registerModule("APP_SETTING", appSettingStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("PAYMENT");
    this.$store.unregisterModule("APP_SETTING");
  },
}
</script>

<style scoped>
.paystack-btn {
  color: red;
}
</style>