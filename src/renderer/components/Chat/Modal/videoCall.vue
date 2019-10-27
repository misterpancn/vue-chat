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
          if (this.$store.getters.getVideoCallShow && this.videoInfo.role === 'offer') {
            this.call()
          }
          if (this.$store.getters.getVideoCallShow && this.videoInfo.role === 'answer') {
            this.footerHide = false
            this.message = this.videoInfo.mes.user_name + '邀请你视频聊天'
          }
          return this.$store.getters.getVideoCallShow
        },
        set: function (val) {
          this.$store.dispatch('videoCallShow', val)
          if (!val) {
            this.connectStatus = true;
            this.message = '正在尝试与对方建立连接......';
            this.sendCont = 'Video Call';
            this.footerHide = true
            this.videoBoxShow = false
            this.answerLoading = false
          }
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
      },
      webrtcError () {
        return webrtc.error
      }
    },
    methods: {
      button () {
        this.show = false
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
            this.startWs()
          }).catch((e) => {
            this.messageFn(this.$t('chat.messageSendFailed'))
          })
        }
      },
      answer (status) {
        if (status === 'agree') {
          this.startWs()
        }
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
          this.show = false
        }
      },
      async openVideo (isOffer) {
        webrtc.init()
        if (isOffer) {
          await webrtc.offer()
          console.log(webrtc.signaling)
        }
        console.log(webrtc)
        if (webrtc.error) {
          this.messageFn(webrtc.error)
          return false;
        }
        this.answerLoading = false
        this.videoBoxShow = true
      },
      messageFn (mes) {
        this.message = mes
        this.connectStatus = false;
        this.footerHide = true
        this.answerLoading = false
      },
      startWs () {
        let localVideo = document.querySelector('#local-video');
        let remoteVideo = document.querySelector('#remote-video');
        let r = webrtc.startSignaling({
          localVideoDom: localVideo,
          remoteVideoDom: remoteVideo,
          subject: 'chat:' + this.selectId
        })
        if (!r) {
          this.messageFn('信令服务器连接失败')
        }
      }
    },
    watch: {
      videoInfo: function (val) {
        if (val.answer === 'refuse') {
          this.messageFn('对方已拒绝')
          console.log(this.message)
        }
        if (val.answer === 'agree') {
          // 开启信令服务器
          this.messageFn('对方已同意，正在尝试建立连接通道...')
          this.openVideo(true)
        }
      },
      webrtcError: function (val) {
        console.log(val)
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
        <div v-if="videoBoxShow" style="position: relative">
            <div class="remote-live">
                <video id="remote-video" style="width: 100%;height: 100%;position: absolute"></video>
            </div>
            <div class="local-live">
                <video id="local-video" style="width: 100%;height: 100%; position: absolute" muted></video>
            </div>
        </div>
        <div slot="footer">
            <Button v-if="!connectStatus" @click="button">{{$t('chat.allRight')}}</Button>
            <div v-if="!footerHide && connectStatus">
                <Button @click="answer('refuse')" :loading="answerLoading" type="error">{{$t('chat.refuse')}}</Button>
                <Button @click="answer('agree')" type="success">{{$t('chat.agree')}}</Button>
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