<template>
  <v-layout>
    <v-main>
      <v-progress-linear color="primary" height="4px" :active="showProgressBar" :indeterminate="true" />
      <router-view />
    </v-main>
  </v-layout>
</template>

<script lang="ts">
  export default {
    name: "Auth",
    computed: {
      showProgressBar() {
        return this.$store.getters.loadingRequest;
      },
    },
  }
</script>
