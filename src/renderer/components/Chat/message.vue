<script>
  import Vue from 'vue'
  export default {
    data () {
      return {
        loading: true
      }
    },
    computed: {
      session () {
        var res = this.$store.getters.getMessageLocation(this.selectId, this.isGroup);
        return res
      },
      sessionUser () {
        let users = this.$store.getters.getUserList.filter(item => item.chat_id === this.session.sendTo)
        return users[0]
      },
      selectId () {
        return this.$store.getters.selectId
      },
      isGroup () {
        return this.$store.getters.isGroup
      }
    },
    methods: {
      // 筛选出用户头像
      avatar (item) {
        // 如果是自己发的消息显示登录用户的头像
        let user = item.self ? this.$store.getters.getUser : this.sessionUser
        return user && user.photo
      },
      html (str) {
        if (str !== undefined) {
          return str.replace(/\\/g, '')
        }
      },
      loadingData () {
        this.loading = false
        this.$store.dispatch('getMessage', {
          selectId: this.selectId,
          isGroup: this.isGroup,
          users: this.$store.getters.getUser
        }).then((res) => {
          console.log(res)
          if (res.data.data && res.data.data.length === 0) {
            this.$Message.warning({
              content: this.$t('notify.noDataQueried'),
              duration: 3
            });
          }
          this.loading = true;
        }).catch((e) => {
          console.log(e);
          this.loading = true;
        })
      },
      getUserInfo (item) {
        if (!item.self) {
          this.$Spin.show();
          this.$store.dispatch('setUserInfo', item.uid)
        }
      }
    },
    filters: {
      // 将日期过滤为 hour:minutes
      time (date) {
        date = new Date(parseInt(date) * 1000)
        if (date.getDay() !== new Date().getDay()) {
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('en-US', {hour12: false})
        }
        return date.getHours() + ':' + date.getMinutes()
      }
    },
    directives: {
      // 发送消息后滚动到底部
      'scroll-bottom' (el) {
        Vue.nextTick(() => {
          el.scrollTop = el.scrollHeight - el.clientHeight
        })
      }
    },
    watch: {
      session (val) {
        // 监听消息列表  当选择的聊天vuex中无消息记录  发送请求
        if (val.length === 0) {
          this.loadingData()
        }
      }
    }
  }
</script>

<template>
    <div v-if="session && session.messages !== undefined" class="m-message" v-scroll-bottom="session.messages">
        <ul>
            <li v-for="item in session.messages">
                <p v-if="item.showTime" class="time"><span>{{item.date | time}}</span></p>
                <div class="main" :class="{ self: item.self }">
                    <p v-if="isGroup" class="name"><span>{{item.user_name}}</span></p>
                    <img class="avatar" width="30" height="30" :src="item.photo" style="cursor: pointer" @click="getUserInfo(item)"/>
                    <div class="text" v-html="html(item.text)"></div>
                </div>
            </li>
        </ul>
    </div>
    <div v-else-if="session.length === 0 && selectId > 0" class="m-message">
        <ul>
            <li>
                <p class="time">
                    <a v-if="loading" @click="loadingData">{{$t('chat.loadingHistory')}}</a>
                    <span v-else>{{$t('notify.loading')}}</span>
                </p>
            </li>
        </ul>
    </div>
    <div v-else class="m-message"></div>
</template>

<style lang="less">
    .m-message {
        padding: 10px 15px;
        overflow-y: scroll;

        li {
            margin-bottom: 15px;
        }
        .time {
            margin: 7px 0;
            text-align: center;

            > span {
                display: inline-block;
                padding: 0 18px;
                font-size: 12px;
                color: #fff;
                border-radius: 2px;
                background-color: #dcdcdc;
            }
        }
        .avatar {
            float: left;
            margin: 0 10px 0 0;
            border-radius: 3px;
        }
        .text {
            display: inline-block;
            position: relative;
            padding: 0 10px;
            max-width: ~'calc(100% - 40px)';
            min-height: 30px;
            line-height: 2.5;
            font-size: 12px;
            text-align: left;
            word-break: break-all;
            background-color: #fafafa;
            border-radius: 4px;

            &:before {
                content: " ";
                position: absolute;
                top: 9px;
                right: 100%;
                border: 6px solid transparent;
                border-right-color: #fafafa;
            }
            img {
                vertical-align: middle
            }
        }

        .self {
            text-align: right;

            .avatar {
                float: right;
                margin: 0 0 0 10px;
            }
            .text {
                background-color: #b2e281;

                &:before {
                    right: inherit;
                    left: 100%;
                    border-right-color: transparent;
                    border-left-color: #b2e281;
                }
            }
        }
        .name {
            padding: 1px 0;
            font-size: 12px;
        }
    }
</style>