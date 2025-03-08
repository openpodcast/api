import dotenv from 'dotenv'
import fs from 'fs'

class Config {
    constructor() {
        dotenv.config()
    }

    /*
     * Reads the ACCOUNTS environment variable or the ACCOUNTS_FILE file
     * and returns a map of accounts
     * {
     *  "token": number_of_account
     * }
     * */
    getAccountsMap(): { [key: string]: number } {
        const accounts = this.readStringFromEnvOrFile('ACCOUNTS', '{}')
        if (accounts !== undefined && accounts !== '{}') {
            const accountMap = JSON.parse(accounts)
            return accountMap
        } else {
            throw new Error(
                `ACCOUNTS not defined or invald in environment variables: ${accounts}`
            )
        }
    }

    // reads schema from schema.sql
    getSchemaData(): string {
        const path = './db_schema/schema.sql'
        if (!fs.existsSync(path)) {
            throw new Error(`Schema file not found: ${path}`)
        }
        return fs.readFileSync(path, 'utf8')
    }

    // location where migration files are stored, e.g. 5.sql, 6.sql, etc.
    getMigrationsPath(): string {
        const path = './db_schema/migrations'
        if (!fs.existsSync(path)) {
            throw new Error(`Migrations directory not found: ${path}`)
        }
        return path
    }

    // reads view statements from views.sql
    getViewsData(): string {
        const path = './db_schema/views.sql'
        if (!fs.existsSync(path)) {
            throw new Error(`Views file not found: ${path}`)
        }
        return fs.readFileSync(path, 'utf8')
    }

    // gets the path to the analytics queries
    // which the query loader will use to load from
    getQueryPath(): string {
        const queryPath = this.readStringFromEnvOrFile(
            'QUERY_PATH',
            './db_schema/queries'
        )
        return queryPath as string
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

    /**
     * Get the MySQL connection string for a database defined in the environment variables
     *
     * @param prefix if you have multiple databases, you can specify a prefix to differentiate them
     * @returns The connection string
     *
     * */
    getMySQLConnectionString(
        prefixString: string | undefined = undefined
    ): string | undefined {
        const prefix = prefixString ? `${prefixString}_` : ''

        let connectionString = process.env[`${prefix}DB_CONNECTION_STRING`]
        if (connectionString === undefined) {
            //let's build the connection string from the individual env vars
            const host = this.readStringFromEnvOrFile(
                `${prefix}MYSQL_HOST`,
                'localhost'
            )
            const port = this.readStringFromEnvOrFile(
                `${prefix}MYSQL_PORT`,
                '3306'
            )
            const user = this.readStringFromEnvOrFile(
                `${prefix}MYSQL_USER`,
                undefined
            )
            const password = this.readStringFromEnvOrFile(
                `${prefix}MYSQL_PASSWORD`,
                undefined
            )
            const database = this.readStringFromEnvOrFile(
                `${prefix}MYSQL_DATABASE`,
                undefined
            )
            const options = this.readStringFromEnvOrFile(
                `${prefix}MYSQL_OPTIONS`,
                ''
            )

            if (host && user && password && database && port) {
                connectionString = `mysql://${user}:${password}@${host}:${port}/${database}${options}`
            } else {
                console.log(options)
                throw new Error(
                    'MySQL connection string not defined or could not be built from environment variables' +
                    prefixString
                        ? ` with prefix ${prefixString}`
                        : ''
                )
            }
        }
        return connectionString
    }
}

export { Config }
