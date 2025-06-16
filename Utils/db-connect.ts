import { MongoClient,Db } from "mongodb";
import { LOG_DB_NAME,LOG_DB_URI } from "../Env/env";
import { getCurrentDateTime } from "./time";

class DBConnection{
    private dbUri:string;
    private dbName:string;
    private client:MongoClient;
    private db:Db|null;

    constructor(){
        this.dbUri=LOG_DB_URI;
        this.dbName=LOG_DB_NAME;
        this.client=new MongoClient(this.dbUri)
        this.db=null;

    }

    public async connect():Promise<Db>{
        if (this.db ) {
            return this.db;
        }
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log(`${getCurrentDateTime()} | INFO | LOG DATABASE Connected`);
            return this.db;
        } catch (err) {
        //    Add Telegram notification
            console.error(`${getCurrentDateTime()} | ERROR | Error in Connecting to MongoDB: `, err);
            throw err;
        }
    }

    public async close():Promise<any>{
        try{
            await this.client.close();
            console.log(`${getCurrentDateTime()} | INFO | LOG DATABASE Connection Closed`);
        }
        catch(err){
            // Add telegram notification
            console.error(`${getCurrentDateTime()} | ERROR | Error in Closing MongoDB Connection: `, err);
        }
    }
}

const dbInstance=new DBConnection();

export default dbInstance;