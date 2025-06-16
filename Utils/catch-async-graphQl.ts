import { GraphQLResolveInfo } from "graphql";
import { Context } from "../graphql/context";
import { handleMongooseError } from "./graphql-error-handler";
import { withLogging } from "./resolver-logger";

type GraphQLResolver<TArgs=any,TResult=any>=(parent:any,args:TArgs,context:Context,info:GraphQLResolveInfo)=>Promise<TResult>|TResult



export const catchAsyncGraphQL = <TArgs = any, TResult = any>(
    resolver: GraphQLResolver<TArgs, TResult>
): GraphQLResolver<TArgs, TResult> => {
    return withLogging(async (parent: any, args: TArgs, context: Context, info: GraphQLResolveInfo): Promise<TResult> => {
        try {
            return await resolver(parent, args, context, info);
        } catch (error) {
            throw handleMongooseError(error);
        }
    })
};