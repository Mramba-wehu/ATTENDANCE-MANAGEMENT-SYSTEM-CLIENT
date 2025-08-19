import { createApp, type App as VueApp } from 'vue'
import '@/style.css'
import App from '@/App.vue'
import router from '@services/unniversal/router'
import pinia from '@services/unniversal/store'

import $ from 'jquery'
import 'datatables.net'
import 'datatables.net-dt'
import '@/assets/css/dataTables.dataTables.css'

import download from 'downloadjs'

import * as security from '@components/utils/security'

const app: VueApp<Element> = createApp(App)

app.config.globalProperties.$ = $
app.config.globalProperties.security = security
app.config.globalProperties.dl = download

app.use(pinia)
app.use(router)

const mountPoint = document.getElementById('app')
if (mountPoint instanceof HTMLElement) {
  app.mount(mountPoint)
} else {
  throw new Error('Mount point #app not found')
}

const today: string = new Date().toLocaleDateString(undefined, {
  year: 'numeric'
})

document.title = `A.M.S – Attendance Management System | ${today}`