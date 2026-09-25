import { handler } from '../src/lambda/guess';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

function makeEvent(body: unknown): APIGatewayProxyEvent {
  return { body: JSON.stringify(body) } as APIGatewayProxyEvent;
}

function mockGame(secretNumber: number) {
  ddbMock.on(GetCommand).resolves({
    Item: { secretNumber },
  });
}

function mockGameNotFound() {
  ddbMock.on(GetCommand).resolves({ Item: undefined });
}

describe('guess - input validation', () => {
  it('returns 400 for invalid JSON body', async () => {
    const result = await handler({ body: 'not-json' } as never);
    expect(result).toMatchObject({ statusCode: 400 });
    expect(JSON.parse((result as { body: string }).body).message).toBe('Invalid JSON body.');
  });

  it('returns 400 for missing gameId', async () => {
    const result = await handler(makeEvent({ guess: 50 }));
    expect(result).toMatchObject({ statusCode: 400 });
  });

  it('returns 400 for missing guess', async () => {
    const result = await handler(makeEvent({ gameId: 'abc' }));
    expect(result).toMatchObject({ statusCode: 400 });
  });

  it('returns 400 when guess is below 1', async () => {
    const result = await handler(makeEvent({ gameId: 'abc', guess: 0 }));
    expect(result).toMatchObject({ statusCode: 400 });
  });

  it('returns 400 when guess is above 100', async () => {
    const result = await handler(makeEvent({ gameId: 'abc', guess: 101 }));
    expect(result).toMatchObject({ statusCode: 400 });
  });

  it('returns 400 when guess is a float', async () => {
    const result = await handler(makeEvent({ gameId: 'abc', guess: 50.5 }));
    expect(result).toMatchObject({ statusCode: 400 });
  });

  it('returns 400 when guess is a string', async () => {
    const result = await handler(makeEvent({ gameId: 'abc', guess: '50' }));
    expect(result).toMatchObject({ statusCode: 400 });
  });
});

describe('guess - game not found', () => {
  it('returns 404 for unknown gameId', async () => {
    mockGameNotFound();
    const result = await handler(makeEvent({ gameId: 'unknown', guess: 50 }));
    expect(result).toMatchObject({ statusCode: 404 });
    expect(JSON.parse((result as { body: string }).body).message).toBe('Game not found.');
  });
});

describe('guess - game logic', () => {
  it('returns "Too low" when guess is below secret number', async () => {
    mockGame(70);
    const result = await handler(makeEvent({ gameId: 'abc', guess: 50 }));
    expect(result).toMatchObject({ statusCode: 200 });
    expect(JSON.parse((result as { body: string }).body).message).toBe('Too low. Try again!');
  });

  it('returns "Too high" when guess is above secret number', async () => {
    mockGame(30);
    const result = await handler(makeEvent({ gameId: 'abc', guess: 50 }));
    expect(result).toMatchObject({ statusCode: 200 });
    expect(JSON.parse((result as { body: string }).body).message).toBe('Too high. Try again!');
  });

  it('returns "Correct" when guess matches secret number', async () => {
    mockGame(50);
    const result = await handler(makeEvent({ gameId: 'abc', guess: 50 }));
    expect(result).toMatchObject({ statusCode: 200 });
    expect(JSON.parse((result as { body: string }).body).message).toBe("Correct! You've guessed the number.");
  });
});
