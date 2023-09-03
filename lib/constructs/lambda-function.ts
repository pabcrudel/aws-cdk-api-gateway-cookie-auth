import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/** Creates a `lambdaNode.NodejsFunction` */
export class LambdaNodeFunction extends lambdaNode.NodejsFunction {
    constructor(scope: Construct, functionName: string, entryFileName: string, handlerName: string, environment: { [key: string]: string }) {
        super(scope, functionName, {
            entry: `oauth2/${entryFileName}.ts`,
            handler: handlerName,
            runtime: lambda.Runtime.NODEJS_18_X,
            environment: environment,
        });
    };
};