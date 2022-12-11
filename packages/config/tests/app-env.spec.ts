import { AppEnvironment, getCurrentAppEnvironment, getDefaultAppEnvironments } from '../src'

describe('AppEnvironment', () => {
  describe('getDefaultAppEnvironments', () => {
    const supported = getDefaultAppEnvironments()

    it('should return the default environments', () => {
      expect(supported).toEqual(
        expect.arrayContaining([AppEnvironment.DEV, AppEnvironment.STAGING, AppEnvironment.PROD, AppEnvironment.TEST])
      )
    })

    it('should return the correct names for each environment', () => {
      expect(AppEnvironment.DEV.name).toBe('development')
      expect(AppEnvironment.STAGING.name).toBe('staging')
      expect(AppEnvironment.PROD.name).toBe('production')
      expect(AppEnvironment.TEST.name).toBe('test')
    })
  })

  describe('getCurrentAppEnvironment', () => {
    const supported = getDefaultAppEnvironments()

    it('should return correct app env', () => {
      expect(getCurrentAppEnvironment('dev', supported)).toBe(AppEnvironment.DEV)
      expect(getCurrentAppEnvironment('development', supported)).toBe(AppEnvironment.DEV)

      expect(getCurrentAppEnvironment('staging', supported)).toBe(AppEnvironment.STAGING)

      expect(getCurrentAppEnvironment('prod', supported)).toBe(AppEnvironment.PROD)
      expect(getCurrentAppEnvironment('production', supported)).toBe(AppEnvironment.PROD)

      expect(getCurrentAppEnvironment('test', supported)).toBe(AppEnvironment.TEST)
      expect(getCurrentAppEnvironment('testing', supported)).toBe(AppEnvironment.TEST)
    })
  })
})
