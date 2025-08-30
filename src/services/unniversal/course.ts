import * as security from "@components/utils/security";

const API_URL = "https://attendance-management-system-server.onrender.com/api";

export const getCourses = async () => {
  try {
    const response = await fetch(`${API_URL}/courses`);
    const data = security.decrypt(await response.json());
    if (!response.ok) throw security.encrypt(data);
    return { status: true, data };
  } catch (error: any) {
    console.clear();
    error = security.decrypt(error);
    return {
      status: false,
      msg: error?.message || "Failed to fetch courses",
      errors: error?.errors || null,
    };
  }
};

export const getUnits = async (courseCode: string | null = null) => {
  if (!courseCode) throw new Error(security.encrypt({message: 'Course Code required'}))
  try {
    const response = await fetch(`${API_URL}/units`, {
      method: 'Post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt({ courseCode: courseCode })})
    })

    const data = security.decrypt(await response.json());
    if (!response.ok) throw security.encrypt(data);
    return { status: true, data };
  } catch (error: any) {
    console.clear();
    error = security.decrypt(error);
    return {
      status: false,
      msg: error?.message || "Failed to fetch courses",
      errors: error?.errors || null,
    };
  }
};

const fillerWords = ["of", "and", "in", "the", "for", "with", "on", "to"];

const levelPrefixes: Record<string, string> = {
  Certificate: "CERT",
  Diploma: "DIP",
  Bachelor: "BA",
  Masters: "MA",
  PhD: "PHD",
  Doctorate: "DOC",
};

export const generateCode = (title: string, level: string): string => {
  const normalizeLevel = (level: string): string =>
    level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

  const normalizedLevel = normalizeLevel(level);

  if (!title.trim() || !normalizedLevel || !levelPrefixes[normalizedLevel]) {
    throw new Error(`Invalid level or title: ${title}, ${level}`);
  }

  const prefix = levelPrefixes[normalizedLevel];

  const initials = title
    .split(" ")
    .filter((word) => word && !fillerWords.includes(word.toLowerCase()))
    .map((word) => word[0].toUpperCase())
    .join("");

  const randomDigits = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}${initials}${randomDigits}`;
};

type BasePayloadData = {
  courseCode: string;
  courseTitle: string;
  courseLevel: string;
};

type BaseUnitPayloadData = {
  unitCode: string;
  unitTitle: string;
  courseCode: string;
  unitYear: number;
};

export const register = async (payload: BasePayloadData) => {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: security.encrypt(payload) }),
    });

    const result = security.decrypt(await response.json());
    if (!response.ok) throw security.encrypt(result);

    return { status: true, data: result };
  } catch (error: any) {
    console.clear();
    error = security.decrypt(error);
    return {
      status: false,
      msg: error?.message || "Course registration failed.",
      errors: error?.errors || null,
    };
  }
};

export const registerUnit = async (payload: BaseUnitPayloadData) => {
  try {
    const response = await fetch(`${API_URL}/units/new`, {
      method: 'Post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt(payload)})
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Unit registration failed',
      errors: error?.errors || null,
    }
  }
};

export const deleteUnit = async (unitCode: string) => {
  try {
    const response = await fetch(`${API_URL}/units`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt({unitCode: unitCode})})
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to delete unit',
      errors: error?.errors || null,
    }
  }
};

export const updateCourse = async (payload: BasePayloadData) => {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: security.encrypt(payload) }),
    });

    const result = security.decrypt(await response.json());
    if (!response.ok) throw security.encrypt(result);

    return { status: true, data: result };
  } catch (error: any) {
    console.clear();
    error = security.decrypt(error);
    return {
      status: false,
      msg: error?.message || "Failed to update course.",
      errors: error?.errors || null,
    };
  }
};

export const deleteCourse = async (courseCode: string) => {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt({courseCode: courseCode})})
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to delete course',
      errors: error?.errors || null,
    }
  }

};
