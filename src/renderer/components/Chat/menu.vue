<script>
  export default {
    methods: {
      logout () {
        this.$Modal.confirm({
          title: '您真的要退出登录吗？',
          loading: true,
          onOk: () => {
            this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId})
              .then((response) => {
                if (response.data.status_code === 200) {
                  this.$Message.success('退出成功')
                  this.$Modal.remove()
                  this.$router.push('/login')
                } else {
                  this.$Notice.warning({
                    title: '提醒',
                    desc: '退出失败，请稍后重试'
                  })
                  this.$Modal.remove()
                }
              }).catch((error) => {
                this.$Notice.error({
                  title: '提醒',
                  desc: error
                })
                this.$Modal.remove()
                this.$router.push('/login')
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