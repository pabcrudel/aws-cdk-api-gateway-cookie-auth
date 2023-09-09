#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoSecuredRestApi } from '../lib/cognito-secured-rest-api';
import { WebsiteDeployment } from '../lib/website-deployment';

let projectName = 'CognitoSecured-';

const tag = process.env.BRANCH_NAME;

if (tag !== undefined) projectName = `${tag}-${projectName}`;

const app = new cdk.App();
new CognitoSecuredRestApi(app, `${projectName}RestApi`);
new WebsiteDeployment(app, `${projectName}WebsiteDeployment`);
