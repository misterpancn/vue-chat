import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: require('@/view/auth/login').default
    },
    {
      path: '/chat',
      name: 'chat',
      component: require('@/view/chat/app').default
    },
    {
      path: '/register',
      name: 'register',
      component: require('@/view/auth/register').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
