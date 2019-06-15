# vue-chat

> An electron-vue project

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
```javascript
const config = {
  serviceAddress: 'localhost.com', // websocket service
  websocketPort: 1234, // ws port
  connectLimit: 10,
  openssl: false,
  apiVersion: 'prs.dingo.v1',
  allMbPrefix: []
}
export default config
```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
