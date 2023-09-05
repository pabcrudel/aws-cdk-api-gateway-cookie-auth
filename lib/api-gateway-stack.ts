import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { LambdaNodeFunction } from './constructs/lambda-node-function';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Rest Api to communicate the frontend with the backend */
    const restApi = new apiGateway.RestApi(this, "CognitoAuthorizerRestApi", {
      deploy: true,
    });

    /** Cognito User Pool*/
    const userPool = new cognito.UserPool(this, 'CognitoAuthorizerUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /** A user pool client application that can interact with the user pool. */
    const userPoolClient = userPool.addClient('CognitoAuthorizerAppClient');
    const clientId = userPoolClient.userPoolClientId;

    /** This function will handle requests to a protected resource in the API Gateway. */
    const protectedLambdaFunction = new LambdaNodeFunction(this, 'ProtectedLambdaFunction', { entryFileName: 'protectedLambda' });

    /** This function will handle sign up request to the Cognito User Pool */
    const signUp = new LambdaNodeFunction(this, 'CognitoSignUpLambdaFunction', {
      entryFileName: 'auth',
      handler: 'signUp',
      environment: {
        USER_POOL_REGION: this.region,
        USER_POOL_CLIENT_ID: clientId,
      }
    });

    restApi.root.addMethod('GET', new apiGateway.LambdaIntegration(protectedLambdaFunction));

    const authApiResource = restApi.root.addResource('auth');
    authApiResource
      .addResource('sign-up')
      .addMethod('POST', new apiGateway.LambdaIntegration(signUp));
  };
};
