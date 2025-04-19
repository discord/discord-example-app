'use strict';
import { describe, test, expect } from '@jest/globals';

import { createDatabaseService, dbInMemory } from '../database.js';
import { getViolations } from '../violations.js';


describe('Integration Tests', () => {
    test('smoke test', async () => {

        const db = await createDatabaseService(":memory:");

        const userId1 = 1;
        const userId2 = 2;
        const violationType1 = getViolations()[0];
        const violationType2 = getViolations()[1];
        const violationType3 = getViolations()[2];

        await db.addShot(userId1, violationType1);

        const firstShotUser1 = await db.getLastShot(userId1);

        expect(firstShotUser1).toBeTruthy();
        expect(firstShotUser1.violationType).toBe(violationType1);
        expect(firstShotUser1.redeemed).toBe(false);
        expect(firstShotUser1.date).toBeTruthy();
        expect(firstShotUser1.date).toBeInstanceOf(Date);
        expect(firstShotUser1.date.toString()).not.toBe("Invalid Date");
        expect(firstShotUser1.date.getTime()).toBeLessThan(Date.now());
        expect(firstShotUser1.date.getTime()).toBeGreaterThan(Date.now() - 1000 * 2); // within the last 2 seconds

        await db.addShot(userId1, violationType2);
        const secondShotUser1 = await db.getLastShot(userId1);

        await db.addShot(userId2, violationType3);
        await db.addShot(userId2, violationType3);
        await db.addShot(userId2, violationType3);

        const shotsUser1 = await db.getPlayerShots(userId1);
        const shotsUser2 = await db.getPlayerShots(userId2);

        const secondShotUser1AfterUser2 = await db.getLastShot(userId1);
        expect(secondShotUser1).toStrictEqual(secondShotUser1AfterUser2);

        expect(shotsUser1.total_shots).toBe(2);
        expect(shotsUser1.open_shots).toBe(2);
        expect(shotsUser1.redeemed_shots).toBe(0);

        expect(shotsUser2.total_shots).toBe(3);
        expect(shotsUser2.open_shots).toBe(3);
        expect(shotsUser2.redeemed_shots).toBe(0);

        await db.redeemShot(userId1)

        const shotsUser1AfterRedemption = await db.getPlayerShots(userId1);

        expect(shotsUser1AfterRedemption.total_shots).toBe(2);
        expect(shotsUser1AfterRedemption.open_shots).toBe(1);
        expect(shotsUser1AfterRedemption.redeemed_shots).toBe(1);

        await db.redeemAllShots(userId2);

        const shotsUser2AfterRedemption = await db.getPlayerShots(userId2);
        expect(shotsUser2AfterRedemption.total_shots).toBe(3);
        expect(shotsUser2AfterRedemption.open_shots).toBe(0);
        expect(shotsUser2AfterRedemption.redeemed_shots).toBe(3);
    });
});

describe('Scaffolding', () => {

    test('create initial shots in db', async () => {

        var db = await createDatabaseService(":memory:");

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