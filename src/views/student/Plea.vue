<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { useAuthStore } from "@/services/unniversal/store"
import { type Role, type Feed, Schemas, Validate } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { getTempos } from '@services/lecturer/tempo'
import { deletePlea, getPleas, newPlea } from '@services/students/plea'
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

type pleaForm = {
  regNo: string | null
  courseCode: string
  unitCode: string
  scheduledDate: Date | null
  scheduledTime: string | null
  reason: string
  pleaFile: File | null
}

interface Plea {
  courseCode: string
  unitCode: string
  scheduledDate: Date
  scheduledTime: string
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

const activeTab = ref<'plea' | 'view'>('view')
const serverRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null })

const units = ref<Unit[] | null>(null)
const course = ref<Course | null>(null)
const user = ref<User | null>(null)
const scheduleList = ref<Schedule[]>([])

const form = ref<pleaForm>({
  regNo: null,
  courseCode: '',
  unitCode: '',
  scheduledDate: null,
  scheduledTime: null,
  reason: '',
  pleaFile: null,
})

const errors = ref<Partial<Record<keyof pleaForm, { msg: string }>> | null>(null)
const pleaList = ref<Plea[]>([])

const pleaTable = ref<HTMLTableElement | null>(null)

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

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  form.value.pleaFile = file || null
}

const handleSubmitPlea = async (): Promise<void> => {
  errors.value = null
  feed.value = { show: false, status: null, msg: null }
  try {
    const selectedCourseCode = course.value?.courseCode

    if (!selectedCourseCode) {
      throw new Error('Invalid course selected')
    }

    const schedule = scheduleList.value.find(s => s.courseCode === selectedCourseCode);
    const scheduledDate = new Date(schedule?.scheduledDate!);

    if (isNaN(scheduledDate.getTime())) {
      throw new Error('Invalid scheduled date');
    }

    if (!user || !user.value?.regNo) {
      throw new Error('Invalid registraion number')
    }

    form.value.regNo = user.value.regNo
    form.value.courseCode = selectedCourseCode;
    form.value.scheduledDate = scheduledDate;
    form.value.scheduledTime = schedule?.scheduledTime ?? null;

    const schema = Schemas.plea
    const data = { ...form.value }

    const { status, error } = await Validate(schema, data)
    if (!status) {
      errors.value = error
      return
    }

    serverRequest.value = true
    const res = await newPlea(data)
    setTimeout(() => {
      feed.value = {
        show: true,
        status: res.status ? true : false,
        msg: res.data ? res.data.message : res.msg || 'Plea added succesfully'
      }

      if(res.status) setTimeout(done, 500)
    }, 1500);
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to update Plea'
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

const handleDeletePlea = async(pleaID: string | null = null): Promise<void> => {
  serverRequest.value = false
  try {
    if (!pleaID) {
      throw new Error('Invalid Plea')
    }

    serverRequest.value = true

    const res = await deletePlea(pleaID)
    setTimeout(() => {
      feed.value = {
        show: true,
        status: res?.status ? true : false,
        msg: res?.status ? res.data.message :  res.msg || 'Unable to delete plea'
      }

      if (res.status) {
        pleaList.value = pleaList.value.filter((plea: any) => plea._id !== pleaID);
        setTimeout(() => {
          done();
        }, 500);
      }
    }, 1000)
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to delete plea'
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

watch(pleaTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

const done = (): void => {
  form.value = {
    regNo: null,
    courseCode: '',
    unitCode: '',
    scheduledDate: null,
    scheduledTime: null,
    reason: '',
    pleaFile: null
  }

  activeTab.value = 'view'
}

watch(activeTab, async(newTab) => {
  if (newTab === 'view') {
    await fetchServer('users')
    await fetchServer('courses')
    await fetchServer('units')
    await fetchServer('schedules')
    await fetchServer('pleas', false)
  }
  await nextTick()
})

onMounted(async () => {
  await fetchServer('users')
  await fetchServer('courses')
  await fetchServer('units')
  await fetchServer('schedules')
  await fetchServer('pleas', false)
  await nextTick()
})

defineExpose({ activeTab, onFileChange, handleSubmitPlea, handleDeletePlea, done, getTitle, formatDate, formatTime })
</script>

<template lang="pug">
.container.mt-5
  ul.nav.nav-tabs
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'view' }", href="javascript:void(0)", @click="activeTab = 'view'") View Pleas
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'plea' }", href="javascript:void(0)", @click="activeTab = 'plea'") Plea

  .tab-content.mt-4
    .tab-pane.fade(:class="{ show: activeTab === 'view', active: activeTab === 'view' }")
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
                  span(v-if="plea.status.toLowerCase() !== 'pending'") {{ plea.status.toUpperCase() }}
                  span(v-else)
                    button.btn.btn-sm.btn-outline-danger(@click="handleDeletePlea(plea._id)") Delete

        p.text-muted(v-else) No pleas added. Add new plea.
    .tab-pane.fade(:class="{ show: activeTab === 'plea', active: activeTab === 'plea' }")
      .row.justify-content-text-center.align-items-center(v-if="feed.show")
        .col-auto
          span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
      .row.justify-content-center.align-items-center(v-else)
        form(v-if="scheduleList && scheduleList.length > 0" @submit.prevent="handleSubmitPlea", enctype="multipart/form-data", novalidate)
          .mb-3
            label.form-label(for="courseCode") Course Title
            small.text-muted.ps-3(v-if="course") {{ course.courseTitle.toUpperCase() }}

          .mb-3
            label.form-label(for="unitCode") Schedule
            select.form-select(v-model="form.unitCode")
              option(v-if="scheduleList.length > 0" value="" hidden) -- Select Unit ---
              option(
                v-if="scheduleList.length > 0"
                v-for="item in scheduleList"
                :key="item.courseCode + item.unitCode + item.scheduledDate"
                :value="item.unitCode"
              )
                | {{ getTitle(item.unitCode, 'unit') }} {{ item.scheduledDate }} {{ item.scheduledTime }}
              option(v-else value="" hidden) No schedules at this time
            small.text-danger {{ errors?.unitCode?.msg }}
          .mb-3
            label.form-label(for="pleasFile") Plea Proof
            input.form-control#pleasFile(type="file", @change="onFileChange", accept=".png, .jpg, .jpeg")
            small.text-danger {{ errors?.pleaFile?.msg }}
          .mb-3
            label.form-label(for="reason") Reason
            textarea.form-control(
              id="reason",
              rows="4",
              v-model="form.reason",
              :class="{ 'is-invalid': errors?.reason }"
            )
            div.invalid-feedback(v-if="errors?.reason") {{ errors.reason.msg }}

          button.btn.btn-outline-primary(type="submit" :disabled="serverRequest")
            span.fa-solid.me-2(:class="serverRequest ? 'fa-spinner fa-spin': 'fa-plus'")
            span(v-if="serverRequest") Processing
            span(v-else) New Plea
        p.text-muted(v-else)
          span.text-center(v-if="pleaList && pleaList.length > 0") Avaliable schedules already have a plea.
          span.text-center(v-else) No schedules available unable to submit a plea request.
</template>