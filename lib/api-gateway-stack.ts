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
      standardAttributes: { email: { required: true } },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /** A user pool client application that can interact with the user pool. */
    const userPoolClient = userPool.addClient('CognitoAuthorizerAppClient', {
      authFlows: { userPassword: true },
    });
    const clientId = userPoolClient.userPoolClientId;

    /** This function will handle requests to a protected resource in the API Gateway. */
    const protectedLambdaFunction = new LambdaNodeFunction(this, 'ProtectedLambdaFunction', { entryFileName: 'protectedLambda' });

    restApi.root.addMethod('GET', new apiGateway.LambdaIntegration(protectedLambdaFunction));

    const authApiResource = restApi.root.addResource('auth');

    /** Common Lambda Function environment variables */
    const environment = {
      USER_POOL_REGION: this.region,
      USER_POOL_CLIENT_ID: clientId,
    };

    ['SignUp', 'ConfirmSignUp', 'SignIn'].forEach(method => {
      /** This function will handle `sign up`, `confirm sign up` and `sign in` request to the Cognito User Pool */
      const lambdaFunction = new LambdaNodeFunction(this, `Cognito${method}LambdaFunction`, {
        entryFileName: 'auth',
        handler: method.replace(/-([a-z])/g, (_, match) => match), // = signUp, confirmSignUp, signIn
        environment: environment
      });

      authApiResource
        .addResource(method.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()) // = sign-up, confirm-sign-up, sign-in
        .addMethod('POST', new apiGateway.LambdaIntegration(lambdaFunction));
    });
  };
};
