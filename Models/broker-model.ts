import mongoose, { Document, Schema, Types,Model } from "mongoose";

export interface IBroker extends Document {
  broker: string;
  userId: string;
  actid: string;
  accessToken?: string | null;
  loginStatus: boolean;
  lastLoginAt: string | null;
  _id: Types.ObjectId;
}

 export interface IBrokerModel extends Model<IBroker>{}

const brokerSchema = new Schema<IBroker>(
  {
    broker: {
      type: String,
      trim: true,
      required: [true, "Broker name is required"],
      enum: {
        values: ["firstock"],
        message: "Invalid broker passed",
      },
    },
    userId: {
      type: String,
      trim: true,
      required: true,
    },
    actid: {
      type: String,
      required: [true, "Please provide a valid account Id"],
      trim: true,
      unique: [true,"This actid is already in use"],
      validate: {
        validator: (value: string) => value.toUpperCase() === value,
        message: "Please provide account Id in capital letters only",
      },
    },
    accessToken: {
      type: String,
      default: null,
      trim: true,
      select: false,
    },
    loginStatus: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret._id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret._id = ret._id.toString();
        return ret;
      },
    },
    timestamps: true, 
    id: false,
    versionKey: false,
  }
);

const Broker:IBrokerModel=mongoose.model<IBroker,IBrokerModel>("Broker",brokerSchema)

export default Broker;
