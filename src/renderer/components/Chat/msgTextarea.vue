<script>
  import chat from '@/request/websocket'
  import WangEdit from 'wangeditor'
  import rec from '@/media/recorder'
  export default {
    props: ['session', 'selectUserId'],
    data () {
      return {
        text: '',
        visible: false,
        editor: {},
        showRecorder: false
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
      }
    },
    methods: {
      inputing (e) {
        if (e.ctrlKey && e.keyCode === 13 && this.editor.txt.text().length) {
          if (isNaN(this.selectUserId)) {
            chat.sendMessage(this.editor.txt.html(), 0, this.selectUserId)
          } else {
            chat.sendMessage(this.editor.txt.html(), this.selectUserId, 0)
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
        rec.init((e) => {
          console.log(e)
        })
        if (rec.isSupport) {
          rec.startRecording()
          this.showRecorder = true;
          console.log('star...')
        } else {
          this.$Message.warning({
            content: this.$t('chat.deviceNotSupport'),
            duration: 3
          });
        }
      },
      recorderStop () {
        this.showRecorder = false;
        rec.stopRecording();
        console.log('stop...')
      }
    },
    mounted () {
      this.editor = new WangEdit('#menus', '#textarea')
      this.editor.customConfig.menus = []
      this.editor.customConfig.zIndex = 1
      this.editor.create()
    }
  }
</script>

<template>
    <div class="m-text">
        <div class="m-input-icon">
            <Poptip word-wrap width="400" placement="top-start" v-model="visible">
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
            <a href="javascript:;"></a>
            <a href="javascript:;"></a>
            <a href="javascript:;" :title="$t('chat.voice')" @click="recorderStart"></a>
            <a href="javascript:;"></a>
            <a href="javascript:;"></a>
            <Modal v-model="showRecorder" width="150" :mask-closable="false" @on-cancel="recorderStop">
                <p slot="header" style="text-align: center;">{{ $t('chat.voice') }}</p>
                <p style="text-align: center">
                    <Icon type="md-microphone" style="font-size: 30px;" /><br>
                    {{ $t('chat.inRecording') }}
                </p>
                <p slot="footer" style="text-align: center">
                    <Button type="info" size="large" long>{{ $t('chat.sendOut') }}</Button>
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
                background: url(/static/img/icon/icon13.png) no-repeat center center;
            }

            a:nth-child(1):hover{
                background: url(/static/img/icon/icon13_1.png) no-repeat center center;
            }

            a:nth-child(2){
                background: url(/static/img/icon/icon14.png) no-repeat center center;
            }

            a:nth-child(2):hover{
                background: url(/static/img/icon/icon14_1.png) no-repeat center center;
            }

            a:nth-child(3){
                background: url(/static/img/icon/icon15.png) no-repeat center center;
            }

            a:nth-child(3):hover{
                background: url(/static/img/icon/icon15_1.png) no-repeat center center;
            }

            a:nth-child(4){
                background: url(/static/img/icon/icon16.png) no-repeat center center;
            }

            a:nth-child(4):hover{
                background: url(/static/img/icon/icon16_1.png) no-repeat center center;
            }

            a:nth-child(6){
                background: url(/static/img/icon/icon17.png) no-repeat center center;
                float: right;
            }

            a:nth-child(6):hover{
                background: url(/static/img/icon/icon17_1.png) no-repeat center center;
            }

            a:nth-child(5){
                background: url(/static/img/icon/icon18.png) no-repeat center center;
                float: right;
            }

            a:nth-child(5):hover{
                background: url(/static/img/icon/icon18_1.png) no-repeat center center;
            }

        }
    }
</style>