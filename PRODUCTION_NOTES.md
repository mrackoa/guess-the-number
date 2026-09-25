# Production Notes

A short overview of possible improvements for production use.

## Security

- **Authentication / authorization** — API keys or JWT / Cognito.
- **Rate limiting** — API Gateway throttling (aggregate backend protection) + AWS WAF (per-IP).
- **Network isolation** — Lambdas in a VPC + a VPC endpoint for DynamoDB so traffic stays within the AWS network.

## Observability

- **Metrics** — CloudWatch: Lambda (errors, duration, throttles), API Gateway (4xx/5xx, latency), DynamoDB (throttled requests); dashboard in CloudWatch or Grafana.
- **Logging** — structured JSON logs.
- **Tracing** — AWS X-Ray across API Gateway → Lambda → DynamoDB.

## Availability

- **Lambda** — reserved / provisioned concurrency.
- **DynamoDB** — Point-in-time recovery, on-demand capacity, Global Tables for multi-region.
- **Resilience** — Lambda versions/aliases with canary deployment and fast rollback.

## CI/CD

- **GitHub Actions pipeline** — on every push/PR: `npm ci` → `tsc --noEmit` → `npm test`; deploy (`cdk deploy`) only from the main branch.
- **`cdk diff` in PRs** — shows infrastructure changes before approval.
- **OIDC instead of keys** — GitHub Actions authenticates to AWS via an IAM role (OIDC).
