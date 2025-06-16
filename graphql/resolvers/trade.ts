import { placeOrder, cancelOrder, placeBulkOrders } from "../../brokers/firstock";
import { getBroker } from "../../cache-controller/broker-cache";
import { 
  getOrders, 
  getPositions, 
  getMargin, 
  updateOrders 
} from "../../cache-controller/order-cache";
import { catchAsyncGraphQL } from "../../Utils/catch-async-graphQl";
import { throwGraphQLError } from "../../Utils/graphql-error";
import { Context } from "../context";

interface PlaceOrderInput {
  actid: string;
  exchange?: string;
  symbol: string;
  quantity: number;
  price?: string;
  triggerPrice?: string;
  productType?: string;
  transactionType: number;
  priceType?: string;
  retention?: string;
  remarks?: string;
  orderNumber: string;
}

interface BulkPlaceOrderInput {
  actid: string;
  orders: Omit<PlaceOrderInput, 'actid'>[]; 
}

interface CancelOrderInput {
  actid: string;
  orderNumber: string;
}

export const TradeResolver = {
  Query: {
    getTrades: catchAsyncGraphQL(async (_: any, args: { actid: string }, context: Context) => {
      if (!context.userId) {
        throwGraphQLError("Please login to access this resource", "UNAUTHENTICATED");
      }

      const { actid } = args;
      const broker = await getBroker(context.userId, actid);
      
      if (!broker) {
        throwGraphQLError(`No broker found with actid: ${actid}`, "NOT_FOUND");
      }

      const [orderResult, positionResult, marginResult] = await Promise.allSettled([
        getOrders(context.userId, actid),
        getPositions(context.userId, actid),
        getMargin(context.userId, actid)
      ]);

      const tradeDetails = {
        orders: orderResult.status === 'fulfilled' ? orderResult.value || [] : [],
        positions: positionResult.status === 'fulfilled' ? positionResult.value || [] : [],
        margin: marginResult.status === 'fulfilled' ? marginResult.value || {} : {}
      };

      return {
        status: true,
        message: "Trade details retrieved successfully",
        data: tradeDetails
      };
    }),

    getOrders: catchAsyncGraphQL(async (_: any, args: { actid: string }, context: Context) => {
      if (!context.userId) {
        throwGraphQLError("Please login to access this resource", "UNAUTHENTICATED");
      }

      const { actid } = args;
      const broker = await getBroker(context.userId, actid);
      
      if (!broker) {
        throwGraphQLError(`No broker found with actid: ${actid}`, "NOT_FOUND");
      }

      const orders = await getOrders(context.userId, actid) || [];

      return {
        status: true,
        message: "Orders retrieved successfully",
        data: orders
      };
    })
  },

  Mutation: {
    placeOrder: catchAsyncGraphQL(async (_: any, { input }: { input: PlaceOrderInput }, context: Context) => {
      if(!context.userId) throwGraphQLError("Please login to access this resource", "UNAUTHENTICATED");
      
      const{ actid, ...orderPayload }=input;
      const broker = await getBroker(context.userId, actid);
      if(!broker) throwGraphQLError("No broker found", "NOT_FOUND");
      
      const response = await placeOrder(broker, orderPayload);
      if (!response.status) throwGraphQLError(response.message || "Failed to place order", "BAD_USER_INPUT");
      
      return {
        status: response.status,
        message: response.message || "Order placed successfully",
        data: response.response.data
      };
    }),
    placeBulkOrders: catchAsyncGraphQL(async (_: any, { input }: { input: BulkPlaceOrderInput }, context: Context) => {
      if (!context.userId) throwGraphQLError("Please login to access this resource", "UNAUTHENTICATED");
      
      const { actid, orders } = input;
      
      if (!orders || orders.length === 0) {
          throwGraphQLError("At least one order is required", "BAD_USER_INPUT");
      }

      const broker = await getBroker(context.userId, actid);
      if (!broker) throwGraphQLError("No broker found", "NOT_FOUND");
      
      const response = await placeBulkOrders(broker, orders);
      
      let message = "";
      if (response.data.successCount === response.data.totalOrders) {
          message = `All ${response.data.totalOrders} orders placed successfully`;
      } else if (response.data.successCount > 0) {
          message = `${response.data.successCount} out of ${response.data.totalOrders} orders placed successfully`;
      } else {
          message = "All orders failed to place";
      }
      
      return {
          status: response.status,
          message,
          data: response.data
      };
  }),

    cancelOrder: catchAsyncGraphQL(async (_: any, { input }: { input: CancelOrderInput }, context: Context) => {
      if (!context.userId) throwGraphQLError("Please login to access this resource", "UNAUTHENTICATED");
      

      const { actid, orderNumber } = input;
      const broker = await getBroker(context.userId, actid);
      
      if (!broker)throwGraphQLError("No broker found", "NOT_FOUND");
      const payload = {orderNumber,userId: context.userId};
      const response = await cancelOrder(broker, payload);
      if (!response.status) throwGraphQLError(response.message || "Failed to cancel order", "BAD_USER_INPUT");
      
      return {status: response.status,message: response.message || "Order cancelled successfully",data: response.response.data};
    }),

    updateOrderBook: catchAsyncGraphQL(async (_: any, args: { actid: string }, context: Context) => {
      if (!context.userId) throwGraphQLError("Please login to access this resource", "UNAUTHENTICATED");
      
      const { actid } = args;
      const broker = await getBroker(context.userId, actid);  
      if (!broker) throwGraphQLError(`No broker found with actid: ${actid}`, "NOT_FOUND");
      await updateOrders(context.userId, actid);
      return {
        status: true,
        message: "Updating order book"
      };
    })
  }
};