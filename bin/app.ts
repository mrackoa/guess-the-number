#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GuessTheNumberStack } from '../lib/guess-the-number-stack';

const app = new cdk.App();
new GuessTheNumberStack(app, 'GuessTheNumberStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
