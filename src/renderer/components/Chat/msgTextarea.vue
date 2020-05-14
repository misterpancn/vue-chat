<script>
  import chat from '@/request/websocket'
  import config from '@/store/config/config'
  import wangEditor from '@/lib/wangEditor'
  import rec from '@/media/recorder'
  import {ipcRenderer} from 'electron'
  import request from '@/request'
  export default {
    data () {
      return {
        text: '',
        visible: false,
        uploadLink: (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress + '/api/media/upload/imgToBase64',
        editor: null,
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
        },
        sendMethod: 'ctrl_enter',
        sendLoading: false,
        uploadData: {local_path: null},
        encrypt: config.encrypt(),
        timer: null
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
        let keys = this.encrypt
        return {
          'Accept': 'application/' + config.apiVersion + '+json',
          'Client-Key': keys.key,
          'Authorization': localStorage.getItem('tokenType') + ' ' + localStorage.getItem('token')
        }
      },
      uploadFileUrl () {
        if (this.isGroup) {
          return (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress + '/api/media/upload/file/group/' + this.selectId
        } else {
          return (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress + '/api/media/upload/file/chat/' + this.selectId
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
      }
    },
    methods: {
      inputing (e) {
        if (e.ctrlKey && e.keyCode === 13 && this.sendMethod === 'ctrl_enter') {
          this.sendMessage(false)
        }
        if (!e.ctrlKey && e.keyCode === 13 && this.sendMethod === 'enter') {
          this.sendMessage(false)
        }
        return false;
      },
      sendMessage (isButton) {
        let html = this.editor.txt.html()
        let empty = true;
        this.sendLoading = true;
        if (this.editor.txt.text().length || html.search(/(img)+/i) > 0) {
          empty = false
        } else {
          this.sendLoading = false;
        }
        // 当发生方式为enter键时 去掉最后一行空白行
        if (this.sendMethod === 'enter' && !isButton) {
          html = html.slice(0, -11)
        }
        if (!empty) {
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
              content: html,
              base64_img: base64Img
            }).then((res) => {
              if (res.data.status_code !== 200) {
                this.$Message.warning({
                  content: this.$t('chat.messageSendFailed'),
                  duration: 2
                });
              }
              this.sendLoading = false;
            }).catch((e) => {
              this.$Message.warning({
                content: this.$t('chat.messageSendFailed'),
                duration: 2
              });
              this.sendLoading = false;
            })
            if (base64Img.length === 0) {
              chat.localPush(html, 0, this.selectId)
            }
          } else {
            this.$store.dispatch('sendChatMes', {
              chat_id: this.selectId,
              content: html,
              base64_img: base64Img
            }).then((res) => {
              if (res.data.status_code !== 200) {
                this.$Message.warning({
                  content: this.$t('chat.messageSendFailed'),
                  duration: 2
                });
              }
              this.sendLoading = false;
            }).catch((e) => {
              this.$Message.warning({
                content: this.$t('chat.messageSendFailed'),
                duration: 2
              });
              this.sendLoading = false;
            })
            if (base64Img.length === 0) {
              chat.localPush(html, this.selectId, 0)
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
      },
      setSendMethod (name) {
        this.sendMethod = name
      },
      videoCall (type) {
        if (this.selectId === 0) {
          this.$Message.warning({
            content: this.$t('chat.selectSendObject'),
            duration: 3
          });
          return false;
        }
        if (rec.isSupport) {
          // this.recorderTime = new Date()
          if (type === 'video') {
            let user = this.$store.getters.getSelectUser(this.selectId, this.isGroup)
            this.$store.dispatch('videoInfo', {mes: null, role: 'offer'}).then(() => {
              // this.$store.dispatch('videoCallShow', true)
              ipcRenderer.send('show-win-modal', {
                video_info: {mes: {user_name: user.name}, role: 'offer'},
                select_id: this.selectId,
                is_group: this.isGroup,
                type: 'video'
              })
            })
          } else {
            this.$store.dispatch('voiceInfo', {mes: null, role: 'offer'}).then(() => {
              this.$store.dispatch('voiceCallShow', true)
            })
          }
        } else {
          this.$Message.warning({
            content: this.$t('chat.deviceNotSupport'),
            duration: 3
          });
        }
      },
      sendFileError () {
        this.$Message.warning({
          content: this.$t('chat.messageSendFailed'),
          duration: 2
        });
      },
      sendFileExceedSize (file) {
        this.$Notice.warning({
          title: this.$t('notifyTitle.exceedingFileSizeLimit'),
          desc: this.$t('notify.exceedingImageFileSizeLimitMes', {fileName: file.name, size: '100M'})
        });
      },
      beforeUpload (file) {
        this.uploadData = {local_path: file.path}
        let promise = new Promise((resolve) => {
          this.$nextTick(function () {
            resolve(true);
          });
        });
        return promise; // 通过返回一个promis对象解决
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
      this.editor.customConfig.customUploadImg = (files, insert) => {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法

        // 上传代码返回结果之后，将图片插入到编辑器中
        var formData = new FormData();
        formData.append('img', files[0])
        formData.append('is_save', 0)
        request.imgToBase64(formData, {
          headers: {'Content-Type': 'multipart/form-data'}
        }).then((res) => {
          var result = res.data
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
          let expHtml = "<img class='m-editor-upload-img' width='" + width + "' height='" + height + "' src='" + url + "'>";
          this.editor.cmd.do('insertHtml', expHtml)
        }).catch((e) => {
          this.$Message.warning({
            content: e.data.data,
            duration: 3
          });
        })
        // insert(imgUrl)
      }
      this.editor.create()
      // 开启音频通道
      rec.init((e) => {
        if (process.env.NODE_ENV === 'development') {
          this.$Message.warning({
            content: String(e),
            duration: 3
          });
        }
      })
      this.timer = setInterval(() => {
        this.encrypt = config.encrypt()
      }, 120000)
      if (document.getElementById('textarea').firstElementChild.className === 'w-e-text') {
        document.getElementById('textarea').firstElementChild.onblur = () => {
          if (!this.isGroup) {
            request.inputNotice({chat_id: this.selectId, sign: 0})
          }
        }
        document.getElementById('textarea').firstElementChild.onfocus = () => {
          if (!this.isGroup) {
            request.inputNotice({chat_id: this.selectId, sign: 1})
          }
        }
      }
    },
    destroyed () {
      if (this.timer) {
        clearInterval(this.timer)
      }
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
            <Upload :action="uploadFileUrl" style="display: inline-block" :headers="headers" :disabled="!selectId" :before-upload="beforeUpload"
                    :data="uploadData"
            :on-error="sendFileError" :max-size="100 * 1024" :show-upload-list="false" :on-exceeded-size="sendFileExceedSize">
                <span @mousemove="menu.folderOpen = 'ios-folder-open'" @mouseout="menu.folderOpen = 'ios-folder-open-outline'">
                <Icon size="24" :type="menu.folderOpen" />
            </span>
            </Upload>
            <span :title="$t('chat.voice')" @click="recorderStart"
            @mousemove="menu.mic = 'ios-mic'" @mouseout="menu.mic = 'ios-mic-outline'">
                <Icon size="24" :type="menu.mic" />
            </span>
            <span @click="videoCall('voice')"
            @mousemove="menu.call = 'ios-call'" @mouseout="menu.call = 'ios-call-outline'">
                <Icon size="24" :type="menu.call" />
            </span>
            <span @click="videoCall('video')" v-if="!isGroup"
            @mousemove="menu.video = 'ios-videocam'" @mouseout="menu.video = 'ios-videocam-outline'">
                <Icon size="24" :type="menu.video" />
            </span>
            <span class="float-right" @click="openMessageHistory" :title="$t('chat.messageHistory')"
            @mousemove="menu.history = 'ios-time'" @mouseout="menu.history = 'ios-time-outline'">
                <Icon size="24" :type="menu.history" />
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
            <div class="div-textarea" id="textarea" @keyup="inputing" :title="$t('chat.notify.sendByCtrlEnter', {key: (sendMethod === 'ctrl_enter' ? 'Ctrl+Enter' : 'Enter')})"></div>
            <!--<textarea placeholder="按 Ctrl + Enter 发送" v-model="text" @keyup="inputing" title="按 Ctrl + Enter 发送"></textarea>-->
            <div class="send-button" v-if="selectId">
                <Dropdown trigger="hover" placement="top-end" transfer @on-click="setSendMethod">
                    <span style="cursor: pointer"><Icon type="ios-arrow-up" size="20" slot="prefix"></Icon></span>
                    <DropdownMenu slot="list">
                        <DropdownItem name="ctrl_enter">Ctrl + Enter  <Icon v-if="sendMethod === 'ctrl_enter'" type="md-checkmark" size="16" /></DropdownItem>
                        <DropdownItem name="enter">Enter <Icon v-if="sendMethod === 'enter'" type="md-checkmark" size="16" /></DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Button :loading="sendLoading" @click="sendMessage(true)">Send</Button>
            </div>
        </div>
    </div>
</template>

<style lang="less">
    .m-text {
        height:calc(100% - 35px);
        border-top: solid 1px #ddd;

        .m-input-box {
            width:100%;
            height:calc(100% - 42px);
            border: none;
            .div-textarea {
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
            .send-button {
                position: absolute;
                float: right;
                bottom: 21px;
                right: 36px;
                z-index: 2;
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