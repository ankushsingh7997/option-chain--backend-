import {
    METHODS,
    updateHeaders,
    updatePayload,
    URLS,
} from "../brokers/broker-constant";
import requestHandler from "../Utils/request-handler";
import { IBroker } from "../Models/broker-model";
import logger from "../Utils/logger";
import redis from "../Utils/redis";
import { book_updater } from "../Utils/helper";
import { getBroker } from "./broker-cache";

const client = redis.getRedisClient("optionChain");

const getBook = async (broker: IBroker, type: string) => {
    const url: string = URLS[broker.broker]["updater"][type];
    const method = METHODS[broker.broker];
    const payload = updatePayload[broker.broker as string](broker);
    const headers = updateHeaders[broker.broker as string] || {};
    let response = await requestHandler({
        method,
        url,
        payload,
        headers,
        userId: broker.userId,
        actid: broker.actid,
    });

    const key = `${broker.broker}_${type}_mapping`;
    let resp= book_updater[key](response);
    if(resp.status) return resp.data
    return []
};

export const setOrders = async (userId: string,orders: any): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        await client.HSET(userId, "orders", JSON.stringify(orders));
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    }
};

export const getOrders = async (userId: string,actid: string): Promise<any> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        const cachedOrders = await client.HGET(userId, "orders");
        if (!cachedOrders) {
            let broker = await getBroker(userId, actid);
            if (!broker) return [];
            let book = await getBook(broker, "order");
            await setOrders(userId, book);
            return book;
        }
        return JSON.parse(cachedOrders as any);
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
    }
};

export const updateOrders = async (userId: string,actid: string): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");

        let broker = await getBroker(userId, actid);
        if (!broker) return;
        let book = await getBook(broker, "order");
        await setOrders(userId, book);
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

export const setPositions = async (userId: string,positions: any): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        await client.HSET(userId, "positions", JSON.stringify(positions));
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

export const getPositions = async (userId: string,actid: string): Promise<any> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        const cachedPositions =await client.HGET(userId, "positions");
        if (!cachedPositions) {
            let broker = await getBroker(userId, actid);
            if (!broker) return [];
            let book = await getBook(broker, "position");
            await setPositions(userId, book);
            return book;
        }
        return JSON.parse(cachedPositions as any);
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

export const updatePositions = async (userId: string,actid: string): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");

        let broker = await getBroker(userId, actid);
        if (!broker) return;
        let book = await getBook(broker, "position");
        await setPositions(userId, book);
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};


export const setMargin = async (userId: string,margin: any): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        await client.HSET(userId, "margin", JSON.stringify(margin));
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

export const getMargin = async (userId: string,actid: string): Promise<any> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");
        const cachedMargin = await client.HGET(userId, "margin");
        if (!cachedMargin) {
            let broker = await getBroker(userId, actid);
            if (!broker) return [];
            let book = await getBook(broker, "margin");
            await setMargin(userId, book);
            return book;
        }
        return JSON.parse(cachedMargin as any);
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

export const updateMargin = async (userId: string,actid: string): Promise<void> => {
    try {
        if (!client) throw new Error("Redis client is not initialized");

        let broker = await getBroker(userId, actid);
        if (!broker) return;
        let book = await getBook(broker, "margin");
        await setMargin(userId, book);
    } catch (error) {
        logger.notify("Error in setting broker in cache");
        if (error instanceof Error) {
            logger.error({ message: error.message, stack: error.stack });
        } else {
            logger.error(String(error));
        }
        return undefined;
    }
};

