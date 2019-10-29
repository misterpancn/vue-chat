<script>
  import chat from '@/request/websocket'
  import webrtc from '@/request/webrtc'
  export default {
    data () {
      return {
        connectStatus: true,
        message: '正在尝试与对方建立连接......',
        sendCont: 'Video Call',
        footerHide: true,
        videoBoxShow: false,
        answerLoading: false
      }
    },
    computed: {
      show: {
        get: function () {
          let s = this.$store.getters.getVideoCallShow
          if (s && this.videoInfo.role === 'offer') {
            this.call()
          }
          if (s && this.videoInfo.role === 'answer') {
            this.footerHide = false
            this.message = this.videoInfo.mes.user_name + '邀请你视频聊天'
          }
          return this.$store.getters.getVideoCallShow
        },
        set: function (val) {
          this.$store.dispatch('videoCallShow', val)
        }
      },
      videoInfo () {
        return this.$store.getters.getVideoInfo
      },
      selectId () {
        return this.$store.getters.selectId
      },
      isGroup () {
        return this.$store.getters.isGroup
      }
    },
    methods: {
      close () {
        this.show = false
        this.connectStatus = true;
        this.message = '正在尝试与对方建立连接......';
        this.sendCont = 'Video Call';
        this.footerHide = true
        this.videoBoxShow = false
        this.answerLoading = false
        webrtc.closePeer()
      },
      call () {
        if (this.selectId === 0) {
          this.message = this.$t('chat.selectSendObject')
          this.connectStatus = false;
        } else {
          this.$store.dispatch('sendChatMes', {
            chat_id: this.selectId,
            content: this.sendCont,
            video_call: 1
          }).then((res) => {
            if (res.data.data.status === 'failed') {
              this.messageFn(res.data.data.message)
              chat.localPush(this.sendCont + ' failed', this.selectId, 0)
            }
          }).catch((e) => {
            this.messageFn(this.$t('chat.messageSendFailed'))
          })
        }
      },
      answer (status) {
        this.answerLoading = true
        this.$store.dispatch('sendChatMes', {
          chat_id: this.selectId,
          content: this.sendCont,
          video_call: 2,
          answer_status: status
        }).then((res) => {
          if (res.data.data.status === 'failed') {
            this.messageFn(res.data.data.message)
          }
          if (status === 'agree') {
            this.messageFn('正在尝试与对方建立连接......')
            this.openVideo(false)
          }
        }).catch((e) => {
          this.messageFn(this.$t('chat.messageSendFailed'))
        })
        if (status === 'refuse') {
          this.close()
        }
      },
      async openVideo (isOffer) {
        this.answerLoading = false
        if (!webrtc.status) {
          this.messageFn(webrtc.error)
          return false;
        }
        if (isOffer) {
          await webrtc.offer()
        }
        if (!webrtc.status || !webrtc.isSetICE) {
          this.messageFn(webrtc.error)
          return false;
        }
        this.videoBoxShow = true
      },
      messageFn (mes) {
        this.message = mes
        this.connectStatus = false;
        this.footerHide = true
        this.answerLoading = false
      }
    },
    watch: {
      videoInfo: function (val) {
        if (val.answer === 'refuse') {
          this.messageFn('对方已拒绝')
        }
        if (val.answer === 'agree') {
          // 开启信令服务器
          this.messageFn('对方已同意，正在尝试建立连接通道...')
          this.openVideo(true)
        }
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" :footer-hide="connectStatus && footerHide" :closable="false">
        <p slot="header" style="text-align: center;">{{ $t('chat.videoCall') }}</p>
        <div class="m-ui-content" style="text-align: center">
            {{message}}
        </div>
        <div :style="{position: 'relative', display: (videoBoxShow ? 'block' : 'none')}">
            <div class="remote-live">
                <video id="remote-video" style="width: 100%;height: 100%;position: absolute"></video>
            </div>
            <div class="local-live">
                <video id="local-video" style="width: 100%;height: 100%; position: absolute" muted></video>
            </div>
        </div>
        <div slot="footer">
            <Button v-if="!connectStatus" @click="close">{{$t('chat.allRight')}}</Button>
            <div v-if="!footerHide && connectStatus">
                <Button @click="answer('refuse')" :loading="answerLoading" type="error">{{$t('chat.refuse')}}</Button>
                <Button @click="answer('agree')" :loading="answerLoading" type="success">{{$t('chat.agree')}}</Button>
            </div>
        </div>
    </Modal>
</template>
<style lang="less">
    .m-ui-content {
        position: relative;
        .left-content {
            height: 100%;
            background: none;
            .m-col {
                font-size: 21px;
                margin: 10px 0;
            }
        }
    }
    .local-live {
        background: darkturquoise;
        min-height: 150px;
        width: 200px;
        position: absolute;
        right: 0;
        bottom: 0;
    }
    .remote-live {
        background: antiquewhite;
        min-height: 400px;
        width: 100%
    }
</style>