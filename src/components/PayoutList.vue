<template>
  <v-dialog
    v-model="payoutDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="payout">
      <v-toolbar color="primary" title="Wallet Payout Details" />
      <v-card-text>
        wallet payout {{  payout._id }}
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" variant="text" @click="payoutDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-data-table-server
    v-model:page="page"
    fixed-header
    :headers="headers"
    :items="payoutPage.docs"
    :items-per-page="limit"
    :items-length="payoutPage.total"
    :loading="loading"
    height="80vh"
    loading-text="Fetching payouts..."
    no-data-text="No payouts to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.amount`]="{ item }">
      {{ item.currency }} {{  item.amount.toLocaleString() }}
    </template>
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY, h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-details" title="View Details" @click="payout = item; payoutDialog = true" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import payoutStoreModule from "@/store/modules/payout";
import { readableDate } from "@/utils/filters";

const { mapActions: payoutActions, mapGetters: payoutGetters } = createNamespacedHelpers("PAYOUT_LIST");

export default {
  name: "PayoutList",
  props: {
    userId: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    tab: 'payouts',
    headers: [
      {
        key: 'amount',
        title: 'Amount',
        sortable: true,
      },
      {
        key: 'paymentMethod',
        title: 'Payout Method',
      },
      {
        key: 'status',
        title: 'Satus',
      },
      {
        key: 'createdAt',
        title: 'Date',
        sortable: true,
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
    payout: undefined as undefined | Payout,
    payoutDialog: false,
    q: '',
    sort: '',
  }),
  computed: {
    ...payoutGetters(["payoutPage"]),
  },
  created() {
    this.fetchData();
  },
  methods: {
    ...payoutActions(["fetchPayoutList"]),
    readableDate,
    fetchData() {
      this.loading = true;
      let params = `?userId=${this.userId}&page=${this.page}&limit=${this.limit}`;
      if (this.q) params += `&q=${this.q}`
      if (this.sort) params += `&sort=${this.sort}`;
      this.fetchPayoutList(params).then((data) => {
        if (data) {
          this.page = data.page;
          this.limit = data.limit;
          this.loading = false;
          this.sort = data.sort;
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
    if (!this.$store.hasModule("PAYOUT_LIST")) {
      this.$store.registerModule("PAYOUT_LIST", payoutStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("PAYOUT_LIST");
  },
}
</script>