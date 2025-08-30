import * as security from '@components/utils/security'

const API_URL = 'https://attendance-management-system-server.onrender.com/api/pleas'

export const getPleas = async (courseCode: string) => {
  try {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({body: security.encrypt({ courseCode: courseCode })})
    })
    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to get Pleas',
      errors: error?.errors || null,
    }
  }
}

export const updatePleaStatus = async (user: any) => {
  try {
    const response = await fetch(`${API_URL}/status`, {
      method: 'PATCH',
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
