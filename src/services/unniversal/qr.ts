import * as security from '@components/utils/security'

const API_URL = '/api/qr'

export const secureQR = (data: any | null = null, status: boolean = true): any => {
    if(!data) {
        throw new Error('Invalid data')
    }

    let qr;

    if(status) {
        qr = security.encrypt(data)
    }
    else {
        qr = security.decrypt(data)
    }
    
    return qr
}

export const newQR = async (qr: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
    },
      body: JSON.stringify({body: security.encrypt({qr})}),
    })

    const data = security.decrypt(await response.json())
    
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    // console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to store qr',
      errors: error?.errors || null,
    }
  }
}

export const validateQR = async (qrData: any | null = null, regNo: string | null = null) => {
  try {
    if (!qrData) {
      throw security.encrypt({ message: 'Invalid QR Code' })
    }

    const raw: string | null = qrData[0]?.rawValue

    if(!raw) {
      throw security.encrypt({ message: 'Invalid QR Code' })
    }

    if (!regNo) {
      throw security.encrypt({ message: 'Invalid User' })
    }

    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
    },
      body: JSON.stringify({body: security.encrypt({raw, regNo })}),
    })

    const data = security.decrypt(await response.json())
    
    if (!response.ok) throw security.encrypt(data)
    return { status: true, data }
  } catch (error: any) {
    // console.clear()
    error = security.decrypt(error)
    return {
      status: false,
      msg: error?.message || 'Failed to store qr',
      errors: error?.errors || null,
    }
  }
}