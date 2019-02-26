import axios from './axios'
import Qs from 'qs'
export default {
  login (data) {
    return axios.post('login.php?action=login', Qs.stringify(data))
  }
}
