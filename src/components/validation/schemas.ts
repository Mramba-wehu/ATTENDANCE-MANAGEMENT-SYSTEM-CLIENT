import * as yup from "yup";

const requiredString = yup.string().trim().required("This field is required");

const alphaOnly = yup
  .string()
  .required("This field is required")
  .matches(/^[A-Za-z\s]+$/, {
    message: "Letters only",
    excludeEmptyString: true,
  });

const regAlpha = yup
  .string()
  .required("This field is required")
  .matches(/^[A-Za-z]+(\/[A-Z]?)?(\/\d{2,4}){1,2}$/, {
    message: "Invalid format. Use Lec/01/2025 or DIT/M/01/2025",
    excludeEmptyString: true,
  });


const alphanumeric = yup
  .string()
  .required("This field is required")
  .matches(/^[A-Za-z0-9]+$/, {
    message: "Alphanumeric only",
    excludeEmptyString: true,
  });

const numeric = yup
  .string()
  .matches(/^\d+$/, "Must be a number")
  .required("This field is required");

const date = yup
  .date()
  .typeError("Must be a valid date")
  .required("This field is required");

const time = yup
  .string()
  .required("This field is required")
  .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Must be a valid time (HH:MM)",
    excludeEmptyString: true,
  });

export const loginSchemas = yup.object({
  regNo: requiredString,
  password: requiredString,
});

export const registrationSchemas = {
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

export const tempoSchema = yup.object({
  courseCode: alphanumeric,
  unitCode: alphanumeric,
  scheduledDate: date,
  scheduledTime: time
});

export const notesSchema = yup.object({
  courseCode: alphanumeric,
  unitCode: alphanumeric,
  notesFile: yup
    .mixed<File>()
    .required("File is required")
    .test(
      "fileType",
      "Only PDF files are allowed",
      (value) =>
        !!value &&
        typeof value === "object" &&
        "type" in value &&
        (value as File).type === "application/pdf"
    ),
});

export const pleaSchema = yup.object({
  regNo: alphanumeric,
  courseCode: alphanumeric,
  unitCode: alphanumeric,
  scheduledDate: date,
  scheduledTime: time,
  reason: yup.string().trim().required("Please provide a reason"),
  pleaFile: yup
    .mixed<File>()
    .required("File is required")
    .test(
      "fileType",
      "Only image files are allowed",
      (value) =>
        !!value &&
        typeof value === "object" &&
        "type" in value &&
        ["image/jpeg", "image/png", "image/jpg"].includes((value as File).type)
    )
});