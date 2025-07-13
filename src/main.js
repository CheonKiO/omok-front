import './assets/main.css';
import './assets/reset.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { faHandsPraying, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

library.add(faHandsPraying);
library.add(faFlag);
library.add(faArrowLeft);
library.add(faPlus);

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia());
app.use(router);

app.mount('#app');
