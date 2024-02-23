<template>
  <v-dialog
    v-model="transactionDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="walletTransaction" width="360px">
      <v-toolbar color="primary" title="Wallet Transaction Details" />
      <v-card-text>
        <table>
          <tr>
            <td valign="top" style="font-weight: bold; width: 90px;">Type:</td>
            <td>
              {{ walletTransaction.type }}
              {{ walletTransaction.payment?.ref ? ', ' + walletTransaction.payment.ref : '' }}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Amount:</td>
            <td>{{ walletTransaction.currency }} {{  walletTransaction.amount.toLocaleString() }}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Tech Fee:</td>
            <td>{{ walletTransaction.currency }} {{  walletTransaction.payment?.techFee.toLocaleString() }}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Paid for:</td>
            <td>
              {{ walletTransaction.payment?.campaignEnrolment?.campaign.title ?? 'n/a'}}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Paid By:</td>
            <td>{{ walletTransaction.payment?.campaignEnrolment?.user.fullName ?? 'n/a'}}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Date:</td>
            <td>{{ readableDate(walletTransaction.createdAt, 'MMM Do, YYYY, h:mmA') }}</td>
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

  <v-data-table-server
    v-model:page="page"
    fixed-header
    :headers="headers"
    :items="walletTransactionPage.docs"
    :items-per-page="limit"
    :items-length="walletTransactionPage.total"
    :loading="loading"
    height="80vh"
    loading-text="Fetching transactions..."
    no-data-text="No walletTransactions to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.amount`]="{ item }">
      {{ item.currency }} {{  item.amount.toLocaleString() }}
    </template>
    <template v-slot:[`item.walletBalance`]="{ item }">
      {{ item.currency }} {{  item.walletBalance.toLocaleString() }}
    </template>
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY, h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-details" title="View Details" @click="walletTransaction = item; transactionDialog = true" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import walletTransactionStoreModule from "@/store/modules/walletTransaction";
import { readableDate } from "@/utils/filters";

const { mapActions: walletTransactionActions, mapGetters: walletTransactionGetters } = createNamespacedHelpers("TRANSACTION_LIST");

export default {
  name: "WalletTransactionList",
  props: {
    userId: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    headers: [
      {
        key: 'amount',
        title: 'Amount',
        sortable: true,
      },
      {
        key: 'type',
        title: 'Type',
      },
      {
        key: 'walletBalance',
        title: 'Wallet Balance',
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
    walletTransaction: undefined as undefined | WalletTransaction,
    transactionDialog: false,
    q: '',
    sort: '',
  }),
  computed: {
    ...walletTransactionGetters(["walletTransactionPage"]),
    user() {
      return this.$store.getters.user;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    ...walletTransactionActions(["fetchWalletTransactionList"]),
    readableDate,
    fetchData() {
      this.loading = true;
      let params = `?userId=${this.userId}&page=${this.page}&limit=${this.limit}`;
      if (this.q) params += `&q=${this.q}`
      if (this.sort) params += `&sort=${this.sort}`;
      this.fetchWalletTransactionList(params).then((data) => {
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
      this.$store.registerModule("TRANSACTION_LIST", walletTransactionStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("TRANSACTION_LIST");
  }
}
</script>