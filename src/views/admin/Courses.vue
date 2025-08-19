<script setup lang="ts">
import { ref, onMounted, watch, getCurrentInstance, nextTick } from 'vue'
import { type Feed, type courseLevel, Schemas, Validate } from '@services/unniversal/validation'
import { getUnits, getCourses, generateCode, register, registerUnit, deleteUnit, updateCourse, deleteCourse } from '@services/unniversal/course'

type Tab = 'courses' | 'new' | 'manage' | 'units'

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
const { appContext } = getCurrentInstance()!
const $ = appContext.config.globalProperties.$

const activeTab = ref<Tab>('courses')
const serverRequest = ref<Boolean>(false);
const feed = ref<Feed>({ show: false, status: null, msg: null });
const errors = ref<Partial<Record<string, { msg: string }>> | null>(null);

const courseUnits = ref<Unit[]>([]);

const courses = ref<Course[]>([])
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const selectedCourseLevel = ref<courseLevel>("")
const coursesTable = ref<HTMLTableElement | null>(null)
const unitsTable = ref<HTMLTableElement | null>(null)

const fetchUnits = async() => {
  serverRequest.value = true;
  feed.value = { show: false, status: null, msg: null };

  try {
    const res = await getUnits(selectedCourse.value?.courseCode);
    serverRequest.value = false;
    if (res.status) {
      if (res.data.length > 0) {
        courseUnits.value = res.data;
      }
    }
    else {
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data ? res.data.message : res.msg || "Failed to load Units.",
      };
    }
  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Network or server error.",
      };
    }, 500);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 500);
  }
}

const fetchCourses = async () => {
  serverRequest.value = true;
  feed.value = { show: false, status: null, msg: null };

  try {
    const res = await getCourses();
    serverRequest.value = false;
    if (res.status) {
      if (res.data.length > 0) {
        courses.value = res.data;
      } else {
        feed.value = {
          show: true,
          status: false,
          msg: "No courses found. Please add courses first.",
        };
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
  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Network or server error.",
      };
    }, 500);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 500);
  }
};

onMounted(async() => {
  await fetchCourses()
  
  await nextTick()
  $('#coursesTable').DataTable()
})

watch(activeTab, async(newTab) => {
  courseUnits.value = []
  if (newTab === 'courses') {
    await fetchCourses()
    await nextTick()
    $('#coursesTable').DataTable()
  } else if (newTab === 'units') {
    await fetchUnits()
    await nextTick()
    $('#unitsTable').DataTable()
  } else {
    serverRequest.value = false
  }
})

const selectedCourse = ref<Course | null>(null)

const newCourse = ref<Course>({
  courseCode: '',
  courseTitle: '',
  courseLevel: ''
})

const newUnit = ref<Unit>({
  unitCode: '',
  unitTitle: '',
  unitYear: 1
})

watch(
  () => newCourse.value?.courseTitle,
  (newVal) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      const title = newVal?.trim();

      if (title && newCourse.value) {
        newCourse.value.courseCode = generateCode(
          title,
          selectedCourseLevel.value.toLowerCase()
        );
      }
    }, 500);
  }
);

watch(
  () => newUnit.value.unitTitle,
  (newVal) => {
    if (debounceTimeout) clearTimeout(debounceTimeout)

    debounceTimeout = setTimeout(() => {
      if (newVal.trim() && selectedCourse.value?.courseLevel) {
        newUnit.value.unitCode = generateCode(
          newUnit.value.unitTitle,
          selectedCourse.value?.courseLevel.toLocaleLowerCase()
        );
      }
    }, 500)
  }
)

watch(
  () => selectedCourse.value?.courseTitle,
  (newVal) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      const title = newVal?.trim();

      if (title && selectedCourse.value) {
        if(selectedCourse.value.courseLevel && !selectedCourse.value.courseCode) {
          selectedCourse.value.courseCode = generateCode(
            title,
            selectedCourse.value.courseLevel.toLowerCase()
          )
        }
      }
    }, 500);
  }
);

const manageCourse = (course: Course): void => {
  selectedCourse.value = { ...course }
  activeTab.value = 'manage'
}

const viewUnits = async() => {
  activeTab.value = 'units'
}

const handleregisterCourse = async () => {
  try {
    if (!selectedCourseLevel.value) {
      return (errors.value = {
        courseLevel: { msg: "Please select a valid course level." },
      })
    }

    feed.value = { show: false, status: null, msg: null }

    const schema = Schemas.register.course;
    const course_data = {
      courseCode: newCourse.value.courseCode,
      courseTitle: newCourse.value.courseTitle,
      courseLevel: selectedCourseLevel.value,
    };
    
    const { status, error } = await Validate(schema, course_data as any);
    if (!status) {
      errors.value = error;
      return;
    }

    serverRequest.value = true;

    const res = await register(course_data);
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Registration successful.",
      };

      if (res.status) {
        setTimeout(() => {
          done();
        }, 1000);
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Registration failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const handleregisterUnit = async() => {
  try {
    if (!selectedCourse.value) {
      return (alert("Please select a valid course level."))
    }

    feed.value = { show: false, status: null, msg: null }

    const schema = Schemas.register.unit;
    const unit_data = {
      unitCode: newUnit.value.unitCode,
      unitTitle: newUnit.value.unitTitle,
      courseCode: selectedCourse.value.courseCode,
      unitYear: Number(newUnit.value.unitYear)
    };
    
    const { status, error } = await Validate(schema, unit_data as any);
    if (!status) {
      errors.value = error;
      return;
    }

    serverRequest.value = true;

    const res = await registerUnit(unit_data);
    
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Registration successful.",
      };

      if (res.status) {
        setTimeout(() => {
          done();
        }, 1000);
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Registration failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const handledeleteUnit = async(unitCode: string) => {
  try {
    if (!selectedCourse.value) {
      return (alert("Please select a valid course level."))
    }

    if (!unitCode) {
      throw new Error('Unit Code required')
    }

    feed.value = { show: false, status: null, msg: null }

    serverRequest.value = true;

    const res = await deleteUnit(unitCode);
    
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Delete successful.",
      };

      if (res.status) {  
        courseUnits.value = courseUnits.value.filter(
          unit => unit.unitCode !== unitCode
        );
        setTimeout(() => {
          done();
        }, 1000);
      }
    }, 1000);

  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Delete failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const handleUpdateCourse = async() => {
  try {
    if (!selectedCourse.value) {
      return (alert("Please select a valid course."))
    }

    feed.value = { show: false, status: null, msg: null }
    
    const schema = Schemas.register.course;
    const course_data = {
      courseCode: selectedCourse.value.courseCode,
      courseTitle: selectedCourse.value.courseTitle,
      courseLevel: selectedCourse.value.courseLevel,
    };
    
    const { status, error } = await Validate(schema, course_data as any);
    if (!status) {
      errors.value = error;
      return;
    }

    serverRequest.value = true;
    
    const res = await updateCourse(course_data);
    setTimeout(() => {
      serverRequest.value = false;
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
        }, 1000);
      }
    }, 1000);
  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Update failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const handleDeleteCourse = async(courseCode: string) => {
  try{
    if (!courseCode) {
      return (alert("Please select a valid course."))
    }

    if (!courseCode) {
      throw new Error('Couse Code required')
    }

    feed.value = { show: false, status: null, msg: null }

    serverRequest.value = true;

    const res = await deleteCourse(courseCode);
    
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: res.status,
        msg: res.data
          ? res.data.message
          : res.msg || "Delete successful.",
      };

      if (res.status) {
        courses.value = courses.value.filter(
          course => course.courseCode !== courseCode
        )
        setTimeout(() => {
          done();
        }, 1000);
      }
    }, 1000);

  } catch (err: any) {
    setTimeout(() => {
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Delete failed.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 3000);
  }
}

const done = (): void => {
  selectedCourse.value = null
  activeTab.value = 'courses'
}

watch(coursesTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

watch(unitsTable, (el) => {
  if (el) {
    $(el).DataTable()
  }
})

defineExpose({ manageCourse, viewUnits, handledeleteUnit, handleregisterUnit, handleregisterCourse, handleUpdateCourse, handleDeleteCourse, done })
</script>

<template lang="pug">
.row.justify-content-center.align-items-center.mt-5(v-if="serverRequest && !feed.show")
  .col-md-6.card.p-4.text-center
    span.fa-solid.fa-spinner.fa-spin
    |
.row.justify-content-center.mt-5(v-if="feed.show && !serverRequest")
  .col-md-6.card.p-4(:class="feed.status ? 'text-success' : 'text-danger'")
    strong {{ feed.msg }}
.row.justify-content-center(v-else v-if="!serverRequest")
  .d-flex.justify-content-between.align-items-center.w-100.mb-2
    ul.nav.nav-tabs
      li.nav-item
        button.nav-link(:class="{ active: activeTab === 'courses' }" @click="activeTab = 'courses'") Courses
      li.nav-item
        button.nav-link(:class="{ active: activeTab === 'new' }" @click="activeTab = 'new'") New Course
    button.btn.btn-sm.btn-outline-secondary(@click="done" v-if="activeTab != 'courses'") Done

  .col-md-8.card.p-3.mt-2(v-if="activeTab === 'courses'")
    h4.mb-3 Registered Courses
    div.table-responsive(v-if="courses && courses.length > 0")
      table#coursesTable.table(ref="coursesTable")
        thead
          tr
            th ID
            th Course Code
            th Course Title
            th Actions
        tbody
          tr(v-for="(course, i) in courses" :key="i")
            td {{ i + 1 }}
            td {{ course.courseCode.toUpperCase() }}
            td {{ course.courseTitle.toUpperCase() }}
            td
              button.btn.btn-sm.btn-outline-primary(@click="manageCourse(course)") Manage
    p.text-muted(v-else) No courses registered yet. Please add a new course.
  .col-md-6.card.p-3.mt-2(v-if="activeTab === 'new'")
    h4.mb-3 Register New Course
    form(@submit.prevent="handleregisterCourse")
      .mb-3
        select.form-select(v-model="selectedCourseLevel")
          option(value="" hidden selected) -- Select Course Level --
          option(value="Certificate") Certificate
          option(value="Diploma") Diploma
          option(value="Bachelor") Bachelor
          option(value="Masters") Masters
          option(value="PhD") PhD
        .small.text-danger(v-if="errors?.courseLevel" ) {{ errors?.courseLevel?.msg }}

      .mb-3
        label.form-label Course Title
        input.form-control(v-model="newCourse.courseTitle" placeholder="e.g., Information Technology")
        .small.text-danger(v-if="errors?.courseTitle" ) {{ errors?.courseTitle?.msg }}
      .mb-3
        label.form-label Course Code
        input.form-control(v-model="newCourse.courseCode" placeholder="e.g., BCS101")
        .small.text-danger(v-if="errors?.courseCode" ) {{ errors?.courseCode?.msg }}
      .mt-3.d-flex.gap-2
        button.btn.btn-outline-primary(type="submit") Save
        button.btn.btn-outline-secondary(type="button" @click="done") Cancel

  .col-md-6.card.p-3.mt-2(v-if="activeTab === 'manage' && selectedCourse")
    h4.mb-3 Manage Course
    form
      .mb-3
        label.form-label Course Code
        input.form-control(v-model="selectedCourse.courseCode")
      .mb-3
        label.form-label Course Title
        input.form-control(v-model="selectedCourse.courseTitle")
    .mt-3.d-flex.gap-2
      button.btn.btn-outline-info(@click.prevent="viewUnits") View Units
      button.btn.btn-outline-success(@click.prevent="handleUpdateCourse") Update
      button.btn.btn-outline-danger(@click.prevent="handleDeleteCourse(selectedCourse.courseCode)") Delete
      button.btn.btn-outline-secondary.ms-auto(@click.prevent="done") Done

  .col-md-10.card.p-3.mt-2(v-if="activeTab === 'units' && selectedCourse")
    h4.mb-3 {{ `${selectedCourse?.courseCode} ${selectedCourse?.courseTitle}` }} Units

    .accordion#unitAccordion
      .accordion-item
        h2.accordion-header
          button.accordion-button.collapsed(
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#addUnitForm"
            aria-expanded="false"
            aria-controls="addUnitForm"
          ) Add New Unit
        .accordion-collapse.collapse#addUnitForm(data-bs-parent="#unitAccordion")
          .accordion-body
            form(@submit.prevent="handleregisterUnit" class="row g-3")
              .col-md-4
                label.form-label Unit Title
                input.form-control(v-model="newUnit.unitTitle")
                .small.text-danger(v-if="errors?.unitTitle" ) {{ errors?.unitTitle?.msg }}
              .col-md-4
                label.form-label Unit Code
                input.form-control(v-model="newUnit.unitCode")
                .small.text-danger(v-if="errors?.unitCode" ) {{ errors?.unitCode?.msg }}
              .col-md-4
                label.form-label Year of Study
                input.form-control(type="number" v-model="newUnit.unitYear")
                .small.text-danger(v-if="errors?.unitYear" ) {{ errors?.unitYear?.msg }}
              .col-12
                button.btn.btn-outline-primary(type="submit") Add Unit

      .accordion-item
        h2.accordion-header
          button.accordion-button.collapsed(
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#unitTable"
            aria-expanded="false"
            aria-controls="unitTable"
          ) Units
        .accordion-collapse.show.collapse#unitTable(data-bs-parent="#unitAccordion")
          .accordion-body
            div.table-responsive(v-if="courseUnits?.length > 0")
              table#unitsTable.table.table-striped.table-bordered(ref="unitsTable")
                thead
                  tr
                    th ID
                    th Unit Code
                    th Unit Title
                    th Year of Study
                    th Action
                tbody
                  tr(
                    v-for="(unit, index) in courseUnits || []"
                    :key="unit.unitCode"
                  )
                    td {{ index + 1 }}
                    td {{ unit.unitCode.toUpperCase() }}
                    td {{ unit.unitTitle.toUpperCase() }}
                    td {{ unit.unitYear }}
                    td
                      button.btn.btn-sm.btn-outline-danger(@click="handledeleteUnit(unit.unitCode)") Remove
              
            p.text-muted(v-else) No unit registered yet. Please add a new unit.
</template>

<style scoped>
.card {
  width: 100%;
}
</style>