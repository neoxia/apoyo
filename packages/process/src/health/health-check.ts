import { Injectable } from '@apoyo/scopes'

export interface HealthReport {
  name: string
  displayName?: string
  healthy: boolean
  message?: string
  meta: Record<string, unknown>
}

export class HealthCheck {
  constructor(public readonly report: () => Promise<HealthReport>) {}
}

export class HealthReporter {
  constructor(private readonly _checks: HealthCheck[]) {}

  public async report() {
    const reports: HealthReport[] = []
    for (const check of this._checks) {
      reports.push(await check.report())
    }

    const healthy = reports.every((report) => report.healthy)
    const message = healthy ? undefined : `One or more health checks have failed.`

    return {
      healthy,
      message,
      reports
    }
  }
}

export const $healthChecks = Injectable.of<HealthCheck[]>([])

export const $healthReporter = Injectable.define([$healthChecks], (checks) => {
  return new HealthReporter(checks)
})
