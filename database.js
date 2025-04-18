import sqlite3 from 'sqlite3';
import { databasePath, isTestEnvironment } from './envHelper.js';

class DatabaseService {
    constructor(testing = false) {
        const dbPath = testing ? './.test.database.db' : databasePath();
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log(`Connected to ${dbPath} database`);
                this.initializeDatabase(testing);
            }
        });
    }

    initializeDatabase(testing) {

        if (testing) {
            this.db.run('DROP TABLE IF EXISTS shot_results');
        }
        this.db.run(`
            CREATE TABLE IF NOT EXISTS shot_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                violation_type TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                redeemed BOOLEAN DEFAULT 0
            )
        `);
    }

    async addShot(playerId, violationType) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO shot_results (player_id, violation_type)
                 VALUES (?, ?)`,
                [playerId, violationType],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    async getPlayerShots(playerId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT 
                    COUNT(*) as total_shots,
                    COUNT(CASE WHEN redeemed = 0 THEN 1 END) as open_shots,
                    COUNT(CASE WHEN redeemed = 1 THEN 1 END) as redeemed_shots
                 FROM shot_results 
                 WHERE player_id = ?`,
                [playerId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || {
                            total_shots: 0,
                            open_shots: 0,
                            redeemed_shots: 0,
                        });
                    }
                }
            );
        });
    }

    async redeemShot(playerId) {
        return new Promise((resolve, reject) => {
            // First begin a transaction
            this.db.run('BEGIN TRANSACTION');

            // First query to find and lock an unredeemed shot
            this.db.get(
                `SELECT id, violation_type
                 FROM shot_results
                 WHERE player_id = ? AND redeemed = 0 
                 ORDER BY id ASC
                 LIMIT 1`,
                [playerId],
                (err, row) => {
                    if (err) {
                        this.db.run('ROLLBACK');
                        return reject(err);
                    }

                    if (!row) {
                        this.db.run('ROLLBACK');
                        return resolve({
                            changes: this.changes,
                            redeemed: false,
                        });
                    }

                    // Now update the found shot
                    this.db.run(
                        `UPDATE shot_results 
                         SET redeemed = 1 
                         WHERE id = ?`,
                        [row.id],
                        function (updateErr) {
                            if (updateErr) {
                                this.db.run('ROLLBACK');
                                return reject(updateErr);
                            }

                            this.db.run('COMMIT');
                            resolve({
                                changes: this.changes,
                                redeemed: true,
                                violationType: row.violation_type
                            });
                        }
                    );
                }
            );
        });
    }

    async redeemAllShots(playerId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE shot_results 
                 SET redeemed = 1 
                 WHERE player_id = ? AND redeemed = 0`,
                [playerId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                }
            );
        });
    }

    async getAllOpenShots() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT player_id, COUNT(*) as open_shots 
                 FROM shot_results 
                 WHERE redeemed = 0 
                 GROUP BY player_id`,
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async getAllPlayers() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT DISTINCT player_id FROM shot_results`,
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
}

export default new DatabaseService(isTestEnvironment())