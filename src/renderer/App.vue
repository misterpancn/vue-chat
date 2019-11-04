<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'vue-chat'
  }
</script>

<style>
  /* CSS */
  *, *:before, *:after {
    box-sizing: border-box;
  }
  body, html {
    height: 100%;
    overflow: hidden;
  }
  body, ul {
    margin: 0;
    padding: 0;
  }
  body {
    color: #4d4d4d;
    font: 14px/1.4em 'Helvetica Neue', Helvetica, 'Microsoft Yahei', Arial, sans-serif;
    background: #f5f5f5 url('./../../static/img/bg.jpg') no-repeat center;
    background-size: cover;
    font-smoothing: antialiased;
  }
  ul {
    list-style: none;
  }

  ::-webkit-scrollbar
  {
    width: 5px;  /*滚动条宽度*/
    height: 5px;  /*滚动条高度*/
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track
  {
    border-radius: 2.5px;  /*滚动条的背景区域的圆角*/
    background-color: #e6e6e6;/*滚动条的背景颜色*/
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb {
    border-radius: 2.5px; /*滚动条的圆角*/
    background-color: #A9A9A9; /*滚动条的颜色*/
  }
  #app {
    margin: auto;
    max-width: 100%;
    height: 100%;
  }
</style>
