<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { useAuthStore } from "@/services/unniversal/store"
import { type Role, type Feed, Schemas, Validate } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { deleteTempo, getTempos, newTempo } from '@services/lecturer/tempo'
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

type TempoForm = {
  courseCode: string
  unitCode: string
  scheduledDate: string
  scheduledTime: string
}

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

const activeTab = ref<'update' | 'view'>('view')
const serverRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null })

const units = ref<Unit[] | null>(null)
const course = ref<Course | null>(null)
const user = ref<User | null>(null)

const form = ref<TempoForm>({
  courseCode: '',
  unitCode: '',
  scheduledDate: '',
  scheduledTime: ''
})

const errors = ref<Partial<Record<keyof TempoForm, { msg: string }>> | null>(null)

const scheduleList = ref<Schedule[]>([])
const scheduleTable = ref<HTMLTableElement | null>(null)
const role = computed(() => {
  return (auth.intendedRole ?? getRole(route.path)) as any as MODULES;
})

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

const handleSubmitTempo = async () => {
  feed.value = { show: false, status: null, msg: null }
  try {
    const selectedCourseCode = course.value?.courseCode

    if (!selectedCourseCode) {
      throw new Error('Invalid course selected')
    }
    else {
      form.value.courseCode = selectedCourseCode
    }

    const schema = Schemas.tempo
    const schedule_data =  {
      courseCode: form.value.courseCode,
      unitCode: form.value.unitCode,
      scheduledDate: form.value.scheduledDate,
      scheduledTime: form.value.scheduledTime
    }

    const { status, error } = await Validate(schema, schedule_data as any)
    if (!status) {
      errors.value = error
      return
    }
    
    serverRequest.value = true

    const res = await newTempo(schedule_data)
    setTimeout(() => {
      feed.value = {
        show: true,
        status: res.status ? false : true,
        msg: res.data ? res.data.message : res.msg || 'Tempo added succesfully'
      }

      if(res.status) setTimeout(done, 500)
    }, 1500);
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to update schedule'
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

const removeSchedule = async(unitCode: string | null = null) => {
  feed.value = { show: false, status: null, msg: null }
  try {
    if (!unitCode) {
      throw new Error('Invalid unit selected')
    }

    serverRequest.value = true

    const res = await deleteTempo(unitCode)
    if (res.status) {
      scheduleList.value = scheduleList.value.filter(
        s => s.unitCode !== unitCode
      );
    }
    
    setTimeout(async() => {
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data ? res.data.message : res.msg || 'Schedule removed succesfully'
      }

      if(res.status) {
        
      } 
    }, 1500);
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to remove schedule'
    }
  } finally {
    setTimeout(async() => {
      serverRequest.value = false
      setTimeout(async() => {
        feed.value = { show: false, status: null, msg: null }
        scheduleList.value = []
        await fetchServer('users')
        await fetchServer('courses')
        await fetchServer('units')
        await fetchServer('schedules', false)
        await nextTick()
      }, 2000)
    }, 2000)
  }
}

const done = (): void => {
  form.value = {
    courseCode: '',
    unitCode: '',
    scheduledDate: '',
    scheduledTime: ''
  }

  activeTab.value = 'view'
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

watch(activeTab, async(newTab) => {
  if (newTab === 'view') {
    scheduleList.value = []
    await fetchServer('users')
    await fetchServer('courses')
    await fetchServer('units')
    await fetchServer('schedules', false)
    await nextTick()
  } else {
    serverRequest.value = false
  }
})

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
defineExpose({ formatDate, formatTime, activeTab, removeSchedule, handleSubmitTempo, done, getTitle })
</script>


<template lang="pug">
div.container.mt-4
  h1.mb-4 Schedule Planner

  ul.nav.nav-tabs
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'view' }", href="#", @click.prevent="activeTab = 'view'") View Schedule
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'update' }", href="#", @click.prevent="activeTab = 'update'") Update Schedule

  div.mt-4
    div(v-if="activeTab === 'update'")
      .row.justify-content-text-center.align-items-center(v-if="feed.show")
        .col-auto
          span(:class="feed.status ? 'text-danger' : 'text-success'") {{ feed.msg }}
      .row.justify-content-center.align-items-center(v-else)
        form(v-if="units && units.length > 0" @submit.prevent="handleSubmitTempo")
          .mb-3.justify-content-start.align-items-center
            label.form-label(for="courseCode") Course Title
            small.text-muted.ps-3(v-if="course") {{ course.courseTitle.toUpperCase() }}

          .mb-3
            label.form-label(for="unitCode") Unit Code
            select.form-select(v-model="form.unitCode")
              option(value="" hidden) -- Select Unit ---
              option(
                v-for="unit in units || []"
                :key="unit?.unitCode"
                :value="unit?.unitCode"
              )
                | {{ unit?.unitTitle?.toUpperCase() }}
            small.text-danger {{ errors?.unitCode?.msg }}

          .mb-3
            label.form-label(for="scheduledDate") Scheduled Date
            input.form-control#scheduledDate(type="date", v-model="form.scheduledDate")
            small.text-danger {{ errors?.scheduledDate?.msg }}
          .mb-3
            label.form-label(for="scheduledTime") Scheduled Time
            input.form-control#scheduledTime(type="time", v-model="form.scheduledTime")
            small.text-danger {{ errors?.scheduledTime?.msg }}
          button.btn.btn-outline-primary(type="submit", :disabled="serverRequest")
            span.fa-solid(:class="serverRequest ? 'fa-spinner fa-spin' : 'fa-plus' ")
            span.ms-1 {{ serverRequest ? 'processing' : 'New Schedule' }}
        div(v-else) No units registered for this course
    div(v-else)
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
                th Action
            tbody
              tr(v-for="item in scheduleList" :key="item.courseCode + item.unitCode + item.scheduledDate")
                td {{ getTitle(item.courseCode, 'course') }}
                td {{ getTitle(item.unitCode, 'unit') }}
                td {{ formatDate(item.scheduledDate) }}
                td {{ formatTime(item.scheduledTime) || '-' }}
                td
                  button.btn.btn-sm.btn-outline-danger(@click="removeSchedule(item.unitCode)") Remove
        p.text-muted(v-else) No schedule added. Add new schedules.
</template>