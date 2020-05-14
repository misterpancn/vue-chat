<script>
    import {ipcRenderer, shell} from 'electron'
    import ws from '@/request/websocket'
    import config from '@/store/config/config'
    import fs from 'fs'
    export default {
      props: ['item'],
      data () {
        return {
          loading: false,
          progressStyle: {display: 'none'}
        }
      },
      computed: {
        downloadPercent () {
          return this.$store.getters.getChatFDP
        }
      },
      watch: {
        downloadPercent: function (val) {
          if (val > 0) {
            this.progressStyle = {display: 'inline-block'}
          } else {
            this.progressStyle = {display: 'none'}
          }
        }
      },
      methods: {
        html (str) {
          if (str !== undefined) {
            return str.replace(/\\/g, '')
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
            if (className === 'ivu-icon ivu-icon-ios-barcode-outline') {
              e.currentTarget.nextElementSibling.pause()
              e.currentTarget.nextElementSibling.nextElementSibling.firstElementChild.className = 'ivu-icon ivu-icon-ios-volume-up'
            }
            return false;
          }
          if (document.getElementsByClassName('audio').length > 0) {
            for (let i = 0; i < document.getElementsByClassName('audio').length; i++) {
              if (document.getElementsByClassName('audio')[i].paused === false) {
                this.$nextTick(() => {
                  document.getElementsByClassName('audio')[i].load()
                })
              }
            }
          }
          if (document.getElementsByClassName('rec-icon').length > 0) {
            for (let i = 0; i < document.getElementsByClassName('rec-icon').length; i++) {
              let cn = document.getElementsByClassName('rec-icon')[i].children[0].className
              if (cn === 'ivu-icon ivu-icon-ios-barcode-outline') {
                this.$nextTick(() => {
                  document.getElementsByClassName('rec-icon')[i].children[0].className = 'ivu-icon ivu-icon-ios-volume-up'
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
        },
        openWinModal (src) {
          let img = new Image()
          img.src = src
          img.onload = () => {
            ipcRenderer.send('show-win-modal', {
              width: img.width,
              height: img.height,
              src: src,
              type: 'img'
            })
          }
        },
        evil (str) {
          return ws.evil(str)
        },
        fileSize (size) {
          if (!size) {
            return 0;
          }
          var num = 1024.00; // byte
          if (size < num) {
            return size + 'B';
          }
          if (size < Math.pow(num, 2)) {
            return (size / num).toFixed(2) + 'K'; // kb
          }
          if (size < Math.pow(num, 3)) {
            return (size / Math.pow(num, 2)).toFixed(2) + 'M'; // M
          }
          if (size < Math.pow(num, 4)) {
            return (size / Math.pow(num, 3)).toFixed(2) + 'G'; // G
          }
          return (size / Math.pow(num, 4)).toFixed(2) + 'T'; // T
        },
        downloadFileUrl (item) {
          if (this.downloadPercent === 0) {
            if (item.is_down) {
              this.$Message.warning({
                content: this.$t('notify.youHaveDownloadedTheFile'),
                duration: 3
              });
              return false;
            }
            let route = this.evil(item.data).src;
            let fileName = this.evil(item.data).fileName;
            // e.currentTarget.parentElement.parentElement.nextElementSibling.style.display = 'inline-block'
            var src = (config.openssl === false ? 'http://' : 'https://') + config.serviceAddress + route + '?t=' + localStorage.getItem('token') + '&fileName=' + fileName;
            if (item.mes_id) {
              this.$store.dispatch('setFileId', item.mes_id)
            } else if (item.redis_id) {
              this.$store.dispatch('setFileId', item.redis_id)
            }
            ipcRenderer.send('download-chat-file', {
              data: src,
              cmd: 'url'
            })
          } else {
            this.$Message.warning({
              content: this.$t('notify.otherDownloadAlreadyExist'),
              duration: 3
            });
          }
        },
        openFile (file) {
          if (!file) {
            this.$Message.warning({
              content: this.$t('notify.fileDoneNotExist'),
              duration: 3
            });
            return false;
          }
          fs.access(file, (err) => {
            if (!err) {
              shell.openItem(file)
            } else {
              this.$Message.warning({
                content: this.$t('notify.fileDoneNotExist'),
                duration: 3
              });
            }
          })
        }
      }
    }
</script>
<template>
    <!-- 普通文本 -->
    <div v-if="item && item.type === 0" class="text m-mess-modal" v-html="html(item.data)"></div>
    <!-- 语音 -->
    <div class="text recorder" v-else-if="item && item.type === 7">
        <!-- 注意：这里的html层级关系不可改 -->
        <span ref="recorderTime" class="recorder-time" @click="controlsAudio($event)"></span>
        <audio class="audio" preload="auto" name="media" @canplay="getDuration($event)" ref="audio" @timeupdate="timeUpdate($event)"
               @ended="endAudio($event)" hidden="true">
            <source :src="audioSrc(item.data)" type="audio/mp3">
        </audio>
        <span class="rec-icon"><Icon type="ios-volume-up" ref="recorderIcon" style="font-size: 2em" /></span>
    </div>
    <!-- 图片 -->
    <div v-else-if="item && item.type === 4" class="text" >
        <img :src="item.data" width="100%" @dblclick="openWinModal(item.data)">
    </div>
    <!-- 文件 -->
    <div v-else-if="item && item.type === 13" class="text" style="padding: .4rem">
        <div class="file-type">{{evil(item.data).ext.toUpperCase()}}</div>
        <div style="display: inline-block;float: left;min-height: 50px;">
            <p>
                <!-- 自己发的文件不下载 直接根据上传路径打开文件 -->
                <a v-if="item.is_down && item.save_path" @click="openFile(item.save_path)" :data="item.save_path">{{evil(item.data).fileName}}</a>
                <a v-else-if="item.self" @click="openFile(evil(item.data).localPath)" :data="evil(item.data).localPath">{{evil(item.data).fileName}}</a>
                <a v-else @click="downloadFileUrl(item)">{{evil(item.data).fileName}}</a>
                <br>
                {{fileSize(evil(item.data).size)}}
                <span v-if="item.is_down && !item.self">({{$t('notify.theSave')}})</span>
            </p>
        </div>
        <Progress v-if="!item.self && !item.is_down" :percent="downloadPercent" status="active" :stroke-width="3" class="download-progress" :style="progressStyle" />
    </div>
</template>
<style lang="less">
    .text {
        display: inline-block;
        position: relative;
        padding: 0 10px;
        max-width: ~'calc(100% - 40px)';
        min-height: 30px;
        line-height: 30px;
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
        .file-type {
            width: 50px;
            height: 50px;
            display: inline-block;
            background-color: #FCE1E5;
            float: left;
            text-align: center;
            line-height: 50px;
            margin-right: .4rem;
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
</style>
