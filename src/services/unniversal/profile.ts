import * as security from '@components/utils/security'

const API_URL = '/api/users'

export const getUsers = async () => {
  try {
    const response = await fetch(API_URL)
    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to fetch users',
      errors: error?.errors || null,
    }
  }
}