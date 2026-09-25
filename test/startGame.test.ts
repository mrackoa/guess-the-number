import { handler } from '../src/lambda/startGame';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
  ddbMock.on(PutCommand).resolves({});
});

describe('startGame', () => {
  it('returns 201 with gameId and message', async () => {
    const result = await handler({} as never);

    expect(result).toMatchObject({ statusCode: 201 });

    const body = JSON.parse((result as { body: string }).body);
    expect(body.gameId).toBeDefined();
    expect(body.message).toBe('Game started. Make a guess between 1 and 100.');
  });

  it('stores gameId and secretNumber in DynamoDB', async () => {
    await handler({} as never);

    expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
      TableName: 'test-table',
      Item: expect.objectContaining({
        gameId: expect.any(String),
        secretNumber: expect.any(Number),
      }),
    });
  });

  it('generates a random number between 1 and 100', async () => {
    for (let i = 0; i < 50; i++) {
      await handler({} as never);
    }

    const calls = ddbMock.commandCalls(PutCommand);
    for (const call of calls) {
      const n = call.args[0].input.Item!['secretNumber'];
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(100);
    }
  });
});
