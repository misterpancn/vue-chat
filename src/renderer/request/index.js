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
  // 获取表情库
  getExpression () {
    return axios.get('lib/getExpression')
  },
  // 获取好友聊天记录
  getChatMessage (data) {
    return axios.get('chat/getChatMessage', {params: data})
  },
  // 获取群历史聊天记录
  getGroupMessage (data) {
    return axios.get('chat/getGroupMes', {params: data})
  }
}
