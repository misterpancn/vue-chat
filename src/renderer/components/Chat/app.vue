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
        selectUserId: 'allUsers'
      }
    },
    computed: {
      session () {
        var res = this.$store.getters.getMessageLocation(this.selectUserId);
        return res
      }
    },
    created () {
      ws.connectWS(this.exception)
    },
    methods: {
      callbackFromCard (res) {
        this.search = res
      },
      callbackFromList (res) {
        console.log(res)
        this.selectUserId = res.selectUserId
      },
      exception (response) {
        if (response.code >= 500) {
          this.$Notice.error({
            title: '服务异常',
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