import { $healthChecks, $healthReporter } from './health-check'

export { HealthCheck, HealthReport, HealthReporter } from './health-check'

/**
 * @namespace Health
 * This namespace contains utilities and interfaces that can be used to monitor the health of the current application.
 */
export const Health = {
  /**
   * All registered health checks.
   * Override this injectable in your application to add custom health-checks.
   */
  $healthChecks,

  /**
   * Health reporter that will execute and sum up all registered health checks.
   */
  $healthReporter
}
