import * as security from '@components/utils/security'

const API_URL = 'https://attendance-management-system-server.onrender.com/api/users'

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

export const updateUser = async (user: any) => {
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt(user)})
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to update user',
      errors: error?.errors || null,
    }
  }
}

export const blockUser = async (user: any) => {
  try {
    const response = await fetch(`${API_URL}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt(user)})
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to update user',
      errors: error?.errors || null,
    }
  }
}

export const deleteUser = async (user: any) => {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({body: security.encrypt(user)})
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to update user',
      errors: error?.errors || null,
    }
  }

}
