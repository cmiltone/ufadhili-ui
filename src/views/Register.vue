<template>
  <v-sheet width="300" class="mx-auto">
    <v-img :src="logo"/>
    <h3 style="text-align: center">Sign Up</h3>
    <v-form @submit.prevent="register" ref="registerForm">
      <v-text-field
        v-model="fullName"
        label="Full Name"
        :rules="getRules('Full name')"
      />

      <v-text-field
        v-model="email"
        label="Email"
        :rules="getRules('Email')"
      />
  
      <v-text-field
        v-model="phone"
        label="Phone"
        :rules="getRules('Phone')"
      />

      <v-text-field
        v-model="password"
        label="Password"
        :rules="getRules('Password')"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-btn type="submit" color="primary" block class="mt-2">Register</v-btn>

      <p>Already have an account? <v-btn variant="text" to="/auth/login" color="primary">Login</v-btn> </p>
    </v-form>
  </v-sheet>
</template>

<script lang="ts">
  import logo from "@/assets/logo.png";
  export default {
    name: 'Register',
    data: () => ({
      logo,
      fullName: '',
      email: '',
      phone: '',
      password: '',
      showPassword: false
    }),
    methods: {
      getRules(field: string) {
        return [
          (value: string) => {
            if (value) return true

            return`This ${field} is required`
          },
        ]
      },
      async register() {
        const { valid } = await (this.$refs as { registerForm: any }).registerForm.validate();

        if (!valid) return;
        this.$store.dispatch('register', {
          url: '/', data: {
            fullName: this.fullName,
            phone: this.phone,
            email: this.email,
            password: this.password,
        }});
      }
    }
  }
</script>