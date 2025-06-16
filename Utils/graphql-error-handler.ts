// Utils/graphqlErrorHandler.ts
import { GraphQLError } from "graphql";

const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const handleCastErrorDB = (err: any): GraphQLError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new GraphQLError(message, {
        extensions: {
            code: 'BAD_USER_INPUT',
            originalError: err
        }
    });
}

const handleDuplicateFieldsDB = (err: any): GraphQLError => {
    const value = err?.errmsg?.match(/dup key: { ([^{}]+) }/);
    let message: string = "";
    
    if (value) {
        const keyValueString = value[1];
        const formattedString = `{${keyValueString.replace(/(\w+):/g, '"$1":')}}`;
        const keyValueObject = JSON.parse(formattedString);
        
        for (const key in keyValueObject) {
            if (key === "something") continue;
            const formattedKey = capitalize(key.split("_").join(" "));
            message += `${formattedKey} (${keyValueObject[key]}) already used. Please use another ${formattedKey}. `;
        }
    } else {
        message = err.message;
    }

    return new GraphQLError(message.trim(), {
        extensions: {
            code: 'BAD_USER_INPUT',
            originalError: err
        }
    });
}

const handleValidationErrorDB = (err: any): GraphQLError => {
    const errors = Object.values(err.errors).map(
        (ele: any) => `${ele.message.replace(/"/g, "")}\n`
    );
    let message = `${errors.join(". ")}`;
    message = message.slice(0, -1);
    
    return new GraphQLError(message, {
        extensions: {
            code: 'BAD_USER_INPUT',
            originalError: err
        }
    });
};

export const handleMongooseError = (error: any): GraphQLError => {
    // Handle Mongoose CastError
    if (error.name === "CastError") {
        return handleCastErrorDB(error);
    }

    // Handle Mongoose duplicate key error
    if (error.code === 11000 || error?.cause?.code === 11000) {
        return handleDuplicateFieldsDB(error);
    }

    // Handle Mongoose ValidationError
    if (error.name === "ValidationError") {
        return handleValidationErrorDB(error);
    }

    // Handle already existing GraphQLError
    if (error instanceof GraphQLError) {
        return error;
    }

    // Default error handling
    return new GraphQLError(error.message || "An unexpected error occurred", {
        extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error
        }
    });
};