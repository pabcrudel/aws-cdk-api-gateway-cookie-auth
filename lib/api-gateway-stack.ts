import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { LambdaNodeFunction } from './constructs/lambda-node-function';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Rest Api to communicate frontend with the backend */
    const restApi = new apiGateway.RestApi(this, "CookieAuthRestApi", {
      deploy: true,
    });

    /** Cognito User Pool*/
    const userPool = new cognito.UserPool(this, 'CookieAuthUserPool', {
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 10,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const userPoolId = userPool.userPoolId;
    
    /** A user pool client application that can interact with the user pool. */
    const userPoolClient = userPool.addClient('CookieAuthAppClient');
    const clientId = userPoolClient.userPoolClientId;
    
    /** Domain to the Cognito User Pool Auth and Registration manager */
    const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', { userPool: userPool });
    new cdk.CfnOutput(this, 'UserPoolURL', {
      value: userPoolDomain.baseUrl(),
      description: 'The URL to manage Auth and Registration to Cognito'
    })

    /** This function will handle requests to a protected resource in the API Gateway. */
    const protectedResourceLambdaFunction = new LambdaNodeFunction(this, 'ProtectedCookieAuthFunction', { entryFileName: 'protectedResource' });

    restApi.root.addMethod('GET', new apiGateway.LambdaIntegration(protectedResourceLambdaFunction));
  };
};
