<script>
  import card from '@/components/Chat/card'
  import list from '@/components/Chat/list'
  import msgTextarea from '@/components/Chat/msgTextarea'
  import message from '@/components/Chat/message'
  import menus from '@/components/Chat/menu'
  import ws from '@/request/websocket'
  import systemNotify from '@/components/Chat/systemNotify'
  import messageHistory from '@/components/Chat/Modal/messageHistory'
  import voiceCall from '@/components/Chat/Modal/voiceCall'
  import {ipcRenderer} from 'electron'
  import config from '@/store/config/config'
  import rec from '@/media/recorder'
  import appMenu from '@/components/AppMenu'
  import mesProcessing from '@/lib/mesProcessing'

  export default {
    data () {
      return {
        isInit: true,
        split: 0.7
      }
    },
    computed: {
      selectNotify () {
        return this.$store.getters.getSelectNotify
      }
    },
    watch: {
      split (val) {
        if (val > 0.71 || val < 0.3) {
          this.split = 0.71
        }
      }
    },
    created () {
      ws.connectWS()
      ws.init(this.callbackWs, this.httpCallback)
    },
    methods: {
      callbackWs (res) {
        mesProcessing.processing(this, res)
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
        if (res.data === 'inputting' || res.data === 'inputDone') {
          this.$store.dispatch('setInputNoticeList', res)
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
              this.$store.dispatch('setGroupList', res.data.group_list)
              this.$store.dispatch('setUserList', res.data.friend_list)
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
        this.$Modal.error({
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
      // 入口模板监听
      ipcRenderer.on('main-app-listen', (e, data) => {
        // 聊天文件下载进度
        if (data.type === 'download-file-progress') {
          if (data.data.code === 'ing') { // 进行中
            this.$store.dispatch('setChatFDP', Math.round(data.data.con * 100))
          }
          if (data.data.code === 'success') {
            let selectId = this.$store.getters.selectId;
            let isGroup = this.$store.getters.isGroup;
            let mesId = this.$store.getters.currentFileID;
            let user = this.$store.getters.getUser;
            if (!isGroup && selectId && mesId) {
              this.$store.dispatch('chatFileDown', {
                selectId: selectId,
                mesId: mesId,
                savePath: data.data.con
              }).then(() => {
                this.$store.dispatch('changeFileStatusMes', {
                  selectId: selectId,
                  isGroup: isGroup,
                  redis_id: mesId,
                  savePath: data.data.con
                })
              })
            } else if (isGroup && selectId && mesId) {
              this.$store.dispatch('groupFileDown', {
                selectId: selectId,
                mesId: mesId,
                savePath: data.data.con
              }).then(() => {
                this.$store.dispatch('changeFileStatusMes', {
                  selectId: selectId,
                  isGroup: isGroup,
                  redis_id: mesId,
                  savePath: data.data.con,
                  user_id: user.userId
                })
              })
            }
          }
          if (data.data.code === 'cancel') {
            this.$store.dispatch('setChatFDP', 0)
            this.$store.dispatch('setFileId', '')
          }
        }
      })
    },
    components: {
      card, list, msgTextarea, message, menus, systemNotify, messageHistory, voiceCall, appMenu
    },
    destroyed () {
      ipcRenderer.removeAllListeners('main-app-listen')
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
            <app-menu v-bind:showLogo="false"></app-menu>
            <system-notify></system-notify>
        </div>
        <div class="main" v-else>
            <app-menu v-bind:showLogo="false"></app-menu>
            <Split v-model="split" mode="vertical">
                <message slot="top" style="height: 100%"></message>
                <msgTextarea slot="bottom"></msgTextarea>
            </Split>
        </div>
        <message-history></message-history>
        <voice-call></voice-call>
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
        }
    }
</style>