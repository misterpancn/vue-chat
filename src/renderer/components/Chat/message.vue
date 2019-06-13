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
      // 获取后台消息记录
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
      },
      // 获取音频的长度并显示
      getDuration (e) {
        let time = e.currentTarget.duration;
        let style = this.setTime(time)
        this.$nextTick(() => {
          e.currentTarget.previousElementSibling.innerHTML = style.txt
          e.currentTarget.parentNode.style.width = style.width + '%'
        })
      },
      // 控制点击播放
      controlsAudio (e) {
        // e.currentTarget.nextElementSibling.play()
        // console.log(e.currentTarget.nextElementSibling.currentTime)
        // console.log(e.currentTarget.nextElementSibling.paused)
        var className = e.currentTarget.nextElementSibling.nextElementSibling.firstElementChild.className
        if (e.currentTarget.nextElementSibling.paused === false) {
          e.currentTarget.nextElementSibling.pause()
          if (className === 'ivu-icon ivu-icon-ios-barcode-outline') {
            e.currentTarget.nextElementSibling.nextElementSibling.firstElementChild.className = 'ivu-icon ivu-icon-ios-volume-up'
          }
          return false;
        }
        if (this.$refs.audio.length > 0) {
          for (let i = 0; i < this.$refs.audio.length; i++) {
            if (this.$refs.audio[i].paused === false) {
              this.$nextTick(() => {
                this.$refs.audio[i].load()
              })
            }
          }
        }
        if (this.$refs.recorderIcon.length > 0) {
          for (let i = 0; i < this.$refs.recorderIcon.length; i++) {
            let cn = this.$refs.recorderIcon[i].$el.className
            if (cn === 'ivu-icon ivu-icon-ios-barcode-outline') {
              this.$nextTick(() => {
                this.$refs.recorderIcon[i].$el.className = 'ivu-icon ivu-icon-ios-volume-up'
              })
            }
          }
        }
        e.currentTarget.nextElementSibling.play()
        e.currentTarget.nextElementSibling.nextElementSibling.firstElementChild.className = 'ivu-icon ivu-icon-ios-barcode-outline'
      },
      // audio时间更新钩子函数
      timeUpdate (e) {
        let time = e.currentTarget.currentTime
        if (time === 0) {
          return false;
        }
        let style = this.setTime(time)
        this.$nextTick(() => {
          e.currentTarget.previousElementSibling.innerHTML = style.txt
        })
      },
      // 播放完成
      endAudio (e) {
        e.currentTarget.load()
        e.currentTarget.nextElementSibling.firstElementChild.className = 'ivu-icon ivu-icon-ios-volume-up'
      },
      setTime (time) {
        let min = 0
        let sec = 0
        let w = 18;
        if (time > 60) {
          min = parseInt(time / 60)
          sec = Math.ceil(time - min * 60)
          w = 50
        } else {
          sec = Math.ceil(time);
          if (time > 50) {
            w = 40
          } else if (time > 40) {
            w = 35
          } else if (time > 30) {
            w = 30
          } else if (time > 20) {
            w = 25
          } else {
            w = 18
          }
        }
        let txt = '';
        if (min) {
          txt = min + '′' + sec + '″'
        } else {
          txt = sec + '″'
        }
        return {
          width: w,
          minute: min,
          second: sec,
          txt: txt
        }
      },
      audioSrc (src) {
        return src + '?t=' + localStorage.getItem('token')
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
                    <div v-if="item.type === 0" class="text" v-html="html(item.text)"></div>
                    <div class="text recorder" v-else-if="item.type === 7">
                        <!-- 注意：这里的html层级关系不可改 -->
                        <span ref="recorderTime" class="recorder-time" @click="controlsAudio($event)"></span>
                        <audio preload="auto" name="media" @canplay="getDuration($event)" ref="audio" @timeupdate="timeUpdate($event)"
                        @ended="endAudio($event)" hidden="true">
                            <source :src="audioSrc(item.text)" type="audio/x-wav">
                        </audio>
                        <span class="rec-icon"><Icon type="ios-volume-up" ref="recorderIcon" style="font-size: 2em" /></span>
                    </div>
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

        .recorder {
            max-width: 50%;
            min-width: 18%;
            .rec-icon {
                width: 2em;
                position: absolute;
                right: 0.4em;
                // top: 0.2em;
            }
            .recorder-time {
                position: absolute;
                width: calc(100% - 4em);
                cursor: pointer;
                min-width: 2em;
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