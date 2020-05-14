<script>
  import chat from '@/request/websocket'
  import webrtc from '@/request/webrtc'
  export default {
    data () {
      return {
        connectStatus: true,
        message: this.$t('chat.video.tryingToConnect'),
        sendCont: 'Voice Call',
        confirmButtonShow: false,
        voiceShowTime: false,
        answerLoading: false,
        voiceTime: 0,
        voiceTimer: null
      }
    },
    computed: {
      show: {
        get: function () {
          let s = this.$store.getters.getVoiceCallShow
          if (s) {
            webrtc.startSignaling(this.errorCallback)
          }
          return this.$store.getters.getVoiceCallShow
        },
        set: function (val) {
          this.$store.dispatch('voiceCallShow', val)
        }
      },
      voiceInfo () {
        return this.$store.getters.getVoiceInfo
      },
      selectUser () {
        return this.$store.getters.getSelectUser(this.selectId, this.isGroup)
      },
      selectId () {
        return this.$store.getters.selectId
      },
      isGroup () {
        return this.$store.getters.isGroup
      },
      showTime () {
        return this.timeNum(parseInt(this.voiceTime / 60 / 60)) + ':' + this.timeNum(parseInt(this.voiceTime / 60) % 60) + ':' + this.timeNum(this.voiceTime % 60)
      }
    },
    methods: {
      close () {
        this.show = false
        this.connectStatus = true;
        this.message = this.$t('chat.video.tryingToConnect');
        this.sendCont = 'Voice Call';
        this.voiceShowTime = false
        this.answerLoading = false
        webrtc.signalClose()
        clearInterval(this.voiceTimer)
        this.voiceTimer = null
        this.voiceTime = 0
      },
      call () {
        if (this.selectId === 0) {
          this.message = this.$t('chat.selectSendObject')
          this.connectStatus = false;
        } else {
          this.$store.dispatch('sendChatMes', {
            chat_id: this.selectId,
            content: this.sendCont,
            video_call: 1,
            type: 'voice'
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
      startTime () {
        this.voiceTimer = setInterval(() => {
          this.voiceTime++
        }, 1000)
      },
      timeNum (num) {
        if (num < 10) {
          return '0' + num
        }
        return num
      },
      answer (status) {
        this.answerLoading = true
        this.$store.dispatch('sendChatMes', {
          chat_id: this.selectId,
          content: this.sendCont,
          video_call: 2,
          answer_status: status,
          type: 'voice'
        }).then((res) => {
          if (res.data.data.status === 'failed') {
            this.$Message.error(res.data.data.message)
          }
          if (status === 'agree') {
            this.message = this.$t('chat.video.tryingToConnect');
            this.openVoice(false)
          }
        }).catch((e) => {
          this.$Message.error(this.$t('chat.messageSendFailed'))
        })
        if (status === 'refuse') {
          this.close()
        }
      },
      async openVoice (isOffer) {
        this.answerLoading = false
        if (!webrtc.status) {
          this.messageFn(webrtc.error)
          return false;
        }
        if (isOffer) {
          await webrtc.offer()
        }
        if (!webrtc.status) {
          let e = webrtc.error ? webrtc.error : this.$t('chat.video.ICEFailed')
          this.messageFn(e)
          return false;
        }
        this.startTime()
        this.voiceShowTime = true
        this.confirmButtonShow = false
      },
      errorCallback (e) {
        if (e) {
          switch (e.status) {
            case 'error':
              this.messageFn(e.message)
              break;
            case 'init':
              webrtc.init('chat:' + this.selectId, 'voice').then(() => {
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
      messageFn (mes) {
        this.message = mes
        this.connectStatus = false;
        this.answerLoading = false
        this.confirmButtonShow = false
      }
    },
    watch: {
      voiceInfo: function (val) {
        if (val.answer === 'refuse') {
          this.messageFn(this.$t('chat.video.theOtherPartyHasRefused'))
        }
        if (val.answer === 'agree') {
          // 开启信令服务器
          this.message = this.$t('chat.video.theOtherPartyHasAgreed');
          this.openVoice(true)
        }
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" :closable="false">
        <p slot="header" style="text-align: center;">{{ $t('chat.voiceCall') }}</p>
        <div class="m-ui-content" style="text-align: center">
            {{message}}
        </div>
        <div :style="{textAlign: 'center'}">
            <img style="width: 30%" :src="selectUser.photo">
            <p v-if="voiceShowTime" style="font-size: 17px;"><b>{{ showTime }}</b></p>
        </div>
        <div slot="footer">
            <Button v-if="!connectStatus" @click="close">{{$t('chat.allRight')}}</Button>
            <Button v-if="connectStatus" @click="close" type="error">Cancel</Button>
            <div v-if="confirmButtonShow">
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