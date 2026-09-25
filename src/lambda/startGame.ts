import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { docClient, TABLE_NAME } from '../shared/dynamo';
import { respond } from '../shared/response';

const TTL_SECONDS = 24 * 60 * 60;

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const gameId = randomUUID();
  const secretNumber = Math.floor(Math.random() * 100) + 1;
  const ttl = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: { gameId, secretNumber, ttl },
  }));

  return respond(201, {
    gameId,
    message: 'Game started. Make a guess between 1 and 100.',
  });
};
