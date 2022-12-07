interface HealthCheckInterface {
    pool: any
    healthy(): Promise<boolean>
}

export { HealthCheckInterface }
