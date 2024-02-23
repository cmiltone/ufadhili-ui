<template>
  <v-layout>
      <v-app-bar
        color="primary"
        :elevation="2" rounded
      >

        <template v-slot:prepend>
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Ufadhili</v-app-bar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-bell</v-icon>
        </v-btn>

        <v-btn title="Logout" icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
        <!-- <v-menu v-model="appBarMenu">
          <v-list>
            <v-list-item>
              <v-list-item-title @click="logout">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu> -->
      </v-app-bar>
      <v-navigation-drawer v-model="drawer">
        <v-list-item
          v-if="user"
          :prepend-avatar="user?.avatarUrl"
          :title="user.fullName"
          nav
        />

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home-city" title="Home" value="home" to="/" />
          <v-list-item prepend-icon="mdi-cash-refund" title="Campaigns" value="campaigns" to="/campaigns" />
          <v-list-item v-if="user.role.includes('admin')" prepend-icon="mdi-cog" title="Categories" value="categories" to="/categories" />
          <v-list-item prepend-icon="mdi-cash" title="Payments" value="payments" to="/payments" />
          <v-list-item v-if="user.role.includes('admin')" prepend-icon="mdi-account-group-outline" title="Users" value="users" to="/users" />
          <v-list-item v-if="user.role.includes('admin')" prepend-icon="mdi-cog" title="Settings" value="settings" to="/settings" />
        </v-list>
      </v-navigation-drawer>
    <v-main scrollable style="background-color: #fbf4f4;">
      <v-progress-linear color="primary" height="4px" :active="showProgressBar" :indeterminate="true" />
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts">
  export default {
    name: "Full",
    data() {
      return {
        drawer: true,
        appBarMenu: false,
      }
    },
    computed: {
      user(): User {
        return this.$store.getters.user;
      },
      showProgressBar() {
        return this.$store.getters.loadingRequest;
      },
    },
    methods: {
      logout() {
        this.$store.dispatch('logout', { to: this.$route.fullPath, redirect: true });
      },
    },
  }
</script>
