import { RequestFunction } from "./types"; 
import { ApiSuccessResponse } from "./utils";

export const handler: RequestFunction = async (event) => {
    return new ApiSuccessResponse('Hello protected lambda');
};