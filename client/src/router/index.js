import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import Setting from '../components/HomeLayout/Setting.vue';
import Account from '../components/HomeLayout/Setting/Account.vue';

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }//ログイン必須
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/settings',
    name: 'setting',
    component: Setting,
  },
  {
    path: '/settings/account',
    name: 'account',
    component: Account,
    meta: { requiresAuth: true }
  }


];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

//ログインしていない場合、弾く
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    //ログインしていないのでログイン画面へ
    next("/login");
  } else {
    next();
  }
})

export default router;
