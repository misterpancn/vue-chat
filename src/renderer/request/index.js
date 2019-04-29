import axios from './axios'
import Qs from 'qs'
export default {
  login (data) {
    return axios.post('auth/login', Qs.stringify(data))
  },
  register (data) {
    return axios.post('auth/register', Qs.stringify(data))
  },
  logout (data) {
    return axios.post('auth/logout', Qs.stringify(data))
  },
  getExpression () {
    return axios.get('lib/getExpression')
  }
}
