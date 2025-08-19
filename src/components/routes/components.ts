import type { Component } from 'vue'
import { MODULES, ACCESS, FLUX } from './names'

import Login from '@views/access/Login.vue'
import Register from '@views/access/Register.vue'

import Users from '@views/admin/Users.vue'
import Courses from '@views/admin/Courses.vue'

import Lecturer_Home from '@views/lecturer/Home.vue'
import Lecturer_Summary from '@views/lecturer/Summary.vue'
import Lecturer_Tempo from '@views/lecturer/Tempo.vue'
import Lecturer_Notes from '@views/lecturer/Notes.vue'

import Student_Home from '@views/student/Home.vue'
import Student_Plea from '@views/student/Plea.vue'
import Student_Tempo from '@views/student/Tempo.vue'
import Student_Notes from '@views/student/Notes.vue'

import Home from '@views/unniversal/Home.vue'
import Profile from '@views/unniversal/Profile.vue'

export const RouteComponents: {
  [K in MODULES]: {
    [P in ACCESS | FLUX]?: Component
  }
} = {
  [MODULES.ADMIN]: {
    [ACCESS.LOGIN]: Login,
    [ACCESS.REGISTER]: Register,
    [FLUX.DASHBOARD]: Users,
    [FLUX.COURSES]: Courses
  },
  [MODULES.LECTURER]: {
    [FLUX.DASHBOARD]: Lecturer_Home,
    [ACCESS.LOGIN]: Login,
    [FLUX.SUMMARY]: Lecturer_Summary,
    [FLUX.TEMPO]: Lecturer_Tempo,
    [FLUX.NOTES]: Lecturer_Notes
  },
  [MODULES.STUDENT]: {
    [FLUX.DASHBOARD]: Student_Home,
    [ACCESS.LOGIN]: Login,
    [FLUX.PLEA]: Student_Plea,
    [FLUX.TEMPO]: Student_Tempo,
    [FLUX.NOTES]: Student_Notes
  },
  [MODULES.UNNIVERSAL]: {
    [FLUX.HOME]: Home,
    [FLUX.PROFILE]: Profile
  }
}