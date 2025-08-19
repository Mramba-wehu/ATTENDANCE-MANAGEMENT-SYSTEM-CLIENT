<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import QRCode from 'qrcode'
import { useAuthStore } from "@services/unniversal/store"
import { type Role, type Feed } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { getTempos } from '@services/lecturer/tempo'
import { formatDate, formatTime } from '@components/utils/unniversal'
import { newQR, secureQR } from '@services/unniversal/qr'

const enum MODULES {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

const { appContext } = getCurrentInstance()!
const $ = appContext.config.globalProperties.$

const auth = useAuthStore()
const route = useRoute()

interface Schedule {
  courseCode: string
  unitCode: string
  scheduledDate: string
  scheduledTime: string
}

interface Course {
  courseCode: string
  courseTitle: string
  courseLevel: string
}

interface Unit {
  unitCode: string
  unitTitle: string
  unitYear: number
}

interface User {
  regNo: string;
  nationalId: string;
  fullNames: string;
  courseCode: string;
  courseTitle: string;
  role: Role;
}

const activeTab = ref<'classes' | 'qr'>('classes')
const serverRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null })

const units = ref<Unit[] | null>(null)
const course = ref<Course | null>(null)
const user = ref<User | null>(null)

const scheduleList = ref<Schedule[]>([])
const scheduleTable = ref<HTMLTableElement | null>(null)
const role = computed(() => {
  return (auth.intendedRole ?? getRole(route.path)) as any as MODULES;
})

const qrData = ref('')
const currentCourse = ref('')
const currentUnit = ref('')
const rawData = ref<string|null>(null)

const fetchServer = async (target: string | null = null, multiple: boolean = true) => {
  serverRequest.value = true
  feed.value = { show: false, status: null, msg: null }

  try {
    let res;
    let status: boolean = false
    let msg: string | null = null

    if (target?.toLowerCase() === 'users') {
      res = await getUsers()
      if (res.status && Array.isArray(res.data)) {
        user.value = res.data.find(
          (u: User) =>
            u.role.toLowerCase() === role.value.toLowerCase() &&
            u.regNo.toLowerCase() === (auth.regNO?.toLowerCase() ?? "")
        ) || null
      }
      if (!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    else if (target?.toLowerCase() === 'courses') {
      res = await getCourses()
      if (res.status && Array.isArray(res.data)) {
        course.value = res.data.find(
          c => c.courseCode.toLowerCase() === user.value?.courseCode.toLowerCase()
        ) || null
      }
      if (!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    else if (target?.toLowerCase() === 'units') {
      res = await getUnits(user.value?.courseCode)
      if (res.status && Array.isArray(res.data)) {
        units.value = res.data.filter(
          u => u.courseCode.toLowerCase() === user.value?.courseCode.toLowerCase()
        ) || null
      }
      if (!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    else if (target?.toLowerCase() === 'schedules') {
      scheduleList.value = []
      const selectedCourseCode = course.value?.courseCode

      if (!selectedCourseCode) {
        throw new Error('Invalid course selected')
      }

      res = await getTempos(selectedCourseCode)
      if (!res.data.schedules) {
        throw new Error('No schedules found')
      }
      const now = new Date()

      scheduleList.value = res.data.schedules
        .filter((s: Schedule) => {
          const scheduleDate = new Date(s.scheduledDate)
          const [hours, minutes] = s.scheduledTime.split(':').map(Number)

          scheduleDate.setHours(hours, minutes, 0, 0)

          const expiry = new Date(scheduleDate.getTime() + 2 * 60 * 60 * 1000)

          return expiry >= now
        })
        .map((s: Schedule) => ({
          ...s,
          status: false
        }))
      if (!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    if (!multiple) {
      feed.value = {
        show: true,
        status: status,
        msg
      }
    }
  } catch (err: any) {
    feed.value = {
      show: true,
      status: false,
      msg: err.message || 'Failed to fetch from server'
    }

    multiple = false
  } finally {
    if (!multiple) {
      setTimeout(() => {
        serverRequest.value = false
        setTimeout(() => {
          feed.value = { show: false, status: null, msg: null }
        }, 2000)
      }, 2000)
    }
  }
}

const generateQR = async (courseCode: string, unitCode: string, date: string, time: string) => {
  feed.value = { show: false, status: null, msg: null }
  try {
    if (!courseCode || !unitCode || !date || !time) {
      throw new Error('Invalid scheduled unit details')
    }

    currentCourse.value = courseCode
    currentUnit.value = unitCode
    rawData.value = JSON.stringify({
      courseCode,
      unitCode,
      date,
      time,
      lecturer: auth.regNO
    })

    const encodedQRData = secureQR(rawData.value)
    qrData.value = await QRCode.toDataURL(encodedQRData)
    serverRequest.value = true
    const res = await newQR(encodedQRData)
    if(res.status) {
      activeTab.value = 'qr'
    }
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to remove schedule'
    }
  } finally {
    setTimeout(() => {
      serverRequest.value = false
      setTimeout(() => {
        feed.value = { show: false, status: null, msg: null }
      }, 2000)
    }, 2000)
  }
}

const done = () => {
  activeTab.value = 'classes'
}

const getTitle = (code: string, type: 'unit' | 'course'): string => {
  if (type === 'unit') {
    return (
      units.value?.find(u => u.unitCode.toLowerCase() === code.toLowerCase())?.unitTitle.toUpperCase() ?? code
    );
  }

  if (type === 'course') {
    return (
      course.value?.courseCode.toLowerCase() === code.toLowerCase()
        ? course.value.courseTitle.toUpperCase()
        : code
    );
  }

  return code;
}

watch(scheduleTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

onMounted(async () => {
  await fetchServer('users')
  await fetchServer('courses')
  await fetchServer('units')
  await fetchServer('schedules', false)
  await nextTick()
})

defineExpose({ generateQR, done, getTitle, formatDate, formatTime })
</script>

<template lang="pug">
div
  h6.display-6 Today's Schedule
  div(v-if="activeTab === 'classes'")
    .row.justify-content-center.align-items-center(v-if="serverRequest")
      .col-auto
        span.fa-solid.fa-spinner.fa-spin
    .row.justify-content-text-center.align-items-center(v-else-if="feed.show")
      .col-auto
        span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
    .row.justify-content-center.align-items-center(v-else)
      div.table-responsive(v-if="scheduleList && scheduleList.length > 0")
        table#scheduleTable.table(ref="scheduleTable")
          thead
            tr
              th Course
              th Unit
              th Date
              th Time
              th Action
          tbody
            tr(v-for="item in scheduleList" :key="item.courseCode + item.unitCode + item.scheduledDate")
              td {{ getTitle(item.courseCode, 'course') }}
              td {{ getTitle(item.unitCode, 'unit') }}
              td {{ formatDate(item.scheduledDate) }}
              td {{ formatTime(item.scheduledTime) || '-' }}
              td
                button.btn.btn-primary(@click="generateQR(item.courseCode, item.unitCode, item.scheduledDate, item.scheduledTime)") Generate QR
      p.text-muted(v-else) Nothing scheduled for today.
  div(v-else-if="activeTab === 'qr'" class="p-2")
    .card
      .card-body.text-center
        h5 Course: {{ getTitle(currentCourse, 'course') }}
        h5 Unit: {{ getTitle(currentUnit, 'unit') }}
        h5 Lecturer: {{ user.fullNames }}
        h5 Course Code: {{ currentCourse }} 
        h5 Unit Code: {{ currentUnit }}
        div(v-if="qrData")
          img(:src="qrData", alt="QR Code", class="my-2")
        button.btn.btn-success(@click="done") Done
</template>

<style lang="css" scoped>
.card {
  width: 100%;
}
</style>