<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { useAuthStore } from "@/services/unniversal/store"
import { type Role, type Feed } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { getTempos } from '@services/lecturer/tempo'
import { getPleas, updatePleaStatus } from '@services/lecturer/pleas'
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
  fileName: string
  fileUrl: string
}

interface Schedule {
  courseCode: string
  unitCode: string
  scheduledDate: string
  scheduledTime: string
  attended: any[] | null
  status: boolean
}

interface Plea {
  _id: string | null
  regNo: string
  courseCode: string
  unitCode: string
  scheduledDate: Date
  scheduledTime: string
  fileName: string
  fileUrl: string
  reason: string
}

const serverRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null })

const units = ref<Unit[] | null>(null)
const course = ref<Course | null>(null)
const user = ref<User | null>(null)
const scheduleList = ref<Schedule[]>([])

const pleaList = ref<Plea[]>([])

const pleaTable = ref<HTMLTableElement | null>(null)

const selected = ref<Plea | null>(null)
const pleaAction = ref<boolean | null>(null)

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

      if(!res.status) multiple = res.status
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
      if(!res.status) multiple = res.status
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
      if(!res.status) multiple = res.status
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
      if(!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    else if (target?.toLowerCase() === 'pleas') {
      const selectedCourseCode = course.value?.courseCode

      if (!selectedCourseCode) {
        throw new Error('Invalid course selected')
      }

      res = await getPleas(selectedCourseCode)
      if (!res.data) {
        feed.value = {
          show: true,
          status: false,
          msg: res.msg || 'Pleas not found'
        }
        pleaList.value = []
        return
      }
      
      if (res.status && Array.isArray(res.data.pleas)) {
        pleaList.value = res.data.pleas
        return
      }
      if(!res.status) multiple = res.status
      status = res.status
      msg = res.data?.message ?? res.msg
    }

    if(!multiple) {
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
    if(!multiple) {
      setTimeout(() => {
        serverRequest.value = false
        setTimeout(() => {
          feed.value = { show: false, status: null, msg: null }
        }, 2000)
      }, 2000)
    }
  }
}

const handlePleaStatus = async(action: boolean | null = null): Promise<void> => {
  try {
    if (action === null) {
      throw new Error('Invalid action')
    }

    if (!selected.value?._id) {
      throw new Error('Invalid plea')
    }

    pleaAction.value = action

    const payload = { id: selected.value._id, action }

    serverRequest.value = true

    const res = await updatePleaStatus(payload)
    feed.value = {
      show: true,
      status: res.status,
      msg: res.data ?  res.data?.message : res.msg
    }

    if(res.status) {
      await fetchServer('users')
      await fetchServer('courses')
      await fetchServer('units')
      await fetchServer('schedules')
      await fetchServer('pleas', false)
      await nextTick()
    };

  } catch (err: any) {
    done()
    feed.value = {
      show: true,
      status: false,
      msg: err.message || 'Failed to fetch from server'
    }
  } finally {
    setTimeout(() => {
      serverRequest.value = false
      setTimeout(async() => {
        feed.value = { show: false, status: null, msg: null }
        await fetchServer('users')
        await fetchServer('courses')
        await fetchServer('units')
        await fetchServer('schedules')
        await fetchServer('pleas', false)
        await nextTick()
      }, 2000)
    }, 2000)
  }
}

const getTitle = (code: string | null = null, type: 'unit' | 'course'): any => {
  if (type === 'unit' && code) {
    return (
      units.value?.find(u => u.unitCode.toLowerCase() === code.toLowerCase())?.unitTitle.toUpperCase() ?? code
    );
  }

  if (type === 'course' && code) {
    return (
      course.value?.courseCode.toLowerCase() === code.toLowerCase()
        ? course.value.courseTitle.toUpperCase()
        : code
    );
  }

  return code;
}

const viewPlea = (plea: Plea) => {
  selected.value = {
    _id: plea._id,
    regNo: plea.regNo,
    courseCode: plea.courseCode,
    unitCode: plea.unitCode,
    scheduledDate: plea.scheduledDate,
    scheduledTime: plea.scheduledTime,
    fileName: plea.fileName,
    fileUrl: plea.fileUrl,
    reason: plea.reason
  }

  const el = document.getElementById('pleaModal')
  if (!el) {
    alert('Unknown error occurred')
    return
  }

  const modal = new (window as any).bootstrap.Modal(el)

  el.removeEventListener('shown.bs.modal', done)
  el.addEventListener('shown.bs.modal', done)

  modal.show()
}

const done = (): void => {
  document.getElementById('close-modal')?.focus()
}

watch(pleaTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

onMounted(async () => {
  await fetchServer('users')
  await fetchServer('courses')
  await fetchServer('units')
  await fetchServer('schedules')
  await fetchServer('pleas', false)
  await nextTick()
})

defineExpose({ viewPlea, done, getTitle, formatDate, formatTime, handlePleaStatus })
</script>

<template lang="pug">
.container.mt-5
  h2.text-xl.mb-4.font-bold Student Pleas
  .p-1
    .row.justify-content-center.align-items-center(v-if="serverRequest")
      .col-auto
        span.fa-solid.fa-spinner.fa-spin
    .row.justify-content-text-center.align-items-center(v-else-if="feed.show")
      .col-auto
        span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
    .row.justify-content-center.align-items-center(v-else)
      div.table-responsive(v-if="pleaList && pleaList.length > 0")
        table.table.table-striped(ref="pleaTable")
          thead
            tr
              th Course
              th Unit
              th Status
          tbody
            tr(v-for="plea in pleaList" :key="plea.code")
              td {{ getTitle(plea.courseCode, 'course') }}
              td {{ getTitle(plea.unitCode, 'unit') }} 
                br 
                | {{ formatDate(plea.scheduledDate.toString()) }}
                br
                | {{ formatTime(plea.scheduledTime) }}
              td
                span {{ plea.status.toUpperCase() }}
                span.ms-2(v-if="plea.status.toLowerCase() === 'pending'")
                  button.btn.btn-sm.btn-outline-info(@click="viewPlea(plea)") View
      p.text-muted(v-else) No pleas added. Add new plea.
  div.modal.fade#pleaModal(tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false")
    div.modal-dialog.modal-dialog-centered.modal-dialog-scrollable.modal-lg
      div.modal-content
        div.modal-header
          h5.modal-title Plea Details
          button#close-modal.btn-close(type="button", data-bs-dismiss="modal", aria-label="Close")
        div.modal-body
          div.mb-2
            strong Registration No:
            span.ms-2 {{ selected?.regNo }}
          div.mb-2
            strong Course Code:
            span.ms-2 {{ getTitle(selected?.courseCode, 'course') }}
          div.mb-2
            strong Unit Code:
            span.ms-2 {{ getTitle(selected?.unitCode, 'unit') }}
          div.mb-2
            strong Plea:
            p.mt-1.text-muted {{ selected?.reason }}
          div.mb-2.row
            strong Proof
            img.mt-3.img-fluid.img-thumbnail(
              v-if="selected?.fileUrl"
              :src="`/api${selected.fileUrl}`"
              :alt="selected.fileName"
            )

        div.modal-footer
          button.btn.btn-outline-success(type="button", data-bs-dismiss="modal" @click.prevent="handlePleaStatus(true)") Approve
          button.btn.btn-outline-danger(type="button", data-bs-dismiss="modal" @click.prevent="handlePleaStatus(false)") Deny
</template>

<style lang="css" scoped>

.modal-body::-webkit-scrollbar {
  display: none;
}

</style>