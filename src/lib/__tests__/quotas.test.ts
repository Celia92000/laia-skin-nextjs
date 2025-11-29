import { PLAN_LIMITS, QuotaExceededError } from '../quotas'

describe('PLAN_LIMITS', () => {
  it('should have correct limits for SOLO plan', () => {
    expect(PLAN_LIMITS.SOLO).toBeDefined()
    expect(PLAN_LIMITS.SOLO.users).toBe(1)
    expect(PLAN_LIMITS.SOLO.locations).toBe(1)
    expect(PLAN_LIMITS.SOLO.reservations).toBe(100)
    expect(PLAN_LIMITS.SOLO.clients).toBe(200)
    expect(PLAN_LIMITS.SOLO.sms).toBe(0) // Pas de SMS en SOLO
  })

  it('should have correct limits for DUO plan', () => {
    expect(PLAN_LIMITS.DUO).toBeDefined()
    expect(PLAN_LIMITS.DUO.users).toBe(3)
    expect(PLAN_LIMITS.DUO.locations).toBe(1)
    expect(PLAN_LIMITS.DUO.reservations).toBe(300)
    expect(PLAN_LIMITS.DUO.clients).toBe(500)
  })

  it('should have correct limits for TEAM plan', () => {
    expect(PLAN_LIMITS.TEAM).toBeDefined()
    expect(PLAN_LIMITS.TEAM.users).toBe(8)
    expect(PLAN_LIMITS.TEAM.locations).toBe(3)
    expect(PLAN_LIMITS.TEAM.sms).toBe(200) // SMS inclus à partir de TEAM
    expect(PLAN_LIMITS.TEAM.reservations).toBe(1000)
    expect(PLAN_LIMITS.TEAM.clients).toBe(2000)
  })

  it('should have unlimited (-1) for PREMIUM plan', () => {
    expect(PLAN_LIMITS.PREMIUM).toBeDefined()
    expect(PLAN_LIMITS.PREMIUM.users).toBe(-1)
    expect(PLAN_LIMITS.PREMIUM.locations).toBe(-1)
    expect(PLAN_LIMITS.PREMIUM.storage).toBe(-1)
    expect(PLAN_LIMITS.PREMIUM.reservations).toBe(-1)
    expect(PLAN_LIMITS.PREMIUM.clients).toBe(-1)
  })

  it('should have all quota types for each plan', () => {
    const requiredQuotaTypes = [
      'users',
      'locations',
      'storage',
      'emails',
      'sms',
      'whatsapp',
      'apiCalls',
      'reservations',
      'clients'
    ]

    Object.keys(PLAN_LIMITS).forEach(plan => {
      requiredQuotaTypes.forEach(quotaType => {
        expect(PLAN_LIMITS[plan]).toHaveProperty(quotaType)
        expect(typeof PLAN_LIMITS[plan][quotaType as keyof typeof PLAN_LIMITS.SOLO]).toBe('number')
      })
    })
  })
})

describe('QuotaExceededError', () => {
  it('should create error with correct properties', () => {
    const error = new QuotaExceededError('users', 5, 3)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('QuotaExceededError')
    expect(error.quotaType).toBe('users')
    expect(error.current).toBe(5)
    expect(error.limit).toBe(3)
    expect(error.message).toContain('users')
    expect(error.message).toContain('5')
    expect(error.message).toContain('3')
  })

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new QuotaExceededError('emails', 1001, 1000)
    }).toThrow(QuotaExceededError)
  })
})
