import { getUsernameFromId } from "./utils.js";

class UsernameCache {
    constructor() {
        this.cache = new Map();
    }

    async getUsername(userId) {
        if (this.cache.has(userId)) {
            return this.cache.get(userId);
        } else {
            const username = await getUsernameFromId(userId);
            this.cache.set(userId, username);
            return username;
        }
    }
}

export default new UsernameCache();