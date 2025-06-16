import User from "../Models/user-model";
import logger from "../Utils/logger";
import redis from "../Utils/redis"

const client = redis.getRedisClient("optionChain");

export const setProfile = async (userId: string, data: any): Promise<void> => {
    try {
        if (!client) {
            throw new Error("Redis client is not initialized");
        }
        await client.HSET(userId.toString(), "profile", JSON.stringify(data));
    } catch (error) {
        logger.notify("Error in setting cache profile");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    };
}

export const getProfile = async (userId: string): Promise<any | undefined> => {
    try {
        if (!client) {
            throw new Error("Redis client is not initialized");
        }

        const profile = await client.HGET(userId, "profile");

        if (!profile) {
            const user = await User.findById(userId);
            if (!user) return undefined;

            const userData = user.toJSON();
            await setProfile(userId, userData);
            return userData;
        }
        return JSON.parse(profile);
    } catch (error) {
        logger.error("Error retrieving profile from Redis or DB");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
}