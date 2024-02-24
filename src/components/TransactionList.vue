<template>
  <v-dialog
    v-model="transactionDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="transaction" width="360px">
      <v-toolbar color="primary" title="Transaction Details" />
      <v-card-text>
        <table>
          <tr>
            <td valign="top" style="font-weight: bold; width: 90px;">Type:</td>
            <td>
              {{ transaction.type }}
              {{ transaction.payment?.ref ? ', ' + transaction.payment.ref : '' }}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Amount:</td>
            <td>{{ transaction.currency }} {{  transaction.amount.toLocaleString() }}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Tech Fee:</td>
            <td>{{ transaction.currency }} {{  transaction.payment?.techFee.toLocaleString() }}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Paid for:</td>
            <td>
              {{ transaction.payment?.campaign.title ?? 'n/a'}}
            </td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Paid By:</td>
            <td>{{ transaction.payment?.user.fullName ?? 'n/a'}}</td>
          </tr>
          <tr>
            <td valign="top" style="font-weight: bold;">Date:</td>
            <td>{{ readableDate(transaction.createdAt, 'MMM Do, YYYY, h:mmA') }}</td>
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
    :items="transactionPage.docs"
    :items-per-page="limit"
    :items-length="transactionPage.total"
    :loading="loading"
    height="80vh"
    loading-text="Fetching transactions..."
    no-data-text="No transactions to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.amount`]="{ item }">
      {{ item.currency }} {{  item.amount.toLocaleString() }}
    </template>
    <template v-slot:[`item.current`]="{ item }">
      {{ item.currency }} {{  item.current.toLocaleString() }}
    </template>
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY, h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-details" title="View Details" @click="transaction = item; transactionDialog = true" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import transactionStoreModule from "@/store/modules/transaction";
import { readableDate } from "@/utils/filters";

const { mapActions: transactionActions, mapGetters: transactionGetters } = createNamespacedHelpers("TRANSACTION_LIST");

export default {
  name: "TransactionList",
  props: {
    campaignId: {
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
        key: 'current',
        title: 'Balance',
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
    transaction: undefined as undefined | AppTransaction,
    transactionDialog: false,
    q: '',
    sort: '',
  }),
  computed: {
    ...transactionGetters(["transactionPage"]),
  },
  created() {
    this.fetchData();
  },
  methods: {
    ...transactionActions(["fetchTransactionList"]),
    readableDate,
    fetchData() {
      this.loading = true;
      let params = `?campaignId=${this.campaignId}&page=${this.page}&limit=${this.limit}`;
      if (this.q) params += `&q=${this.q}`
      if (this.sort) params += `&sort=${this.sort}`;
      this.fetchTransactionList(params).then((data) => {
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
      this.$store.registerModule("TRANSACTION_LIST", transactionStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("TRANSACTION_LIST");
  }
}
</script>