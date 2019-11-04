<script>
  import axios from '@/request'
  import addGroupUser from './addGroupUser.vue'
  export default {
    components: { addGroupUser },
    data () {
      return {
        group: {},
        removeUser: false,
        groupUserName: '',
        showEdit: false,
        showEditGroupName: false,
        groupName: ''
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
          if (!val) {
            this.removeUser = false
          }
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
        this.$store.dispatch('upUserInfoShow', true)
        this.$store.dispatch('setUserInfo', uid).catch((e) => {
          this.$Message.warning({
            content: this.$t('notifyTitle.errorOccurred'),
            duration: 3
          });
          this.$store.dispatch('upUserInfoShow', false)
        })
      },
      addGroupUser () {
        this.$store.dispatch('addGroupUserShow', true)
      },
      quitTheGroup (uid, self) {
        this.$Modal.confirm({
          title: (self ? this.$t('notify.haveConfirmOperation') : this.$t('chat.notify.confirmRemoveGroupUser')),
          loading: true,
          onOk: () => {
            axios.quitTheGroup(this.groupId, uid).then((r) => {
              // 退出成功后重新获取群成员
              if (!self) {
                axios.getGroupMember(this.groupId).then((r) => {
                  this.group = r.data.data
                  this.$Modal.remove()
                  this.$Message.success({
                    content: this.$t('notify.successOperation'),
                    duration: 3
                  });
                }).catch(() => {
                  this.$Message.error({
                    content: this.$t('notifyTitle.errorOccurred'),
                    duration: 3
                  });
                  this.$Modal.remove()
                })
              } else {
                this.$Modal.remove()
                this.show = false
                this.$store.dispatch('setSelectId', 0)
                this.$store.dispatch('setIsGroup', false)
              }
            }).catch((e) => {
              this.$Message.error({
                content: e.response.data.data,
                duration: 3
              });
              this.$Modal.remove()
            })
          }
        })
      },
      changeGroupUserName () {
        if (this.groupUserName === '' || this.groupUserName === this.group.current_user.group_user_name) {
          this.$Message.warning({
            content: this.$t('account.notify.fillInIncorrect'),
            duration: 2
          });
          this.showEdit = false
          return false;
        }
        axios.editGroupUserName({group_id: this.groupId, name: this.groupUserName}).then((r) => {
          this.$Message.success({
            content: this.$t('notify.successOperation'),
            duration: 3
          });
          this.group.current_user.group_user_name = this.groupUserName
          // 修改成功之后在获取一次群信息  以便更新显示名称
          axios.getGroupMember(this.groupId).then((r) => {
            this.group = r.data.data
          })
          this.$store.dispatch('currentGroupUser', this.$store.getters.getUser.userId)
          this.showEdit = false
        }).catch((e) => {
          this.$Message.error({
            content: e.response.data.data,
            duration: 3
          });
          this.showEdit = false
        })
      },
      changeGroupName () {
        if (this.groupName === '' || this.groupName === this.group.group_name) {
          this.$Message.warning({
            content: this.$t('account.notify.fillInIncorrect'),
            duration: 2
          });
          this.showEditGroupName = false
          return false;
        }
        axios.editGroupName({group_id: this.groupId, name: this.groupName}).then((r) => {
          this.$Message.success({
            content: this.$t('notify.successOperation'),
            duration: 3
          });
          this.group.group_name = this.groupName
          // 修改成功之后在获取一次群信息  以便更新显示名称
          axios.getGroupMember(this.groupId).then((r) => {
            this.group = r.data.data
          })
          this.showEditGroupName = false
        }).catch((e) => {
          this.$Message.error({
            content: e.response.data.data,
            duration: 3
          });
          this.showEditGroupName = false
        })
      }
    }
  }
</script>
<template>
    <Drawer v-model="show" :closable="false" :styles="{top: '50px'}" footer-hide>
        <p slot="header" style="text-align: center;">{{ $t('chat.groupInformation') }}</p>
        <div class="m-ui-content-group-user" v-if="group.group_id">
            <div class="m-ui-gu-gi">
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('chat.groupName')}}</Col>
                    <Col span="16">
                    <span v-if="!showEditGroupName">{{group.group_name}}</span>
                    <Input v-if="showEditGroupName" v-model="groupName" size="small" :placeholder="group.group_name" @keyup.esc.native="showEditGroupName = false" @on-blur="changeGroupName" />
                    <Icon v-if="!showEditGroupName && group.user_id === user.userId" style="margin-left: 15px;cursor: pointer" @click="groupName = group.group_name;showEditGroupName = true" type="ios-create" size="20" />
                    </Col>
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
            <div class="m-ui-group-member">
                <div class="m-ui-g-user" v-if="group.group_members" v-for="item in group.group_members" :key="item.group_user_id">
                    <img :src="item.photo" width="50" height="50" @click="getUserInfo(item.user_id)" style="cursor: pointer">
                    <div v-if="removeUser && group.user_id !== item.user_id" style="position: absolute;top:0;right: 0;">
                        <Icon style="cursor: pointer" @click="quitTheGroup(item.user_id, false)" type="md-close-circle" color="red" size="14" />
                    </div>
                    <span :title="item.group_user_name">{{item.group_user_name}}</span>
                </div>
                <div class="m-ui-g-user">
                    <Icon type="md-add-circle" size="40" style="line-height: 80px;cursor: pointer;" @click="addGroupUser" />
                </div>
                <div class="m-ui-g-user" v-if="group.user_id === user.userId">
                    <Icon type="md-remove-circle" size="40" @click="removeUser ? removeUser = false : removeUser = true" style="line-height: 80px;cursor: pointer;" />
                </div>
            </div>
            <Divider orientation="left" size="small">{{$t('account.personalInformation')}}</Divider>
            <div class="m-ui-gu-gi">
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('account.groupUsername')}}</Col>
                    <Col span="16">
                    <span v-if="!showEdit">{{group.current_user.group_user_name}}</span>
                    <Input v-if="showEdit" v-model="groupUserName" size="small" :placeholder="group.current_user.group_user_name" @keyup.esc.native="showEdit = false" @on-blur="changeGroupUserName" />
                    <Icon v-if="!showEdit" style="margin-left: 15px;cursor: pointer" @click="groupUserName = group.current_user.group_user_name;showEdit = true" type="ios-create" size="20" />
                    </Col>
                </Row>
                <Row class="m-ui-gu-row">
                    <Col span="8">{{$t('account.joinTime')}}</Col><Col span="16">{{group.current_user.created_at}}</Col>
                </Row>
            </div>
            <div class="m-ui-group-user-bottom">
                <Button type="error" long @click="quitTheGroup(user.userId, true)">{{$t('chat.quitTheGroup')}}</Button>
            </div>
        </div>
        <div class="m-ui-content-group-user" v-else><Spin fix></Spin></div>
        <add-group-user v-bind:group="group"></add-group-user>
    </Drawer>
</template>
<style lang="less">
    .m-ui-content-group-user {
        position: relative;
        overflow-y: auto;
        min-height: 150px;
        height: 100%;
        .m-ui-gu-gi {
            margin-bottom: 10px;
            .m-ui-gu-row {
                padding: 6px 0;
            }
        }
        .m-ui-group-user-bottom {
            position: absolute;
            bottom: 0px;
            width: 100%;
        }
        .m-ui-group-member {
            margin: 10px 0;
            width: 100%;
            float: left;
            max-height: 50vh;
            overflow-y: auto;
            .m-ui-g-user {
                float: left;
                width: 30%;
                text-align: center;
                height: 80px;
                position: relative;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            span {
                vertical-align: middle;
                text-align: center;
                display: block;
            }
        }
    }
</style>