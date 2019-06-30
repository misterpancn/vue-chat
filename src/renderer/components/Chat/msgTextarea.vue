<script>
  import chat from '@/request/websocket'
  import WangEdit from 'wangeditor'
  import rec from '@/media/recorder'
  export default {
    data () {
      return {
        text: '',
        visible: false,
        editor: {},
        showRecorder: false,
        recorderTime: new Date()
      }
    },
    computed: {
      expression () {
        return this.$store.getters.getExpression
      },
      spinShow () {
        if (this.expression.length > 0) {
          return false;
        } else {
          return true;
        }
      },
      editorDisable () {
        if (this.selectId > 0) {
          return true;
        } else {
          return false;
        }
      },
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
    watch: {
      editorDisable: function (val) {
        this.editor.$textElem.attr('contenteditable', val)
      },
      recorderTime: function (val) {
        console.log(val)
      }
    },
    methods: {
      inputing (e) {
        let html = this.editor.txt.html()
        let empty = true;
        if (this.editor.txt.text().length || html.search(/(img)+/i) > 0) {
          empty = false
        }
        if (e.ctrlKey && e.keyCode === 13 && !empty) {
          if (this.isGroup) {
            this.$store.dispatch('sendGroupMes', {
              group_id: this.selectId,
              content: this.editor.txt.html()
            }).then((res) => {
              if (res.data.status_code !== 200) {
                this.$Message.warning({
                  content: this.$t('chat.messageSendFailed'),
                  duration: 2
                });
              }
            }).catch((e) => {
              this.$Message.warning({
                content: this.$t('chat.messageSendFailed'),
                duration: 2
              });
            })
            chat.localPush(this.editor.txt.html(), 0, this.selectId)
          } else {
            this.$store.dispatch('sendChatMes', {
              chat_id: this.selectId,
              content: this.editor.txt.html()
            }).then((res) => {
              if (res.data.status_code !== 200) {
                this.$Message.warning({
                  content: this.$t('chat.messageSendFailed'),
                  duration: 2
                });
              }
            }).catch((e) => {
              this.$Message.warning({
                content: this.$t('chat.messageSendFailed'),
                duration: 2
              });
            })
            chat.localPush(this.editor.txt.html(), this.selectId, 0)
          }
          this.text = ''
          this.editor.txt.clear()
        }
      },
      getExpression () {
        if (this.expression === null || this.expression.length === 0) {
          this.$store.dispatch('expression')
        }
      },
      activeImg (expId) {
        let exp = this.$store.getters.getExpressionById(expId)
        let expHtml = "<img width='21px' height='21px' src='" + exp.path + "'>";
        this.editor.cmd.do('insertHtml', expHtml)
        this.visible = false
      },
      recorderStart () {
        if (this.selectId === 0) {
          this.$Message.warning({
            content: this.$t('chat.selectSendObject'),
            duration: 3
          });
          return false;
        }
        if (rec.isSupport) {
          rec.startRecording()
          this.recorderTime = new Date()
          this.showRecorder = true;
        } else {
          this.$Message.warning({
            content: this.$t('chat.deviceNotSupport'),
            duration: 3
          });
        }
      },
      recorderStop () {
        this.showRecorder = false;
        // rec.stopRecording(false, {isGroup: this.isGroup, selectId: this.selectId});
      },
      sendRecorder () {
        this.showRecorder = false;
        rec.stopRecording(true, {isGroup: this.isGroup, selectId: this.selectId});
      },
      poptip () {
        if (this.selectId === 0) {
          this.visible = false
          this.$Message.warning({
            content: this.$t('chat.selectSendObject'),
            duration: 3
          });
        }
      },
      functionNotOnline () {
        this.$Message.warning({
          content: this.$t('notify.functionNotOnlineYet'),
          duration: 2
        });
        return false;
      }
    },
    mounted () {
      this.editor = new WangEdit('#menus', '#textarea')
      this.$nextTick(() => {
        this.editor.$textElem.attr('contenteditable', this.editorDisable)
      })
      this.editor.customConfig.menus = []
      this.editor.customConfig.zIndex = 1
      this.editor.customConfig.pasteFilterStyle = true
      // this.editor.customConfig.pasteUrl = 'http://reconsitutionfs.com/api/media/upload/recorder/chat/1'
      // this.editor.customConfig.uploadImgServer = 'http://reconsitutionfs.com/api/media/upload/recorder/chat/1'
      this.editor.create()
      rec.init((e) => {
        this.$Message.warning({
          content: String(e),
          duration: 3
        });
      })
    }
  }
</script>

<template>
    <div class="m-text">
        <div class="m-input-icon">
            <Poptip word-wrap width="400" placement="top-start" v-model="visible" @on-popper-show="poptip">
                <a href="javascript:;" @click="getExpression"></a>
                <div slot="content">
                    <Spin fix v-if="spinShow">
                        <Icon type="ios-loading" size=20 class="demo-spin-icon-load"></Icon>
                        <div>{{ $t('notify.loading') }}</div>
                    </Spin>
                    <img v-for="exp in expression" :src="exp.path" width="21px" height="21px" style="padding: 2px;cursor: pointer"
                    @click="activeImg(exp.id)">
                </div>
            </Poptip>
            <a href="javascript:;" @click="functionNotOnline"></a>
            <a href="javascript:;" @click="functionNotOnline"></a>
            <a href="javascript:;" :title="$t('chat.voice')" @click="functionNotOnline"></a>
            <a href="javascript:;" @click="functionNotOnline"></a>
            <a href="javascript:;" @click="functionNotOnline"></a>
            <Modal v-model="showRecorder" width="150" :mask-closable="false" @on-cancel="recorderStop">
                <p slot="header" style="text-align: center;">{{ $t('chat.voice') }}</p>
                <p style="text-align: center"><Time :time="recorderTime" :interval="1" /></p>
                <p style="text-align: center">
                    <Icon type="md-microphone" style="font-size: 30px;" /><br>
                    {{ $t('chat.inRecording') }}
                </p>
                <p slot="footer" style="text-align: center">
                    <Button @click="sendRecorder" type="info" size="large" long>{{ $t('chat.sendOut') }}</Button>
                </p>
            </Modal>
        </div>
        <div class="m-input-box">
            <div class="menus" id="menus"></div>
            <div class="textarea" id="textarea" @keyup="inputing" :title="$t('chat.notify.sendByCtrlEnter')"></div>
            <!--<textarea placeholder="按 Ctrl + Enter 发送" v-model="text" @keyup="inputing" title="按 Ctrl + Enter 发送"></textarea>-->
        </div>
    </div>
</template>

<style lang="less">
    .m-text {
        height: 160px;
        border-top: solid 1px #ddd;

        .m-input-box {
            width:100%;
            height:calc(100% - 42px);
            border: none;
            .textarea {
                height: 100%;
                width: 100%;
                border: none;
                outline: 0;
                background:#f5f5f5;
                resize:none;
                font-size: 14px;
                line-height: 0.5em;
                font-family: "Micrsofot Yahei";
                .menus {
                    border: none;
                }
                .w-e-text {
                    p {
                        margin: 0;
                    }
                }
            }
        }
        .m-input-icon {
            height: 42px;
            padding:0 10px;
            a {
                position: relative;
                display: inline-block;
                height: 20px;
                width: 24px;
                margin-top:11px;
                margin-right:8px;
                img {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform:translate(-50%,-50%);
                }
            }
            a:nth-child(1){
                background: url(./../../../../static/img/icon/icon13.png) no-repeat center center;
            }

            a:nth-child(1):hover{
                background: url(./../../../../static/img/icon/icon13_1.png) no-repeat center center;
            }

            a:nth-child(2){
                background: url(./../../../../static/img/icon/icon14.png) no-repeat center center;
            }

            a:nth-child(2):hover{
                background: url(./../../../../static/img/icon/icon14_1.png) no-repeat center center;
            }

            a:nth-child(3){
                background: url(./../../../../static/img/icon/icon15.png) no-repeat center center;
            }

            a:nth-child(3):hover{
                background: url(./../../../../static/img/icon/icon15_1.png) no-repeat center center;
            }

            a:nth-child(4){
                background: url(./../../../../static/img/icon/icon16.png) no-repeat center center;
            }

            a:nth-child(4):hover{
                background: url(./../../../../static/img/icon/icon16_1.png) no-repeat center center;
            }

            a:nth-child(6){
                background: url(./../../../../static/img/icon/icon17.png) no-repeat center center;
                float: right;
            }

            a:nth-child(6):hover{
                background: url(./../../../../static/img/icon/icon17_1.png) no-repeat center center;
            }

            a:nth-child(5){
                background: url(./../../../../static/img/icon/icon18.png) no-repeat center center;
                float: right;
            }

            a:nth-child(5):hover{
                background: url(./../../../../static/img/icon/icon18_1.png) no-repeat center center;
            }

        }
    }
</style>