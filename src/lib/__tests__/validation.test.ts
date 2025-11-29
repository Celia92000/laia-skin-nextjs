// Tests pour les validations

describe('Password validation', () => {
  // Règles de mot de passe: minimum 8 caractères
  function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  it('should accept valid passwords', () => {
    expect(validatePassword('password123').valid).toBe(true)
    expect(validatePassword('securepass').valid).toBe(true)
    expect(validatePassword('12345678').valid).toBe(true)
  })

  it('should reject short passwords', () => {
    const result = validatePassword('short')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères')
  })

  it('should reject empty passwords', () => {
    expect(validatePassword('').valid).toBe(false)
  })
})

describe('SIRET validation', () => {
  function validateSiret(siret: string): boolean {
    // SIRET = 14 chiffres
    const cleaned = siret.replace(/\s/g, '')
    if (!/^\d{14}$/.test(cleaned)) return false

    // Algorithme de Luhn
    let sum = 0
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(cleaned[i], 10)
      if (i % 2 === 0) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    return sum % 10 === 0
  }

  it('should validate correct SIRET format', () => {
    // Note: Ces SIRET sont des exemples valides mathématiquement
    expect(validateSiret('73282932000074')).toBe(true)
  })

  it('should reject invalid SIRET', () => {
    expect(validateSiret('12345')).toBe(false) // Trop court
    expect(validateSiret('abcdefghijklmn')).toBe(false) // Non numérique
    expect(validateSiret('00000000000000')).toBe(true) // Valide mathématiquement
  })
})

describe('TVA number validation', () => {
  function validateTVA(tva: string): boolean {
    // Format FR: FRXX XXXXXXXXX (2 lettres + 11 chiffres)
    const frRegex = /^FR[0-9A-Z]{2}\d{9}$/
    return frRegex.test(tva.replace(/\s/g, ''))
  }

  it('should validate French TVA numbers', () => {
    expect(validateTVA('FR12345678901')).toBe(true)
    expect(validateTVA('FR 12 345678901')).toBe(true)
    expect(validateTVA('FRAA123456789')).toBe(true)
  })

  it('should reject invalid TVA numbers', () => {
    expect(validateTVA('DE123456789')).toBe(false) // Allemand
    expect(validateTVA('12345678901')).toBe(false) // Pas de préfixe
    expect(validateTVA('FR123')).toBe(false) // Trop court
  })
})

describe('Reservation validation', () => {
  interface ReservationInput {
    date: string
    startTime: string
    endTime: string
    serviceId: string
    clientEmail?: string
  }

  function validateReservation(input: ReservationInput): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Date requise et dans le futur
    if (!input.date) {
      errors.push('La date est requise')
    } else {
      const reservationDate = new Date(input.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (reservationDate < today) {
        errors.push('La date doit être dans le futur')
      }
    }

    // Heures requises
    if (!input.startTime) {
      errors.push('L\'heure de début est requise')
    }
    if (!input.endTime) {
      errors.push('L\'heure de fin est requise')
    }

    // Heure de fin après heure de début
    if (input.startTime && input.endTime) {
      const [startH, startM] = input.startTime.split(':').map(Number)
      const [endH, endM] = input.endTime.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      if (endMinutes <= startMinutes) {
        errors.push('L\'heure de fin doit être après l\'heure de début')
      }
    }

    // Service requis
    if (!input.serviceId) {
      errors.push('Le service est requis')
    }

    // Email valide si fourni
    if (input.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.clientEmail)) {
      errors.push('L\'email client est invalide')
    }

    return { valid: errors.length === 0, errors }
  }

  it('should validate correct reservation', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const result = validateReservation({
      date: futureDate.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      serviceId: 'service-123'
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject reservation with end time before start time', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const result = validateReservation({
      date: futureDate.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '10:00',
      serviceId: 'service-123'
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('L\'heure de fin doit être après l\'heure de début')
  })

  it('should reject reservation without service', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const result = validateReservation({
      date: futureDate.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      serviceId: ''
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Le service est requis')
  })
})

describe('Service price validation', () => {
  function validateServicePrice(price: number, duration: number): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (price < 0) {
      errors.push('Le prix ne peut pas être négatif')
    }

    if (price > 10000) {
      errors.push('Le prix semble trop élevé (max 10 000€)')
    }

    if (duration < 5) {
      errors.push('La durée minimum est de 5 minutes')
    }

    if (duration > 480) {
      errors.push('La durée maximum est de 8 heures (480 minutes)')
    }

    if (duration % 5 !== 0) {
      errors.push('La durée doit être un multiple de 5 minutes')
    }

    return { valid: errors.length === 0, errors }
  }

  it('should validate correct service prices', () => {
    expect(validateServicePrice(50, 60).valid).toBe(true)
    expect(validateServicePrice(0, 30).valid).toBe(true) // Prix gratuit valide
    expect(validateServicePrice(199, 90).valid).toBe(true)
  })

  it('should reject negative prices', () => {
    const result = validateServicePrice(-10, 60)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Le prix ne peut pas être négatif')
  })

  it('should reject invalid durations', () => {
    expect(validateServicePrice(50, 3).valid).toBe(false) // Trop court
    expect(validateServicePrice(50, 500).valid).toBe(false) // Trop long
    expect(validateServicePrice(50, 17).valid).toBe(false) // Pas multiple de 5
  })
})
