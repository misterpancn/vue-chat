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
  getChatMessage (chatId, limit) {
    return axios.get('chat/getChatMessage/chat/' + chatId + '/' + limit)
  },
  // 获取群历史聊天记录
  getGroupMessage (groupId, limit) {
    return axios.get('chat/getGroupMessage/' + groupId + '/' + limit)
  },
  // 获取用户信息
  getUserInfo (uid) {
    return axios.get('chat/getUserInfo/' + uid)
  },
  // websocket初始化
  initChat (data) {
    return axios.post('chat/init', Qs.stringify(data))
  },
  // 对话消息接口 param: chat_id & content
  sendChatMessage (data) {
    return axios.post('chat/chatMessage', Qs.stringify(data))
  },
  // 群消息接口 param: group_id & content
  sendGroupMessage (data) {
    return axios.post('chat/groupMessage', Qs.stringify(data))
  },
  // websocket断开接口
  chatConnectClose () {
    return axios.get('chat/connectClose');
  },
  // 重置消息提醒 param:chat_id or group id & is_group
  resetBadge (data) {
    return axios.post('chat/resetBadge', Qs.stringify(data))
  }
}
