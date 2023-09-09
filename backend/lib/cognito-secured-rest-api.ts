import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { LambdaNodeFunction } from './utils/lambda-node-function';

export class CognitoSecuredRestApi extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Rest Api to communicate the frontend with the backend */
    const restApi = new apiGateway.RestApi(this, "CognitoAuthorizerRestApi", {
      deploy: true,
    });

    /** API usage plan that limits the requests per minute, with an initial burst of requests */
    const usagePlan = restApi.addUsagePlan('CognitoAuthorizerUsagePlan', {
      throttle: {
        burstLimit: 20,  // burst requests before apply rateLimit
        rateLimit: 100, // requests per minute
      },
    });
    // Adds the usage plan to the deployment stage of the Api
    usagePlan.addApiStage({ stage: restApi.deploymentStage });

    /** Cognito User Pool*/
    const userPool = new cognito.UserPool(this, 'CognitoAuthorizerUserPool', {
      selfSignUpEnabled: true,
      standardAttributes: { email: { required: true } },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /** A user pool client application that can interact with the user pool. */
    const userPoolClient = userPool.addClient('CognitoAuthorizerAppClient', {
      authFlows: { userPassword: true, },
      refreshTokenValidity: cdk.Duration.days(1),
    });
    const clientId = userPoolClient.userPoolClientId;

    /** Cognito User Pools authorizer for theses Api Resources */
    const authorizer = new apiGateway.CognitoUserPoolsAuthorizer(this, 'ProtectedLambdaFunctionAuthorizer', {
      cognitoUserPools: [userPool]
    });

    /** This function will handle requests to a protected resource in the API Gateway. */
    const protectedLambdaFunction = new LambdaNodeFunction(this, 'ProtectedLambdaFunction', { entryFileName: 'protectedLambda' });

    // Protected api resource with Cognito Authorizer at the root path
    restApi.root.addMethod('GET', new apiGateway.LambdaIntegration(protectedLambdaFunction), {
      authorizationType: apiGateway.AuthorizationType.COGNITO,
      authorizer: authorizer
    });

    /** API Resource to manage User Authentication */
    const authApiResource = restApi.root.addResource('auth');

    /** Common Lambda Function environment variables */
    const environment = { USER_POOL_REGION: this.region, USER_POOL_CLIENT_ID: clientId };

    // Actions that users made when are unauthenticated or new ones
    ['SignUp', 'ConfirmUser', 'ResendCode', 'SignIn', 'RefreshToken', 'SignOut'].forEach(action => {

      const lowerCaseAction = action.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); // = sign-up, confirm-user

      const lambdaFunction = new LambdaNodeFunction(this, `${action}LambdaFunction`, {
        entryFileName: `auth/${lowerCaseAction}`,
        environment: environment
      });

      authApiResource
        .addResource(lowerCaseAction)
        .addMethod('POST', new apiGateway.LambdaIntegration(lambdaFunction));
    });
  };
};
