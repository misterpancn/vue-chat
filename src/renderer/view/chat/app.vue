<script>
  import card from '@/components/Chat/card'
  import list from '@/components/Chat/list'
  import msgTextarea from '@/components/Chat/msgTextarea'
  import message from '@/components/Chat/message'
  import name from '@/components/Chat/name'
  import menus from '@/components/Chat/menu'
  import ws from '@/request/websocket'
  import userInfoModal from '@/components/Chat/Modal/userInformation'
  import systemNotify from '@/components/Chat/systemNotify'
  import {ipcRenderer} from 'electron'
  import config from '@/store/config/config'
  import rec from '@/media/recorder'

  export default {
    data () {
      return {
        isInit: true
      }
    },
    computed: {
      selectNotify () {
        return this.$store.getters.getSelectNotify
      }
    },
    created () {
      ws.connectWS()
      ws.init(this.callbackWs, this.httpCallback)
    },
    methods: {
      callbackWs (res) {
        console.log(res)
        switch (res.type) {
          case ws.messageType.notify:
            this.notifyHandle(res)
            break;
          case ws.messageType.error:
            this.logout()
            break;
          case ws.messageType.refresh_token:
            // token 过期自动刷新
            this.$store.dispatch('setToken', {
              type: res.token_type,
              token: res.data
            })
            this.$Modal.remove()
            break;
          case ws.messageType.message:
          case ws.messageType.audio:
            this.$store.dispatch('pushMessage', {
              response: res,
              thisUser: this.$store.getters.getUser
            })
            // 设置未读图标数字
            let selectId = this.$store.getters.selectId;
            let isGroup = this.$store.getters.isGroup;
            if (res.chat_id > 0 && (isGroup || (!isGroup && res.chat_id !== selectId))) {
              this.$store.dispatch('setBadge', {id: res.chat_id, is_group: false})
            } else if (res.group_id > 0 && (!isGroup || (isGroup && res.group_id !== selectId))) {
              this.$store.dispatch('setBadge', {id: res.group_id, is_group: true})
            }
            break;
          // 好友申请通知
          case ws.messageType.apply_notify:
            // 如何没有系统消息或者是选中了系统消息  则请求更新
            if (!this.$store.getters.getHaveNotify || this.$store.getters.getSelectNotify) {
              this.$store.dispatch('setNotifyList')
            }
            // 如何没有系统消息或者是未选中系统消息  添加提醒数
            if (!this.$store.getters.getHaveNotify || !this.$store.getters.getSelectNotify) {
              this.$store.dispatch('upNotifyBadge')
            }
            break;
          // 对方审核通过通知修改好友列表
          case ws.messageType.release_friend_list:
            this.$store.dispatch('getFriendsList', res.data)
            break;
          default: break;
        }
      },
      logoutHttpStatus (response) {
        if (response.data.status_code === 200 || response.data.status_code === 401) {
          this.$store.dispatch('deleteMessage')
          this.$store.dispatch('chatDataDestroy')
          this.$store.dispatch('destroyNotify')
          this.$store.dispatch('destroyModalStatus')
          this.$Message.success(this.$t('notify.exitSuccess'))
          this.$Modal.remove()
          rec.closeAudio()
          this.$router.push('/login')
          ipcRenderer.send('change-win-size', config.windowSize.login)
        } else {
          this.$Notice.warning({
            title: this.$t('notifyTitle.reminding'),
            desc: this.$t('chat.notify.exitFailed') // 退出失败
          })
          this.$Modal.remove()
        }
      },
      notifyHandle (res) {
        // 好友在线状态切换时调整  res 来自websocket
        if (res.data === 'login') {
          this.$store.dispatch('setUserStatus', {uid: res.uid, online: 1})
        }
        if (res.data === 'close') {
          this.$store.dispatch('setUserStatus', {uid: res.uid, online: 0})
        }
      },
      httpCallback (response) {
        let res = response.status !== 200 ? response.response.data : response.data;
        if (res.status_code !== 200) {
          this.logout()
        }
        switch (res.data.type) {
          case 'init':
            // 初始化请求中返回 未读消息数
            this.$Spin.hide();
            if (res.data.badge_list && res.status_code === 200) {
              this.isInit = false
              this.$store.dispatch('initBadge', res.data.badge_list)
              this.$store.dispatch('initNotifyList', res.data.apply_notify)
              this.$store.dispatch('initNotifyBadge', res.data.apply_notify_badge)
            } else {
              this.logout()
            }
            break;
          default: break;
        }
      },
      logout () {
        this.$Spin.hide();
        this.$Modal.confirm({
          title: this.$t('chat.notify.serverErrorLogout'), // 服务器出现异常，正在帮您退出登录
          loading: true,
          onOk: () => {
            this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId, badge: this.$store.getters.getBadgeList})
              .then((response) => {
                this.logoutHttpStatus(response)
              }).catch((error) => {
                this.logoutHttpStatus(error.response)
                this.$Notice.error({
                  title: this.$t('notifyTitle.reminding'),
                  desc: error
                })
                this.$Modal.remove()
              })
          }
        })
      }
    },
    mounted () {
      if (this.isInit) {
        this.$Spin.show();
      }
    },
    components: {
      card, list, msgTextarea, message, name, menus, userInfoModal, systemNotify
    }
  }
</script>

<template>
    <div style="height: 100%;">
        <div class="sidebar">
            <card></card>
            <list></list>
            <menus></menus>
        </div>
        <div class="main" v-if="selectNotify">
            <name></name>
            <system-notify></system-notify>
        </div>
        <div class="main" v-else>
            <name></name>
            <message></message>
            <msgTextarea></msgTextarea>
        </div>
        <userInfoModal></userInfoModal>
    </div>
</template>

<style lang="less">
    #app {
        overflow: hidden;

        .sidebar, .main {
            height: 100%;
        }
        .sidebar {
            position: relative;
            float: left;
            max-width: 200px;
            color: #f4f4f4;
            background-color: #2e3238;
        }
        .main {
            position: relative;
            overflow: hidden;
            background-color: #eee;
        }
        .m-text {
            position: absolute;
            width: 100%;
            left: 0;
            min-height: 160px;
            height: 30%;
        }
    }
</style>