interface status{
    [key:string]:number
}

const statusCode:status={
    UNAUTHENTICATED:401,
    FORBIDDEN:403,
    NOT_FOUND:404,
    BAD_USER_INPUT:400,
    GRAPHQL_VALIDATION_FAILED:400,
    INTERNAL_SERVER_ERROR:500
}
export const getStatusCode=(status:string)=>{
    return statusCode[status ]||400
}