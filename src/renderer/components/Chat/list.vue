<script>
  export default {
    methods: {
      select (value) {
        this.$store.dispatch('setSelectId', value.chat_id > 0 ? value.chat_id : value.group_id)
        this.$store.dispatch('setIsGroup', value.group_id > 0)
        this.$store.dispatch('resetBadge', {
          id: value.chat_id > 0 ? value.chat_id : value.group_id,
          is_group: value.group_id > 0
        })
      },
      badgeCount (item) {
        if (item.group_id) {
          return this.$store.getters.getBadgeCount(item.group_id, true)
        } else if (item.chat_id) {
          return this.$store.getters.getBadgeCount(item.chat_id, false)
        }
      }
    },
    computed: {
      users () {
        return this.$store.getters.searchUser(this.search)
      },
      selectId () {
        return this.$store.getters.selectId
      },
      isGroup () {
        return this.$store.getters.isGroup
      },
      search () {
        return this.$store.getters.search
      }
    },
    filters: {
      img (item) {
        if (!item.is_online && !item.group_id) {
          return 'm-img-gray'
        }
      }
    }
  }
</script>

<template>
    <div v-if="users" class="m-list">
        <ul>
            <li class="m-user-list" v-for="item in users"
                :class="{ active: ((selectId === item.chat_id && !isGroup) || (selectId === item.group_id && isGroup)) }" @click="select(item)">
                <img class="avatar" width="30" height="30" :alt="item.name" :src="item.photo" :class="item | img">
                <Badge :count="badgeCount(item)" style="width: calc(100% - 50px)"><p class="name">{{item.group_id > 0 ? item.group_name : item.name}}</p></Badge>
            </li>
        </ul>
    </div>
</template>

<style lang="less">
    .m-list {
        .m-user-list {
            padding: 12px 15px;
            cursor: pointer;
            transition: background-color .1s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.03);
            }
            &.active {
                background-color: rgba(255, 255, 255, 0.1);
            }
            .m-img-gray {
                -webkit-filter: grayscale(100%);
                -moz-filter: grayscale(100%);
                -ms-filter: grayscale(100%);
                -o-filter: grayscale(100%);
                filter: grayscale(100%);
                filter: gray;
            }
        }
        .avatar, .name {
            vertical-align: middle;
        }
        .avatar {
            border-radius: 2px;
        }
        .name {
            display: inline-block;
            margin: 0 0 0 15px;
        }
    }
</style>