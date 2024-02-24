import { RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layouts/Outlet.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import(/* webpackChunkName: "landing" */ '@/views/Landing.vue'),
        meta: {
          noAuth: true
        },
      },
      {
        path: ':campaignId',
        name: 'View Campaign',
        props: true,
        component: () => import(/* webpackChunkName: "view-campaign" */ '@/views/ViewCampaign.vue'),
        meta: {
          noAuth: true
        },
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/Full.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
      },
    ],
  },
  {
    path: '/users',
    component: () => import('@/layouts/Full.vue'),
    children: [
      {
        path: '',
        name: 'Users',
        component: () => import(/* webpackChunkName: "users" */ '@/views/Users.vue'),
      },
      {
        path: ':userId',
        name: 'Edit User',
        props: true,
        component: () => import(/* webpackChunkName: "edit-user" */ '@/views/User.vue'),
      },
    ],
  },
  {
    path: '/campaigns',
    component: () => import('@/layouts/Full.vue'),
    children: [
      {
        path: '',
        name: 'Campaigns',
        component: () => import(/* webpackChunkName: "campaigns" */ '@/views/Campaigns.vue'),
      },
      {
        path: 'create',
        name: 'Create Campaign',
        component: () => import(/* webpackChunkName: "create-campaign" */ '@/views/CreateCampaign.vue'),
      },
      {
        path: 'edit/:campaignId',
        props: true,
        name: 'Edit Campaign',
        component: () => import(/* webpackChunkName: "edit-campaign" */ '@/views/EditCampaign.vue'),
      },
      {
        path: ':campaignId',
        name: 'Campaign',
        props: true,
        component: () => import(/* webpackChunkName: "campaign" */ '@/views/Campaign.vue'),
      },
    ],
  },
  {
    path: '/categories',
    component: () => import('@/layouts/Full.vue'),
    children: [
      {
        path: '',
        name: 'Categories',
        component: () => import(/* webpackChunkName: "campaign-categories" */ '@/views/CampaignCategories.vue'),
      },
    ],
  },
  {
    path: '/payments',
    component: () => import('@/layouts/Full.vue'),
    children: [
      {
        path: '',
        name: 'Payments',
        component: () => import(/* webpackChunkName: "payments" */ '@/views/Payments.vue'),
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('@/layouts/Full.vue'),
    children: [
      {
        path: '',
        name: 'Settings',
        component: () => import(/* webpackChunkName: "app-setting" */ '@/views/AppSetting.vue'),
      },
    ],
  },
  {
    path: '/auth',
    meta: {
      noAuth: true
    },
    component: () => import('@/layouts/Auth.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import(/* webpackChunkName: "register" */ '@/views/Register.vue'),
      }
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    meta: {
      noAuth: true
    },
    component: () => import('@/layouts/Auth.vue'),
    children: [
      {
        path: '',
        name: 'Not Found',
        component: () => import(/* webpackChunkName: "not-found" */ '@/views/NotFound.vue'),
      }
    ],
  },
]
