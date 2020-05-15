<script>
  import Vue from 'vue'
  export default {
    props: ['session'],
    computed: {
      sessionUser () {
        let users = this.$store.getters.getUserList.filter(item => item.userId === this.session.userId)
        return users[0]
      }
    },
    methods: {
      // 筛选出用户头像
      avatar (item) {
        // 如果是自己发的消息显示登录用户的头像
        let user = item.self ? this.$store.getters.getUser : this.sessionUser
        return user && user.img
      },
      html (str) {
        return str.replace(/\\/g, '')
      }
    },
    filters: {
      // 将日期过滤为 hour:minutes
      time (date) {
        let d = date
        if (typeof date === 'string') {
          date = new Date(date)
        }
        if (date.getDay() !== new Date().getDay()) {
          return d
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
    }
  }
</script>

<template>
    <div v-if="session" class="m-message" v-scroll-bottom="session.messages">
        <ul>
            <li v-for="item in session.messages">
                <p v-if="item.showTime" class="time"><span>{{item.date | time}}</span></p>
                <div class="main" :class="{ self: item.self }">
                    <img class="avatar" width="30" height="30" :src="avatar(item)"/>
                    <div class="text" v-html="html(item.text)"></div>
                </div>
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
    }
</style>