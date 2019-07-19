<script>
  import axios from '@/request'
  export default {
    data () {
      return {
        group: {}
      }
    },
    computed: {
      show: {
        get: function () {
          if (this.$store.getters.getGroupUserShow) {
            this.$Spin.hide();
            axios.getGroupMember(this.groupId).then((r) => {
              this.group = r.data.data
            })
          }
          return this.$store.getters.getGroupUserShow
        },
        set: function (val) {
          this.$store.dispatch('setGroupUserShow', val)
        }
      },
      groupId () {
        return this.$store.getters.selectId
      },
      user () {
        return this.$store.getters.getUser
      }
    },
    methods: {
      getUserInfo (uid) {
        if (uid === this.user.userId) {
          this.$Message.warning({
            content: this.$t('notify.thisIsYou'),
            duration: 3
          });
          return false;
        }
        this.$Spin.show()
        this.$store.dispatch('setUserInfo', uid).then((r) => {
          if (r.status === 200) {
            this.$store.dispatch('upUserInfoShow', true)
          }
          this.$Spin.hide();
        }).catch((e) => {
          this.$Message.warning({
            content: this.$t('notifyTitle.errorOccurred'),
            duration: 3
          });
          this.$Spin.hide();
        })
      }
    }
  }
</script>
<template>
    <Modal v-model="show" :mask-closable="false" :styles="{top: '50px'}" footer-hide>
        <p slot="header" style="text-align: center;">{{ $t('chat.groupInformation') }}</p>
        <div class="m-ui-content-group-user" v-if="group.group_id">
            <div class="m-ui-gu-gi">
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('chat.groupName')}}</Col><Col span="16">{{group.group_name}}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('chat.chatId')}}</Col><Col span="16">{{group.group_number}}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('chat.groupOwner')}}</Col><Col span="16">{{group.group_owner_name}}</Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('chat.createTime')}}</Col><Col span="16">{{group.created_at}}</Col>
                </Row>
            </div>
            <Divider orientation="left" size="small">{{$t('chat.groupMembers')}}</Divider>
            <div class="m-ui-g-user" v-if="group.group_members" v-for="item in group.group_members" :key="item.group_user_id">
                <img :src="item.photo" width="50" height="50" @click="getUserInfo(item.user_id)" style="cursor: pointer"><span>{{item.group_user_name}}</span>
            </div>
        </div>
        <div class="m-ui-content-group-user" v-else><Spin fix></Spin></div>
    </Modal>
</template>
<style lang="less">
    .m-ui-content-group-user {
        position: relative;
        overflow-y: auto;
        max-height: calc(100vh - 250px);
        min-height: 150px;
        .m-ui-g-user {
            float: left;
            width: 25%;
            text-align: center;
        }
        .m-ui-gu-gi {
            margin-bottom: 10px;
            .m-ui-gu-row {
                padding: 6px 0;
            }
        }
        span {
            vertical-align: middle;
            text-align: center;
            display: block;
        }
    }
</style>