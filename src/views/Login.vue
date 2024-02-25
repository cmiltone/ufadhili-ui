<template>
  <v-sheet width="300" class="mx-auto">
    <v-img :src="logo"/>
    <h3 style="text-align: center">Sign In</h3>
    <v-form @submit.prevent="login" ref="loginForm">
      <v-text-field
        v-model="identifier"
        label="Email or Phone"
        :rules="identifierRules"
      />

      <v-text-field
        v-model="password"
        label="Password"
        :rules="passwordRules"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-btn type="submit" color="primary" block class="mt-2">Login</v-btn>
      <p>Don't have an account? <v-btn variant="text" :to="`/auth/register?redirectUrl=${$route.query.redirectUrl ?? '/dashboard'}`" color="primary">Register</v-btn> </p>
    </v-form>
  </v-sheet>
</template>

<script lang="ts">
  import logo from "@/assets/logo.png";
  export default {
    name: 'Login',
    data: () => ({
      logo,
      identifier: '',
      identifierRules: [
        (value: string) => {
          if (value) return true

          return 'This field is required'
        },
      ],
      password: '',
      passwordRules: [
        (value: string) => {
          if (value) return true

          return 'Password is required'
        },
      ],
      showPassword: false
    }),
    methods: {
      async login() {
        const { valid } = await (this.$refs as { loginForm: any }).loginForm.validate();

        if (!valid) return;
        this.$store.dispatch('login', {
          url: this.$route.query.redirectUrl ?? '/dashboard',
          data: { identifier: this.identifier, password: this.password },
        });
      }
    }
  }
</script>