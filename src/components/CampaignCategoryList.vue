<template>
  <v-dialog
    v-model="delCampaignCategoryDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="campaignCategory">
      <v-toolbar color="red" title="Delete Campaign Category!" />
      <v-card-text>
        <p class="text-subtitle-2 text-center">
          {{ campaignCategory.title }}
        </p>
        <!-- <p class="text-center">By {{ campaignCategory?.owner.fullName }}</p> -->
        <div class="text-h6 pa-12">Confirm to Delete this Campaign Category</div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="green" variant="text" @click="delCampaignCategoryDialog = false">
          Cancel
        </v-btn>
        <v-btn
          variant="text"
          color="red"
          @click="delCampaignCategory(campaignCategory?._id)"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="editModal"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="campaignCategory">
      <edit-campaign-category-form :category-id="campaignCategory._id" @saved="closeModal"/>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="createModal"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card>
      <v-card-text>
        <campaign-category-form @saved="closeModal"/>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-row>
    <v-col>
      <h3>CampaignCategorys</h3>
    </v-col>
    <v-col>
      <v-text-field v-model="q" prepend-icon="mdi-magnify" placeholder="Search Campaign Categories" @keyup="fetchData" />
    </v-col>
    <v-col>
      <v-btn @click="createModal = true" v-if="user.role.includes('admin')">Create Category</v-btn>
    </v-col>
  </v-row>

  <v-data-table-server
    v-model:page="page"
    fixed-header
    :headers="headers"
    :items="campaignCategoryPage.docs"
    :items-per-page="limit"
    :items-length="campaignCategoryPage.total"
    :loading="loading"
    :search="q"
    height="70vh"
    loading-text="Fetching Campaign Categories..."
    no-data-text="No campaignCategorys to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY, h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-account-edit-outline" @click="campaignCategory = item; editModal = true" title="Edit Category" />
      <v-btn size="x-small" color="red" icon="mdi-delete-alert" title="Delete Category" @click="campaignCategory = item; delCampaignCategoryDialog = true;" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import campaignCategoryStoreModule from "@/store/modules/campaignCategory";
import EditCampaignCategoryForm from "./EditCampaignCategoryForm.vue";
import CampaignCategoryForm from "./CampaignCategoryForm.vue";
import { readableDate } from "@/utils/filters";

const { mapActions: campaignCategoryActions, mapGetters: campaignCategoryGetters } = createNamespacedHelpers("CAMPAIGN_CATEGORY_LIST");

export default {
    name: "CampaignCategoryList",
    data: () => ({
        headers: [
            {
                key: 'title',
                title: 'title',
                sortable: true,
                maxWidth: '150px'
            },
            {
                key: 'status',
                title: 'Status',
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
        delCampaignCategoryDialog: false,
        campaignCategory: undefined as undefined | CampaignCategory,
        page: 1,
        limit: 10,
        loading: false,
        sort: '',
        q: '',
        createModal: false,
        editModal: false
    }),
    computed: {
        ...campaignCategoryGetters(["campaignCategoryPage"]),
        user(): User {
            return this.$store.getters.user;
        }
    },
    created() {
        this.fetchData();
    },
    methods: {
        ...campaignCategoryActions(["updateCampaignCategory", "deleteCampaignCategory", "fetchCampaignCategoryList"]),
        readableDate,
        delCampaignCategory(campaignCategoryId?: string) {
            this.deleteCampaignCategory(campaignCategoryId).then((campaignCategory) => {
                if (campaignCategory)
                    this.delCampaignCategoryDialog = false;
            });
        },
        fetchData() {
            this.loading = true;
            let params = `?page=${this.page}&limit=${this.limit}`;
            if (this.q)
                params += `&q=${this.q}`;
            this.fetchCampaignCategoryList(params).then((data) => {
                if (data) {
                    this.page = data.page;
                    this.limit = data.limit;
                }
                this.loading = false;
            });
        },
        setOptions(opts: {
            page: number;
            itemsPerPage: number;
            sortBy: any;
        }) {
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
        closeModal(saved: any) {
          if (saved) this.fetchData();
          this.editModal = false;
          this.createModal = false;
        }
    },
    beforeCreate() {
        if (!this.$store.hasModule("CAMPAIGN_CATEGORY_LIST")) {
            this.$store.registerModule("CAMPAIGN_CATEGORY_LIST", campaignCategoryStoreModule);
        }
    },
    beforeUnmount() {
        this.$store.unregisterModule("CAMPAIGN_CATEGORY_LIST");
    },
    components: { EditCampaignCategoryForm, CampaignCategoryForm }
}
</script>