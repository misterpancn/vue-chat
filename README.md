# vue-chat

> 基于electron-vue开发的桌面简易聊天工具

### 功能

- 群聊与单聊，加群加好友
- 支持语音发送
- 支持视频聊天
- 支持文件发送

#### Operating environment
package|version
---|---
npm|6.9.0
nodejs|10.16.0

#### Build Setup

``` bash
# install dependencies run root/administrator
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

#### Config Setup
```bash
# setup config file
cd src/renderer/store/config
cp config.js.example config.js
```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
