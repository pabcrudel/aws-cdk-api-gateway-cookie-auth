import { RequestFunction } from "./types";
import { ApiSuccessResponse } from "./utils/api";

export const handler: RequestFunction = async (event) => {
    let username = event.requestContext.authorizer?.claims['cognito:username'] + " ";

    if (typeof username !== 'string') username = '';

    return new ApiSuccessResponse({ message: `Hello ${username}from the protected lambda` });
};