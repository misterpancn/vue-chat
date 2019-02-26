<script>
  import store from '@/store'
  import config from '@/store/config/config'
  import axios from 'axios'
  import Qs from 'qs'
  export default {
    methods: {
      logout () {
        this.$Modal.confirm({
          title: '您真的要退出登录吗？',
          loading: true,
          onOk: () => {
            axios.post('https://' + config.serviceAddress + '/login.php?action=logout', Qs.stringify({uid: store.getters.getUser.userId}))
              .then((response) => {
                if (response.data === 'success') {
                  this.$Message.success('退出成功')
                  this.$Modal.remove()
                  this.$router.push('/login')
                } else {
                  this.$Notice.warning({
                    title: '提醒',
                    desc: '退出失败，请稍后重试'
                  })
                  this.$Modal.remove()
                  this.$router.push('/login')
                }
              }).catch((error) => {
                this.$Notice.error({
                  title: '提醒',
                  desc: error
                })
                this.$Modal.remove()
              })
          }
        })
      }
    }
  }
</script>
<template>
    <div class="m-menu">
        <Icon type="md-power" slot="prefix" class="exit" @click="logout"></Icon>
    </div>
</template>
<style lang="less">
    .m-menu {
        max-height: 55px;
        position: absolute;
        bottom: 0;
        .exit {
            font-size: 20px;
            padding: 10px;
            cursor: pointer;
        }
    }
</style>