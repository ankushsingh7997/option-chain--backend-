import crypto from "crypto";
import { Buffer } from "buffer";
import requestHandler from "../Utils/request-handler";
import { FIRSTOCK_APP_ID,FIRSTOCK_SECRET_KEY } from "../Env/env";
import {updateHeaders, URLS} from "./broker-constant"
import logger from "../Utils/logger"; 
import { IBroker } from "../Models/broker-model";
import { makeCancelOrderObj, makePlaceOrderObj } from "../Utils/helper";
import { updateMargin, updateOrders, updatePositions } from "../cache-controller/order-cache";

interface LoginData {
    actid:string;
    request_token?:string;
    userId?:string;
}

interface LoginResponse {
    status:boolean;
    message?:string;
    redirect_uri?:string;
    data?:{
        accessToken:string;
    };
    broker?:string
}

interface PayloadData {
    userId:string;
    type:string;
    accessToken:string;
    appId: string;
    deviceId:string;
}


function decrypt(token:string):string{
    const decipher =crypto.createDecipheriv("aes-256-cbc",FIRSTOCK_SECRET_KEY,Buffer.alloc(16))
    return decipher.update(token,"base64","utf-8") + decipher.final("utf-8")
}
// Broker login
export const Brokerlogin= async (data: LoginData): Promise<LoginResponse> => {
    try {
        const { actid, request_token } = data;
        if(!request_token){
            return{
                status: false,
                message: "redirect",
                redirect_uri: `https://app.firstock.in/login?appId=${FIRSTOCK_APP_ID}&callback=${URLS["firstock"]["login"].callback}`,
            };
        }
        const accessToken = Buffer.from(request_token, "base64").toString("utf-8");
        const [_, jKey, deviceId] = decrypt(accessToken).split(":");

        let payload: PayloadData = {
            userId: actid,
            type: "WEB",
            accessToken,
            appId: FIRSTOCK_APP_ID,
            deviceId: deviceId,
        };

        const res = await requestHandler({
            method: "POST",
            url: URLS["firstock"]["login"].verify_token,
            payload,
            service: "optionChain",
            userId: data.userId,
            actid,
        });

        if (res.response?.status === "Success") return { status: true, data: { accessToken: jKey } };
        return { status: false, message: res.response?.message || res.message };
    } catch (err: any) {
        logger.notify(`Error on firstock login: ${err.message}`);
        return { status: false, message: `Error while login for actid: ${data.actid}` };
    }
};

// Order placer
export const placeOrder=async(broker:IBroker,payload:any)=>{
    const orderPayload=makePlaceOrderObj(payload,broker)
    const headers=updateHeaders[broker.broker](broker)
    const response=await requestHandler({
        method:"POST",
        url:URLS.firstock.placer.place,
        headers,
        payload:orderPayload,
        service:"optionChain",
        userId:broker.userId 
    }) 
    let updateBook=[updateOrders(broker.userId ,broker.actid)]
    if(response.status){
        response.message="Order Placed"
        updateBook=[...updateBook,updatePositions(broker.userId ,broker.actid),updateMargin(broker.userId , broker.actid)]
        
    }else response.message=response.response.name
    await Promise.allSettled(updateBook)
    return response    
}

export const placeBulkOrders = async (broker: IBroker, orders: any[]) => {
    const results = {
        successfulOrders: [] as any[],
        failedOrders: [] as any[],
        totalOrders: orders.length,
        successCount: 0,
        failureCount: 0
    };

    // Process all orders concurrently
    const orderPromises = orders.map(async (orderPayload) => {
        try {
            const response = await placeOrder(broker, orderPayload);
            if (response.status) {
                results.successfulOrders.push(response.response.data);
                results.successCount++;
            } else {
                results.failedOrders.push({
                    orderInput: orderPayload,
                    error: response.message || "Unknown error"
                });
                results.failureCount++;
            }
        } catch (error) {
            results.failedOrders.push({
                orderInput: orderPayload,
                error: error instanceof Error ? error.message : "Unknown error"
            });
            results.failureCount++;
        }
    });

    await Promise.allSettled(orderPromises);

    return {
        status: results.successCount > 0, // True if at least one order succeeded
        data: results
    };
};


export const cancelOrder=async(broker:IBroker,payload:any)=>{
     let orderPayload=makeCancelOrderObj(payload,broker);
     const headers=updateHeaders[broker.broker](broker)
     let response=await requestHandler({method:"POST",url:URLS.firstock.placer.cancel,headers,payload:orderPayload,service:"optionChain",userId:payload.userId as string})    
     await updateOrders(broker.userId as string,broker.actid);
     if(response.status) response.message="order cancel in progress"
     else response.message=response.response.name
     return response;
}





