<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { logout } from "@components/utils/unniversal";
import { useAuthStore } from "@/services/unniversal/store";
import { getRole } from "@components/utils/role";
import { getUsers } from "@services/unniversal/profile";
import type { Role } from "@services/unniversal/validation";

const enum MODULES {
  ADMIN = 'Admin',
  LECTURER = 'Lecturer',
  STUDENT = 'Student',
  UNNIVERSAL = 'Unniversal'
}

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const originalBodyBackground = document.body.style.background;
const processing = ref(false);
const spin = ref("fa-spin");
const errorMsg = ref<string | null>(null);
const serverRequest = ref(true);

interface User {
  regNo: string;
  nationalId: string;
  fullNames: string;
  courseCode: string;
  courseTitle: string;
  role: Role;
}

const user = ref<User | null>(null);

const role = computed(() => {
  return (auth.intendedRole ?? getRole(route.path)) as any as MODULES;
});

const fetchUser = async () => {
  serverRequest.value = true;
  errorMsg.value = null;

  try {
    const res = await getUsers();

    if (res.status && Array.isArray(res.data)) {
      user.value = res.data.find(
        u =>
          u.role.toLowerCase() === role.value.toLowerCase() &&
          u.regNo.toLowerCase() === (auth.regNO?.toLowerCase() ?? "")
      ) || null;
    } else {
      errorMsg.value = res.msg || "Failed to load users.";
    }
  } catch (err) {
    errorMsg.value = "Network or server error.";
  } finally {
    setTimeout(() => {
      serverRequest.value = false;
    }, 500);
  }
};

onMounted(() => {
  document.body.style.background = "linear-gradient(135deg, #0f172a, #1e293b)";
  fetchUser();
});

onBeforeUnmount(() => {
  document.body.style.background = originalBodyBackground;
});

const handleLogout = (): void => {
  try {
    processing.value = true;
    setTimeout(() => {
      logout(router);
    }, 1500);
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(() => {
      processing.value = false;
    }, 1000);
  }
};

defineExpose({ role, spin, handleLogout });
</script>

<template lang="pug">
.content-row.row.justify-content-center.align-content-center
  .profile-card
    .profile-card-content
        .avatar-wrapper
            .avatar
                .avatar-inner
                .avatar-glow
                .avatar-border
        .profile-info()
            div(v-if="serverRequest")
                .col-auto.mt-5
                    span.fa-solid.fa-spinner.text-white(:class="serverRequest ? 'fa-spin' : ''")
            div(v-if="!user && !serverRequest")
                .col-auto.mt-5
                    h2.name.text-white Unable to fetch Users details.
            div(v-else v-if="!serverRequest")
                h2.name {{ user.fullNames }}
                p.title {{ role }}
                .stats(v-if="user.courseTitle")
                    .stat
                        .stat-value {{ user.courseTitle.toUpperCase() }}
                        .stat-label Course
                .stats(style="border-top: none")
                    .stat
                        .stat-value  {{ user.regNo }}
                        .stat-label {{ role.toLowerCase() === 'admin' ? 'User ID' : 'Registration ID' }}
                    .stat(v-if="user.year")
                        .stat-value {{ user.year }}
                        .stat-label Year
                .actions
                    button.action-btn.primary(@click.prevent="handleLogout")
                        span.fa-solid.fa-spinner(v-if="processing" :class="spin")
                        template(v-else)
                            span.fa-solid.fa-right-from-bracket
                        span.ms-2
                                template(v-if="processing") Logging out
                                template(v-else) Logout
                        .btn-effect
    .card-shine
    .card-border
    .card-glow
</template>

<style scoped>
.content-row {
  position: relative;
  top: 0;
  left: 0;
  width: initial;
  height: 100%;
}

.profile-card {
  position: relative;
  top: 0;
  left: 0;
  width: 50%;
  height: 90%;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-0.5em);
}

.profile-card-content {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  overflow: hidden;
}

.avatar-wrapper {
  position: relative;
  width: 5em;
  height: 5em;
  margin: 0 auto 0.5rem;
}

.avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, #60a5fa, #a78bfa);
  opacity: 0.8;
}

.avatar-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #60a5fa, #a78bfa);
  border-radius: 50%;
  opacity: 0;
  filter: blur(15px);
  transition: opacity 0.3s ease;
}

.avatar:hover .avatar-glow {
  opacity: 0.5;
}

.avatar-border {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #60a5fa, #a78bfa) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}

.profile-info {
  text-align: center;
}

.name {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title {
  color: #94a3b8;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
}

.bio {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.skills {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-bottom: 3.5rem;
}

.skill {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  font-size: 0.9rem;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.skill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-2px);
}

.actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  position: relative;
  padding: 0.8rem;
  border: none;
  border-radius: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.action-btn span {
  position: relative;
  z-index: 1;
}

.btn-effect {
  position: absolute;
  inset: 0;
  transition: opacity 0.3s ease;
}

.primary {
  background: linear-gradient(45deg, #60a5fa20, #a78bfa20);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.primary .btn-effect {
  background: linear-gradient(45deg, #60a5fa, #a78bfa);
  opacity: 0;
}

.primary:hover .btn-effect {
  opacity: 0.2;
}

.secondary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.secondary .btn-effect {
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
}

.secondary:hover .btn-effect {
  opacity: 1;
}

.card-border {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: 1rem;
  background: linear-gradient(45deg, #60a5fa, #a78bfa) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-card:hover .card-border {
  opacity: 1;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, #60a5fa, #a78bfa);
  border-radius: 1.5rem;
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.3s ease;
}

.profile-card:hover .card-glow {
  opacity: 0.05;
}

@media (max-width: 480px) {
  .profile-card {
    padding: 1.5rem;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .name {
    font-size: 1.5rem;
  }

  .skills {
    flex-wrap: wrap;
  }
}
</style>