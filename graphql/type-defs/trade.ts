import { gql } from 'graphql-tag';

export const TradeTypeDefs = gql`
  type Position {
    realizedPnl: Float!
    dayBuyAmount: Float!
    dayBuyAveragePrice: Float!
    dayBuyQuantity: Int!
    daySellAmount: Float!
    daySellAveragePrice: Float!
    daySellQuantity: Int!
    exchange: String!
    lotSize: Int!
    mult: Int!
    netAveragePrice: Float!
    netQuantity: Float!
    netUploadQuantity: String!
    priceFactor: String!
    pricePrecision: String!
    product: String!
    tickSize: String!
    token: String!
    symbol: String!
    unrealizedMtom: Float!
    uploadPrice: String!
    userId: String!
  }

  type Order {
    orderNumber: String!
    exchange: String!
    symbol: String!
    quantity: Int!
    transactionType: String!
    priceType: String!
    retention: String!
    token: String!
    product: String!
    price: Float!
    averagePrice: String!
    triggerPrice: String!
    status: String!
    remarks: String!
    message: String!
    orderTime: String!
  }

  type Margin {
    available_margin: String!
    available_cash: String!
    used_cash: String!
  }

  type TradeDetails {
    orders: [Order!]!
    positions: [Position!]!
    margin: Margin!
  }

  input PlaceOrderInput {
    actid: String!
    exchange: String
    symbol: String!
    quantity: Int!
    price: String
    triggerPrice: String
    productType: String
    transactionType: Int!
    priceType: String
    retention: String
    remarks: String
    orderNumber: String
  }

  # Input type for individual order (without actid)
  input OrderInput {
    exchange: String
    symbol: String!
    quantity: Int!
    price: String
    triggerPrice: String
    productType: String
    transactionType: Int!
    priceType: String
    retention: String
    remarks: String
    orderNumber: String
  }

  # New input type for bulk orders
  input BulkPlaceOrderInput {
    actid: String!
    orders: [OrderInput!]!
  }

  input CancelOrderInput {
    actid: String!
    orderNumber: String!
  }

  type PlaceOrderResponse {
    status: Boolean!
    message: String
    data: OrderData
  }

  type OrderData {
    requestTime: String
    orderNumber: String
  }

  # New response types for bulk orders
  type BulkPlaceOrderResponse {
    status: Boolean!
    message: String!
    data: BulkOrderData!
  }

  type BulkOrderData {
    successfulOrders: [OrderData!]!
    failedOrders: [FailedOrderData!]!
    totalOrders: Int!
    successCount: Int!
    failureCount: Int!
  }

  type FailedOrderData {
    orderInput: FailedOrderDetails!
    error: String!
  }

  type FailedOrderDetails {
    exchange: String
    symbol: String!
    quantity: Int!
    price: String
    triggerPrice: String
    productType: String
    transactionType: Int!
    priceType: String
    retention: String
    remarks: String
    orderNumber: String!
  }

  type CancelOrderResponse {
    status: Boolean!
    message: String
    data: OrderData
  }

  type TradeDetailsResponse {
    status: Boolean!
    message: String!
    data: TradeDetails!
  }

  type OrdersResponse {
    status: Boolean!
    message: String!
    data: [Order!]!
  }

  type UpdateOrderResponse {
    status: Boolean!
    message: String!
  }

  type Query {
    getTrades(actid: String!): TradeDetailsResponse!
    getOrders(actid: String!): OrdersResponse!
  }

  type Mutation {
    # Keep the old mutation for backward compatibility
    placeOrder(input: PlaceOrderInput!): PlaceOrderResponse!
    # New bulk order mutation
    placeBulkOrders(input: BulkPlaceOrderInput!): BulkPlaceOrderResponse!
    cancelOrder(input: CancelOrderInput!): CancelOrderResponse!
    updateOrderBook(actid: String!): UpdateOrderResponse!
  }
`;