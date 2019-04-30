/**
 * Created by buck on 2019/4/30.
 */
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from 'iview/dist/locale/en-US'
import zh from 'iview/dist/locale/zh-CN'
import enlocal from './en'
import zhlocal from './zh'

Vue.use(VueI18n);
Vue.locale = () => {};
const messages = {
  en: Object.assign(enlocal, en),
  zh: Object.assign(zhlocal, zh)
};

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'zh',
  messages
});
export default i18n
