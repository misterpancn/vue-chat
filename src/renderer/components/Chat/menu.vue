<script>
  export default {
    methods: {
      logout () {
        this.$Modal.confirm({
          title: this.$t('chat.notify.confirmLogout'),
          loading: true,
          onOk: () => {
            this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId})
              .then((response) => {
                if (response.data.status_code === 200) {
                  this.$store.dispatch('deleteMessage')
                  this.$Message.success(this.$t('notify.exitSuccess'))
                  this.$Modal.remove()
                  this.$router.push('/login')
                } else {
                  this.$Notice.warning({
                    title: this.$t('notifyTitle.reminding'),
                    desc: this.$t('chat.notify.exitFailed')
                  })
                  this.$Modal.remove()
                }
              }).catch((error) => {
                this.$Notice.error({
                  title: this.$t('notifyTitle.reminding'),
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