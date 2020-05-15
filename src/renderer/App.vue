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
  #app {
    margin: 20px auto;
    max-width: 800px;
  }
</style>
