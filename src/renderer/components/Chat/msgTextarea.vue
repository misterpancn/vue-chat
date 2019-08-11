<script>
  import chat from '@/request/websocket'
  import config from '@/store/config/config'
  import wangEditor from '@/lib/wangEditor'
  import rec from '@/media/recorder'
  import groupUser from './Modal/groupUser'
  export default {
    components: { groupUser },
    data () {
      return {
        text: '',
        visible: false,
        uploadLink: (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress + '/api/media/upload/imgToBase64',
        editor: {},
        showRecorder: false,
        recorderTime: 0,
        timerFunc: null,
        menu: {
          emoji: 'ios-happy-outline',
          mic: 'ios-mic-outline',
          call: 'ios-call-outline',
          folderOpen: 'ios-folder-open-outline',
          video: 'ios-videocam-outline',
          history: 'ios-time-outline',
          people: 'ios-contacts-outline'
        }
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
      },
      headers () {
        let keys = config.encrypt()
        return {
          'Accept': 'application/' + config.apiVersion + '+json',
          'Client-Key': keys.key,
          'Secret-Salt': keys.salt,
          'Authorization': localStorage.getItem('tokenType') + ' ' + localStorage.getItem('token')
        }
      }
    },
    watch: {
      editorDisable: function (val) {
        this.editor.$textElem.attr('contenteditable', val)
      },
      recorderTime: function (val) {
        // console.log(val)
        // 录制时间最长120s  超过自动发送
        if (val > 120) {
          this.sendRecorder()
        }
      },
      headers: (val) => {
        this.editor.customConfig.uploadImgHeaders = val
      }
    },
    methods: {
      inputing (e) {
        if (!e.ctrlKey && e.keyCode !== 13) {
          return false;
        }
        let html = this.editor.txt.html()
        let empty = true;
        if (this.editor.txt.text().length || html.search(/(img)+/i) > 0) {
          empty = false
        }
        if (e.ctrlKey && e.keyCode === 13 && !empty) {
          let uploadImg = document.getElementsByClassName('m-editor-upload-img')
          let base64Img = []
          if (uploadImg) {
            for (var i = 0; i < uploadImg.length; i++) {
              base64Img.push(uploadImg[i].currentSrc)
            }
          }
          if (this.isGroup) {
            this.$store.dispatch('sendGroupMes', {
              group_id: this.selectId,
              content: this.editor.txt.html(),
              base64_img: base64Img
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
            if (base64Img.length === 0) {
              chat.localPush(this.editor.txt.html(), 0, this.selectId)
            }
          } else {
            this.$store.dispatch('sendChatMes', {
              chat_id: this.selectId,
              content: this.editor.txt.html(),
              base64_img: base64Img
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
            if (base64Img.length === 0) {
              chat.localPush(this.editor.txt.html(), this.selectId, 0)
            }
          }
          this.text = ''
          this.editor.txt.clear()
        }
      },
      getExpression () {
        if (this.selectId === 0) {
          this.$Message.warning({
            content: this.$t('chat.selectSendObject'),
            duration: 3
          });
          this.visible = false
          return false;
        }
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
          // this.recorderTime = new Date()
          this.timeRun()
          this.showRecorder = true;
          rec.startRecording()
        } else {
          this.$Message.warning({
            content: this.$t('chat.deviceNotSupport'),
            duration: 3
          });
        }
      },
      recorderStop () {
        this.showRecorder = false;
        this.clearTimer()
        rec.stopRecording(false, {isGroup: this.isGroup, selectId: this.selectId});
      },
      sendRecorder () {
        this.showRecorder = false;
        this.clearTimer()
        rec.stopRecording(true, {isGroup: this.isGroup, selectId: this.selectId});
      },
      functionNotOnline () {
        this.$Message.warning({
          content: this.$t('notify.functionNotOnlineYet'),
          duration: 2
        });
        return false;
      },
      timeRun () {
        if (this.timerFunc === null) {
          this.timerFunc = setInterval(() => {
            this.recorderTime++
          }, 1000)
        }
      },
      clearTimer () {
        if (this.timerFunc) {
          clearInterval(this.timerFunc)
        }
        this.timerFunc = null
        this.recorderTime = 0
      },
      openMessageHistory () {
        if (this.selectId === 0) {
          this.$Message.warning({
            content: this.$t('chat.selectSendObject'),
            duration: 3
          });
          return false;
        }
        this.$store.dispatch('setMessageHistory', true)
      }
    },
    mounted () {
      wangEditor.init({
        menu: '#menu',
        cont: '#textarea',
        headers: this.headers,
        uploadLink: this.uploadLink
      })
      this.editor = wangEditor.editor
      this.$nextTick(() => {
        this.editor.$textElem.attr('contenteditable', this.editorDisable)
      })
      this.editor.customConfig.customAlert = (info) => {
        // info 是需要提示的内容
        this.$Message.warning({
          content: String(info),
          duration: 3
        });
      }
      this.editor.customConfig.uploadImgHooks = {
        // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
        // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
        customInsert: (insertImg, result, editor) => {
          // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
          // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果

          // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
          var url = result.data.img_url
          let proportion = 1;
          let max;
          if (parseInt(result.data.img_info.width) > parseInt(result.data.img_info.height)) {
            max = parseInt(result.data.img_info.width)
          } else {
            max = parseInt(result.data.img_info.height)
          }
          if (max >= 1000) {
            proportion = 0.2
          }
          if (max >= 500 && max < 1000) {
            proportion = 0.35
          }
          if (max >= 200 && max < 500) {
            proportion = 0.6
          }
          let width = parseInt(result.data.img_info.width) * proportion
          let height = parseInt(result.data.img_info.height) * proportion
          // insertImg(url)
          let expHtml = "<img class='m-editor-upload-img' width='" + width + "' height='" + height + "' src='" + url + "'>";
          editor.cmd.do('insertHtml', expHtml)

          // result 必须是一个 JSON 格式字符串！！！否则报错
        }
      }
      this.editor.create()
      rec.init((e) => {
        if (process.env.NODE_ENV === 'development') {
          this.$Message.warning({
            content: String(e),
            duration: 3
          });
        }
      })
    }
  }
</script>

<template>
    <div class="m-text">
        <div class="m-input-icon">
            <Poptip word-wrap width="400" placement="top-start" v-model="visible">
                <span @click="getExpression" @mousemove="menu.emoji = 'ios-happy'"
                 @mouseout="menu.emoji = 'ios-happy-outline'">
                    <Icon size="24" :type="menu.emoji" /></span>
                <div slot="content">
                    <Spin fix v-if="spinShow"></Spin>
                    <img v-for="exp in expression" :src="exp.path" width="21px" height="21px" style="padding: 2px;cursor: pointer"
                    @click="activeImg(exp.id)">
                </div>
            </Poptip>
            <span @click="functionNotOnline"
            @mousemove="menu.folderOpen = 'ios-folder-open'" @mouseout="menu.folderOpen = 'ios-folder-open-outline'">
                <Icon size="24" :type="menu.folderOpen" />
            </span>
            <span :title="$t('chat.voice')" @click="recorderStart"
            @mousemove="menu.mic = 'ios-mic'" @mouseout="menu.mic = 'ios-mic-outline'">
                <Icon size="24" :type="menu.mic" />
            </span>
            <span @click="functionNotOnline"
            @mousemove="menu.call = 'ios-call'" @mouseout="menu.call = 'ios-call-outline'">
                <Icon size="24" :type="menu.call" />
            </span>
            <span @click="functionNotOnline"
            @mousemove="menu.video = 'ios-videocam'" @mouseout="menu.video = 'ios-videocam-outline'">
                <Icon size="24" :type="menu.video" />
            </span>
            <span class="float-right" @click="openMessageHistory" :title="$t('chat.messageHistory')"
            @mousemove="menu.history = 'ios-time'" @mouseout="menu.history = 'ios-time-outline'">
                <Icon size="24" :type="menu.history" />
            </span>
            <span class="float-right" v-if="isGroup" @click="$store.dispatch('setGroupUserShow', true)"
                  @mousemove="menu.people = 'ios-contacts'" @mouseout="menu.people = 'ios-contacts-outline'">
                <Icon size="24" :type="menu.people" />
            </span>
            <Modal v-model="showRecorder" width="150" :mask-closable="false" @on-cancel="recorderStop">
                <p slot="header" style="text-align: center;">{{ $t('chat.voice') }}</p>
                <p style="text-align: center"><span>{{recorderTime}}s</span></p>
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
        <group-user></group-user>
    </div>
</template>

<style lang="less">
    .m-text {
        height:calc(100% - 42px);
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
            span {
                position: relative;
                display: inline-block;
                margin-top:11px;
                margin-right:8px;
                cursor: pointer;
            }
            .float-right {
                float: right;
            }

        }
    }
</style>