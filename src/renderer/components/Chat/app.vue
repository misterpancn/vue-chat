<script>
  import card from './card'
  import list from './list'
  import msgTextarea from './msgTextarea'
  import message from './message'
  import name from './name'
  import menus from './menu'
  import ws from '@/request/websocket'
  import userInfoModal from './Modal/userInformation'

  export default {
    data () {
      return {}
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
            this.$Modal.confirm({
              title: this.$t('chat.notify.serverErrorLogout'), // 服务器出现异常，正在帮您退出登录
              loading: true,
              onOk: () => {
                this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId})
                  .then((response) => {
                    this.logoutHttpStatus(response)
                  }).catch((error) => {
                    console.log(error)
                    this.$Notice.error({
                      title: this.$t('notifyTitle.reminding'),
                      desc: error
                    })
                    this.$Modal.remove()
                  })
              }
            })
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
          default: break;
        }
      },
      logoutHttpStatus (response) {
        if (response.data.status_code === 200 || response.data.status_code === 401) {
          this.$Message.success(this.$t('notify.exitSuccess'))
          this.$Modal.remove()
          this.$router.push('/login')
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
        if (res.status_code === 200) {
          switch (res.data.type) {
            case 'init':
              // 初始化请求中返回 未读消息数
              if (res.data.badge_list) {
                this.$store.dispatch('initBadge', res.data.badge_list)
              }
              break;
            default: break;
          }
        }
      }
    },
    components: {
      card, list, msgTextarea, message, name, menus, userInfoModal
    }
  }
</script>

<template>
    <div style="height: 600px;">
        <div class="sidebar">
            <card></card>
            <list></list>
            <menus></menus>
        </div>
        <div class="main">
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
        border-radius: 3px;

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
            bottom: 0;
            left: 0;
        }
        .m-message {
            height: ~'calc(100% - 190px)';
        }
    }
</style>