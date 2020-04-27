<script>
  import groupUser from './Modal/groupUser'
  import userInfoModal from './Modal/userInformation'
  export default {
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

<template>
    <div class="m-u-name">
        {{ selectUser }}
        <div v-if="selectId" style="float: right">
            <Icon style="cursor: pointer" @click="show" type="md-menu" size="20" />
        </div>
        <group-user></group-user>
        <userInfoModal v-bind:isGroup="isGroup"></userInfoModal>
    </div>
</template>

<style lang="less">
    .m-u-name {
        width: 100%;
        height: 30px;
        padding: 0 10px;
        line-height: 30px;
        text-align: center;
        font-size: 1.3em;
    }
</style>