import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export interface RequestFunction {
    (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult | any>
}