import * as yup from "yup";
var requiredString = yup.string().trim().required("This field is required");
var alphaOnly = yup
    .string()
    .required("This field is required")
    .matches(/^[A-Za-z\s]+$/, {
    message: "Letters only",
    excludeEmptyString: true,
});
var regAlpha = yup
    .string()
    .required("This field is required")
    .matches(/^[A-Za-z]+(\/[A-Z]?)?(\/\d{2,4}){1,2}$/, {
    message: "Invalid format. Use Lec/01/2025 or DIT/M/01/2025",
    excludeEmptyString: true,
});
var alphanumeric = yup
    .string()
    .required("This field is required")
    .matches(/^[A-Za-z0-9]+$/, {
    message: "Alphanumeric only",
    excludeEmptyString: true,
});
var numeric = yup
    .string()
    .matches(/^\d+$/, "Must be a number")
    .required("This field is required");
var date = yup
    .date()
    .typeError("Must be a valid date")
    .required("This field is required");
var time = yup
    .string()
    .required("This field is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Must be a valid time (HH:MM)",
    excludeEmptyString: true,
});
export var loginSchemas = yup.object({
    regNo: requiredString,
    password: requiredString,
});
export var registrationSchemas = {
    course: yup.object({
        courseCode: alphanumeric,
        courseTitle: alphaOnly,
        courseLevel: alphanumeric
    }),
    unit: yup.object({
        unitCode: alphanumeric,
        unitTitle: alphaOnly,
        unitYear: numeric,
        courseCode: alphanumeric,
    }),
    admin: yup.object({
        regNo: alphanumeric,
        nationalId: numeric,
        fullNames: alphaOnly,
        password: alphanumeric,
    }),
    student: yup.object({
        regNo: regAlpha,
        nationalId: numeric,
        fullNames: alphaOnly,
        courseCode: alphanumeric,
        year: numeric,
        password: alphanumeric,
    }),
    lecturer: yup.object({
        regNo: regAlpha,
        nationalId: numeric,
        fullNames: alphaOnly,
        courseCode: alphanumeric,
        password: alphanumeric,
    }),
};
export var tempoSchema = yup.object({
    courseCode: alphanumeric,
    unitCode: alphanumeric,
    scheduledDate: date,
    scheduledTime: time
});
export var notesSchema = yup.object({
    courseCode: alphanumeric,
    unitCode: alphanumeric,
    notesFile: yup
        .mixed()
        .required("File is required")
        .test("fileType", "Only PDF files are allowed", function (value) {
        return !!value &&
            typeof value === "object" &&
            "type" in value &&
            value.type === "application/pdf";
    }),
});
export var pleaSchema = yup.object({
    regNo: alphanumeric,
    courseCode: alphanumeric,
    unitCode: alphanumeric,
    scheduledDate: date,
    scheduledTime: time,
    reason: yup.string().trim().required("Please provide a reason"),
    pleaFile: yup
        .mixed()
        .required("File is required")
        .test("fileType", "Only image files are allowed", function (value) {
        return !!value &&
            typeof value === "object" &&
            "type" in value &&
            ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
    })
});
