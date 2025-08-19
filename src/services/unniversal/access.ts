import type { MODULES } from '@/services/unniversal/store';
import * as security from '@/components/utils/security';

const API_URL = '/api/access';

type LoginPayload = {
  regNo: string;
  password: string;
  role: MODULES;
};

type RegisterPayload =
  | {
      role: 'Admin';
      data: {
        regNo: string;
        nationalId: string;
        fullNames: string;
        password: string;
      };
    }
  | {
      role: 'Lecturer';
      data: {
        regNo: string;
        nationalId: string;
        fullNames: string;
        courseCode: string;
        password: string;
      };
    }
  | {
      role: 'Student';
      data: {
        regNo: string;
        nationalId: string;
        fullNames: string;
        courseCode: string;
        password: string;
      };
    };

type Response = {
  status: boolean;
  data?: any | null;
  msg?: string | null;
  errors?: Record<string, any> | null;
};

type BasePayloadData = {
  regNo: string;
  password: string;
  nationalId: string;
  fullNames: string;
  courseCode: string;
  year: string;
};

export const rolePayloadFields: Record<'Admin' | 'Lecturer' | 'Student', (keyof BasePayloadData)[]> = {
  Admin: ['regNo', 'nationalId', 'fullNames', 'password'],
  Lecturer: ['regNo', 'nationalId', 'fullNames', 'courseCode', 'password'],
  Student: ['regNo', 'nationalId', 'fullNames', 'courseCode', 'password', 'year'],
};

export const login = async (payload: LoginPayload): Promise<Response> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({body: security.encrypt(payload)}),
    });

    const result = security.decrypt(await response.json());
    if (!response.ok) throw security.encrypt(result);

    return { status: true, data: result };
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error);
    return {
      status: false,
      msg: error?.message || 'Login failed. Please check your credentials.',
      errors: error?.errors || null,
    };
  }
};

export const register = async (payload: RegisterPayload) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({body: security.encrypt(payload)}),
    });

    const result = security.decrypt(await response.json());
    if (!response.ok) throw security.encrypt(result);

    return { status: true, data: result };
  } catch (error: any) {
    error = security.decrypt(error);
    return {
      status: false,
      msg: error?.message || 'Registration failed.',
      errors: error?.errors || null,
    };
  }
};