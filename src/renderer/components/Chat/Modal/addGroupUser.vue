<script>
  import axios from '@/request'
  export default {
    props: [ 'group' ],
    data () {
      return {
        selectUser: [],
        loading: false
      }
    },
    computed: {
      show: {
        get: function () {
          if (this.$store.getters.getAddGroupUserShow) {
            this.$Spin.hide();
          }
          return this.$store.getters.getAddGroupUserShow
        },
        set: function (val) {
          this.$store.dispatch('addGroupUserShow', val)
        }
      },
      friendList () {
        let friendList = this.$store.getters.getUserList
        if (friendList && friendList.length > 0) {
          friendList.map((item) => {
            item.label = item.name
            item.key = item.id
            if (this.group.group_members) {
              for (let i = 0; i < this.group.group_members.length; i++) {
                if (item.id === this.group.group_members[i].user_id) {
                  item.disabled = true
                }
              }
            }
          })
          return friendList
        } else {
          return []
        }
      }
    },
    methods: {
      close () {

      },
      handleChange (newTargetKeys) {
        this.selectUser = newTargetKeys;
      },
      inviteToGroup () {
        if (this.selectUser) {
          this.loading = true;
          axios.inviteToGroup({users: this.selectUser, group_id: this.group.group_id}).then((r) => {
            this.$Message.warning({
              content: r.data.data,
              duration: 3
            });
            this.loading = false;
          }).catch((e) => {
            this.$Message.warning({
              content: e.response.data.data,
              duration: 3
            });
            this.loading = false;
          });
        }
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" footer-hide @on-cancel="close">
        <p slot="header" style="text-align: center;">{{ $t('chat.inviteToGroup') }}</p>
        <div class="m-ui-content">
            <Transfer style="margin-left: 35px"
                    :data="friendList"
                    :target-keys="selectUser"
                    :titles="[$t('chat.theFriendsList'), $t('chat.theSelected')]"
                    filterable
                    @on-change="handleChange"></Transfer>
            <p style="margin-top: 10px;text-align: center"><Button @click="inviteToGroup" :loading="loading">Submit</Button></p>
        </div>
    </Modal>
</template>
<style lang="less">
    .m-ui-content {
        position: relative;
    }
</style>