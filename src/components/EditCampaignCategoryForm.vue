<template>
  <h3>Create Category</h3>
  <v-form ref="form" class="mx-auto" style="max-width: 400px; margin: 10px;" @submit.prevent="save">
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

    <div class="justify-end">
      <v-btn
        color="secondary"
        variant="text"
        @click="$emit('saved', false)"
      >
        Cancel
      </v-btn>

      <v-btn
        class="me-4"
        type="submit"
        color="primary"
        variant="text"
      >
        Update Category
      </v-btn>
    </div>
  </v-form>
</template>

<script lang="ts">
import { createNamespacedHelpers } from 'vuex';

import campaignCategoryStoreModule from "@/store/modules/campaignCategory";

const { mapActions: campaignCategoryActions } = createNamespacedHelpers("EDIT_CAMPAIGN_CATEGORY");

export default {
  name: 'EditCampaignCateogoryForm',
  props: {
    categoryId: {
      type: String,
      required: true,
    }
  },
  emits: ["saved"],
  data: () => ({
    title: "",
    description: "",
  }),
  computed: {
    category() {
      return this.$store.getters["EDIT_CAMPAIGN_CATEGORY/getCampaignCategory"](this.categoryId);
    }
  },
  created() {
    this.fetchCampaignCategory(`?campaignCategoryId=${this.categoryId}`).then((cat) => {
      if (cat) {
        this.description = cat.description;
        this.title = cat.title;
      }
    })
  },
  methods: {
    ...campaignCategoryActions(["updateCampaignCategory", "fetchCampaignCategory"]),
    getRules(field: string): any[] {
      return [
        (v: string) =>
          !!v || `${field} field is required`,
      ];
    },
    async save() {
      const { valid } = await (this.$refs as { form: any }).form.validate();

      if (!valid) return;
      this.updateCampaignCategory({
        id: this.categoryId,
        campaignCategory: {
          title: this.title,
          description: this.description,
        }
      }).then((campaignCategory) => {
        if (campaignCategory) {
          this.$emit("saved", true);
        }
      });
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule("EDIT_CAMPAIGN_CATEGORY")) {
      this.$store.registerModule("EDIT_CAMPAIGN_CATEGORY", campaignCategoryStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("EDIT_CAMPAIGN_CATEGORY");
  }
}
</script>