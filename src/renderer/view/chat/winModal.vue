<script>
  import {ipcRenderer} from 'electron'
  export default {
    data () {
      return {
        imgSrc: ''
      }
    },
    methods: {
      cancelModal () {
        ipcRenderer.send('hide-win-modal')
      }
    },
    mounted () {
      let biasX = 0
      let biasY = 0
      window.addEventListener('mousedown', (e) => {
        biasX = e.x
        biasY = e.y
        window.addEventListener('mousemove', moveEvent)
      })
      window.addEventListener('mouseup', () => {
        biasX = 0
        biasY = 0
        window.removeEventListener('mousemove', moveEvent)
      })
      function moveEvent (e) {
        window.moveTo(e.screenX - biasX, e.screenY - biasY)
      }
    },
    created () {
      ipcRenderer.on('send-win-modal-img', (e, src) => {
        this.imgSrc = src
      })
    }
  }
</script>
<template>
    <div class="m-win-modal">
        <div class="icon-cancel" @click="cancelModal"><Icon type="ios-close-circle" size="32" style="cursor: pointer" /></div>
        <div class="m-img"><img draggable="false" :src="imgSrc"></div>
    </div>
</template>
<style lang="less">
    .m-win-modal {
        position: relative;
        width: 100%;
        .icon-cancel {
            position: absolute;
            top: 0;
            right: 0;
        }
    }
</style>
