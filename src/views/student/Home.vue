<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { QrcodeStream } from 'vue-qrcode-reader'
import { useAuthStore } from "@services/unniversal/store"
import { type Role, type Feed } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { getTempos } from '@services/lecturer/tempo'
import { secureQR, validateQR } from '@services/unniversal/qr'
import { getPleas } from '@services/lecturer/pleas'
import { formatDate } from '@components/utils/unniversal'

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
  attended: any[] | null
  status: boolean
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

interface Plea {
  courseCode: string
  unitCode: string
  scheduledDate: Date
  scheduledTime: string
  fileName: string
  fileUrl: string
}

const activeTab = ref<'classes' | 'scanner'>('classes')
const serverRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null })

const units = ref<Unit[] | null>(null)
const course = ref<Course | null>(null)
const user = ref<User | null>(null)

const scheduleList = ref<Schedule[]>([])
const pleaList = ref<Plea[]>([])
const currentCoursePlea = ref<boolean>(false)

const scheduleTable = ref<HTMLTableElement | null>(null)
const role = computed(() => {
  return (auth.intendedRole ?? getRole(route.path)) as any as MODULES;
})

const scannedData = ref<string | null>(null)
const currentCourse = ref('')
const currentUnit = ref('')

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
          u =>
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
      if (res.status && Array.isArray(res.data.schedules)) {
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

        return
      }
      if (!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    else if (target?.toLowerCase() === 'pleas') {
      const selectedCourseCode = currentCourse.value

      if (!selectedCourseCode) {
        throw new Error('Invalid course selected')
      }

      res = await getPleas(selectedCourseCode)
      if (res.status && Array.isArray(res.data.pleas)) {
        pleaList.value = res.data.pleas.map((p: any) => ({
          ...p,
          scheduledDate: new Date(p.scheduledDate)
        }))


        const filteredSchedules = scheduleList.value.filter(schedule => {
          const match = pleaList.value.some(plea =>
            plea.courseCode === schedule.courseCode &&
            plea.unitCode === schedule.unitCode &&
            new Date(plea.scheduledDate).toISOString().split('T')[0] ===
              new Date(schedule.scheduledDate).toISOString().split('T')[0] &&
            plea.scheduledTime === schedule.scheduledTime
          )
          return !match
        })

        scheduleList.value = filteredSchedules
        return
      }
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

const handleValidateQR = async (data: any | null = null) => {
  feed.value = { show: false, status: null, msg: null }
  try {
    if (!data) {
      throw new Error('Invalid QR Code')
    }
    
    serverRequest.value = true
    const res = await validateQR(data, auth.regNO)
    feed.value = {
      show: true,
      status: res.status,
      msg: res.data ? res.data.message : res.msg || 'Attendance Confirmed'
    }
    if(res.status) {
      setTimeout(() => activeTab.value = 'classes' , 1000);
    }
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to validate QR Code'
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

const onDetect = (data: any) => {
  scannedData.value = data
  handleValidateQR(data)
}


const attendClass = async(item: Schedule) => {

  currentCourse.value = item.courseCode
  currentUnit.value = item.unitCode
  activeTab.value = 'scanner'
  scannedData.value = null
  
  await fetchServer('pleas', false)
  await nextTick()

  pleaList.value.forEach(plea => {
    if(plea.scheduledDate.toISOString().split('T')[0] === item.scheduledDate && plea.scheduledTime === item.scheduledTime) {
      currentCoursePlea.value = true
    }
    else {
      currentCoursePlea.value = false
    }
  })
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
    const existing = $(el).DataTable()
    if (existing) existing.destroy()
    $(el).DataTable()
  }
})

watch(scheduleList, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    newVal.forEach(schedule => {
      if (schedule.attended) {
        const attended = secureQR(schedule.attended, false);
        attended.forEach((user: any) => {
          if (user.student?.toLowerCase() === auth.regNO?.toLowerCase()) {
          schedule.status = true
          }
        })
      }
    });
  }
});

watch(activeTab, async(newTab) => {
  scheduleList.value = []
  if (newTab === 'classes') {
    await fetchServer('users')
    await fetchServer('courses')
    await fetchServer('units')
    await fetchServer('schedules', false)
    await nextTick()
  } else {
    serverRequest.value = false
  }
})

onMounted(async () => {
  await fetchServer('users')
  await fetchServer('courses')
  await fetchServer('units')
  await fetchServer('schedules', false)
  await nextTick()
})

defineExpose({ QrcodeStream, onDetect, getTitle, handleValidateQR, attendClass, done, formatDate })
</script>

<template lang="pug">
div
  div(v-if="activeTab === 'classes'")
    .row.justify-content-center.align-items-center(v-if="serverRequest")
      .col-auto
        span.fa-solid.fa-spinner.fa-spin
    .row.justify-content-text-center.align-items-center(v-else-if="feed.show")
      .col-auto
        span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
    .row.justify-content-center.align-items-center(v-else)
      div.table-responsive(v-if="scheduleList && scheduleList.length > 0" )
        table#scheduleTable.table(ref="scheduleTable")
          thead
            tr
              th Course Code
              th Unit Code
              th Date
              th Status
          tbody
            tr(v-for="item in scheduleList" :key="item.courseCode + item.unitCode + item.scheduledDate")
              td {{ getTitle(item.courseCode, 'course') }}
              td {{ getTitle(item.unitCode, 'unit') }}
              td {{ formatDate(item.scheduledDate) }}
              td
                button.btn.btn-primary(@click="attendClass(item)" v-if="!item.status") Attend
                span(v-else) Attended
      p.text-muted(v-else) Nothing scheduled for today.
  div(v-else-if="activeTab === 'scanner'" class="p-3")
    .row.justify-content-center.align-items-center(v-if="serverRequest")
      .col-auto
        span.fa-solid.fa-spinner.fa-spin
    .row.justify-content-text-center.align-items-center(v-else-if="feed.show")
      .col-auto
        span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
    .row.justify-content-center.align-items-center(v-else)
      .card
        .card-body.text-center(v-if="currentCoursePlea")
          p.text-muted 
            | Unable to complete attendance
            br
            | Pending plea found for this schedule
            br
            | Wait for response from lecturer
          .mt-3
            button.btn.btn-sm.btn-outline-danger(@click.prevent="done") Cancel
        .card-body.text-center(v-else)
          h5 Course Code: {{ getTitle(currentCourse, 'course') }}
          h5 Unit Code: {{ getTitle(currentUnit, 'unit') }}
          h5 Student: {{ user.regNO }}
          div.border.border-primary.rounded.p-3
            qrcode-stream(@detect="onDetect")
          .mt-3
            button.btn.btn-sm.btn-outline-danger(@click.prevent="done") Cancel
</template>

