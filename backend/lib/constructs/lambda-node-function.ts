import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

interface LambdaNodeFunctionProps {
    readonly entryFileName: string;
    readonly environment?: { [key: string]: string }
};

/** Creates a `lambdaNode.NodejsFunction` */
export class LambdaNodeFunction extends lambdaNode.NodejsFunction {
    constructor(scope: Construct, functionName: string, props: LambdaNodeFunctionProps) {
        super(scope, functionName, {
            entry: `src/${props.entryFileName}.ts`,
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_18_X,
            environment: props.environment,
        });
    };
};