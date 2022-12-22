import dotenv from 'dotenv'
import fs from 'fs'

class Config {
    constructor() {
        dotenv.config()
    }

    // reads a value from an environment variable or a file in the format <envVar>_FILE
    readStringFromEnvOrFile(
        envVar: string,
        defaultValue: string | undefined
    ): string | undefined {
        let value = process.env[envVar]
        if (value === undefined) {
            const filePath = process.env[`${envVar}_FILE`]
            if (filePath && fs.existsSync(filePath)) {
                value = fs.readFileSync(filePath, 'utf8')
            }
        }
        if (value === undefined) {
            return defaultValue
        }
        return value
    }

    getExpressPort(): number {
        const portString = this.readStringFromEnvOrFile('PORT', '8080')
        return parseInt(portString || '8080', 10)
    }

    getMySQLConnectionString(): string | undefined {
        let connectionString = process.env.DB_CONNECTION_STRING
        if (connectionString === undefined) {
            //let's build the connection string from the individual env vars
            const host = this.readStringFromEnvOrFile('MYSQL_HOST', 'localhost')
            const port = this.readStringFromEnvOrFile('MYSQL_PORT', '3306')
            const user = this.readStringFromEnvOrFile('MYSQL_USER', undefined)
            const password = this.readStringFromEnvOrFile(
                'MYSQL_PASSWORD',
                undefined
            )
            const database = this.readStringFromEnvOrFile(
                'MYSQL_DATABASE',
                undefined
            )
            const options = this.readStringFromEnvOrFile('MYSQL_OPTIONS', '')

            if (host && user && password && database && port) {
                connectionString = `mysql://${user}:${password}@${host}:${port}/${database}${options}`
            } else {
                console.log(options)
                throw new Error(
                    'MySQL connection string not defined or could not be built from environment variables'
                )
            }
        }
        return connectionString
    }
}

export { Config }
