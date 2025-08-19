import * as security from '@components/utils/security'

const API_URL = '/api/notes'

export const getNotes = async (courseCode: string) => {
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
      msg: error?.message || 'Failed to get notes',
      errors: error?.errors || null,
    }
  }
}

export const newNote = async (tempo: any) => {
  try {
    const formData = new FormData()

    const encryptedMeta = security.encrypt({
      courseCode: tempo.courseCode,
      unitCode: tempo.unitCode,
    })

    formData.append('body', JSON.stringify(encryptedMeta))
    formData.append('notesFile', tempo.notesFile)

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
      msg: error?.message || 'Failed to add note',
      errors: error?.errors || null,
    }
  }
}

export const deleteNote = async (unitCode: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: security.encrypt({ unitCode }) })
    })

    const data = security.decrypt(await response.json())
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to delete note',
      errors: error?.errors || null,
    }
  }
}

export const downloadNote = async (dl: Function, note: any) => {
  try {
    const res = await fetch(`api${note.fileUrl}`)
    if (!res.ok) throw new Error('Download failed')

    const blob = await res.blob()
    if(!dl(blob, note.fileName, blob.type)) throw security.decrypt(JSON.stringify({ message: 'Download failed' }))
    return { status: true, msg: 'Download successfull' }
  } catch (error: any) {
    console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to download note',
      errors: error?.errors || null,
    }
  }
}