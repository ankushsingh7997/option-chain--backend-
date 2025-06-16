import mongoose, { Document, Schema, Model,Types } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string;
    email: string;
    number: string;
    change_number?: string;
    password: string;
    _id:Types.ObjectId;
    
    checkPassword(password: string): Promise<boolean>;
}


export interface IUserModel extends Model<IUser> {

}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Please provide a valid name"],
            trim: true,
            maxlength: [50, "Please provide a valid name within 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Please provide a valid email"],
            unique: [true, "Email already used!"] as any,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (value: string): boolean {
                    return validator.isEmail(value) && value.length <= 50;
                },
                message: "Please provide a valid email",
            },
        },
        number: {
            type: String,
            required: [true, "Please provide 10 digit mobile number"],
            trim: true,
            validate: {
                validator: function (value: string): boolean {
                    return value.length === 10 && validator.isNumeric(value);
                },
                message: "Please enter valid mobile number",
            },
            unique: [true, "Mobile number already used!"] as any,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform: (doc: any, ret: any) => {
                ret._id = ret._id.toString();
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc: any, ret: any) => {
                ret._id = ret._id.toString();
                return ret;
            },
        },
        id: false,
        timestamps: true,
        versionKey: false,
    }
);


userSchema.pre('save', async function(this: IUser, next) {
    // Only hash the password if it has been modified
    if (!this.isModified('password')) return next();
    
    // Hash the password with bcrypt
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.checkPassword = async function (this: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};


const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;