<script setup lang="ts">
import { ref, computed, type ComputedRef, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@services/unniversal/store";
import { Schemas, Validate } from "@services/unniversal/validation";
import { getRole } from "@components/utils/role";
import { login as access } from "@services/unniversal/access";

const enum Role {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const role = computed(() => {
  return (auth.intendedRole ?? getRole(route.path)) as any as Role;
});

interface RoleStyle {
  class: string | null;
  icon: string | null;
}

const roleToClassMap: Record<Role, RoleStyle> = {
  [Role.ADMIN]: {
    class: 'purple-gradient',
    icon: 'fa-shield-halved'
  },
  [Role.LECTURER]: {
    class: 'orange-gradient',
    icon: 'fa-user-tie'
  },
  [Role.STUDENT]: {
    class: 'blue-gradient',
    icon: 'fa-graduation-cap'
  },
  [Role.UNNIVERSAL]: {
    class: null,
    icon: null
  }
};

const targetClass = ref<string>(roleToClassMap[role.value]?.class || '');

const roleIcon: ComputedRef<string | null> = computed(() => {
  return roleToClassMap[role.value]?.icon || null;
});

const roleLabel: ComputedRef<string> = computed(() => role.value.toUpperCase());

const label: ComputedRef<string> = computed(() => {
  switch (role.value) {
    case Role.LECTURER:
      return "Lecturer ID";
    case Role.STUDENT:
      return "Student ID";
    case Role.ADMIN:
      return "Admin";
    default:
      return "Student ID";
  }
});

const username = ref<string | null>(null);
const password = ref<string | null>(null);
const errors = ref<Partial<Record<string, { msg: string }>> | null>(null);
const processing = ref<boolean>(false);

interface ApiResponse<T = any> {
  status: boolean;
  data?: T | null;
  msg?: string | null;
}

const api = ref<ApiResponse | null>(null);

const login = async (): Promise<void> => {
  try {
    processing.value = true;
    errors.value = null;

    const schema = Schemas.login;
    const user_data = {
      regNo: username.value,
      password: password.value,
    };

    const { status, error } = await Validate(schema, user_data as any);

    if (!status) {
      errors.value = error;
      return;
    }

    const { status: access_status, msg, data, errors: serverErrors } = await access({
      regNo: username.value!,
      password: password.value!,
      role: role.value as any,
    });

    api.value = { status: access_status, data, msg };
    
    if (!access_status) {
      serverErrors ? errors.value = serverErrors : null
      return
    }

    const store = auth.login(role.value as any, username.value)
    const targetRoute =
      role.value == Role.STUDENT ? '/' : `/${role.value.toLowerCase()}`

    setTimeout(() => {
      store.status ? router.replace(targetRoute) : alert(store.msg)
    }, 1500)
  } catch (err) {
    alert("An error occurred during login. Please try again.");
  } finally {
    setTimeout(() => {
      processing.value = false;
      if (errors.value) {
        setTimeout(() => {
          if (errors.value) {
            username.value = errors.value.username ? null : username.value;
            password.value = errors.value.password ? null : password.value;
            errors.value = null;
          }
        }, 1000);
      } else {
        setTimeout(() => (api.value = null), 3000);
      }
    }, 1000);
  }
};

onMounted(() => document.body.classList.add(targetClass.value));

defineExpose({ role, login, roleLabel, label, username, password, errors, roleIcon });
</script>

<template lang="pug">
form.card(@submit.prevent="login")
  .card-body(:class="targetClass")
    .card-title.text-center.row.mb-3
      h1.row.justify-content-center.align-items-center.flex-row.card-heading
        span.fa-solid(:class="roleIcon")
        span.heading-text {{ roleLabel }} LOGIN
    .row.mb-3
      .input-group.mb-2
        span.input-group-text
          i.fa-solid.fa-id-card
        .form-floating
          input#username.form-control(type="text" v-model="username" placeholder="Username")
          label(for="username") {{ label }}
      .small.text-danger.fit(v-if="errors?.username") {{ errors.username?.msg }}
    .row.mb-3
      .input-group.mb-2
        span.input-group-text
          i.fa-solid.fa-lock
        .form-floating
          input#password.form-control(type="password" v-model="password" placeholder="Password")
          label(for="password") Password
      .small.text-danger.fit(v-if="errors?.password") {{ errors.password?.msg }}
      
    .row.mb-3.align-items-center(:class="api ? 'justify-content-between' : 'justify-content-end'")
      .col-auto(v-if="api")
        span(:class="api.status ? 'text-success' : 'text-danger'") {{ api.msg ?? api.data?.message }}
      .col-auto
        button.btn.btn-outline-dark(type="submit" :disabled="processing")
          span.fa-solid.fa-spinner(v-if="processing" :class="processing ? 'fa-spin' : ''")
          span.fa-solid.fa-right-to-bracket(v-else)

</template>

<style lang="css">
.blue-gradient {
  background: linear-gradient(135deg, #ADE8F4, #5BC0EB);
}

.purple-gradient {
  background: linear-gradient(135deg, #E0E0FF, #7F00FF);
}

.orange-gradient{
  background: linear-gradient(135deg, #FFF5E1, #FFA500);
}

</style>

<style scope>

.card {
  box-shadow: 1.5px 2.5px 5px 2.5px;
}

.card-title {
  margin-left: unset;
}

.card-heading {
  gap: 0.5em;
}

.card-heading span.heading-text {
  font-size: large;
}
</style>