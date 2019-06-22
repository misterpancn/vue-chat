import axios from 'axios'
import config from '@/store/config/config'
// import store from '@/store'
var transport = config.openssl === false ? 'http://' : 'https://'
var instance = axios.create({
  baseURL: transport + config.serviceAddress + '/api/',
  timeout: 1000 * 60,
  headers: {
    'Accept': 'application/' + config.apiVersion + '+json',
    'Custom-Token': config.clientKey
  }
})
// 添加请求拦截器
instance.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  config.headers.Authorization = localStorage.getItem('tokenType') + ' ' + localStorage.getItem('token')
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response
}, function (error) {
  // 对响应错误做点什么
  // if (error.response.status === 401 || error.response.data.status_code === 401) store.commit('LOGOUT')
  return Promise.reject(error)
})
export default instance
