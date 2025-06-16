import axios from "axios";
import logger from "./logger";

interface RequestHandlerParams {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    payload?: any;
    headers?: Record<string, string>;
    contentType?: string;
    userId?: string;
    service?: string;
    actid?: string | null;
    log?: boolean;
}

interface RequestDetails {
    method: string;
    payload: any;
    headers: Record<string, string>;
    url: string;
    start_time: number;
    userId?: string;
    service?: string;
    actid?: string | null;
    time_taken?: number | null;
    response?: any;
    status?: boolean;
    error_code?: string;
    msg?: string;
}

interface RequestHandlerResponse {
    status: boolean;
    response: any;
    message: string;
}

const requestHandler = async ({
    method = "GET",
    url,
    payload = "",
    headers = {},
    contentType = "application/json",
    userId,
    service="optionChain",
    actid = null,
    log = true,
}: RequestHandlerParams): Promise<RequestHandlerResponse> => {
    const startTime = Date.now();
    const requestDetails: RequestDetails = {
        method,
        payload,
        headers: {
            "Content-Type": contentType,
            ...headers,
        },
        url,
        start_time: startTime,
        userId,
        service,
        actid,
    };

    try {
        let axios_config: any = {
            method,
            maxBodyLength: Infinity,
            url,
            data: payload,
            headers: requestDetails.headers,
            timeout: 7000,
        };
        if (method === "GET") delete axios_config.data;
        const response: any = await axios.request(axios_config);
        requestDetails.time_taken = Date.now() - startTime;
        requestDetails.response = response.data;
        requestDetails.status = true;
        if (log) logger.request(requestDetails);

        return {
            status: true,
            response: response.data,
            message: "Response Received Successfully",
        };
    } catch (error: any) {
        let statusCode = error.response?.status;
        if (statusCode < 400) {
            return {
                status: true,
                response: error.response?.data || {},
                message: "OK",
            };
        }
        const errorTypes: Record<string, string> = {
            ECONNABORTED: "Connection Timeout",
            ECONNREFUSED: "Connection Refused",
            RESPONSE: "Response Received Successfully",
            NO_RESPONSE: "No Response Received",
            UNKNOWN: "Something Went Very Wrong",
        };

        const errorType = error.response ? "RESPONSE" : error.code ? error.code : error.request ? "NO_RESPONSE" : "UNKNOWN";
        const message = errorTypes[errorType] || errorTypes.UNKNOWN;

        if (errorType !== "RESPONSE") {
            requestDetails.time_taken = null;
            requestDetails.response = errorTypes[errorType];
            const logMessage = JSON.stringify(requestDetails);
            logger.notify(`Error Occurred in Sending Request.\n${logMessage}`);
            if (errorType === "UNKNOWN") {
                logger.error({
                    message: error.message,
                    error_function: "requestHandler",
                    service,
                    userId,
                    actid,
                });
            }
        } else {
            requestDetails.response = error.response.data;
        }

        requestDetails.status = false;
        requestDetails.error_code = error.code ? error.code : "UNKNOWN/NORESPONSE";
        requestDetails.msg = message;
        logger.request(requestDetails);

        return {
            status: false,
            response: error.response?.data || {},
            message,
        };
    }
};

export default requestHandler;