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
    return axios.get('lib/expression')
  },
  // 获取好友聊天记录
  getChatMessage (chatId, limit, page, getLast) {
    return axios.get('chat/message/list/chat/' + chatId + '/' + limit + '?page=' + page + '&getLast=' + getLast)
  },
  // 获取群历史聊天记录
  getGroupMessage (groupId, limit, page, getLast) {
    return axios.get('chat/message/list/group/' + groupId + '/' + limit + '?page=' + page + '&getLast=' + getLast)
  },
  // 获取用户信息
  getUserInfo (uid) {
    return axios.get('chat/user/info/' + uid)
  },
  // websocket初始化
  initChat (data) {
    return axios.post('chat/init', Qs.stringify(data))
  },
  // 对话消息接口 param: chat_id & content
  sendChatMessage (data) {
    return axios.post('chat/message/chat/send', Qs.stringify(data))
  },
  // 群消息接口 param: group_id & content
  sendGroupMessage (data) {
    return axios.post('chat/message/group/send', Qs.stringify(data))
  },
  // websocket断开接口
  chatConnectClose () {
    return axios.get('chat/connect/close');
  },
  // 重置消息提醒 param:chat_id or group id & is_group
  resetBadge (data) {
    return axios.post('chat/reset/badge', Qs.stringify(data))
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
    return axios.post('chat/friend/add', Qs.stringify(data))
  },
  // 添加群或好友 param: friend_id | group_id & remarks
  inviteToGroup (data) {
    return axios.post('chat/group/invite', Qs.stringify(data))
  },
  // 搜索好友和群 param: chat_number
  searchNo (data) {
    return axios.post('chat/number/search', Qs.stringify(data))
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
    return axios.get('chat/friend/list')
  },
  // 获取登录用户的群列表  无参数
  getGroupList () {
    return axios.get('chat/group/list')
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
    return axios.get('chat/member/group/' + groupId)
  },
  // 获取群里某个人的信息
  getGroupUserInfo (groupId, uid) {
    return axios.get('chat/group/' + groupId + '/uid/' + uid + '/info')
  },
  // 退出群
  quitTheGroup (groupId, uid) {
    return axios.delete('chat/group/' + groupId + '/uid/' + uid + '/quit')
  },
  // 解除好友
  unFriend (chatId) {
    return axios.delete('chat/friend/' + chatId + '/remove');
  },
  // 修改群昵称 param: group_id & name
  editGroupUserName (data) {
    return axios.post('chat/group/username/edit', Qs.stringify(data));
  },
  // 修改群名称 param: group_id & name
  editGroupName (data) {
    return axios.post('chat/group/name/edit', Qs.stringify(data));
  }
}
