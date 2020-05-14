import ws from '@/request/websocket'
import {ipcRenderer} from 'electron'
import rec from '@/media/recorder'
var mesProcess = {
  processing (appVue, res) {
    let _this = appVue
    switch (res.type) {
      case ws.messageType.notify:
        _this.notifyHandle(res)
        break;
      case ws.messageType.error:
        _this.logout()
        break;
      case ws.messageType.refresh_token:
        // token 过期自动刷新
        _this.$store.dispatch('setToken', {
          type: res.token_type,
          token: res.data
        })
        _this.$Modal.remove()
        break;
      // 消息类通知  包括文本 语音 图片 文件
      case ws.messageType.message:
      case ws.messageType.audio:
      case ws.messageType.img:
      case ws.messageType.file:
        _this.$store.dispatch('pushMessage', {
          response: res,
          thisUser: _this.$store.getters.getUser
        })
        // 设置未读图标数字
        let selectId = _this.$store.getters.selectId;
        let isGroup = _this.$store.getters.isGroup;
        if (res.chat_id > 0 && (isGroup || (!isGroup && res.chat_id !== selectId))) {
          _this.$store.dispatch('setBadge', {id: res.chat_id, is_group: false})
        } else if (res.group_id > 0 && (!isGroup || (isGroup && res.group_id !== selectId))) {
          _this.$store.dispatch('setBadge', {id: res.group_id, is_group: true})
        }
        ipcRenderer.send('show-win-notify', {show: true})
        break;
      // 好友申请通知
      case ws.messageType.apply_notify:
        // 如何没有系统消息或者是选中了系统消息  则请求更新
        if (!_this.$store.getters.getHaveNotify || _this.$store.getters.getSelectNotify) {
          _this.$store.dispatch('setNotifyList')
        }
        // 如何没有系统消息或者是未选中系统消息  添加提醒数
        if (!_this.$store.getters.getHaveNotify || !_this.$store.getters.getSelectNotify) {
          _this.$store.dispatch('upNotifyBadge')
        }
        break;
      // 对方审核通过通知修改好友列表
      case ws.messageType.release_friend_list:
        _this.$store.dispatch('getFriendsList', res.data)
        break;
      // 视频聊天发起
      case ws.messageType.video_call:
        if (rec.isSupport) {
          _this.$store.dispatch('setIsGroup', res.group_id > 0)
          _this.$store.dispatch('setSelectId', res.chat_id ? res.chat_id : res.group_id)
          // 语音通话  默认是视频
          if (res.data.type && res.data.type === 'voice') {
            _this.$store.dispatch('voiceInfo', {mes: res, role: 'answer'}).then(() => {
              _this.$store.dispatch('voiceCallShow', true)
            })
          } else {
            _this.$store.dispatch('videoInfo', {mes: res, role: 'answer'}).then(() => {
              ipcRenderer.send('show-win-modal', {
                video_info: {mes: res, role: 'answer'},
                select_id: (res.chat_id ? res.chat_id : res.group_id),
                is_group: res.group_id > 0,
                type: 'video'
              })
            })
          }
        } else {
          // 当受到好友视频通知时，自己设备不支持，直接通知拒绝
          let _that = _this;
          _this.$Modal.error({
            title: res.user_name + _this.$t('chat.video.inviteToVideo') + ',' + _this.$t('chat.deviceNotSupport'),
            loading: true,
            onOk: function () {
              let selectId = _that.$store.getters.selectId;
              let modal = this;
              _that.$store.dispatch('sendChatMes', {
                chat_id: selectId,
                content: 'Video Call',
                video_call: 2,
                answer_status: 'refuse'
              }).then((res) => {
                _that.$Modal.remove()
              }).catch((e) => {
                modal.$data.buttonLoading = false;
                _that.$Message.error(_that.$t('chat.messageSendFailed'))
                _that.$Modal.remove()
              })
            }
          })
        }
        break;
      // 视频聊天应答
      case ws.messageType.video_answer:
        if (res.data.type && res.data.type === 'voice') {
          let voiceInfo = _this.$store.getters.getVoiceInfo
          _this.$store.dispatch('voiceInfo', {mes: res, role: voiceInfo.role, answer: res.data.content}).then(() => {
            // _this.$store.dispatch('voiceCallShow', true)
          })
        } else {
          let videoInfo = _this.$store.getters.getVideoInfo
          _this.$store.dispatch('videoInfo', {mes: res, role: videoInfo.role, answer: res.data.content})
            .then(() => {
              ipcRenderer.send('forwarded-message-to-video', {
                video_info: {mes: res, role: videoInfo.role, answer: res.data.content},
                select_id: (res.chat_id ? res.chat_id : res.group_id),
                is_group: res.group_id > 0,
                type: 'init'
              })
            })
        }
        break;
      // 视频聊天关闭通知
      case ws.messageType.video_close:
        if (res.data.type && res.data.type === 'voice') {
          let voiceInfo = _this.$store.getters.getVoiceInfo
          _this.$store.dispatch('voiceInfo', {mes: res, role: voiceInfo.role, status: 'close'})
        } else {
          ipcRenderer.send('forwarded-message-to-video', {
            status: 'close',
            type: 'notify'
          })
        }
        break;
      default: break;
    }
  }
}
export default mesProcess
