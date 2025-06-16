import {mergeResolvers} from "@graphql-tools/merge"
import { userResolvers } from "./user"
import { BrokerResolver } from "./broker"
import { TradeResolver } from "./trade"
export const resolvers =mergeResolvers([userResolvers,BrokerResolver,TradeResolver])