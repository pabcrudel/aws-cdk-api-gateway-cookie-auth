import { RequestFunction } from "./types"; 
import { ApiSuccessResponse } from "./utils";

export const handler: RequestFunction = async (event) => {
    const response = {
        msg: 'Hello protected lambda',
        event: event,
    };
    return new ApiSuccessResponse(response);
};