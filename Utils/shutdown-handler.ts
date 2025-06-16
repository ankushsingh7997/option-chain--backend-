import { getCurrentDateTime } from "./time";


class ShutdownHandler{
    cleanupFunction:Array<()=>Promise<void>|void>
    endCleanupFunctions:Array<()=>Promise<void>|void>

    constructor(){
        this.cleanupFunction=[]
        this.endCleanupFunctions=[]
        process.on("SIGINT", () => this.shutdown(`SIGINT`));
        process.on("SIGTERM", () => this.shutdown(`SIGTERM`));
        process.on("uncaughtExceptionMonitor",(reason,promise)=>{
            console.error(`${getCurrentDateTime()} | ERROR | Unhandled Rejection at: ${promise} reason: ${reason}`);
        })
        process.on("uncaughtException",(error)=>{
            console.error(`${getCurrentDateTime()} | ERROR | Uncaught Exception: ${error.message}`, error.stack);
        })
    }
    
    registerCleanupFunction(fn:()=>Promise<void>|void,end=false): void{
        end?this.endCleanupFunctions.push(fn):this.cleanupFunction.push(fn)
    }

    async shutdown(signal:string): Promise<any>{
    if(["unhandledRejection", "uncaughtException", "SIGTERM"].includes(signal)){
    //  Handle the action needed to be taken
    // Send telegram notification 
    }
    for(const fn of this.cleanupFunction) await fn()
    for (const fn of this.endCleanupFunctions) await fn()

    process.exit(signal === `unhandledRejection` || signal === `uncaughtException` ? 1 : 0);
}
}

export default new ShutdownHandler()