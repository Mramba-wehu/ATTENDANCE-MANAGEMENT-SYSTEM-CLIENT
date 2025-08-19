import { createApp } from 'vue';
import '@/style.css';
import App from '@/App.vue';
import router from '@services/unniversal/router';
import pinia from '@services/unniversal/store';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt';
import '@/assets/css/dataTables.dataTables.css';
import download from 'downloadjs';
import * as security from '@components/utils/security';
var app = createApp(App);
app.config.globalProperties.$ = $;
app.config.globalProperties.security = security;
app.config.globalProperties.dl = download;
app.use(pinia);
app.use(router);
var mountPoint = document.getElementById('app');
if (mountPoint instanceof HTMLElement) {
    app.mount(mountPoint);
}
else {
    throw new Error('Mount point #app not found');
}
var today = new Date().toLocaleDateString(undefined, {
    year: 'numeric'
});
document.title = "A.M.S \u2013 Attendance Management System | ".concat(today);
