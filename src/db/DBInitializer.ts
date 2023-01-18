import { Pool } from 'mysql2/promise'

/**
 * This class is responsible for initializing the mysql database.
 * It checks if one of the tables exists and sends the schema.sql file
 * to the server to create all tables
 */

class DBInitializer {
    private pool: Pool
    private tablesToCheck: string[]
    private schemaData: string

    constructor(pool: Pool, tablesToCheck: string[], schemaData: string) {
        this.pool = pool
        this.tablesToCheck = tablesToCheck
        this.schemaData = schemaData
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

    private async createTables(): Promise<any> {
        const queries = this.schemaData
            // split by semicolon to get individual queries
            .split(';')
            // remove empty queries
            .filter((query) => query.trim() !== '')
        return Promise.all(queries.map((query) => this.pool.query(query)))
    }

    public async init(): Promise<void> {
        const tablesExist = await this.checkTablesExist()
        if (!tablesExist) {
            console.log(
                "MySQL tables don't exist in the specified db, creating them..."
            )
            await this.createTables()
            console.log('tables created')
        }
    }
}

export { DBInitializer }
