<template>
  <v-form ref="form" class="mx-auto" style="max-width: 400px; margin: 10px;" @submit.prevent="saveCampaign">
    <v-text-field
      v-model="title"
      :rules="getRules('Title')"
      label="Title"
    />

    <v-textarea
      label="Description"
      v-model="description"
      placeholder="Type something..."
      :rules="getRules('Description')"
    />

    <v-autocomplete
      label="Category"
      :items="campaignCategoryPage.docs"
      item-title="title"
      item-value="_id"
      v-model="category"
      :rules="getRules('Categoires')"
      laceholder="Search category"
    />
    
    <v-file-input
      accept="image/png, image/jpeg"
      prepend-icon="mdi-camera"
      placeholder="Select image"
      show-size
      label="Cover Image"
      ref="imageRef"
      :rules="imagesRules('Cover Image')"
    />

    <h5>Target</h5>
    <v-row>
      <v-col cols="6">
        <v-select
          label="Currency"
          v-model="currency"
          :items="['KES']"
          placeholder="Select currency"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="Amount"
          v-model.number="amount"
          type="number"
          :min="0"
          placeholder="Enter amount"
        />
      </v-col>
    </v-row>

    <div class="justify-end">
      <v-btn
        color="secondary"
        variant="text"
        to="/campaign"
      >
        Back
      </v-btn>

      <v-btn
        class="me-4"
        type="submit"
        color="primary"
        variant="text"
      >
        Create Campaign
      </v-btn>
    </div>
  </v-form>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import campaignStoreModule from "@/store/modules/campaign";
import coverImage from "@/assets/avatar.png";
import campaignCategoryModule from '@/store/modules/campaignCategory';

const { mapActions: campaignActions } = createNamespacedHelpers("EDIT_CAMPAIGN");
const { mapActions: categoryActions, mapGetters: categoryGetters } = createNamespacedHelpers("CAMPAIGN_CATEGORIES");
const fileLimit = 2 * 1024 * 1024;

export default {
  name: 'CampaignForm',
  data: () => ({
    coverImage,
    title: "",
    description: "",
    category: [] as string[],
    currency: "",
    amount: 0,
    images: [],
    categoryDialog: false,
    categoryId: "",
    imageDialog: false,
  }),
  computed: {
    ...categoryGetters(["campaignCategoryPage"]),
    user() {
      return this.$store.getters.user;
    },
  },
  created() {
    this.fetchCampaignCategoryList('?status=active&limit=1000');
  },
  methods: {
    ...campaignActions(["createCampaign", "uploadCampaignImage"]),
    ...categoryActions(["fetchCampaignCategoryList"]),
    getRules(field: string): any[] {
      return [
        (v: string) =>
          !!v || `${field} field is required`,
      ];
    },
    imagesRules(field: string): any[] {
      return [
        (v: File[]) =>
          !!v || `${field} field is required`,
          (v: File[]) => v.every(f => f.size <= fileLimit) || `${field} File is must be less than 2MBs`,
      ];
    },
    async saveCampaign() {
      const { valid } = await (this.$refs as { form: any }).form.validate();

      if (!valid) return;
      this.createCampaign({
        ownerId: this.user._id,
        title: this.title,
        description: this.description,
        category: this.category,
        target: this.amount,
        currency: this.currency,
      }).then((campaign) => {
        if (campaign) {
          this.uploadCoverImage(campaign._id);
        }
      });
    },
    async uploadCoverImage(campaignId: string) {
      const files : FileList = (this.$refs['imageRef'] as any).files;
      if(files.length) {
            const formData = new FormData();
            for (var i = 0; i <files.length; i++ ) {
              formData.append("file", files[i]);
            }
            this.uploadCampaignImage({
              id: campaignId,
              image: formData,
            }).then((campaign) => {
              if (campaign) {
                location.reload();
              }
            });
          }
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule("EDIT_CAMPAIGN")) {
      this.$store.registerModule("EDIT_CAMPAIGN", campaignStoreModule);
    }
    if (!this.$store.hasModule("CAMPAIGN_CATEGORIES")) {
      this.$store.registerModule("CAMPAIGN_CATEGORIES", campaignCategoryModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("EDIT_CAMPAIGN");
    this.$store.unregisterModule("CAMPAIGN_CATEGORIES");
  }
}
</script>