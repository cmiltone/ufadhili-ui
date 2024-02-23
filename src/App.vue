<template>
  <v-app>
    <router-view />
    <notifications group="alerts" position="top right"/>
  </v-app>
</template>

<script lang="ts">
export default {
  computed: {
    toast() {
      return this.$store.getters.toast;
    },
    showToast() {
      return this.$store.getters.toast.show;
    },
  },
  watch: {
    showToast() {
      if (this.showToast && this.toast.text !== "Session expired") {
        this.$notify({
          group: "alerts",
          title: this.toast.title,
          text: this.toast.text,
          type: this.toast.type,
          duration: this.toast.timeout,
        });
        this.$store.dispatch("hideToast");
      }
    },
  }
}
</script>
