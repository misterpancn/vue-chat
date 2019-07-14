<script>
    import {ipcRenderer} from 'electron'
    export default {
      props: ['item'],
      data () {
        return {
          loading: false
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
            ipcRenderer.send('show-win-model', {
              width: img.width,
              height: img.height,
              src: src
            })
          }
        }
      }
    }
</script>
<template>
    <div v-if="item && item.type === 0" class="text m-mess-modal" v-html="html(item.data)"></div>
    <div class="text recorder" v-else-if="item && item.type === 7">
        <!-- 注意：这里的html层级关系不可改 -->
        <span ref="recorderTime" class="recorder-time" @click="controlsAudio($event)"></span>
        <audio class="audio" preload="auto" name="media" @canplay="getDuration($event)" ref="audio" @timeupdate="timeUpdate($event)"
               @ended="endAudio($event)" hidden="true">
            <source :src="audioSrc(item.data)" type="audio/mp3">
        </audio>
        <span class="rec-icon"><Icon type="ios-volume-up" ref="recorderIcon" style="font-size: 2em" /></span>
    </div>
    <div v-else-if="item && item.type === 4" class="text" >
        <img :src="item.data" width="100%" @dblclick="openWinModal(item.data)">
    </div>
</template>
<style lang="less">
    .text {
        display: inline-block;
        position: relative;
        padding: 0 10px;
        max-width: ~'calc(100% - 40px)';
        min-height: 30px;
        line-height: 2.5;
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
