import { APIGatewayProxyResult } from "aws-lambda";

class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    };
};
export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    };
};
export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404);
    };
};
export class ServerError extends ApiError {
    constructor(message: string) {
        super(message, 500);
    };
};

class ApiResponse implements APIGatewayProxyResult {
    readonly statusCode: number;
    readonly headers: {[key: string]: string};
    readonly body: string;

    constructor(statusCode: number, rawBody: any, additionalHeaders?: {[key: string]: string}) {
        this.statusCode = statusCode;
        this.body = JSON.stringify(rawBody);
        this.headers = {
            "content-type": "application/json",
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            ...additionalHeaders,
        };
    };
};
export class ApiSuccessResponse extends ApiResponse {
    constructor(rawBody: any) {
        super(200, rawBody);
    };
};
export class ApiErrorResponse extends ApiResponse {
    constructor(error: any) {
        super(
            error instanceof ApiError || error.statusCode !== undefined ? error.statusCode : 500,
            { error: error instanceof Error ? error.message : "Unknown error occurred" },
        );
    };
};

export const validateEmail = (email: string) => {
    const validEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    return validEmail.test(email);
};