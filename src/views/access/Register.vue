<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { loadContent } from "@components/utils/unniversal";
import {
  Schemas,
  Validate,
  type Role,
  type Feed,
  getValidationFields,
  pick,
} from "@services/unniversal/validation";
import { register, rolePayloadFields } from "@services/unniversal/access";
import { getCourses } from "@services/unniversal/course";

const router = useRouter();
const selectedRole = ref<Role>("");

const serverRequest = ref<Boolean>(false);
const feed = ref<Feed>({ show: false, status: null, msg: null });
const errors = ref<Partial<Record<string, { msg: string }>> | null>(null);

const courseList = ref<{ courseCode: string; courseTitle: string }[]>([]);
const filteredCourses = ref<typeof courseList.value>([]);
const showDropdown = ref<boolean>(false)

const form = ref({
  regNo: "",
  password: "",
  nationalId: "",
  fullNames: "",
  courseCode: "",
  displayTitle: "",
  year: ""
});

const fetchCourses = async () => {
  serverRequest.value = true;
  feed.value = { show: false, status: null, msg: null };

  try {
    const res = await getCourses();
    setTimeout(() => {
      serverRequest.value = false;
      if (res.status) {
        if (res.data.length > 0) {
          const mapped = res.data.map((course: any) => ({
            ...course,
            displayTitle: `${course.courseTitle}`,
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
      serverRequest.value = false;
      feed.value = {
        show: true,
        status: false,
        msg: err.msg ?? "Network or server error.",
      };
    }, 1000);
  } finally {
    setTimeout(() => {
      errors.value = null;
      serverRequest.value = false;
      feed.value = { show: false, status: null, msg: null };
    }, 4000);
  }
};


const submitForm = async () => {
  try {
    if (!selectedRole.value || !(selectedRole.value in rolePayloadFields)) {
      return (errors.value = {
        role: { msg: "Please select a valid role." },
      });
    }

    feed.value = { show: false, status: null, msg: null };

    const baseValidationData = {
      regNo: form.value.regNo,
      nationalId: form.value.nationalId,
      fullNames: form.value.fullNames,
      courseCode: form.value.courseCode,
      year: form.value.year,
      password: form.value.password
    };

    const basePayloadData = {
      regNo: baseValidationData.regNo,
      nationalId: baseValidationData.nationalId,
      fullNames: baseValidationData.fullNames,
      courseCode: baseValidationData.courseCode,
      year: baseValidationData.year,
      password: baseValidationData.password
    };

    const dataForValidation = getValidationFields(
      selectedRole.value,
      baseValidationData
    ) as typeof baseValidationData;
    
    const roleSchemas = {
      admin: Schemas.register.admin,
      lecturer: Schemas.register.lecturer,
      student: Schemas.register.student,
    } as const;

    const schema =
      roleSchemas[selectedRole.value.toLowerCase() as keyof typeof roleSchemas];

    const { status, error } = await Validate(schema, dataForValidation);
    if (!status) {
      errors.value = error;
      return;
    }

    const role = selectedRole.value as keyof typeof rolePayloadFields;

    const payload = {
      role,
      data: pick(basePayloadData, rolePayloadFields[role]),
    };

    serverRequest.value = true;

    const res = await register(payload);
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
          goBack();
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
};

const selectCourse = (course: any) => {
  form.value.courseCode = course.courseCode;
  form.value.displayTitle = course.displayTitle;
  showDropdown.value = false;
};

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const goBack = () => loadContent("/admin/dashboard", router);

watch(
  () => form.value.displayTitle,
  (val) => {
    showDropdown.value = true;
    filteredCourses.value = courseList.value.filter(course =>
      course.courseTitle.toLowerCase().includes(val.toLowerCase())
    );
  }
);

watch(selectedRole, (role) => {
  if (role === 'Student' || role === 'Lecturer') {
    fetchCourses();
  }
});

defineExpose({ submitForm, handleBlur, selectCourse });
</script>

<template lang="pug">

.row.justify-content-center.align-items-center.mt-5(v-if="serverRequest && !feed.show")
  .col-md-6.card.p-4.text-center
    span.fa-solid.fa-spinner.fa-spin
    |
.row.justify-content-center.mt-5(v-if="feed.show && !serverRequest")
  .col-md-6.card.p-4(:class="feed.status ? 'text-success' : 'text-danger'")
    strong {{ feed.msg }}
.row.justify-content-center.mt-5(v-else v-if="!serverRequest")
  .col-md-6.card.p-4
    h4.mb-3 Register New User

    .mb-3
      label.form-label Role
      select.form-select(v-model="selectedRole" placeHolder="Select Role")
        option(value="" hidden) -- Select Role --
        option(value="Admin") Admin
        option(value="Lecturer") Lecturer
        option(value="Student") Student
      .small.text-danger(v-if="errors?.role" ) {{ errors?.role?.msg }}

    form(@submit.prevent="submitForm")
      .mb-3
        label.form-label {{ selectedRole === 'Admin' ? 'Username' : 'Registration No' }}
        input.form-control(v-model="form.regNo")
        .small.text-danger(v-if="errors?.username || errors?.regNo") {{ errors?.username?.msg || errors?.regNo?.msg }}

      .mb-3
        label.form-label National ID
        input.form-control(type="text" v-model="form.nationalId")
        .small.text-danger(v-if="errors?.nationalId") {{ errors.nationalId.msg }}
      .mb-3
        label.form-label Full Names
        input.form-control(v-model="form.fullNames")
        .small.text-danger(v-if="errors?.fullNames") {{ errors.fullNames.msg }}

      template(v-if="selectedRole.toLowerCase() === 'student' || selectedRole.toLowerCase() === 'lecturer'")
        .mb-3.position-relative
          label.form-label Course Title
          input.form-control( v-model="form.displayTitle"
            @input="showDropdown = true"
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
      template(v-if="selectedRole.toLowerCase() === 'student'")
        .mb-3.position-relative
          label.form-label Year
          input.form-control(type="text" v-model="form.year")
          .small.text-danger(v-if="errors?.year") {{ errors.year.msg }}
      .mb-3
        label.form-label Password
        input.form-control(type="password" v-model="form.password")
        .small.text-danger(v-if="errors?.password") {{ errors.password.msg }}

      .mt-4.d-flex.justify-content-end.gap-2
        button.btn.btn-outline-secondary(type="button" @click="goBack") Back
        button.btn.btn-outline-primary(type="submit" :disabled="serverRequest")
          span.fa-solid.fa-spinner.fa-spin(v-if="serverRequest")
          | 
          span(v-else) Register
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 600px;
}
</style>