// starting with version 2.6.0, you need to manually introduce swiper's css
require('swiper/dist/css/swiper.css');

import Vue from 'vue';
import App from './App.vue';
import VueAwesomeSwiper from 'vue-awesome-swiper';

// mount with global
Vue.use(VueAwesomeSwiper);

import {swiper, swiperSlide} from 'vue-awesome-swiper';

Vue.component('swiper', swiper);
Vue.component('swiper-slide', swiperSlide);

import Page from './components/Page.vue';
import PageContainer from './components/PageContainer.vue';
import Editor from './components/Editor.vue';
import PageElement from './components/PageElement.vue';

Vue.component('page', Page);
Vue.component('page-container', PageContainer);
Vue.component('editor', Editor);
Vue.component('page-element', PageElement);

new Vue({
  el: '#app',
  render: h => h(App)
})
