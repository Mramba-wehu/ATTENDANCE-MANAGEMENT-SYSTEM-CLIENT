<script setup lang="ts">
import { onMounted, ref, computed, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute } from "vue-router"
import { useAuthStore } from "@/services/unniversal/store"
import { type Role, type Feed, Schemas, Validate } from '@services/unniversal/validation'
import { getUsers } from '@services/unniversal/profile'
import { getCourses, getUnits } from '@services/unniversal/course'
import { getRole } from "@components/utils/role"
import { deleteNote, downloadNote, getNotes, newNote } from '@services/lecturer/note'

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

type NoteForm = {
  courseCode: string
  unitCode: string
  notesFile: File | null
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

const form = ref<NoteForm>({
  courseCode: '',
  unitCode: '',
  notesFile: null,
})

const errors = ref<Partial<Record<keyof NoteForm, { msg: string }>> | null>(null)
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
  form.value.notesFile = file || null
}

const handleSubmitNote = async (): Promise<void> => {
  feed.value = { show: false, status: null, msg: null }
  try {
    const selectedCourseCode = course.value?.courseCode

    if (!selectedCourseCode) {
      throw new Error('Invalid course selected')
    }
    else {
      form.value.courseCode = selectedCourseCode
    }

    const schema = Schemas.notes
    const data = { ...form.value }

    const { status, error } = await Validate(schema, data)
    if (!status) {
      errors.value = error
      return
    }

    serverRequest.value = true

    const res = await newNote(data)
    setTimeout(() => {
      feed.value = {
        show: true,
        status: res.status ? false : true,
        msg: res.data ? res.data.message : res.msg || 'Note added succesfully'
      }

      if(res.status) setTimeout(done, 500)
    }, 1500);
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to update Note'
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

      if(res?.status) setTimeout(done, 500)
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

const handleDeleteNote = async(unitCode: string | null = null): Promise<void> => {
  serverRequest.value = false
  try {
    if (!unitCode) {
      throw new Error('Invalid note')
    }

    serverRequest.value = true

    const res = await deleteNote(unitCode)
    setTimeout(() => {
      feed.value = {
        show: true,
        status: res?.status ? true : false,
        msg: res?.status ? res.data.message :  res.msg || 'Unable to delete note'
      }

      if (res.status) {
        notesList.value = notesList.value.filter(note => note.unitCode !== unitCode);
        setTimeout(() => {
          done();
        }, 500);
      }
    }, 1000)
  } catch (error: any) {
    feed.value = {
      show: true,
      status: false,
      msg: error.message || 'Unable to delete note'
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

watch(activeTab, async(newTab) => {
  if (newTab === 'view') {
    notesList.value = []
    await fetchServer('users')
    await fetchServer('courses')
    await fetchServer('units')
    await fetchServer('notes', false)
    await nextTick()
  } else {
    serverRequest.value = false
  }
})

watch(notesTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

const done = (): void => {
  form.value = {
    courseCode: '',
    unitCode: '',
    notesFile: null
  }

  activeTab.value = 'view'
}

onMounted(async () => {
  await fetchServer('users')
  await fetchServer('courses')
  await fetchServer('units')
  await fetchServer('notes', false)
  await nextTick()
})

defineExpose({ activeTab, onFileChange, handleSubmitNote, handleDownloadNote, handleDeleteNote, done, getTitle })
</script>

<template lang="pug">
div.container.mt-4
  h1.mb-4 Notes

  ul.nav.nav-tabs
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'view' }", href="#", @click.prevent="activeTab = 'view'") View Notes
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'upload' }", href="#", @click.prevent="activeTab = 'upload'") Upload Notes

  div.mt-4
    div(v-if="activeTab === 'upload'")
      .row.justify-content-text-center.align-items-center(v-if="feed.show")
        .col-auto
          span(:class="feed.status ? 'text-success' : 'text-danger'") {{ feed.msg }}
      .row.justify-content-center.align-items-center(v-else)
        form(@submit.prevent="handleSubmitNote", enctype="multipart/form-data", novalidate)
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
            label.form-label(for="notesFile") Notes PDF
            input.form-control#notesFile(type="file", @change="onFileChange", accept=".pdf")
            small.text-danger {{ errors?.notesFile?.msg }}

          button.btn.btn-primary(type="submit", :disabled="serverRequest")
            span.fa-solid(:class="serverRequest ? 'fa-spinner fa-spin' : 'fa-plus' ")
            span.ms-1 {{ serverRequest ? 'Uploading' : 'Upload Note' }}

    div(v-else)
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
                th(colspan="2") Actions
            tbody
              tr(v-for="note in notesList" :key="note.fileUrl")
                td {{ getTitle(note.courseCode, 'course') }}
                td {{ getTitle(note.unitCode, 'unit') }}
                td {{ note.fileName }}
                td
                  a.btn.btn-sm.btn-outline-primary(@click.prevent="handleDownloadNote(note)") Download
                td
                  button.btn.btn-sm.btn-outline-danger(@click=`handleDeleteNote(note.unitCode)`) Delete

        p.text-muted(v-else) No notes added. Add new notes.
</template>