// Tests pour les fonctions utilitaires

describe('formatBytes', () => {
  // Fonction helper pour formater les bytes (copiée de quotas.ts)
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  it('should return "0 B" for 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('should format bytes correctly', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('should format kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('should format megabytes correctly', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB')
  })

  it('should format gigabytes correctly', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatBytes(5 * 1024 * 1024 * 1024)).toBe('5 GB')
  })
})

describe('Email validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  it('should validate correct email formats', () => {
    expect(emailRegex.test('test@example.com')).toBe(true)
    expect(emailRegex.test('user.name@domain.fr')).toBe(true)
    expect(emailRegex.test('user+tag@example.org')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(emailRegex.test('invalid')).toBe(false)
    expect(emailRegex.test('missing@domain')).toBe(false)
    expect(emailRegex.test('@nodomain.com')).toBe(false)
    expect(emailRegex.test('spaces in@email.com')).toBe(false)
  })
})

describe('Phone number formatting', () => {
  function formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '')

    // Format français: XX XX XX XX XX
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }

    // Format international français: +33 X XX XX XX XX
    if (cleaned.length === 11 && cleaned.startsWith('33')) {
      return '+33 ' + cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }

    return phone
  }

  it('should format French phone numbers', () => {
    expect(formatPhoneNumber('0612345678')).toBe('06 12 34 56 78')
    expect(formatPhoneNumber('06 12 34 56 78')).toBe('06 12 34 56 78')
  })

  it('should format international French numbers', () => {
    expect(formatPhoneNumber('33612345678')).toBe('+33 6 12 34 56 78')
  })

  it('should return original if format unknown', () => {
    expect(formatPhoneNumber('12345')).toBe('12345')
  })
})

describe('Date utilities', () => {
  function formatDateFR(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  function isDateInPast(date: Date): boolean {
    return date < new Date()
  }

  function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  it('should format dates in French format', () => {
    const date = new Date('2025-01-15')
    expect(formatDateFR(date)).toBe('15/01/2025')
  })

  it('should detect past dates', () => {
    const pastDate = new Date('2020-01-01')
    const futureDate = new Date('2030-01-01')

    expect(isDateInPast(pastDate)).toBe(true)
    expect(isDateInPast(futureDate)).toBe(false)
  })

  it('should add days correctly', () => {
    const date = new Date('2025-01-01')
    const result = addDays(date, 14)

    expect(result.getDate()).toBe(15)
    expect(result.getMonth()).toBe(0) // January
  })
})

describe('Price formatting', () => {
  function formatPrice(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount)
  }

  function calculateTTC(priceHT: number, tvaRate: number = 20): number {
    return priceHT * (1 + tvaRate / 100)
  }

  it('should format prices in EUR', () => {
    expect(formatPrice(49)).toContain('49')
    expect(formatPrice(49)).toContain('€')
  })

  it('should calculate TTC correctly', () => {
    expect(calculateTTC(100, 20)).toBe(120)
    expect(calculateTTC(50, 10)).toBe(55)
    expect(calculateTTC(100, 0)).toBe(100)
  })
})

describe('Slug generation', () => {
  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  it('should generate valid slugs', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
    expect(generateSlug('Institut Beauté Paris')).toBe('institut-beaute-paris')
    expect(generateSlug('Café & Thé')).toBe('cafe-the')
  })

  it('should handle special characters', () => {
    expect(generateSlug('éàüö')).toBe('eauo')
    expect(generateSlug('test@#$%test')).toBe('test-test')
  })

  it('should trim hyphens', () => {
    expect(generateSlug('--test--')).toBe('test')
    expect(generateSlug('  spaces  ')).toBe('spaces')
  })
})
