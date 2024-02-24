<template>
  <v-form ref="form" class="mx-auto" style="max-width: 500px; margin: 10px;" @submit.prevent="saveCampaign">
    <div v-if="campaign">
      <p class="text-subtitle-2 text-center">
        <v-img v-if="campaign.coverImage" :src="getImage(campaign.coverImage)" height="50px"/>
        <v-img v-else :src="placeholderImg"  height="50px" />
      </p>
      <p class="text-subtitle-2 text-center">{{ campaign.title }}</p>
      <p class="text-center">By {{ campaign.owner.fullName }}</p>
      <p class="text-subtitle-2 text-center">Added {{ readableDate(campaign.createdAt, 'MMM Do, YYYY, h:mma') }}</p>
    </div>
    <v-text-field
      v-model="title"
      :rules="getRules('Title')"
      label="Title"
    />

    <v-textarea
      v-model="description"
      :rules="getRules('Description')"
      label="Description"
    />

    <v-select
      v-model="currency"
      :items="currencies"
      :rules="getRules('Currency')"
      label="Currency"
    />

    <v-text-field
      v-model="target"
      type="number"
      label="Amount"
    />

    <v-autocomplete
      v-model="category"
      :items="campaignCategoryPage.docs"
      :rules="getRules('Category')"
      item-value="_id"
      item-title="title"
      label="Category"
      no-filter
      no-data-text="No category"
      prepend-inner-icon="mdi-magnify"
      @update:search="searchCategory"
    />


    <v-radio-group v-if="user.role.includes('admin')" inline v-model="status" label="Status">
      <v-radio label="Active" value="active" />
      <v-radio label="Inactive" value="inactive" />
    </v-radio-group>

    <div class="justify-end">
      <v-btn
        color="secondary"
        variant="text"
        to="/campaigns"
      >
        Cancel
      </v-btn>

      <v-btn
        class="me-4"
        type="submit"
        color="primary"
        variant="text"
      >
        Save
      </v-btn>
    </div>
  </v-form>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import campaignStoreModule from "@/store/modules/campaign";
import campaignCategoryStoreModule from "@/store/modules/campaignCategory";
import { readableDate } from "@/utils/filters";
import placeholderImg from "@/assets/placeholder.png";

const API_URL = import.meta.env.VITE_API_URL;

const { mapActions: campaignActions } = createNamespacedHelpers("EDIT_CAMPAIGN");
const {
  mapActions: campaignCategoryActions,
  mapGetters: campaignCategoryGetters
} = createNamespacedHelpers("CAMPAIGN_CATEGORY");

export default {
  name: 'EditCampaign',
  props: {
    campaignId: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    placeholderImg,
    title: "",
    description: "",
    target: 0,
    currency: "",
    status: "",
    category: "",
    currencies: ['KES'], //, 'USD'
  }),
  computed: {
    ...campaignCategoryGetters(["campaignCategoryPage"]),
      user(): User {
        return this.$store.getters.user;
      },
      campaign() {
        return this.$store.getters["EDIT_CAMPAIGN/getCampaign"](this.campaignId);
      }
  },
  created() {
    this.fetchCampaign(`?campaignId=${this.campaignId}`).then((campaign) => {
      this.title = campaign.title;
      this.description = campaign.description;
      this.target = campaign.target;
      this.category = campaign.category?._id ?? "";
      this.status = campaign.status;
      this.currency = campaign.currency;
    });
    this.fetchCampaignCategoryList();
  },
  methods: {
    ...campaignActions(["fetchCampaign", "updateCampaign", "deleteCampaign"]),
    ...campaignCategoryActions(["fetchCampaignCategoryList"]),
    readableDate,
    getRules(field: string): any[] {
      return [
        (v: string) =>
          !!v || `${field} field is required`,
      ];
    },
    async saveCampaign() {
      const { valid } = await (this.$refs as { form: any }).form.validate();

      if (!valid) return;

      this.updateCampaign({ id: this.campaign._id, campaign: {
        title: this.title,
        description: this.description,
        target: this.target,
        category: this.category,
        status: this.status,
      }});
    },
    searchCategory(q: string) {
      if (q) {
        this.fetchCampaignCategoryList(`?q=${q}`); // TODO: implement debounce
      }
    },
    getImage(filename: string) {
      return `${API_URL}/v1/file/${filename}`;
    }
  },
  beforeCreate() {
    if (!this.$store.hasModule("EDIT_CAMPAIGN")) {
      this.$store.registerModule("EDIT_CAMPAIGN", campaignStoreModule);
    }
    if (!this.$store.hasModule("CAMPAIGN_CATEGORY")) {
      this.$store.registerModule("CAMPAIGN_CATEGORY", campaignCategoryStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("EDIT_CAMPAIGN");
    this.$store.unregisterModule("CAMPAIGN_CATEGORY");
  }
}
</script>