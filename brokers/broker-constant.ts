interface Url{
    firstock:{
        login:{callback:string,verify_token:string},
        placer:{place:string,modify:string,cancel:string},
        updater:{order:string,position:string,margin:string}
    }
    [key:string]:any
}

export const URLS :Url= {
    firstock: {
        login: { callback: "", verify_token: "https://signon.firstock.in/firstock/verifyToken" },
        placer: { place: "https://connect.thefirstock.com/api/V3/placeOrder", 
        modify: "https://connect.thefirstock.com/api/V3/modifyOrder", 
        cancel: "https://connect.thefirstock.com/api/V3/cancelOrder" },
        updater: {
            order: "https://connect.thefirstock.com/api/V3/orderBook",
            position: "https://connect.thefirstock.com/api/V3/positionBook",
            margin:"https://connect.thefirstock.com/api/V4/limit"
        },
    },
};

export const METHODS:{[key:string]:"GET" | "POST" | "PUT" | "DELETE" | "PATCH"}={
    firstock:"POST"
}

export const updatePayload:{[key:string]:any}={
    firstock:(data:{accessToken:string,actid:string,[key:string]:unknown})=>({
     userId:data.actid,
     jKey: data.accessToken,
    })

}

export const updateHeaders:{[key:string]:any}={
    firstock:(data:{accessToken:string,actid:string,[key:string]:unknown})=>({
        userId:data.actid,
        jKey: data.accessToken,
       })
}


