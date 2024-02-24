<template>
  <v-dialog
    v-model="delCampaignDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="campaign">
      <v-toolbar color="red" title="Delete Campaign!" />
      <v-card-text>
        <p class="text-subtitle-2 text-center">
          <v-img v-if="campaign?.coverImage" :src="getImage(campaign?.coverImage.filename)" height="50px"/>
          <v-img v-else :src="placeholderImg"  height="50px" />
        </p>
        <p class="text-subtitle-2 text-center">{{ campaign?.title }}</p>
        <!-- <p class="text-center">By {{ campaign?.owner.fullName }}</p> -->
        <div class="text-h6 pa-12">Confirm to Delete this Campaign</div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="green" variant="text" @click="delCampaignDialog = false">
          Cancel
        </v-btn>
        <v-btn
          variant="text"
          color="red"
          @click="delCampaign(campaign?._id)"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-row>
    <v-col>
      <h3>Campaigns</h3>
    </v-col>
    <v-col>
      <v-text-field v-model="q" prepend-icon="mdi-magnify" placeholder="Search Campaigns" @keyup="fetchData" />
    </v-col>
    <v-col>
      <v-btn to="/campaigns/create" v-if="user.role.includes('campaigner')">Create Campaign</v-btn>
    </v-col>
  </v-row>

  <v-data-table-server
    v-model:page="page"
    fixed-header
    :headers="headers"
    :items="campaignPage.docs"
    :items-per-page="limit"
    :items-length="campaignPage.total"
    :loading="loading"
    :search="q"
    height="70vh"
    loading-text="Fetching campaigns..."
    no-data-text="No campaigns to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.owner`]="{ item }">
      <v-avatar v-if="item.owner.avatarUrl" :image="item.owner.avatarUrl" height="50px"/>
      <v-avatar v-else :image="avatar"  height="50px" />
      {{ item.owner.fullName }}
    </template>
    <template v-slot:[`item.category`]="{ item }">
      <v-chip v-for="(r, i) in item.category" :key="i" class="ma-2" color="primary" variant="outlined">
        <v-icon start icon="mdi-shape" /> {{ r.title }}
      </v-chip>
    </template>
    <template v-slot:[`item.target`]="{ item }">
      {{ item.currency }} {{  numberWithCommas(item.target) }}
    </template>
    <template v-slot:[`item.raised`]="{ item }">
      {{ item.currency }} {{  numberWithCommas(item.raised) }}
    </template>
    <template v-slot:[`item.current`]="{ item }">
      {{ item.currency }} {{  numberWithCommas(item.current) }}
    </template>
    <template v-slot:[`item.category`]="{ item }">
      {{ item.category.title }}
    </template>
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY, h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-pencil-outline" :to="`/campaigns/edit/${item._id}`" title="Edit Campaign" />
      <v-btn size="x-small" color="red" icon="mdi-delete-alert" title="Delete Campaign" @click="delCampaignDialog = true; campaign = item" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import campaignStoreModule from "@/store/modules/campaign";
import { readableDate, numberWithCommas } from "@/utils/filters";
import placeholderImg from "@/assets/placeholder.png";
import avatar from "@/assets/avatar.png";

const API_URL = import.meta.env.VITE_API_URL;

const { mapActions: campaignActions, mapGetters: campaignGetters } = createNamespacedHelpers("CAMPAIGN_LIST");

export default {
  name: "CampaignList",
  data: () => ({
    placeholderImg,
    avatar,
    headers: [
      {
        key: 'title',
        title: 'Campaign',
        sortable: true,
        maxWidth: '150px'
      },
      {
        key: 'owner',
        title: 'By',
      },
      {
        key: 'status',
        title: 'Status',
      },
      {
        key: 'target',
        title: 'Target',
      },
      {
        key: 'raised',
        title: 'Raised',
      },
      {
        key: 'current',
        title: 'Available',
      },
      {
        key: 'category',
        title: 'Category',
      },
      {
        key: 'createdAt',
        title: 'Created',
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
    delCampaignDialog: false,
    campaign: undefined as undefined | Campaign,//campaignToJSON(),
    page: 1,
    limit: 10,
    loading: false,
    sort: '',
    q: '',
  }),
  computed: {
    ...campaignGetters(["campaignPage"]),
    user(): User {
      return this.$store.getters.user;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    ...campaignActions(["updateCampaign", "deleteCampaign", "fetchCampaignList"]),
    readableDate,
    numberWithCommas,
    delCampaign(campaignId?: string) {
      this.deleteCampaign(campaignId).then((campaign) => {
        if (campaign) this.delCampaignDialog = false;
      })
    },
    getImage(filename: string) {
      return `${API_URL}/v1/file/${filename}`;
    },
    fetchData() {
      this.loading = true;
      let params = `?page=${this.page}&limit=${this.limit}`;
      if (this.q) params += `&q=${this.q}`
      this.fetchCampaignList(params).then((data) => {
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
    if (!this.$store.hasModule("CAMPAIGN_LIST")) {
      this.$store.registerModule("CAMPAIGN_LIST", campaignStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("CAMPAIGN_LIST");
  }
}
</script>