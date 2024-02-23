<template>
  <v-dialog
    v-model="delUserDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="user">
      <v-toolbar color="red" title="Delete User!" />
      <v-card-text>
        <p class="text-subtitle-2 text-center">
          <v-avatar v-if="user?.avatarUrl" :image="user?.avatarUrl" height="50px"/>
          <v-avatar v-else :image="avatar"  height="50px" />
        </p>
        <p class="text-subtitle-2 text-center">{{ user?.fullName }}</p>
        <div class="text-h6 pa-12">Confirm to Delete this User</div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="green" variant="text" @click="delUserDialog = false">
          Cancel
        </v-btn>
        <v-btn
          variant="text"
          color="red"
          @click="delUser(user?._id)"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="editUserDialog"
    transition="dialog-bottom-transition"
    width="auto"
  >
    <v-card v-if="userId" width="390px">
      <v-toolbar color="primary" title="Edit User" />
      <v-card-text>
        <edit-user-form :user-id="(userId)" @saved="editUserDialog = false" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-row>
    <v-col>
      <h3>Users</h3>
    </v-col>
    <v-col>
      <v-text-field v-model="q" prepend-icon="mdi-magnify" placeholder="Search Users" @keyup="fetchData" />
    </v-col>
  </v-row>

  <v-data-table-server
    v-model:page="page"
    fixed-header
    :headers="headers"
    :items="userPage.docs"
    :items-per-page="limit"
    :items-length="userPage.total"
    :loading="loading"
    :search="q"
    height="70vh"
    loading-text="Fetching users..."
    no-data-text="No users to display"
    class="elevation-1"
    @update:options="setOptions"
  >
    <template v-slot:[`item.fullName`]="{ item }">
      <v-avatar v-if="item.avatarUrl" :image="item.avatarUrl" height="50px"/>
      <v-avatar v-else :image="avatar"  height="50px" />
      {{ item.fullName }}
    </template>
    <template v-slot:[`item.role`]="{ item }">
      <v-chip v-for="(r, i) in item.role" :key="i" class="ma-2" color="primary" variant="outlined">
        <v-icon start icon="mdi-account-outline" /> {{ r }}
      </v-chip>
    </template>
    <template v-slot:[`item.createdAt`]="{ item }">
      {{ readableDate(item.createdAt, 'MMM Do, YYYY h:mmA') }}
    </template>
    <template v-slot:[`item.action`]="{ item }">
      <v-btn size="x-small" color="primary" icon="mdi-account-edit-outline" @click="userId = item._id; editUserDialog = true" title="Edit User" />
      <v-btn size="x-small" color="primary" icon="mdi-unfold-more-vertical" :to="`/users/${item._id}`" title="View User" />
      <v-btn size="x-small" color="red" icon="mdi-delete-alert" title="Delete User" @click="delUserDialog = true; user = item" />
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { createNamespacedHelpers } from "vuex";

import userStoreModule, { userToJSON } from "@/store/modules/user";
import { readableDate } from "@/utils/filters";
import avatar from "@/assets/avatar.png";
import EditUserForm from './EditUserForm.vue';

const { mapActions: userActions, mapGetters: userGetters } = createNamespacedHelpers("USER_LIST");

export default {
  name: "UserList",
  components: { EditUserForm },
  data: () => ({
    avatar,
    headers: [
      {
        key: 'fullName',
        title: 'User',
        sortable: true,
        maxWidth: '150px'
      },
      {
        key: 'role',
        title: 'Role',
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
    delUserDialog: false,
    editUserDialog: false,
    userId: '',
    user: userToJSON(),
    page: 1,
    limit: 10,
    loading: false,
    sort: '',
    q: '',
  }),
  computed: {
    ...userGetters(["userPage"]),
  },
  // watch: {
  //   page: "fetchData",
  // },
  created() {
    this.fetchData();
  },
  methods: {
    ...userActions(["updateUser", "deleteUser", "fetchUserList"]),
    readableDate,
    delUser(userId?: string) {
      this.deleteUser(userId).then((user) => {
        if (user) this.delUserDialog = false;
      })
    },
    fetchData() {
      this.loading = true;
      let params = `?page=${this.page}&limit=${this.limit}`;
      if (this.q) params += `&q=${this.q}`
      if (this.sort) params += `&sort=${this.sort}`;
      this.fetchUserList(params).then((data) => {
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
    if (!this.$store.hasModule("USER_LIST")) {
      this.$store.registerModule("USER_LIST", userStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("USER_LIST");
  }
}
</script>