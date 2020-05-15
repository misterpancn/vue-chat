<script>
  import webrtc from '@/request/webrtc'
  import {ipcRenderer} from 'electron'
  export default {
    data () {
      return {
        connectStatus: true,
        message: '',
        sendCont: 'Video Call',
        footerHide: true,
        // 邀请应答按钮的loading
        answerLoading: false,
        // 模态框的显示
        show: true,
        videoInfo: {},
        selectId: 0,
        isGroup: false,
        // 顶部鼠标划入的显示控制
        showExit: false,
        // 退出操作的loading
        exitLoading: false,
        // 收到对方退出的通知，直接退出即可
        autoExit: false
      }
    },
    methods: {
      close () {
        this.exitLoading = true
        if (this.autoExit) {
          this.exit()
        } else {
          this.$store.dispatch('sendChatMes', {
            chat_id: this.selectId,
            content: 'close',
            video_call: 3
          }).then((res) => {
            this.exit()
          }).catch((e) => {
            this.messageFn(this.$t('chat.messageSendFailed'))
            this.exitLoading = false
            this.autoExit = true
          })
        }
      },
      exit () {
        this.connectStatus = true;
        this.message = '';
        this.sendCont = 'Video Call';
        this.footerHide = true
        this.answerLoading = false
        webrtc.signalClose()
        ipcRenderer.send('close-video-modal')
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
            return false
          }
          if (status === 'agree') {
            this.messageFn(this.$t('chat.video.tryingToConnect'))
            this.openVideo(false)
          }
          if (status === 'refuse') {
            this.close()
          }
        }).catch((e) => {
          this.messageFn(this.$t('chat.messageSendFailed'))
        })
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
          let e = webrtc.error ? webrtc.error : this.$t('chat.video.ICEFailed')
          this.messageFn(e)
          return false;
        }
        this.show = false
      },
      messageFn (mes) {
        this.message = mes
        this.connectStatus = false;
        this.footerHide = true
        this.answerLoading = false
        this.show = true
      },
      errorCallback (e) {
        if (e) {
          switch (e.status) {
            case 'error':
              this.messageFn(e.message)
              break;
            case 'init':
              webrtc.init('chat:' + this.selectId).then(() => {
                if (this.videoInfo.role === 'offer') {
                  this.call()
                }
                if (this.videoInfo.role === 'answer') {
                  this.footerHide = false
                  this.message = this.videoInfo.mes.user_name + this.$t('chat.video.inviteToVideo')
                }
              }).catch((e) => {
                this.messageFn(e.message)
              })
              break;
          }
        }
      },
      fullScreen () {
        console.log(222)
        ipcRenderer.send('video-modal-full-screen')
      }
    },
    watch: {
      videoInfo: function (val) {
        if (val.answer === 'refuse') {
          this.messageFn(this.$t('chat.video.theOtherPartyHasRefused'))
        }
        if (val.answer === 'agree') {
          // 发起SDP
          this.messageFn(this.$t('chat.video.theOtherPartyHasAgreed'))
          this.openVideo(true)
        }
      }
    },
    mounted () {
      ipcRenderer.on('video-modal-data', (e, data) => {
        this.videoInfo = data.video_info
        this.selectId = data.select_id
        this.isGroup = data.is_group
        webrtc.startSignaling(this.errorCallback)
      })
      this.message = this.$t('chat.video.tryingToConnect')
    },
    created () {
      ipcRenderer.on('forwarded-message-to-video', (e, data) => {
        if (data.type === 'init') {
          this.videoInfo = data.video_info
          this.selectId = data.select_id
          this.isGroup = data.is_group
        }
        if (data.type === 'notify') {
          this.messageFn(this.$t('chat.video.theCallIsOff'))
          this.autoExit = true
        }
      })
    }
  }
</script>
<template>
    <div style="width: 100%; height: 100%">
        <div class="video-title-drag">
            <span>{{ $t('chat.videoCall') }}</span>
        </div>
        <div class="video-title" v-if="videoInfo.mes && videoInfo.mes.user_name" @mouseover="showExit = true" @mouseout="showExit = false">
            <span :style="{display: showExit ? 'none' : 'block'}">{{$t('chat.video.talkingOnVideo', {name: videoInfo.mes.user_name})}}</span>
            <Button :style="{display: showExit ? 'block' : 'none'}" :loading="exitLoading" @click="close" type="error" long>{{$t('chat.video.hangUpAndExit')}}</Button>
        </div>
        <Modal v-model="show" :mask-closable="false" :closable="false">
            <p slot="header" style="text-align: center;">{{ $t('chat.videoCall') }}</p>
            <div class="m-ui-content" style="text-align: center">
                {{message}}
            </div>
            <div slot="footer">
                <Button v-if="!connectStatus" @click="close" :loading="exitLoading">{{$t('chat.allRight')}}</Button>
                <Button v-if="connectStatus && footerHide" @click="close" :loading="exitLoading" type="error">Cancel</Button>
                <div v-if="!footerHide && connectStatus">
                    <Button @click="answer('refuse')" :loading="answerLoading" type="error">{{$t('chat.refuse')}}</Button>
                    <Button @click="answer('agree')" :loading="answerLoading" type="success">{{$t('chat.agree')}}</Button>
                </div>
            </div>
        </Modal>
        <div class="video-content"  @dblclick="fullScreen" :title="$t('chat.video.dlClickOpenOrCloseFullScreen')">
            <div class="remote-live">
                <video id="remote-video" style="width: 100%;height: 100%;position: absolute"></video>
            </div>
            <div class="local-live">
                <video id="local-video" style="width: 100%;height: 100%; position: absolute" muted></video>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    .video-title {
        height: 30px;
        text-align: center;
        line-height: 30px;
        background: antiquewhite;
    }
    .video-title-drag {
        height: 30px;
        text-align: center;
        line-height: 30px;
        -webkit-user-select: none;
        -webkit-app-region: drag;
    }
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
    .video-content {
        width: 100%;
        position: relative;
        height: 100%;
        .local-live {
            background: darkturquoise;
            min-height: 250px;
            height: 30%;
            width: 30%;
            position: absolute;
            right: 0;
            bottom: 0;
        }
        .remote-live {
            background: antiquewhite;
            height: 100vh;
            width: 100%
        }
    }
</style>