import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { ENVIRONMENT, JWT_SECRET, JWT_EXPIRY_DAYS } from "../Env/env";
import { Response } from "express";
import logger from "../Utils/logger";

interface CookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure: boolean;
}

interface CustomJwtPayload extends DefaultJwtPayload {
  id: string;
}

interface VerificationResult<T> {
  status: boolean;
  message: string;
  code?: number;
  data?: T;
  id?: string;
}

function signJwt(mongodbUserId: string): string {
  return jwt.sign({ id: mongodbUserId }, JWT_SECRET, {
    expiresIn: Number(JWT_EXPIRY_DAYS) * 24 * 60 * 60,
  });
}


// For GraphQL

export function signAndSendToken(
  userId: string,
  res: Response
): string {
  try {
    let cookie_options: CookieOptions = {
      expires: new Date(Date.now() + Number(JWT_EXPIRY_DAYS) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: ENVIRONMENT !== "LOCAL",
    };
    let token = signJwt(userId);
    res.cookie("jwt", token, cookie_options);
    return token;
  } catch (error) {
    logger.notify("Error signing token while logging in!!");

    if (error instanceof Error) {
      logger.error({ message: error.message, stack: error.stack });
    } else {
      logger.error(String(error));
    }

    throw new Error("Token generation failed");
  }
}








export async function getAndVerifyUser<T extends { _id: string }>(
  Model: { findById: (id: string) => Promise<T | null> },token: string | undefined): Promise<VerificationResult<T>> {
  try {
    if (!token)return {status: false,message: "Please login to get access!!",code: 401,};
    const user_data = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

    const user = await Model.findById(user_data.id);
    if (!user) {return { status: false, message: "User does not exist!!", code: 404 };}
    return {status: true,data: user,message: "User Found!",id: user_data.id,};
  } catch (err: any) {
    const err_name = err?.name;

    if (err_name !== "JsonWebTokenError" && err_name !== "TokenExpiredError") {
      logger.error(err);
      return {status: false,message: "Something went wrong!",code: 500,};
    }

    return {status: false,message: "Please login again to access!!",code: 401,};
  }
}
