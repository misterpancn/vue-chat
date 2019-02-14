<script>
  import store from './../../store/modules/store'
  import card from './card'
  import list from './list'
  import msgTextarea from './msgTextarea'
  import message from './message'
  import name from './name'
  import chat from './../../store/modules/chat'

  export default {
    data () {
      let serverData = store.fetch()
      return {
        // 登录用户
        user: serverData.user,
        // 用户列表
        userList: [],
        // 会话列表
        sessionList: serverData.sessionList,
        // 用户组
        groupList: [],
        // 搜索key
        search: '',
        // 选中的会话Index
        sessionIndex: 0,
        // 选中的会话userID
        selectUserId: 'allUsers'
      }
    },
    computed: {
      session () {
        var res = [];
        var _this = this;
        if (this.sessionList.length > 0) {
          this.sessionList.map(function (v) {
            if (v.sendTo === _this.selectUserId) {
              res = v
            }
          })
        }
        return res
      }
    },
    watch: {
      // 每当sessionList改变时，保存到localStorage中
      sessionList: {
        deep: true,
        handler () {
          store.save({
            user: this.user,
            userList: this.userList,
            sessionList: this.sessionList,
            groupList: this.groupList
          })
        }
      }
    },
    created () {
      chat.connectWS(this.callbackMes, this.exception)
    },
    methods: {
      callbackFromCard (res) {
        this.search = res
      },
      callbackFromList (res) {
        console.log(res)
        this.sessionIndex = res.item
        this.selectUserId = res.selectUserId
      },
      callbackMes (res) {
        if (typeof res.all_user === 'object' && res.all_user.length > 0) {
          let user = [];
          for (var i = 0; i < res.all_user.length; i++) {
            let c = {
              userId: parseInt(res.all_user[i].id),
              name: res.all_user[i].user_name,
              img: './../../../../static/img/2.png'
            }
            user.push(c)
          }
          this.userList = user;
          if (typeof res.all_group === 'object' && res.all_group.length > 0) {
            this.groupList = res.all_group;
          }
          this.pushSession(res)
          console.log(res)
        }
      },
      exception (response) {
        if (response.code >= 500) {
          this.$Notice.error({
            title: '服务异常',
            desc: response.mess
          })
        }
      },
      pushSession (res) {
        if (this.sessionList && this.sessionList.length > 0) {
          var _this = this;
          this.sessionList.map(function (item) {
            if (parseInt(res.send_to_uid) === item.sendTo || parseInt(res.from_uid) === item.sendTo || res.send_to_group === item.sendTo) {
              item.messages.push({
                text: res.content,
                date: res.time,
                self: parseInt(res.from_uid) === _this.user.userId
              })
            }
          })
        } else {
          this.sessionList = [
            {
              sendTo: res.send_to_uid > 0 ? res.send_to_uid : res.send_to_group,
              messages: [
                {
                  text: res.content,
                  date: res.time,
                  self: parseInt(res.from_uid) === this.user.userId
                }
              ]
            }
          ];
        }
      }
    },
    components: {
      card, list, msgTextarea, message, name
    }
  }
</script>

<template>
    <div style="height: 600px;">
        <div class="sidebar">
            <card :user="user" :search.sync="search" v-on:listenToChildEvent="callbackFromCard"></card>
            <list :user-list="userList" :session-index.sync="sessionIndex" :search="search"
                  v-on:listenToChildEvent="callbackFromList" :group-list="groupList" :select-user-id.sync="selectUserId"></list>
        </div>
        <div class="main">
            <name :select-user-id.sync="selectUserId" :user-list="userList" :group-list="groupList"></name>
            <message :session="session" :user="user" :user-list="userList"></message>
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
            float: left;
            width: 200px;
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