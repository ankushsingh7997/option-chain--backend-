import fs from "fs"
import winston , {format,transports,Logger as WinstonLogger} from "winston"
import { LOG_LEVELS,LEVEL, CustomLogger } from "../constants/logger-constants"
import {
    SERVICE_NAME,
    ENVIRONMENT,
    CLUSTER_ID,
    INTERNAL_IP,
} from "../Env/env";

import { getCurrentDateTime } from "./time";
import DBTransport from "./mongo-transport";

if(!fs.existsSync("./Logs")){
    fs.mkdirSync("./Logs")
}

const custom_format=winston.format.printf(({level,message}:{level:string,message:any})=>{
    return `${getCurrentDateTime()} | ${level.toUpperCase()} | ${typeof message==="string"?message:JSON.stringify(message)}`
})

const console_filter=winston.format((info:winston.Logform.TransformableInfo)=>{
    if(info.level==="info") return info
     return false
})

const db_transport=new DBTransport()

const logger=winston.createLogger({
    levels:LOG_LEVELS,
    level:LEVEL,
    format:winston.format.combine(custom_format),
    transports: ENVIRONMENT !== "LOCAL"?[new winston.transports.Console({
        format:winston.format.combine(console_filter(),custom_format)
    }),
    db_transport,
]:[new winston.transports.Console()]
}) as CustomLogger


export default logger
