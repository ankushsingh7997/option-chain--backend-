import { IBroker } from "../Models/broker-model";

// ===== TYPES AND INTERFACES =====

interface BrokerData {
  actid?: string;
  broker?: string;
  api_key?: string;
  secret?: string;
  [key: string]: unknown; 
}

interface OrderInput {
  exchange?: string;
  symbol: string;
  quantity: number | string;
  price?: string;
  triggerPrice?: string;
  productType?: string;
  transactionType: number;
  priceType?: string;
  retention?: string;
  remarks?: string;
  orderNumber?: string;
  [key:string]:unknown;
}

interface CancelOrderObject {
  userId: string;
  orderNumber: string;
  jKey: string;
}

interface PlaceOrderObject {
  userId: string;
  exchange: string;
  tradingSymbol: string;
  quantity: string;
  price: string;
  triggerPrice: string;
  product: string;
  transactionType: "B" | "S";
  priceType: string;
  retention: string;
  remarks?: string;
  jKey: string;
  orderNumber?: string;
  [key:string]:unknown;
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  response?: {
    data: T[] | T;
  };
  [key:string]:unknown;
}

interface FirstockPosition {
  RealizedPNL?: number | string;
  dayBuyAmount?: number | string;
  dayBuyAveragePrice?: number | string;
  dayBuyQuantity?: number;
  daySellAmount?: number | string;
  daySellAveragePrice?: number | string;
  daySellQuantity?: number;
  exchange?: string;
  lotSize?: number;
  mult?: number;
  netAveragePrice?: number | string;
  netQuantity?: number | string;
  netUploadPrice?: string;
  priceFactor?: string;
  pricePrecision?: string;
  product?: string;
  tickSize?: string;
  token?: string;
  tradingSymbol?: string;
  unrealizedMTOM?: number | string;
  uploadPrice?: string;
  userId?: string;
  [key:string]:unknown;
}

interface FirstockOrder {
  orderNumber?: string;
  exchange?: string;
  tradingSymbol?: string;
  quantity?: number;
  transactionType?: string;
  priceType?: string;
  retention?: string;
  token?: string;
  product?: string;
  price?: number;
  averagePrice?: string;
  triggerPrice?: string;
  status?: string;
  remarks?: string;
  rejectReason?: string;
  orderTime?: string;
  [key:string]:unknown;
}

interface FirstockMargin {
  cash?: number;
  payin?: number;
  collateral?: number;
  marginused?: number;
  [key:string]:unknown;
}

// Standardized response interface
interface StandardResponse<T = unknown> {
  status: boolean;
  data?: T;
  message?: string;
}

// ===== CONSTANTS =====

const DEFAULT_ORDER_VALUES = {
  EXCHANGE: "NFO",
  PRICE: "0",
  TRIGGER_PRICE: "0",
  PRODUCT_TYPE: "I",
  PRICE_TYPE: "MKT",
  RETENTION: "DAY",
  REMARKS: "opt_chain"
} as const;

const TRANSACTION_TYPES = {
  BUY: 1,
  SELL: 0
} as const;

// ===== VALIDATION FUNCTIONS =====

const checkRequiredFields = (data: BrokerData, ...fields: string[]): string | null => {
  for (const field of fields) {
    if (!data[field]) {
      return `${field} is required!`;
    }
  }
  return null;
};

const brokerValidators: Record<string, (data: BrokerData) => string | null> = {
  firstock: (data) => checkRequiredFields(data, "actid", "broker"),
  zerodha: (data) => checkRequiredFields(data, "actid", "api_key", "secret"),
};

export const validateBroker = (data: BrokerData): string | null => {
  if (!data.broker || !brokerValidators[data.broker]) {
    return "Unsupported or missing broker type!";
  }
  return brokerValidators[data.broker](data);
};

// ===== ORDER UTILITY FUNCTIONS =====

export const createPlaceOrderObject = (order: OrderInput, broker: IBroker): PlaceOrderObject => {
  return {
    userId: broker.actid,
    exchange: order.exchange || DEFAULT_ORDER_VALUES.EXCHANGE,
    tradingSymbol: order.symbol,
    quantity: String(order.quantity),
    price: order.price || DEFAULT_ORDER_VALUES.PRICE,
    triggerPrice: order.triggerPrice || DEFAULT_ORDER_VALUES.TRIGGER_PRICE,
    product: order.productType || DEFAULT_ORDER_VALUES.PRODUCT_TYPE,
    transactionType: order.transactionType === TRANSACTION_TYPES.BUY ? "B" : "S",
    priceType: order.priceType || DEFAULT_ORDER_VALUES.PRICE_TYPE,
    retention: order.retention || DEFAULT_ORDER_VALUES.RETENTION,
    remarks: DEFAULT_ORDER_VALUES.REMARKS,
    jKey: broker.accessToken as string,
    orderNumber: order.orderNumber,
  };
};

export const createCancelOrderObject = (
  order: { orderNumber: string }, 
  broker: IBroker
): CancelOrderObject => {
  return {
    userId: broker.actid,
    orderNumber: order.orderNumber,
    jKey: broker.accessToken as string,
  };
};

// ===== GENERIC MAPPING HELPER =====

const createStandardResponse = <T>(
  apiResponse: ApiResponse<T>,
  mapFunction?: (data: T[]) => unknown[]
): StandardResponse => {
  if (!apiResponse?.status) {
    return { 
      status: false, 
      message: apiResponse?.message ?? "Unknown error" 
    };
  }

  const rawData = apiResponse?.response?.data;
  const dataArray = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
  
  return {
    status: true,
    data: mapFunction ? mapFunction(dataArray) : dataArray
  };
};

// ===== FIRSTOCK MAPPING FUNCTIONS =====

export const mapFirstockPositions = (response: ApiResponse<FirstockPosition>): StandardResponse => {
  return createStandardResponse(response, (positions: FirstockPosition[]) =>
    positions.map((item) => ({
      realizedPnl: Number(item?.RealizedPNL ?? 0),
      dayBuyAmount: Number(item?.dayBuyAmount ?? 0),
      dayBuyAveragePrice: Number(item?.dayBuyAveragePrice ?? 0),
      dayBuyQuantity: item?.dayBuyQuantity ?? 0,
      daySellAmount: Number(item?.daySellAmount ?? 0),
      daySellAveragePrice: Number(item?.daySellAveragePrice ?? 0),
      daySellQuantity: item?.daySellQuantity ?? 0,
      exchange: item?.exchange ?? "",
      lotSize: item?.lotSize ?? 0,
      mult: item?.mult ?? 0,
      netAveragePrice: Number(item?.netAveragePrice ?? 0),
      netQuantity: Number(item?.netQuantity ?? 0),
      netUploadQuantity: item?.netUploadPrice ?? "",
      priceFactor: item?.priceFactor ?? "",
      pricePrecision: item?.pricePrecision ?? "",
      product: item?.product ?? "",
      tickSize: item?.tickSize ?? "",
      token: item?.token ?? "",
      symbol: item?.tradingSymbol ?? "",
      unrealizedMtom: Number(item?.unrealizedMTOM ?? 0),
      uploadPrice: item?.uploadPrice ?? "",
      userId: item?.userId ?? "",
    }))
  );
};

export const mapFirstockOrders = (response: ApiResponse<FirstockOrder>): StandardResponse => {
  return createStandardResponse(response, (orders: FirstockOrder[]) =>
    orders.map((order) => ({
      orderNumber: order.orderNumber ?? "",
      exchange: order.exchange ?? "",
      symbol: order.tradingSymbol ?? "",
      quantity: order.quantity ?? 0,
      transactionType: order.transactionType ?? "",
      priceType: order.priceType ?? "",
      retention: order.retention ?? "",
      token: order.token ?? "",
      product: order.product ?? "",
      price: order.price ?? 0,
      averagePrice: order.averagePrice ?? "",
      triggerPrice: order.triggerPrice ?? "",
      status: order.status ?? "",
      remarks: order.remarks ?? "",
      message: order.status === "REJECTED" ? (order.rejectReason ?? "") : "",
      orderTime: order.orderTime ?? "",
    }))
  );
};

export const mapFirstockMargin = (response: ApiResponse<FirstockMargin>): StandardResponse => {
  if (!response.status) {
    return { status: false, message: response.message };
  }

  const data = (response.response?.data || {}) as FirstockMargin;
  
  const cash = Number(data.cash ?? 0);
  const payin = Number(data.payin ?? 0);
  const collateral = Number(data.collateral ?? 0);
  const used = Number(data.marginused ?? 0);

  return {
    status: true,
    data: {
      available_margin: (cash + payin + collateral - used).toFixed(2),
      available_cash: cash.toFixed(2),
      used_cash: used.toFixed(2),
    }
  };
};

type MappingFn = (response: any) => any;
export const book_updater: Record<string, MappingFn> = {
    firstock_position_mapping: mapFirstockPositions,
    firstock_order_mapping: mapFirstockOrders,
    firstock_margin_mapping: mapFirstockMargin,
  };

export const broker_validation = validateBroker;
export const makePlaceOrderObj = createPlaceOrderObject;
export const makeCancelOrderObj = createCancelOrderObject;



