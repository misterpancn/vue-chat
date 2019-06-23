<script>
  import addToModal from '@/components/Chat/Modal/addTo.vue'
  import {ipcRenderer} from 'electron'
  import config from '@/store/config/config'
  import rec from '@/media/recorder'
  export default {
    components: {addToModal},
    methods: {
      logout () {
        this.$Modal.confirm({
          title: this.$t('chat.notify.confirmLogout'),
          loading: true,
          onOk: () => {
            this.$store.dispatch('logout', {uid: this.$store.getters.getUser.userId, badge: this.$store.getters.getBadgeList})
              .then((response) => {
                if (response.data.status_code === 200) {
                  this.$store.dispatch('deleteMessage')
                  this.$store.dispatch('chatDataDestroy')
                  this.$store.dispatch('destroyNotify')
                  this.$store.dispatch('destroyModalStatus')
                  this.$Message.success(this.$t('notify.exitSuccess'))
                  this.$Modal.remove()
                  rec.closeAudio()
                  this.$router.push('/login')
                  ipcRenderer.send('change-win-size', config.windowSize.login)
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
                this.$router.push('/login')
                ipcRenderer.send('change-win-size', config.windowSize.login)
              })
          }
        })
      },
      setting (name) {
        if (name === 'logout') {
          this.logout()
        }
        if (name === 'addTo') {
          this.addTo()
        }
      },
      addTo () {
        this.$store.dispatch('upAddToShow', true)
      }
    },
    mounted () {
      ipcRenderer.on('close-window', () => {
        this.logout()
      })
    }
  }
</script>
<template>
    <div class="m-menu">
        <Dropdown trigger="hover" placement="top-start" transfer @on-click="setting">
            <span><Icon type="ios-settings" slot="prefix" class="setting"></Icon></span>
            <DropdownMenu slot="list">
                <DropdownItem name="addTo">{{$t('chat.addTo')}}</DropdownItem>
                <DropdownItem name="logout">{{$t('account.logout')}}</DropdownItem>
            </DropdownMenu>
        </Dropdown>
        <add-to-modal></add-to-modal>
    </div>
</template>
<style lang="less">
    .m-menu {
        max-height: 55px;
        position: absolute;
        bottom: 0;
        .setting {
            font-size: 20px;
            padding: 10px;
            cursor: pointer;
        }
    }
</style>