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
  getUserChatMessage (data) {
    return axios.get('chat/getUserChatMessage', {params: data})
  },
  // 获取群历史聊天记录
  getGroupMessage (groupId, limit) {
    return axios.get('chat/getGroupMessage/' + groupId + '/' + limit)
  }
}
