<script>
  import Vue from 'vue'
  import messageItem from './messageItem'
  export default {
    components: { messageItem },
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
      selectId () {
        return this.$store.getters.selectId
      },
      isGroup () {
        return this.$store.getters.isGroup
      }
    },
    methods: {
      // 获取后台消息记录
      loadingData () {
        this.loading = false
        this.$store.dispatch('getMessage', {
          selectId: this.selectId,
          isGroup: this.isGroup,
          users: this.$store.getters.getUser,
          limit: 50,
          saveLocal: true,
          page: 1,
          getLast: 1
        }).then((res) => {
          if (res.data.data.data && res.data.data.data.length === 0) {
            this.$Message.warning({
              content: this.$t('notify.noDataQueried'),
              duration: 3
            });
          }
          this.loading = true;
        }).catch((e) => {
          this.$Message.warning({
            content: this.$t('notifyTitle.errorOccurred'),
            duration: 3
          });
          this.loading = true;
        })
      },
      getUserInfo (item) {
        if (!item.self) {
          this.$store.dispatch('upUserInfoShow', true)
          this.$store.dispatch('setUserInfo', item.uid).catch((e) => {
            this.$Message.warning({
              content: this.$t('notifyTitle.errorOccurred'),
              duration: 3
            });
            this.$store.dispatch('upUserInfoShow', false)
          })
        }
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
    filters: {
      // 将日期过滤为 hour:minutes
      time (date) {
        date = new Date(parseInt(date) * 1000)
        if (date.getDate() !== new Date().getDate() || (date.getTime() - new Date().getTime() > 3600 * 24 * 1000)) {
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('en-US', {hour12: false})
        }
        return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
      }
    },
    watch: {
      session (val) {
        // 监听消息列表  当选择的聊天vuex中无消息记录  发送请求
        if (val.length === 0) {
          this.loadingData()
        }
      }
    },
    mounted () {
      // 当从系统消息切换到聊天消息时，不能触发session的watch事件  因为两次返回数据都是空数组  因此在钩子函数内进行初始化加载消息
      if (this.selectId > 0 && !this.$store.getters.getSelectNotify && this.session.length === 0) {
        this.loadingData()
      }
    }
  }
</script>

<template>
    <div v-if="session && session.messages !== undefined" class="m-message" v-scroll-bottom="session.messages">
        <ul>
            <li v-for="item in session.messages">
                <p v-if="item.showTime" class="time"><span>{{item.time | time}}</span></p>
                <div class="main" :class="{ self: item.self }">
                    <p v-if="isGroup" class="name"><span>{{item.user_name}}</span></p>
                    <img class="avatar" width="30" height="30" :src="item.photo" style="cursor: pointer" @click="getUserInfo(item)"/>
                    <message-item v-bind:item="item"></message-item>
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
        height: ~'calc(70% - 30px)';

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
                .rec-icon {
                    width: 2em;
                    position: absolute;
                    left: 0.4em;
                    height: 2em;
                    // top: 0.2em;
                }
                .recorder-time {
                    position: absolute;
                    width: calc(100% - 4em);
                    right: 0.6em;
                    text-align: right;
                }
            }
        }
        .name {
            padding: 1px 0;
            font-size: 12px;
        }
    }
</style>