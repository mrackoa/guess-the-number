import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class GuessTheNumberStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'GamesTable', {
      tableName: 'guess-the-number-games',
      partitionKey: { name: 'gameId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const startGameFn = new NodejsFunction(this, 'StartGameFunction', {
      entry: path.join(__dirname, '../src/lambda/startGame.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const guessFn = new NodejsFunction(this, 'GuessFunction', {
      entry: path.join(__dirname, '../src/lambda/guess.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantWriteData(startGameFn);
    table.grantReadData(guessFn);

    const api = new apigateway.RestApi(this, 'GuessTheNumberApi', {
      restApiName: 'guess-the-number-api',
      deployOptions: { stageName: 'v1' },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['POST'],
      },
    });

    const startGame = api.root.addResource('start-game');
    startGame.addMethod('POST', new apigateway.LambdaIntegration(startGameFn));

    const guess = api.root.addResource('guess');
    guess.addMethod('POST', new apigateway.LambdaIntegration(guessFn));

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });
  }
}
