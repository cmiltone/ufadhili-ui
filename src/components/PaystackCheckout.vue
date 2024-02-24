<template>
  <paystack
    buttonClass="v-btn v-theme--light text-primary v-btn--density-default v-btn--size-default v-btn--variant-text"
    buttonText="Accept and Pay"
    :amount="amount"
    :email="email"
    :publicKey="apiKey"
    :firstname="firstname"
    :lastname="lastname"
    :reference="reference"
    :onSuccess="paystackCallback"
    :onCancel="paystackCancelled"
    :channels="['card']"
    :currency="currency"
    :embed="false"
  />
</template>

<script>
import Paystack from 'vue3-paystack';

export default {
  name: 'PayoutCheckout',
  components: { Paystack },
  props: {
    amount: { type: Number, required: true },
    email: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    reference: { type: String, required: true },
    currency: { type: String, required: true },
    apiKey: { type: String, required: true }
  },
  methods: {
    paystackCallback(res) {
      this.$emit('onSuccess', res);
    },
    paystackCancelled(arg) {
      this.$emit('onCancel', arg);
    },
  },
}
</script>