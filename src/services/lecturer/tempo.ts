import * as security from '@components/utils/security'

const API_URL = '/api/schedules'

export const getTempos = async (courseCode: string) => {
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
      msg: error?.message || 'Failed to get schedules',
      errors: error?.errors || null,
    }
  }
}

export const newTempo = async (tempo: any) => {
  try {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({body: security.encrypt(tempo)})
    })
    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to add schedule',
      errors: error?.errors || null,
    }
  }
}

export const deleteTempo = async (unitCode: string) => {
  try {
    const response = await fetch(API_URL, {
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
      msg: error?.message || 'Failed to remove schedule',
      errors: error?.errors || null,
    }
  }
};