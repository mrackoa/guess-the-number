import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { docClient, TABLE_NAME } from '../shared/dynamo';
import { respond } from '../shared/response';

const GuessRequest = z.object({
  gameId: z.string().min(1),
  guess: z.number().int().min(1).max(100),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? '');
  } catch {
    return respond(400, { message: 'Invalid JSON body.' });
  }

  const parsed = GuessRequest.safeParse(body);
  if (!parsed.success) {
    return respond(400, { message: parsed.error.issues[0].message });
  }

  const { gameId, guess } = parsed.data;

  const { Item } = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { gameId },
  }));

  if (!Item) {
    return respond(404, { message: 'Game not found.' });
  }

  const secretNumber = Number(Item.secretNumber);
  if (!Number.isInteger(secretNumber)) {
    return respond(500, { message: 'Corrupted game state.' });
  }

  if (guess < secretNumber) return respond(200, { message: 'Too low. Try again!' });
  if (guess > secretNumber) return respond(200, { message: 'Too high. Try again!' });
  return respond(200, { message: "Correct! You've guessed the number." });
};
