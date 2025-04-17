import sqlite3 from 'sqlite3';

class DatabaseService {
    constructor() {
        this.db = new sqlite3.Database('./shot_results.db', (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log('Connected to the game results database');
                this.initializeDatabase();
            }
        });
    }

    initializeDatabase() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS shot_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                violationType TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                redeemed BOOLEAN DEFAULT 0
            )
        `);
    }

    async addShot(playerId, violationType) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO shot_results (player_id, violationType) 
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
                    COUNT(*) as total_shots, COUNT(CASE WHEN redeemed = 0 THEN 1 END) as open_shots, COUNT(CASE WHEN redeemed = 1 THEN 1 END) as redeemed_shots,
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
            this.db.run(
                `UPDATE shot_results 
                 SET redeemed = 1 
                 WHERE player_id = ? AND redeemed = 0 
                 LIMIT 1`,
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

export default new DatabaseService()