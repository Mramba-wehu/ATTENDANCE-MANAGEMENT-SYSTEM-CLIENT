import * as yup from 'yup'

import {
  loginSchemas,
  registrationSchemas,
  pleaSchema,
  tempoSchema,
  notesSchema,
} from '@components/validation/schemas'

export type Role = "Admin" | "Lecturer" | "Student" | "";

export type courseLevel = "Certificate" | "Diploma" | "Bachelor" | "Masters" | "PhD" | "";

export type Feed = {
  show: boolean;
  status: boolean | null;
  msg: string | null;
};

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> =>
  Object.fromEntries(
    Object.entries(obj).filter(([k]) => keys.includes(k as K))
  ) as Pick<T, K>;

export type ValidationResult<T> = {
  status: boolean
  error: Partial<Record<keyof T, { msg: string }>> | null
}

export function getValidationFields<T extends Record<string, any>>(
  role: Exclude<Role, "">,
  baseValidationData: T
): Partial<T> {
  const fieldsMap: Record<
    Exclude<Role, "">,
    (keyof T)[]
  > = {
    Admin: ["regNo", "nationalId", "fullNames", "password"],
    Lecturer: ["regNo", "nationalId", "fullNames", "courseCode", "password"],
    Student: ["regNo", "nationalId", "fullNames", "courseCode", "year", "password"],
  };

  const keys = fieldsMap[role] || [];

  const picked = Object.fromEntries(
    Object.entries(baseValidationData).filter(([key]) =>
      keys.includes(key as keyof T)
    )
  ) as Partial<T>;

  return picked;
}


export async function Validate<T extends Record<string, any>>(
  schema: yup.ObjectSchema<T>,
  data: T
): Promise<ValidationResult<T>> {
  const result: ValidationResult<T> = {
    status: false,
    error: null,
  }

  try {
    await schema.validate(data, { abortEarly: false })
    result.status = true
  } catch (err: any) {
    result.error = {}
    for (const e of err.inner) {
      const path = e.path as keyof T
      if (path && !result.error[path]) {
        result.error[path] = { msg: e.message }
      }
    }
  }

  return result
}

export const Schemas = {
  login: loginSchemas,
  register: registrationSchemas,
  plea: pleaSchema,
  tempo: tempoSchema,
  notes: notesSchema,
}