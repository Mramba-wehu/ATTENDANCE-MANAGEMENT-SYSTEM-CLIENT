<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { logout, loadContent } from "@components/utils/unniversal"

const enum MODULES {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

const props = defineProps<{
  role: string;
}>();

const router = useRouter();
const route = useRoute();

const activePath = ref<string>(route.path);

const processing = ref<boolean>(false);

const spin = ref<string>('fa-spin')

watch(
  () => route.path,
  (newPath) => {
    activePath.value = newPath;
  }
);

const closeButton = ref<HTMLButtonElement | null>(null);

const navItems = computed(() => {
  const items: { name: string; path: string }[] = [];

  switch (props.role.toLowerCase()) {
    case MODULES.ADMIN.toLowerCase():
      items.push(
        { name: "Users", path: "/admin/dashboard" },
        { name: "Courses", path: "/admin/courses" }
      );
      break;
    case MODULES.LECTURER.toLowerCase():
      items.push(
        { name: "Dashboard", path: '/lecturer/dashboard'},
        { name: "Summary", path: "/lecturer/summary" },
        { name: "Tempo", path: "/lecturer/tempo" },
        // { name: "Notes", path: "/lecturer/notes" }
      );
      break;
    case MODULES.STUDENT.toLowerCase():
      items.push(
        { name: "Dashboard", path: '/dashboard'},
        { name: "Plea", path: "/plea" },
        { name: "Tempo", path: "/tempo" },
        // { name: "Notes", path: "/notes" }
      );
      break;
  }

  items.push({
    name: "Profile",
    path:
      props.role.toLowerCase() === "student"
        ? "/profile"
        : `/${props.role.toLowerCase()}/profile`,
  });

  return items;
});


const handleLoadContent = (path: string): void => {
  if (!path.startsWith("/")) {
    const base =
      props.role.toLowerCase() === "student"
        ? ""
        : `/${props.role.toLowerCase()}`;
    path = `${base}/${path}`.replace(/\/+$/, "");
  }

  loadContent(path, router, closeButton.value)
};

const handleLogout = (): void => {
  try {
    processing.value = true
    setTimeout(() => {
      logout(router)
    },1000)
  } catch (error) {
    console.log(error)
  }
  finally {
    setTimeout(() => {
      processing.value = false;
    }, 25000);
  }
}


defineExpose({ spin, handleLoadContent, handleLogout, navItems, loadContent });
</script>

<template lang="pug">
nav.navbar.navbar-dark.bg-dark.fixed-top
  .container-fluid
    a.navbar-brand(href="#") Attendance Management System
    button.navbar-toggler(
      type="button",
      data-bs-toggle="offcanvas",
      data-bs-target="#offcanvasDarkNavbar",
      aria-controls="offcanvasDarkNavbar",
      aria-label="Toggle navigation"
    )
      span.navbar-toggler-icon
    .offcanvas.offcanvas-end.text-bg-dark(
      tabindex="-1",
      id="offcanvasDarkNavbar",
      aria-labelledby="offcanvasDarkNavbarLabel"
    )
      .offcanvas-header
        .menu-header
          h3.offcanvas-title#offcanvasDarkNavbarLabel AMS
          h5.offcanvas-title {{ props.role }}
        button.btn-close.btn-close-white(
          ref="closeButton",
          type="button",
          data-bs-dismiss="offcanvas",
          aria-label="Close"
        )
      .offcanvas-body
        ul.navbar-nav.justify-content-end.flex-grow-1.pe-3
          li.nav-item(v-for="item in navItems" :key="item.name")
            a.nav-link(
              href="javascript:void(0)",
              :class="{ active: activePath === item.path }",
              @click.prevent="handleLoadContent(item.path)"
            ) {{ item.name }}
          li.nav-item
            a.nav-link(href="javascript:void(0)" @click.prevent="handleLogout()")
              span.fa-solid.fa-spinner(v-if="processing" :class="spin")
              span.fa-solid.fa-right-from-bracket(v-if="!processing")
              span.ms-2
                template(v-if="processing") Logging out
                template(v-else) Logout
</template>

<style scoped>
.menu-header {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: initial;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  gap: 1em;
}

.text-muted-light {
  color: rgba(255, 255, 255, 0.6);
}

</style>