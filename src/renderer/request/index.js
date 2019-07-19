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
  getGroupMessage (groupId, limit, page) {
    return axios.get('chat/getGroupMessage/' + groupId + '/' + limit + '?page=' + page)
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
  },
  // 对话发送语音
  uploadRecorderByChat (chatId, data, config) {
    return axios.post('media/upload/recorder/chat/' + chatId, data, config)
  },
  // 群组发送语音
  uploadRecorderByGroup (groupId, data, config) {
    return axios.post('media/upload/recorder/group/' + groupId, data, config)
  },
  // 添加群或好友 param: friend_id | group_id & remarks
  addFriends (data) {
    return axios.post('chat/addFriends', Qs.stringify(data))
  },
  // 搜索好友和群 param: chat_number
  searchNo (data) {
    return axios.post('chat/searchNo', Qs.stringify(data))
  },
  // 加群加好友审核 param: audit
  audit (applyId, data) {
    return axios.post('chat/apply/audit/' + applyId, Qs.stringify(data))
  },
  // 获取好友和群申请列表 无参数
  getApplyList () {
    return axios.get('chat/apply/get')
  },
  // 重置申请的消息提醒  无参数
  resetNotifyBadge () {
    return axios.get('chat/apply/notify/reset')
  },
  // 获取好友列表  无参数
  getFriendList () {
    return axios.get('chat/friendsList/get')
  },
  // 获取登录用户的群列表  无参数
  getGroupList () {
    return axios.get('chat/groupList/get')
  },
  me () {
    return axios.post('auth/me')
  },
  // 更新用户信息 param: email name phone
  updateUserInfo (data) {
    return axios.post('auth/information/update', Qs.stringify(data))
  },
  // 修改密码 param: old_password & password & password_confirmation
  changePassword (data) {
    return axios.post('auth/password/change', Qs.stringify(data))
  },
  // 删除修改头像的临时文件 param: img_path
  deleteTempAvatar (data) {
    return axios.post('media/upload/avatar/delete', Qs.stringify(data))
  },
  // 确认修改头像 param: img_path
  saveTempAvatar (data) {
    return axios.post('media/upload/avatar/save', Qs.stringify(data))
  },
  // 获取群成员
  getGroupMember (groupId) {
    return axios.get('chat/getGroupMember/' + groupId)
  }
}
