import User from "../../Models/user-model";
import { signAndSendToken } from "../../Middleware/jwt";
import { setProfile } from "../../cache-controller/user-cache";
import {Context} from '../context'
import { throwGraphQLError } from "../../Utils/graphql-error";
import { catchAsyncGraphQL } from "../../Utils/catch-async-graphQl";

const requiredFields:string[]=["name", "email", "number", "password", "confirm_password"];

export const userResolvers={
    Query:{
        healthCheck:()=>({status:true,message:"Health is Ok"}),
    
        getUser:catchAsyncGraphQL(async(_: any, __: any, context: Context)=>{
        if(!context.userId) throwGraphQLError("Please login to access this Resource","UNAUTHENTICATED")
        return{status: true,message: "User found!",data: context.user}
        
    
    })},
    Mutation:{
        register:catchAsyncGraphQL(async(_:any,{input}:{input:any},context:Context)=>{
           
                const missingFields=requiredFields.filter((field:string)=>!input[field])
                if(missingFields.length > 0) throwGraphQLError(`Missing required fields: ${missingFields.join(", ")}`, "BAD_USER_INPUT");

                if(input.password !== input.confirm_password) throwGraphQLError("Passwords do not match", "BAD_USER_INPUT");

                const {name,email,number,password}=input;
                // check if used already exists
                const existingUser = await User.findOne({$or:[{email},{number}]})
                if (existingUser) throwGraphQLError("User with this email or number already exists", "BAD_USER_INPUT");

                const user=await User.create({name,email,number,password})
                const token =  signAndSendToken(user._id.toString(),context.res)
                return {status:true,message:"Registered Sucessfully!",user:user.toJSON(),token:context.environment!=="PRODUCTION"?token:undefined}
           
        }),
        login:catchAsyncGraphQL( async (_: any, {input} : {input:any}, context: Context)=>{
           
                const {emailOrNumber,password} = input;
                if( !emailOrNumber || !password ) throwGraphQLError("Email/Number and password are required","BAD_USER_INPUT")

                const user = await User.findOne({$or:[{email:emailOrNumber?.trim()},{number:emailOrNumber?.trim()}]}).select('+password')

                if(!user) throwGraphQLError("User not found!!!","UNAUTHENTICATED")
                if(!await user.checkPassword(password)) throwGraphQLError("Incorrect Password","UNAUTHENTICATED")
                
                const token = signAndSendToken(user._id.toString(), context.res);
                return {
                    status:true,
                    message:"User Logged in successfully",
                    user:user.toJSON(),
                    token:context.environment!=='PRODUCTION'?token:undefined
                }
            
        }),
        logout: catchAsyncGraphQL(async (_: any, __: any, context: Context) => {
            context.res.clearCookie("jwt", {
                httpOnly: true,
                secure: context.environment !== "LOCAL",
                sameSite: "lax",
            });
        
            return {
                status: true,
                message: "Logged out successfully",
            };
        }),
        
        updateUser:catchAsyncGraphQL(async(_: any,{input}:{input:any},context:Context)=>{
            if(!context.userId) throwGraphQLError("Please login to access this Resource","UNAUTHENTICATED")
            
                const disallowedFields=["subscription", "password", "_id"];
                const containsDisallowed = disallowedFields.some((field)=>Object.prototype.hasOwnProperty.call(input,field))
                if(containsDisallowed) throwGraphQLError("Cannot perform operation on restricted fields","FORBIDDEN")
                const updatedUser = await User.findByIdAndUpdate(context.userId,input,{new: true, runValidators: true,}).lean();
              
                if (!updatedUser) throwGraphQLError("User not found or update failed", "NOT_FOUND");
                await setProfile(context.userId, updatedUser);

                return {
                    status: true,
                    message: "User data updated successfully",
                    data: updatedUser
                }    
        })
    }
}
