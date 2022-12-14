import { AppMode, getCurrentAppMode, getDefaultAppEnvironments } from '../src'

describe('AppEnvironment', () => {
  describe('getDefaultAppEnvironments', () => {
    const supported = getDefaultAppEnvironments()

    it('should return the default environments', () => {
      expect(supported).toEqual(
        expect.arrayContaining([AppMode.DEV, AppMode.STAGING, AppMode.PROD, AppMode.TEST])
      )
    })

    it('should return the correct names for each environment', () => {
      expect(AppMode.DEV.name).toBe('development')
      expect(AppMode.STAGING.name).toBe('staging')
      expect(AppMode.PROD.name).toBe('production')
      expect(AppMode.TEST.name).toBe('test')
    })
  })

  describe('getCurrentAppEnvironment', () => {
    const supported = getDefaultAppEnvironments()

    it('should return correct app env', () => {
      expect(getCurrentAppMode('dev', supported)).toBe(AppMode.DEV)
      expect(getCurrentAppMode('development', supported)).toBe(AppMode.DEV)

      expect(getCurrentAppMode('staging', supported)).toBe(AppMode.STAGING)

      expect(getCurrentAppMode('prod', supported)).toBe(AppMode.PROD)
      expect(getCurrentAppMode('production', supported)).toBe(AppMode.PROD)

      expect(getCurrentAppMode('test', supported)).toBe(AppMode.TEST)
      expect(getCurrentAppMode('testing', supported)).toBe(AppMode.TEST)
    })
  })
})
