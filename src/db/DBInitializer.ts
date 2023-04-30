import { Pool, RowDataPacket } from 'mysql2/promise'
import fs from 'fs'

/**
 * This class is responsible for initializing the mysql database.
 * It checks if one of the tables exists and sends the schema.sql file
 * to the server to create all tables
 */

class DBInitializer {
    private pool: Pool
    private tablesToCheck: string[]
    private schemaData: string
    private sqlToRun: string
    private migrationsPath: string

    constructor(
        pool: Pool,
        tablesToCheck: string[],
        schemaData: string,
        sqlToRun: string,
        migrationsPath: string
    ) {
        this.pool = pool
        this.tablesToCheck = tablesToCheck
        this.schemaData = schemaData
        this.sqlToRun = sqlToRun
        this.migrationsPath = migrationsPath
    }

    private async checkTableExist(tableName: string): Promise<boolean> {
        // check if tableName exists in the database
        const result = await this.pool.query('SHOW TABLES LIKE ?', [tableName])
        return (result[0] as []).length > 0
    }

    private async checkTablesExist(): Promise<boolean> {
        const tablesExist = await Promise.all(
            this.tablesToCheck.map((tableName) =>
                this.checkTableExist(tableName)
            )
        )
        return tablesExist.every((tableExists) => tableExists)
    }

    private async runQueries(queriesData: string): Promise<any> {
        const queries = queriesData
            // split by semicolon to get individual queries
            .split(';')
            // remove empty queries
            .filter((query) => query.trim() !== '')
        // run queries sequentially as otherwise tables might not be created yet
        for (const query of queries) {
            await this.pool.query(query)
        }
        return
    }

    // Function which waits for the database to be ready
    // Retry up to N times with exponential backoff
    private async waitForDatabase(): Promise<void> {
        let retries = 10
        let waitTime = 3 // seconds

        while (retries > 0) {
            try {
                await this.pool.query('SELECT 1')
                return
            } catch (err) {
                console.log(
                    `Database not ready, retrying in ${waitTime} seconds...`
                )
                await new Promise((resolve) =>
                    setTimeout(resolve, waitTime * 1000)
                )
                waitTime *= 2
                retries--
            }
        }
        throw new Error('Database not ready after 3 retries')
    }

    private getMigrationGoal(): number {
        // get all files in the migrations folder and get highest number from files like 5.sql
        const files = fs.readdirSync(this.migrationsPath)
        const migrationIds = files
            .map((file): number | null => {
                const match = file.match(/^(\d+).*\.sql$/)
                if (match) {
                    return parseInt(match[1], 10)
                }
                return null
            })
            .filter((migrationId) => migrationId !== null) as number[]
        return Math.max(...migrationIds)
    }

    private runMigration(migrationId: number): void {
        // find migration file of form <migrationId>OtherText.sql and run it
        const migrationFile = fs
            .readdirSync(this.migrationsPath)
            .map((file) =>
                // regex to start with whole number and continue with anything but a number
                file.match(new RegExp(`^${migrationId}[^0-9]*\\.sql$`))
            )
            .filter((match) => match !== null)[0]
        if (migrationFile?.length === 1) {
            console.log(`Migration file ${migrationFile} will be applied`)
            const migrationData = fs.readFileSync(
                `${this.migrationsPath}/${migrationFile[0]}`,
                'utf8'
            )
            this.runQueries(migrationData)
        } else {
            throw new Error(
                `Migration file for migration number ${migrationId} not found.`
            )
        }
    }

    private async runMigrations(): Promise<void> {
        console.log('Checking migrations ...')
        //check if migrations table is present and fetch the latest migration_id
        const migrationsTableExists = await this.checkTableExist('migrations')
        let latestMigrationId = 0
        if (migrationsTableExists) {
            const result = (await this.pool.query(
                'SELECT MAX(migration_id) as latestMigrationId FROM migrations'
            )) as RowDataPacket[]
            latestMigrationId = result[0][0].latestMigrationId || 0
            console.log(`Latest migration id: ${latestMigrationId}`)
        } else {
            console.log('No migrations table found, init migration number 0')
        }
        const migrationIdGoal = this.getMigrationGoal()
        console.log(`Migration id goal: ${migrationIdGoal}`)
        for (
            let migrationId = latestMigrationId + 1;
            migrationId <= migrationIdGoal;
            migrationId++
        ) {
            console.log(`Running migration number ${migrationId} ...`)
            this.runMigration(migrationId)
            console.log(`Migration ${migrationId} done`)
        }
        console.log('All migration work finished')
    }

    public async init(): Promise<void> {
        await this.waitForDatabase()
        // check if there is anything, otherwise create the tables
        const tablesExist = await this.checkTablesExist()
        if (!tablesExist) {
            console.log(
                "MySQL tables don't exist in the specified db, creating them..."
            )
            await this.runQueries(this.schemaData)
            console.log('tables created')
            // if there is already a schema, check if migrations are needed
        } else {
            await this.runMigrations()
        }
        // queries that are always executed, e.g. to replace all views
        if (this.sqlToRun) {
            console.log(`Running sql statements ...`)
            // as planetscale doesn't support some more advanced sql statements
            // allow errors and just continue
            await this.runQueries(this.sqlToRun).catch((err) => {
                console.log(err)
            })
            console.log('sql statements executed')
        }
    }
}

export { DBInitializer }
