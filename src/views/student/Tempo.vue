<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { useAuthStore } from "@/services/unniversal/store"
import { type Role, type Feed } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { getTempos } from '@services/lecturer/tempo'
import { formatDate, formatTime } from '@components/utils/unniversal'

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

const fetchServer = async (target: string | null = null, multiple: boolean = false) => {
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
      const selectedCourseCode = course.value?.courseCode

      if (!selectedCourseCode) {
        throw new Error('Invalid course selected')
      }

      res = await getTempos(selectedCourseCode)
      if (res.status && Array.isArray(res.data.schedules)) {
        scheduleList.value = res.data.schedules
        return
      }
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
defineExpose({ formatDate, formatTime, getTitle })
</script>


<template lang="pug">
div.container.mt-4
  h1.mb-4 Schedule Planner
  div.mt-4
    .row.justify-content-center.align-items-center(v-if="serverRequest")
      .col-auto
        span.fa-solid.fa-spinner.fa-spin
    .row.justify-content-text-center.align-items-center(v-else-if="feed.show")
      .col-auto
        span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
    .row.justify-content-center.align-items-center(v-else)
      div.table-responsive(v-if="scheduleList && scheduleList.length > 0")
        table#scheduleTable.table.table-striped(ref="scheduleTable")
          thead
            tr
              th Course
              th Unit
              th Date
              th Time
          tbody
            tr(v-for="item in scheduleList" :key="item.courseCode + item.unitCode + item.scheduledDate")
              td {{ getTitle(item.courseCode, 'course') }}
              td {{ getTitle(item.unitCode, 'unit') }}
              td {{ formatDate(item.scheduledDate) }}
              td {{ formatTime(item.scheduledTime) || '-' }}
      p.text-muted(v-else) No schedule added. Add new schedules.
</template>