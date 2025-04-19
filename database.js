'use strict';

import sqlite3 from 'sqlite3';
import { databasePath } from './envHelper.js';

class DatabaseService {
    constructor(databasePath, sqliteModule = sqlite3) {
        this.sqlite = sqliteModule;
        this.databasePath = databasePath;
        this.db = null;
        this.connectionPromise = null;
    }

    async #ensureConnected() {
        if (this.db) return;
        if (this.connectionPromise) return await this.connectionPromise;

        this.connectionPromise = new Promise((resolve, reject) => {
            this.db = new this.sqlite.Database(this.databasePath, (err) => {
                if (err) {
                    console.error('Database connection error:', err);
                    reject(err);
                } else {
                    console.log(`Connected to ${this.databasePath} database`);
                    resolve();
                }
            });
        });

        try {
            await this.connectionPromise;
        } finally {
            this.connectionPromise = null;
        }
    }

    async disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    this.db = null;
                    resolve();
                }
            });
        });
    }

    async _initializeDatabase() {
        await this.#runQuery(`
            CREATE TABLE IF NOT EXISTS shot_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                violation_type TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                redeemed BOOLEAN DEFAULT 0
            )
        `);
    }

    async #runQuery(sql, params = []) {
        await this.#ensureConnected();

        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    async #getQuery(sql, params = []) {
        await this.#ensureConnected();

        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async #allQuery(sql, params = []) {
        await this.#ensureConnected();

        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async addShot(playerId, violationType) {
        const result = await this.#runQuery(
            `INSERT INTO shot_results (player_id, violation_type)
             VALUES (?, ?)`,
            [playerId, violationType]
        );
        return result.lastID;
    }

    async getPlayerShots(playerId) {
        const row = await this.#getQuery(
            `SELECT 
                COUNT(*) as total_shots,
                COUNT(CASE WHEN redeemed = 0 THEN 1 END) as open_shots,
                COUNT(CASE WHEN redeemed = 1 THEN 1 END) as redeemed_shots
             FROM shot_results 
             WHERE player_id = ?`,
            [playerId]
        );

        return row || {
            total_shots: 0,
            open_shots: 0,
            redeemed_shots: 0,
        };
    }

    async redeemShot(playerId) {
        try {
            await this.#runQuery('BEGIN TRANSACTION');

            const row = await this.#getQuery(
                `SELECT id, violation_type
                 FROM shot_results
                 WHERE player_id = ? AND redeemed = 0 
                 ORDER BY id ASC
                 LIMIT 1`,
                [playerId]
            );

            if (!row) {
                await this.#runQuery('ROLLBACK');
                return {
                    changes: 0,
                    redeemed: false,
                };
            }

            const result = await this.#runQuery(
                `UPDATE shot_results 
                 SET redeemed = 1 
                 WHERE id = ?`,
                [row.id]
            );

            await this.#runQuery('COMMIT');
            return {
                changes: result.changes,
                redeemed: true,
                violationType: row.violation_type
            };
        } catch (error) {
            await this.#runQuery('ROLLBACK');
            throw error;
        }
    }

    async redeemAllShots(playerId) {
        const result = await this.#runQuery(
            `UPDATE shot_results 
             SET redeemed = 1 
             WHERE player_id = ? AND redeemed = 0`,
            [playerId]
        );
        return result.changes;
    }

    async getAllOpenShots() {
        return this.#allQuery(
            `SELECT player_id, COUNT(*) as open_shots
             FROM shot_results
             WHERE redeemed = 0
             GROUP BY player_id`
        );
    }

    async getLastShot(playerId) {
        const row = await this.#getQuery(
            `SELECT violation_type, added_at
             FROM shot_results
             WHERE player_id = ?
             ORDER BY added_at DESC
             LIMIT 1`,
            [playerId]
        );

        if (row) {
            return {
                violationType: row.violation_type,
                date: new Date(`${row.added_at}Z`), // Ensure UTC parsing
                redeemed: row.redeemed === 1
            };
        }
        return null;
    }

    async getAllPlayers() {
        return this.#allQuery(
            `SELECT DISTINCT player_id FROM shot_results`
        );
    }

}

// Factory function for creating database service instances
export async function createDatabaseService(path = databasePath()) {
    const dbService = new DatabaseService(path);
    await dbService._initializeDatabase();
    return dbService;
}