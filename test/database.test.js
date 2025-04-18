import db from '../database.js';
import { getViolations } from '../violations.js';


describe('Database Tests', () => {
    test('create a shot for a user', async () => {
        const userId = 1;
        const violationType = getViolations()[0];
        await db.addShot(userId, violationType);

        const shots = await db.getPlayerShots(userId);
        expect(shots.total_shots).toBe(1);
    });
});

describe('Scaffolding', () => {
    test('create initial shots in db', async () => {
        const kemurId = "232460657629462528";
        const pawnobiId = "299962313442590721";
        const flexId = "238705817422004226";

        function getRandomViolationType() {
            const violations = getViolations();
            return violations[Math.floor(Math.random() * violations.length)];
        }

        async function createShots(playerId, count) {
            for (let i = 0; i < count; i++) {
                const violations = getViolations();
                const violation = violations[Math.floor(Math.random() * violations.length)];
                await db.addShot(playerId, violation);
            }
        }

        // from snapshot 2025-04-17
        await createShots(pawnobiId, 10);
        await createShots(flexId, 6);
        await createShots(kemurId, 8);
    });
});