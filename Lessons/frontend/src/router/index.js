import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Menu from '../views/Menu.vue'
import SignIn from '../views/SignIn.vue'
import UserOrder from '../views/UserOrder.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/sign_in',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
  },
  {
    path: '/user_order',
    name: 'UserOrder',
    component: UserOrder,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})
/**
 * Проверить, что пользователь авторизован (в store.state.auth.isAuth)
 * Если !isAuth - ищем в localStorage. Если не найден - устанавливаем axios default header, isAuth - true.
 * Возможные варианты:
 * 1.зашел по url и не авторизован
 *  а)Редирект на /sign_in
 *  б)ввод логина и пароля
 *  в)сохранение токена в localStorage
 *  г)установка для axios header по умолчанию
 *  д)редирект на страницу(либо на нашу, либо на ту, на которую пытался зайти изначально)
 * 2.зашел по url, есть токен в localStorage
 *  а)Нужно проверить 
 */
router.beforeEach((to,from,next)=>{
  console.log('isAuth: ',store.state.auth.isAuth)
  console.log(store.state.auth.isAuth)
  console.log('to: ',to)
  console.log('from: ',from)
  
  const token=localStorage.getItem('token')
  if (token){
    store.dispatch('auth/setAuth', token)
    if(to.name==='SignIn'){
      next({name:'Home'})
    } else {
      next()
    }
  }
  else {next({name: 'SignIn'})}

})
export default router
