import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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

    /** Custom domain to the Cognito User Pool. */
    const userPoolDomain = userPool.addDomain("UserPoolDomain", {
      cognitoDomain: {
        domainPrefix: "cookie-auth",
      },
    });

    /** This function will handle requests to a protected resource in the API Gateway. */
    const protectedResourceLambdaFunction = new lambda.Function(this, 'ProtectedCookieAuthFunction', {
      functionName: 'ProtectedCookieAuthFunction',
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      code: new lambda.InlineCode(`
        exports.handler = async () => {
          return {
            statusCode: 200,
            body: JSON.stringify("Hello from Protected Lambda!"),
          }; 
        };
      `),
    });

    /** Lambda function `oAuth2CallbackFunction` is responsible for issuing and persisting the OAuth2 access tokens */
    const oAuth2CallbackFunction = new LambdaNodeFunction(this, 'oAuth2CallbackFunction', {
      entryFileName: 'callback',
      environment: {
        TOKEN_ENDPOINT: `${userPoolDomain.baseUrl()}/oauth2/token`,
        CLIENT_ID: clientId,
      }
    });

    /** Lambda function `oAuth2AuthorizerFunction` checks that requests are authenticated */
    const oAuth2AuthorizerFunction = new LambdaNodeFunction(this, 'oAuth2AuthorizerFunction', {
      entryFileName: 'authorizer',
      environment: {
        USER_POOL_ID: userPoolId,
        CLIENT_ID: clientId,
      }
    });

    const authorizer = new apiGateway.RequestAuthorizer(this, 'LambdaAuthorizer', {
      handler: oAuth2AuthorizerFunction,
      identitySources: [apiGateway.IdentitySource.header('Authorization')]
    });

    restApi.root.addMethod('GET', new apiGateway.LambdaIntegration(protectedResourceLambdaFunction), {
      authorizationType: apiGateway.AuthorizationType.CUSTOM,
      authorizer: authorizer
    });

    restApi.root.addResource("oauth2").addMethod('GET', new apiGateway.LambdaIntegration(oAuth2CallbackFunction))
  };
};
