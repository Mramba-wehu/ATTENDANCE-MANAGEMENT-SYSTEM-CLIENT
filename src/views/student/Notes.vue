<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { useAuthStore } from "@/services/unniversal/store"
import { type Role, type Feed } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { downloadNote, getNotes } from '@services/lecturer/note'

const enum MODULES {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

const { appContext } = getCurrentInstance()!
const $ = appContext.config.globalProperties.$
const dl = appContext.config.globalProperties.dl

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

interface Note {
  courseCode: string
  unitCode: string
  fileName: string
  fileUrl: string
}

const activeTab = ref<'upload' | 'view'>('view')
const serverRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null })

const units = ref<Unit[] | null>(null)
const course = ref<Course | null>(null)
const user = ref<User | null>(null)

const notesList = ref<Note[]>([])

const notesTable = ref<HTMLTableElement | null>(null)

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

    else if (target?.toLowerCase() === 'notes') {
      const selectedCourseCode = course.value?.courseCode

      if (!selectedCourseCode) {
        throw new Error('Invalid course selected')
      }

      res = await getNotes(selectedCourseCode)
      if (res.status && Array.isArray(res.data.notes)) {
        notesList.value = res.data.notes
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

const handleDownloadNote = async(note: Note | null = null): Promise<void> => {
  serverRequest.value = false
  try {
    if (!note) {
      throw new Error('Invalid notes file')
    }

    if(!note?.fileUrl) {
      throw new Error('Invalid download link')
    }

    serverRequest.value = true

    const res = await downloadNote(dl, note)
    setTimeout(() => {
      feed.value = {
        show: true,
        status: res?.status ? true : false,
        msg: res?.status ? res.msg : 'Download failed'
      }
    }, 1000)
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to download note'
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

watch(notesTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

onMounted(async () => {
  await fetchServer('users')
  await fetchServer('courses')
  await fetchServer('units')
  await fetchServer('notes')
  await nextTick()
})

defineExpose({ activeTab, handleDownloadNote, getTitle })
</script>

<template lang="pug">
div.container.mt-4
  h1.mb-4 Notes
  div.mt-4
    .row.justify-content-center.align-items-center(v-if="serverRequest")
      .col-auto
        span.fa-solid.fa-spinner.fa-spin
    .row.justify-content-text-center.align-items-center(v-else-if="feed.show")
      .col-auto
        span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
    .row.justify-content-center.align-items-center(v-else)
      div.table-responsive(v-if="notesList && notesList.length > 0")
        table#notesTable.table.table-striped(ref="notesTable")
          thead
            tr
              th Course Code
              th Unit Code
              th Title
              th Actions
          tbody
            tr(v-for="note in notesList" :key="note.fileUrl")
              td {{ getTitle(note.courseCode, 'course') }}
              td {{ getTitle(note.unitCode, 'unit') }}
              td {{ note.fileName }}
              td
                a.btn.btn-sm.btn-outline-primary(@click.prevent="handleDownloadNote(note)") Download

      p.text-muted(v-else) No notes added. Add new notes.
</template>