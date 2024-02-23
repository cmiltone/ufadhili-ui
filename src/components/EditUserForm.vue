<template>
  <v-form ref="form" class="mx-auto" style="max-width: 400px; margin: 10px;" @submit.prevent="saveUser">
    <div v-if="user">
      <p class="text-subtitle-2 text-center">
        <v-avatar v-if="user.avatarUrl" :image="user.avatarUrl" size="100"/>
        <v-avatar v-else :image="avatar"  height="50px" />
      </p>
      <p class="text-subtitle-2 text-center">{{ user.fullName }}</p>
      <p class="text-subtitle-2 text-center">Born {{ readableDate(user.dob, 'MMM Do, YYYY') }}</p>
    </div>
    <v-text-field
      v-model="fullName"
      :rules="getRules('Full Name')"
      label="Full Name"
    />

    <v-text-field
      v-model="phone"
      :rules="getRules('Phone Number')"
      label="Phone Number"
    />

    <v-text-field
      v-model="email"
      :rules="getRules('Email')"
      label="E-mail"
    />

    <v-select
      v-model="role"
      :items="roles"
      :rules="getRules('Role')"
      :multiple="true"
      label="Role"
    />

    <v-radio-group inline v-model="status" label="Status">
      <v-radio label="Active" value="active" />
      <v-radio label="Blocked" value="blocked" />
    </v-radio-group>

    <div class="justify-end">
      <v-btn
        color="secondary"
        variant="text"
        to="/users"
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

import userStoreModule from "@/store/modules/user";
import { readableDate } from "@/utils/filters";
import avatar from "@/assets/avatar.png";

const { mapActions: userActions } = createNamespacedHelpers("EDIT_USER");

export default {
  name: 'EditUserForm',
  props: {
    userId: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    avatar,
    fullName: "",
    phone: "",
    email: "",
    role: "",
    status: "",
    roles: ['admin', 'campaigner', 'contributor']
  }),
  computed: {
    user() {
      return this.$store.getters["EDIT_USER/getUser"](this.userId);
    }
  },
  created() {
    this.fetchUser(`?userId=${this.userId}`).then((user) => {
      this.fullName = user.fullName;
      this.phone = user.phone;
      this.email = user.email;
      this.role = user.role;
      this.status = user.status;
    });
  },
  methods: {
    ...userActions(["fetchUser", "updateUser", "deleteUser"]),
    readableDate,
    getRules(field: string): any[] {
      return [
        (v: string) =>
          !!v || `${field} field is required`,
      ];
    },
    async saveUser() {
      const { valid } = await (this.$refs as { form: any }).form.validate();

      if (!valid) return;
      this.updateUser({ id: this.user._id, user: {
        fullName: this.fullName,
        phone: this.phone,
        email: this.email,
        role: this.role,
        status: this.status,
      }}).then((user) => {
        if (user) this.$emit('saved', user);
      });
    },
  },
  beforeCreate() {
    if (!this.$store.hasModule("EDIT_USER")) {
      this.$store.registerModule("EDIT_USER", userStoreModule);
    }
  },
  beforeUnmount() {
    this.$store.unregisterModule("EDIT_USER");
  }
}
</script>