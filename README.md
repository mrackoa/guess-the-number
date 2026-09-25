# guess-the-number

Serverless "Guess the Number" REST API — AWS Lambda + DynamoDB + API Gateway, deployed with AWS CDK (TypeScript).

## Prerequisites

- Node.js 18+
- An AWS account
- AWS credentials configured via `aws configure` — enter your **Access Key ID**, **Secret Access Key**, and **default region** (e.g. `eu-central-1`)
- AWS CDK bootstrapped once per account/region: `npx cdk bootstrap`

## Setup

```bash
npm install
```

## Test

```bash
npm test
```

## Deploy

```bash
npx cdk deploy
```

After deploy, the API URL is printed as the `ApiUrl` output.

## Usage

Start a game:

```bash
curl -X POST <ApiUrl>/start-game
# -> {"gameId":"...","message":"Game started. Make a guess between 1 and 100."}
```

Make a guess (use the gameId from the response above):

```bash
curl -X POST <ApiUrl>/guess \
  -H 'Content-Type: application/json' \
  -d '{"gameId":"...","guess":50}'
# -> {"message":"Too low. Try again!"}
```

## Teardown

```bash
npx cdk destroy
```

## Production

See [PRODUCTION_NOTES.md](PRODUCTION_NOTES.md) for ideas on running this in production (security, observability, availability, CI/CD).
