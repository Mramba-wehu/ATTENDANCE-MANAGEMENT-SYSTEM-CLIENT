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

export const newPlea = async (plea: any) => {
  try {
    const formData = new FormData()

    const encryptedMeta = security.encrypt({
        regNo: plea.regNo,
        courseCode: plea.courseCode,
        unitCode: plea.unitCode,
        scheduledDate: plea.scheduledDate,
        scheduledTime: plea.scheduledTime,
        reason: plea.reason
    })

    formData.append('body', JSON.stringify(encryptedMeta))
    formData.append('pleaFile', plea.pleaFile)

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    })

    const data = security.decrypt(await response.json())
    
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to add Plea',
      errors: error?.errors || null,
    }
  }
}

export const deletePlea = async (_id: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: security.encrypt({ _id }) })
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to delete Plea',
      errors: error?.errors || null,
    }
  }

}
