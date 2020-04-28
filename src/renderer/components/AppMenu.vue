<style lang="less">
    .app-menu {
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 1.3em;
        -webkit-app-region: drag;
        border-bottom: solid 1px #e3e5e8;
        .app-menu-button {
            cursor: pointer;
            padding: 0 6px;
            display: inline-block;
        }
        .default-menu-bg:hover {
            background-color: #c5c8ce;
        }
        .error-menu-bg:hover {
            background-color: #dc6666;
        }
    }
</style>
<template>
    <div class="app-menu">
        <div style="float: left" v-if="showLogo">
            <img src="./../../../static/img/favicon.png" style="-webkit-app-region: no-drag;margin: 5px 0 0 10px;" width="20" height="20" />
        </div>
        <span v-if="selectUser" style="-webkit-app-region: no-drag;">{{ selectUser }}</span>
        <div style="float: right;-webkit-app-region: no-drag;">
            <span class="app-menu-button default-menu-bg" v-if="selectId" @click="show"><Icon type="md-menu" size="18" /></span>
            <span class="app-menu-button default-menu-bg" @click="minimize"><Icon type="md-remove" size="18" /></span>
            <span class="app-menu-button default-menu-bg" @click="screenCtrl"><Icon :type="screenIcon" size="18" /></span>
            <span class="app-menu-button error-menu-bg" @click="appExit"><Icon type="md-close" size="18" /></span>
        </div>
        <group-user v-if="selectUser"></group-user>
        <userInfoModal v-bind:isGroup="isGroup" v-if="selectUser"></userInfoModal>
    </div>
</template>
<script>
  import groupUser from '@/components/Chat/Modal/groupUser'
  import userInfoModal from '@/components/Chat/Modal/userInformation'
  import {ipcRenderer} from 'electron'
  export default {
    props: [ 'showLogo' ],
    data () {
      return {
        screenIcon: 'md-expand'
      }
    },
    components: { groupUser, userInfoModal },
    computed: {
      selectUser () {
        // let info = chat.getUserInfo(this.selectUserId, this.userList, this.groupList)
        let info = this.$store.getters.getSelectUser(this.selectId, this.isGroup)
        return info.name === undefined ? (info.group_name === undefined ? '' : info.group_name) : info.name
      },
      selectId () {
        return this.$store.getters.selectId
      },
      isGroup () {
        return this.$store.getters.isGroup
      }
    },
    filters: {
      selection (list, sear) {
        return list.filter(item => item.name.indexOf(sear) > -1)
      }
    },
    methods: {
      screenCtrl () {
        if (this.screenIcon === 'md-expand') {
          this.screenIcon = 'md-contract'
          ipcRenderer.send('winMaximize')
        } else {
          ipcRenderer.send('winUnMaximize')
          this.screenIcon = 'md-expand'
        }
      },
      appExit () {
        this.$Modal.confirm({
          title: 'Do you want to close the application?',
          loading: true,
          onOk: () => {
            ipcRenderer.send('exit')
          }
        })
      },
      minimize () {
        ipcRenderer.send('winMinimize')
      },
      show () {
        if (this.selectUser && this.isGroup) {
          this.$store.dispatch('setGroupUserShow', true)
        } else if (this.selectId && !this.isGroup) {
          this.$store.dispatch('upUserInfoShow', true)
          let info = this.$store.getters.getSelectUser(this.selectId, this.isGroup)
          this.$store.dispatch('setUserInfo', info.id).catch((e) => {
            this.$Message.warning({
              content: this.$t('notifyTitle.errorOccurred'),
              duration: 3
            });
            this.$store.dispatch('upUserInfoShow', false)
          })
        }
      }
    }
  }
</script>