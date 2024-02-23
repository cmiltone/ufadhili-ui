// Composables
import { isAuthenticated } from '@/utils/auth';
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta?.noAuth) {
    next();
  } else {
    if (isAuthenticated()) {
      next();
      return;
    }
    const redirectUrl = to.fullPath;
    let query = {};
    query = { ...query, redirectUrl };
    next({ path: "/auth", query: query });
  }
});

export default router
