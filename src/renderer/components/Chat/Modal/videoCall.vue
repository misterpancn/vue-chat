<script>
  import chat from '@/request/websocket'
  export default {
    data () {
      return {
        connectStatus: true,
        message: '正在尝试与对方建立连接......',
        sendCont: 'Video Call',
        footerHide: true
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
      }
    },
    methods: {
      button () {
        this.show = false
      },
      call () {
        if (this.selectId === 0) {
          console.log(this.selectId)
          this.message = this.$t('chat.selectSendObject')
          this.connectStatus = false;
        } else {
          this.$store.dispatch('sendChatMes', {
            chat_id: this.selectId,
            content: this.sendCont,
            video_call: 1
          }).then((res) => {
            if (res.data.data.status === 'failed') {
              this.message = res.data.data.message
              this.connectStatus = false;
              chat.localPush(this.sendCont + ' failed', this.selectId, 0)
            }
          }).catch((e) => {
            this.message = this.$t('chat.messageSendFailed')
            this.connectStatus = false;
          })
        }
      },
      answer (status) {
        console.log(status)
        this.$store.dispatch('sendChatMes', {
          chat_id: this.selectId,
          content: this.sendCont,
          video_call: 2,
          answer_status: status
        }).then((res) => {
          if (res.data.data.status === 'failed') {
            this.message = res.data.data.message
            this.connectStatus = false;
          }
        }).catch((e) => {
          this.message = this.$t('chat.messageSendFailed')
          this.connectStatus = false;
        })
      }
    },
    watch: {
      videoInfo: function (val) {
        if (val.answer === 'refuse') {
          this.message = '对方已拒绝';
          this.connectStatus = false
          console.log(this.message)
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
        <div slot="footer">
            <Button v-if="!connectStatus" @click="button">{{$t('chat.allRight')}}</Button>
            <div v-if="!footerHide && connectStatus">
                <Button @click="answer('refuse')" type="error">{{$t('chat.refuse')}}</Button>
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
</style>