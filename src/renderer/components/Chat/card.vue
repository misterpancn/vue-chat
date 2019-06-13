<script>
  export default {
    data () {
      return {
        user: this.$store.getters.getUser
      }
    },
    computed: {
      search: {
        get: function () {
          return this.$store.getters.search
        },
        set: function (val) {
          this.$store.dispatch('setSearch', val)
        }
      }
    }
  }
</script>

<template>
    <div class="m-card">
        <header>
            <img class="avatar" width="40" height="40" :alt="user.name" :src="user.photo">
            <Dropdown trigger="contextMenu">
                <p class="name" :title="$t('chat.rightClickMenu')" style="cursor: default">{{user.name}}</p>
                <DropdownMenu slot="list">
                    <DropdownItem>返回</DropdownItem>
                    <DropdownItem>删除</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </header>
        <footer>
            <input class="search" type="text" placeholder="search user..." v-model="search">
        </footer>
    </div>
</template>

<style lang="less">
    .m-card {
    padding: 12px;
    border-bottom: solid 1px #24272C;

    footer {
    margin-top: 10px;
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
    font-size: 16px;
    }
    .search {
    padding: 0 10px;
    width: 100%;
    font-size: 12px;
    color: #fff;
    height: 30px;
    line-height: 30px;
    border: solid 1px #3a3a3a;
    border-radius: 4px;
    outline: none;
    background-color: #26292E;
    }
    }
</style>