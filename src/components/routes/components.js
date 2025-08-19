var _a, _b, _c, _d, _e;
import Login from '@views/access/Login.vue';
import Register from '@views/access/Register.vue';
import Users from '@views/admin/Users.vue';
import Courses from '@views/admin/Courses.vue';
import Lecturer_Home from '@views/lecturer/Home.vue';
import Lecturer_Summary from '@views/lecturer/Summary.vue';
import Lecturer_Tempo from '@views/lecturer/Tempo.vue';
import Lecturer_Notes from '@views/lecturer/Notes.vue';
import Student_Home from '@views/student/Home.vue';
import Student_Plea from '@views/student/Plea.vue';
import Student_Tempo from '@views/student/Tempo.vue';
import Student_Notes from '@views/student/Notes.vue';
import Home from '@views/unniversal/Home.vue';
import Profile from '@views/unniversal/Profile.vue';
export var RouteComponents = (_a = {},
    _a["Admin" /* MODULES.ADMIN */] = (_b = {},
        _b["Login" /* ACCESS.LOGIN */] = Login,
        _b["Register" /* ACCESS.REGISTER */] = Register,
        _b["Dashboard" /* FLUX.DASHBOARD */] = Users,
        _b["Courses" /* FLUX.COURSES */] = Courses,
        _b),
    _a["Lecturer" /* MODULES.LECTURER */] = (_c = {},
        _c["Dashboard" /* FLUX.DASHBOARD */] = Lecturer_Home,
        _c["Login" /* ACCESS.LOGIN */] = Login,
        _c["Summary" /* FLUX.SUMMARY */] = Lecturer_Summary,
        _c["Tempo" /* FLUX.TEMPO */] = Lecturer_Tempo,
        _c["Notes" /* FLUX.NOTES */] = Lecturer_Notes,
        _c),
    _a["Student" /* MODULES.STUDENT */] = (_d = {},
        _d["Dashboard" /* FLUX.DASHBOARD */] = Student_Home,
        _d["Login" /* ACCESS.LOGIN */] = Login,
        _d["Plea" /* FLUX.PLEA */] = Student_Plea,
        _d["Tempo" /* FLUX.TEMPO */] = Student_Tempo,
        _d["Notes" /* FLUX.NOTES */] = Student_Notes,
        _d),
    _a["Unniversal" /* MODULES.UNNIVERSAL */] = (_e = {},
        _e["Home" /* FLUX.HOME */] = Home,
        _e["Profile" /* FLUX.PROFILE */] = Profile,
        _e),
    _a);
