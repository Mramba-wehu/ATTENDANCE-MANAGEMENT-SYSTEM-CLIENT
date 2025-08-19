<script setup lang="ts">
import { ref, onMounted, watch, getCurrentInstance, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { loadContent } from '@components/utils/unniversal'
import { deleteUser, blockUser, getUsers, updateUser } from '@services/admin/user'
import {
  Schemas,
  Validate,
  type Role,
  type Feed,
  getValidationFields,
  pick,
} from "@services/unniversal/validation";
import { rolePayloadFields } from "@services/unniversal/access";
import { getCourses } from "@services/unniversal/course";

const router = useRouter()
const { appContext } = getCurrentInstance()!
const $ = appContext.config.globalProperties.$

interface User {
  regNo: string
  nationalId: string
  fullNames: string
  courseCode: string
  courseTitle: string
  role: Role
  year: string
  password: string
}

const users = ref<User[] |null>(null)
const serverRequest = ref<boolean>(true)
const manageServerRequest = ref<boolean>(true)
const feed = ref<Feed>({ show: false, status: null, msg: null });
const errors = ref<Partial<Record<string, { msg: string }>> | null>(null);
const errorMsg = ref<string | null>(null)
const activeTab = ref<'users' | 'manage'>('users')
const selectedUser = ref<User | null>(null)
const courseList = ref<{ courseCode: string; courseTitle: string }[]>([]);
const filteredCourses = ref<typeof courseList.value>([]);
const showDropdown = ref<boolean>(false)
const courseTitleInputActive = ref(false)
const usersTable = ref<HTMLTableElement | null>(null)
let fetchTimeout: ReturnType<typeof setTimeout> | null = null

const fetchUsers = async () => {
  serverRequest.value = true
  errorMsg.value = null

  try {
    const res = await getUsers()
    if (res.status) {
      users.value = res.data
    } else {
      errorMsg.value = res.msg || 'Failed to load users.'
    }
  } catch (err) {
    errorMsg.value = 'Network or server error.'
  } finally {
    setTimeout(() => {
      serverRequest.value = false
    }, 500)
  }
}

onMounted(async() => {
  await fetchUsers()
  
  await nextTick()
  $('#usersTable').DataTable()
})

watch(users, async() => {
  if (activeTab.value === 'users') {
    if (fetchTimeout) clearTimeout(fetchTimeout)
    fetchTimeout = setTimeout(() => {
      serverRequest.value = false
    }, 500)
  }
})

watch(activeTab, async(newTab) => {
  if (newTab === 'users') {
    fetchUsers()
    await nextTick()
  } else {
    serverRequest.value = false
  }
})

watch(
  () => selectedUser.value?.courseTitle,
  (newTitle) => {
    if (selectedUser.value && newTitle) {
      selectedUser.value.courseTitle = newTitle.toUpperCase()
    }
  },
  { immediate: true }
)

watch(
  () => selectedUser.value?.courseTitle,
  (val) => {
    if (val && courseTitleInputActive.value) {
      showDropdown.value = true
      filteredCourses.value = courseList.value.filter(course =>
        course.courseTitle.toLowerCase().includes(val.toLowerCase())
      )
    } else {
      showDropdown.value = false
      filteredCourses.value = []
    }
  }
)

const manageUser = (user: User): void => {
  manageServerRequest.value = false
  feed.value = { show: false, status: null, msg: null };
  selectedUser.value = { ...user }
  if (selectedUser.value.role !== 'Admin') {
    fetchCourses()
  }
  activeTab.value = 'manage'
}

const handleUpdateUser = async() => {
  feed.value = { show: false, status: null, msg: null };

  try {
    if (!selectedUser.value?.role || !(selectedUser.value?.role in rolePayloadFields)) {
      return (errors.value = {
        role: { msg: "Please select a valid role." },
      });
    }

    const baseValidationData = {
      regNo: selectedUser.value.regNo,
      nationalId: selectedUser.value.nationalId,
      fullNames: selectedUser.value.fullNames,
      courseCode: selectedUser.value.courseCode,
      year: selectedUser.value.year,
      password: selectedUser.value.password
    };

    const basePayloadData = {
      regNo: baseValidationData.regNo,
      nationalId: baseValidationData.nationalId,
      fullNames: baseValidationData.fullNames,
      courseCode: baseValidationData.courseCode,
      year: baseValidationData.year,
      password: baseValidationData.password,
    };

    const dataForValidation = getValidationFields(
      selectedUser.value.role,
      baseValidationData
    ) as typeof baseValidationData;

    const roleSchemas = {
      admin: Schemas.register.admin,
      lecturer: Schemas.register.lecturer,
      student: Schemas.register.student,
    } as const;

    const schema =
      roleSchemas[selectedUser.value.role.toLowerCase() as keyof typeof roleSchemas];

    const { status, error } = await Validate(schema, dataForValidation);
    if (!status) {
      errors.value = error;
      return;
    }

    const role = selectedUser.value.role as keyof typeof rolePayloadFields;

    const payload = {
      role,
      data: pick(basePayloadData, rolePayloadFields[role]),
    };

    manageServerRequest.value = true;
    const res = await updateUser(payload);
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Update successful.",
      };

      if (res.status) {
        setTimeout(() => {
          done();
        }, 1500);
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Update failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      manageServerRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const fetchCourses = async () => {
  manageServerRequest.value = true;
  feed.value = { show: false, status: null, msg: null };

  try {
    const res = await getCourses();
    setTimeout(() => {
      manageServerRequest.value = false;
      if (res.status) {
        if (res.data.length > 0) {
          const mapped = res.data.map((course: any) => ({
            ...course,
            displayTitle: `${course.courseLevel} in ${course.courseTitle}`,
          }));
          courseList.value = mapped;
          filteredCourses.value = mapped;
        } else {
          feed.value = {
            show: true,
            status: false,
            msg: "No courses found. Please add courses first.",
          };

          setTimeout(() => {
            feed.value.msg = "Navigating to Courses page.";

            setTimeout(() => {
              router.replace("/admin/courses");
            }, 1000);
          }, 1500);
          return;
        }
      }
      else {
        feed.value = {
          show: true,
          status: res.status,
          msg: res.data ? res.data.message : res.msg || "Failed to load Courses.",
        };
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Network or server error.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      manageServerRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 4000);
  }
};

const handleblockUser = async(action: boolean = true) => {
  feed.value = { show: false, status: null, msg: null };

  try {
    if (!selectedUser.value?.role || !(selectedUser.value?.role in rolePayloadFields)) {
      return (errors.value = {
        role: { msg: "Please select a valid role." },
      });
    }

    const payload = {
      regNo: selectedUser.value?.regNo,
      action
    };

    manageServerRequest.value = true;
    const res = await blockUser(payload);
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Block successful.",
      };

      if (res.status) {
        setTimeout(() => {
          done();
        }, 1500);
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Block failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      manageServerRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const handledeleteUser = async() => {
  feed.value = { show: false, status: null, msg: null };

  try {
    if (!selectedUser.value?.role || !(selectedUser.value?.role in rolePayloadFields)) {
      return (errors.value = {
        role: { msg: "Please select a valid role." },
      });
    }

    const payload = {
      regNo: selectedUser.value?.regNo
    };

    manageServerRequest.value = true;
    const res = await deleteUser(payload);
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Delete successful.",
      };

      if (res.status) {
        setTimeout(() => {
          done();
        }, 1500);
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      manageServerRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Delete failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      manageServerRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const done = (): void => {
  selectedUser.value = null
  activeTab.value = 'users'
}

const goToRegister = (): void => {
  loadContent('/admin/register', router)
}

const selectCourse = (course: any) => {
  if (selectedUser.value) {
    selectedUser.value.courseCode = course.courseCode;
    selectedUser.value.courseTitle = course.displayTitle;
  }
  showDropdown.value = false;
};

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

watch(usersTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

defineExpose({ users, manageUser, handleUpdateUser, handleblockUser, handledeleteUser, done, goToRegister, handleBlur, selectCourse })
</script>

<template lang="pug">
.row.content-row.justify-content-center.align-items-center
  ul.nav.nav-tabs
    li.nav-item
      button.nav-link(:class="{ active: activeTab === 'users' }") Users
    li.nav-item
      button.nav-link(@click.prevent="goToRegister") New User
  
  .row.justify-content-center.align-items-center(v-if="serverRequest")
    .col-auto
      span.fa-solid.fa-spinner.fa-spin
      |
  .row.text-danger.justify-content-center.mt-3(v-if="errorMsg")
    .col-auto
      strong {{ errorMsg ?? 'Unable to process request.' }}

  .row.manage-row.justify-content-center.align-items-start(v-if="!serverRequest")
    .col-auto.card.p-2.mt-5(v-if="activeTab === 'users'")
      h4.mb-3 Users
      div.table-responsive(v-if="users && users.length > 0")
        table#usersTable.table(ref="usersTable")
          thead
            tr
              th ID
              th Registration No
              th Role
              th Actions
          tbody
            tr(v-for="(user, i) in users" :key="i")
              td {{ i + 1 }}
              td {{ user.regNo }}
              td {{ user.role }}
              td
                button.btn.btn-sm.btn-outline-primary(@click="manageUser(user)") Manage
      p.text-muted(v-else) No users registered yet. Please regiser new users.
    .col-auto.card.p-2.mt-5(v-if="activeTab === 'manage'" :class="feed.show || manageServerRequest ? 'align-self-md-start align-self-lg-start' : 'align-self-md-end align-self-lg-end'")
      div(v-if="manageServerRequest && !feed.show")
        .row.justify-content-center.align-items-center
          .col-md-6.p-4.text-center
            span.fa-solid.fa-spinner.fa-spin
      div(v-if="feed.show && !manageServerRequest")
        .col-md-6.p-4(:class="feed.status ? 'text-success' : 'text-danger'")
          strong {{ feed.msg }}
      div(v-else v-if="!manageServerRequest && selectedUser")
        h4 Manage User
        form
          .mb-3
            label.form-label National ID
            input.form-control(v-model="selectedUser.nationalId")
            .small.text-danger(v-if="errors?.nationalId") {{ errors.nationalId.msg }}
          .mb-3
            label.form-label Full Names
            input.form-control(v-model="selectedUser.fullNames")
            .small.text-danger(v-if="errors?.fullNames") {{ errors.fullNames.msg }}
          .mb-3(v-if="selectedUser.courseCode && (selectedUser.role === 'Student' || selectedUser.role === 'Lecturer')")
            label.form-label Course Title
            input.form-control(v-model="selectedUser.courseTitle"
              @input="courseTitleInputActive = true"
              @focus="showDropdown = true"
              @blur="handleBlur"
              placeholder="Start typing to search"
              autocomplete="off"
            )
            ul.dropdown-menu.show(
              v-if="showDropdown && filteredCourses.length"
              style="width: 100%; max-height: 200px; overflow-y: auto;"
            )
              li(v-for="course in filteredCourses" :key="course.courseCode")
                a.dropdown-item(@mousedown.prevent="selectCourse(course)") {{ course.displayTitle }}
            .small.text-danger(v-if="errors?.courseCode") {{ errors.courseCode.msg }}
          template(v-if="selectedUser.role.toLowerCase() === 'student'")
            .mb-3
              label.form-label Year
              input.form-control(v-model="selectedUser.year")
              .small.text-danger(v-if="errors?.year") {{ errors.year.msg }}
          .mb-3
            label.form-label Password
            input.form-control(type="password" v-model="selectedUser.password")
            .small.text-danger(v-if="errors?.password") {{ errors.password.msg }}
          .mb-3
            label.form-label Role
            select.form-select(v-model="selectedUser.role")
              option(value="Student") Student
              option(value="Lecturer") Lecturer
              option(value="Admin") Admin
            .small.text-danger(v-if="errors?.role" ) {{ errors?.role?.msg }}
        .mt-3.d-flex.gap-2
          button.btn.btn-outline-success(@click.prevent="handleUpdateUser") Update
          button.btn.btn-outline-warning(@click.prevent="handleblockUser(true)") Block
          button.btn.btn-outline-primary(@click.prevent="handleblockUser(false)") Unblock
          button.btn.btn-outline-danger(@click.prevent="handledeleteUser") Delete
          button.btn.btn-outline-secondary.ms-auto(@click="done") Done
</template>

<style scoped>
.content-row, 
.manage-row  {
  height: 100%;
}

.content-row .nav.nav-tabs {
  position: absolute;
  top: 0;
}

.card {
  width: 100%;
}
</style>