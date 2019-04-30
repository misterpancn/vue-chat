import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import iview from 'iview'
import 'iview/dist/styles/iview.css'
import i18n from './lang'

Vue.use(iview)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>'
}).$mount('#app')
