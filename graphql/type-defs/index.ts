import { mergeTypeDefs } from "@graphql-tools/merge";
import { userTypeDefs } from "./user";
import { BrokerTypeDefs } from "./broker";
import { TradeTypeDefs } from "./trade";

export const typeDefs=mergeTypeDefs([
    userTypeDefs,BrokerTypeDefs,TradeTypeDefs
])