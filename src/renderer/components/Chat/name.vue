<script>
  export default {
    props: ['selectUserId'],
    computed: {
      selectUser () {
        // let info = chat.getUserInfo(this.selectUserId, this.userList, this.groupList)
        let info = this.$store.getters.getSelectUser(this.selectUserId)
        return info.name === undefined ? (info.group_name === undefined ? '未知' : info.group_name) : info.name
      }
    },
    filters: {
      selection (list, sear) {
        return list.filter(item => item.name.indexOf(sear) > -1)
      }
    }
  }
</script>

<template>
    <div class="m-u-name">
        {{ selectUser }}
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