<script>
  import chat from '@/request/websocket'
  export default {
    props: ['session', 'selectUserId'],
    data () {
      return {
        text: ''
      }
    },
    methods: {
      inputing (e) {
        if (e.ctrlKey && e.keyCode === 13 && this.text.length) {
          if (isNaN(this.selectUserId)) {
            chat.sendMessage(this.text, 0, this.selectUserId)
          } else {
            chat.sendMessage(this.text, this.selectUserId, 0)
          }
          this.text = ''
        }
      }
    }
  }
</script>

<template>
    <div class="m-text">
        <textarea placeholder="按 Ctrl + Enter 发送" v-model="text" @keyup="inputing"></textarea>
    </div>
</template>

<style lang="less">
    .m-text {
        height: 160px;
        border-top: solid 1px #ddd;

        textarea {
            padding: 10px;
            height: 100%;
            width: 100%;
            border: none;
            outline: none;
            font-family: "Micrsofot Yahei";
            resize: none;
        }
    }
</style>