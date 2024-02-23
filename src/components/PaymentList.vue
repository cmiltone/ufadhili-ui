<template>
  <v-dialog
    v-model="transactionDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="payment" width="360px">
      <v-toolbar color="primary" title="Wallet Transaction Details" />
      <v-card-text>
        <table>
          <tr>
            <td valign="top" style="font-weight: bold; width: 90px;">Paid To:</td>
            <td>
              {{ payment.campaignEnrolment?.campaign.owner.fullName }}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Amount:</td>
            <td>{{ payment.currency }} {{  payment.amount.toLocaleString() }}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Tech Fee:</td>
            <td>{{ payment.currency }} {{  payment?.techFee.toLocaleString() }}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Paid for:</td>
            <td>
              {{ payment.campaignEnrolment?.campaign.title ?? 'n/a'}}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Paid By:</td>
            <td>
              {{ payment.campaignEnrolment?.user.fullName }}
              {{ payment.ref ? ', ' + payment.ref : '' }}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Date:</td>
            <td>{{ readableDate(payment.createdAt, 'MMM Do, YYYY, h:mmA') }}</td>
          </tr>
        </table>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" variant="text" @click="transactionDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-row>
    <v-col>
      <h3>Payments</h3>
    </v-col>
  </v-row>

  <v-data-table-server
    v-model:page="page"
    fixed-header
    :headers="headers"
    :items="paymentPage.docs"
    :items-per-page="limit"
    :items-length="paymentPage.total"
    :loading="loading"
    height="80vh"
    loading-text="Fetching payments..."
    no-data-text="No payments to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.amount`]="{ item }">
      {{ item.currency }} {{  item.amount.toLocaleString() }}
    </template>
    <template v-slot:[`item.campaign`]="{ item }">
      {{ item.campaignEnrolment?.campaign.title }}
    </template>
    <template v-slot:[`item.user`]="{ item }">
      {{ item.campaignEnrolment?.user.fullName }}
    </template>
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY, h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-details" title="View Details" @click="payment = item; transactionDialog = true" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import paymentStoreModule from "@/store/modules/payment";
import { readableDate } from "@/utils/filters";

const { mapActions: paymentActions, mapGetters: paymentGetters } = createNamespacedHelpers("TRANSACTION_LIST");

export default {
  name: "PaymentList",
  data: () => ({
    headers: [
      {
        key: 'amount',
        title: 'Amount',
        sortable: true,
      },
      {
        key: 'campaign',
        title: 'Campaign',
      },
      {
        key: 'user',
        title: 'Paid By',
      },
      {
        key: 'createdAt',
        title: 'Date',
      },
      {
        key: 'action',
        title: 'Action',
      },
    ],
    options: {
      pageCount: 1,
    },
    page: 1,
    limit: 10,
    loading: false,
    payment: undefined as undefined | Payment,
    transactionDialog: false,
    q: '',
    sort: '',
  }),
  computed: {
    ...paymentGetters(["paymentPage"]),
    user() {
      return this.$store.getters.user;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    ...paymentActions(["fetchPaymentList"]),
    readableDate,
    fetchData() {
      this.loading = true;
      let params = `?page=${this.page}&limit=${this.limit}`;
      if (this.q) params += `&q=${this.q}`
      if (this.sort) params += `&sort=${this.sort}`;
      this.fetchPaymentList(params).then((data) => {
        if (data) {
          this.page = data.page;
          this.limit = data.limit;
          this.loading = false;
        }
      });
    },
    setOptions(opts: { page: number; itemsPerPage: number; sortBy: any }) {
      const sortArr = [...opts.sortBy];
      if (sortArr.length) {
        const field = sortArr[0].key;
        const sign = sortArr[0].order === 'asc' ? '' : '-';

        this.sort = `${sign}${field}`;
      }
      this.page = opts.page;
      this.limit = opts.itemsPerPage;
      this.fetchData();
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule("TRANSACTION_LIST")) {
      this.$store.registerModule("TRANSACTION_LIST", paymentStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("TRANSACTION_LIST");
  }
}
</script>