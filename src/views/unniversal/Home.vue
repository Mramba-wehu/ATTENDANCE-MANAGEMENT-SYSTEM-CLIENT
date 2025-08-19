<script setup lang="ts">
import Navbar from '@views/unniversal/Navbar.vue';
import Footer from '@views/unniversal/Footer.vue';
import { ref, computed, type ComputedRef, onMounted } from 'vue'
import { useRoute, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/services/unniversal/store'
import { getRole } from '@components/utils/role'
import { loadContent } from '@components/utils/unniversal';

const enum Role {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const role: ComputedRef<Role> = computed(() => {
  return  (auth.intendedRole ?? getRole(route.path)) as any as Role
})

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


const isLoggedIn = computed(() => auth.isLoggedIn)

const label = ref<string| null>(null);

onMounted(() => {
  const targetRoute = role.value == Role.STUDENT
    ? '/dashboard'
    : `/${role.value.toLowerCase()}/dashboard`
  document.body.classList.add(targetClass.value)
  loadContent(targetRoute, router)
})

defineExpose({ Navbar, Footer, RouterView, role, isLoggedIn, label })
</script>

<template lang="pug">

Navbar(:role)
.container-fluid.content
  RouterView
Footer
</template>

<style scoped>
.content {
  position: absolute;
  top: 4em;
  left: 0;
  height: 86vh;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>