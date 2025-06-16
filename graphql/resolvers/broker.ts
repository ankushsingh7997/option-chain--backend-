import { Brokerlogin } from "../../brokers/firstock"
import { delete_broker, get_all_brokers, getBroker, set_all_brokers, setBroker } from "../../cache-controller/broker-cache"
import { updateMargin, updateOrders, updatePositions } from "../../cache-controller/order-cache"
import Broker, { IBroker } from "../../Models/broker-model"
import { catchAsyncGraphQL } from "../../Utils/catch-async-graphQl"
import { throwGraphQLError } from "../../Utils/graphql-error"
import { broker_validation } from "../../Utils/helper"
import { getCurrentTime } from "../../Utils/time"
import { Context } from "../context"

export const BrokerResolver={
    Query:{
        getBroker:catchAsyncGraphQL(async(_:any,args,context:Context)=>{
            let {actid}=args
            let broker =await getBroker(context.userId as string,actid)
            if(!broker) throwGraphQLError("No broker found!","NOT_FOUND")
            return {status:true,message:"Broker data",data:broker}

        }),
        getAllBrokers:catchAsyncGraphQL(async(_:any, __:any,context:Context)=>{
            let brokers=await get_all_brokers(context.userId as string)||[]
            return {status:true,message:"Brokers",data:brokers}
        })
    },
    Mutation:{
        registerBroker:catchAsyncGraphQL(async(_:any,{input}:{input:{broker:string,actid:string}},context:Context)=>{
            const{broker,actid}=input
            const error =broker_validation({broker,actid})
            if(error) throwGraphQLError(error,"BAD_USER_INPUT")
            await Broker.create({broker,actid,userId:context.userId})
            let brokerData=await getBroker(context.userId as string,actid)
            return {
                status:true,message:"Broker created Successfully!",data:brokerData
            }  
        }),
        loginBroker:catchAsyncGraphQL(async(_:any,{input}:{input:{actid:string,request_token:string}},context:Context)=>{
            if(!context.userId) throwGraphQLError("Please login to access this Resource","UNAUTHENTICATED")
            const {actid}=input;
            let broker=await getBroker(context.userId as string,actid);
            if(!broker) throwGraphQLError("No Broker Found","NOT_FOUND")
            if(broker?.loginStatus) return {status:true,message:"Brokker LoggedIn",accessToken:broker.accessToken};
            let response=await Brokerlogin({...input,userId:context.userId});
            if(!response.status) return response
            const updateObj={
                accessToken:response?.data?.accessToken as string,
                loginStatus:true,
                lastLoginAt:getCurrentTime()
            }
            broker=await Broker.findOneAndUpdate({actid:actid,userId:context.userId},updateObj,{new:true}) as IBroker;
            broker.accessToken=response.data?.accessToken as string;
            await Promise.allSettled([setBroker(context.userId as string,broker),set_all_brokers(context.userId as string,[],true),updateOrders(context.userId as string,broker.actid),updatePositions(context.userId as string,broker.actid),updateMargin(context.userId as string, broker.actid)]);

            return {status:true,accessToken:response.data?.accessToken,message:"Broker LoggedIn successfully"};

        }),
        removeBroker:catchAsyncGraphQL(async(_:any,{input}:{input:{actid:string}},context:Context)=>{
            if(!context.userId) throwGraphQLError("Please login to access this Resource","UNAUTHENTICATED")
            let broker=await getBroker(context.userId as string,input.actid)
            if(!broker) throwGraphQLError("NOT BROKER FOUND","NOT_FOUND")
                
            await Promise.allSettled([await Broker.findOneAndDelete({userId:context.userId,actid:input.actid}),await  delete_broker(context.userId as string,input.actid)])

            return {status:true,message:"Broker Removed"}
        })
    }
}