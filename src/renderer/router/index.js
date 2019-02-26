import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: require('@/components/Login/login').default
    },
    {
      path: '/chat',
      name: 'chat',
      component: require('@/components/Chat/app').default
    },
    {
      path: '/register',
      name: 'register',
      component: require('@/components/Login/register').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
