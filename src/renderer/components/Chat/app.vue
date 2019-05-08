<script>
  import card from './card'
  import list from './list'
  import msgTextarea from './msgTextarea'
  import message from './message'
  import name from './name'
  import menus from './menu'
  import ws from '@/request/websocket'

  export default {
    data () {
      return {
        // 搜索key
        search: '',
        // 选中的会话userID
        selectUserId: 'all'
      }
    },
    computed: {
      session () {
        var res = this.$store.getters.getMessageLocation(this.selectUserId);
        return res
      }
    },
    created () {
      ws.init(this.callbackWsError, this.exception)
    },
    methods: {
      callbackFromCard (res) {
        this.search = res
      },
      callbackFromList (res) {
        console.log(res)
        this.selectUserId = res.selectUserId
      },
      callbackWsError (res) {
        console.log(res)
        if (res.type === 'login') {
          return false;
        }
        if (res.type === 'error') {
          this.$Modal.confirm({
            title: this.$t('chat.notify.serverErrorLogout'), // 服务器出现异常，正在帮您退出登录
            loading: true,
            onOk: () => {
              this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId})
                .then((response) => {
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
        } else if (res.type === 'refresh_token') {
          // token 过期自动刷新
          this.$store.dispatch('setToken', {
            type: res.token_type,
            token: res.content
          })
          this.$Modal.remove()
        }
        // this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId})
      },
      exception (response) {
        if (response.code >= 500) {
          this.$Notice.error({
            title: this.$t('notifyTitle.serverException'),
            desc: response.mess
          })
        }
      }
    },
    components: {
      card, list, msgTextarea, message, name, menus
    }
  }
</script>

<template>
    <div style="height: 600px;">
        <div class="sidebar">
            <card :search.sync="search" v-on:listenToChildEvent="callbackFromCard"></card>
            <list :search="search" v-on:listenToChildEvent="callbackFromList" :select-user-id.sync="selectUserId"></list>
            <menus></menus>
        </div>
        <div class="main">
            <name :select-user-id.sync="selectUserId"></name>
            <message :session="session" ></message>
            <msgTextarea :session="session" :select-user-id.sync="selectUserId"></msgTextarea>
        </div>
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