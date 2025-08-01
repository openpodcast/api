import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export interface User {
    id: number
    email: string
    name: string
    created_at: string
    updated_at: string
}

export class UserRepository {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT id, email, name, created_at, updated_at FROM users WHERE email = ?',
            [email.toLowerCase()]
        )

        if (!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        return rows[0] as User
    }

    async createUser(name: string, email: string): Promise<User> {
        const [result] = await this.pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name.trim(), email.toLowerCase()]
        )

        if (!result.insertId) {
            throw new Error('Failed to create user')
        }

        const user = await this.getUserById(result.insertId)
        if (!user) {
            throw new Error('Failed to retrieve created user')
        }

        return user
    }

    private async getUserById(id: number): Promise<User | null> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?',
            [id]
        )

        if (!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        return rows[0] as User
    }
}
