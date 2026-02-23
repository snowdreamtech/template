# Monitoring & Observability Guidelines

> Objective: Define standards for logging, metrics, and distributed tracing to ensure system health and debuggability.

## 1. The Three Pillars

- Implement all three pillars of observability: **Logs** (what happened), **Metrics** (how the system is performing), and **Traces** (where time was spent across services).
- Use an established observability stack: e.g., OpenTelemetry for instrumentation, Prometheus + Grafana for metrics, Loki for logs, and Jaeger/Tempo for traces.

## 2. Logging

- Use **structured logging** (output JSON, not plain text). Include fields: `timestamp`, `level`, `service`, `traceId`, `message`.
- Use log levels correctly: `DEBUG` (development detail), `INFO` (normal operations), `WARN` (unexpected but recoverable), `ERROR` (failures requiring attention).
- Never log sensitive data: passwords, tokens, PII, or full HTTP request/response bodies.
- Correlate logs with a `traceId` / `requestId` that is propagated through all services in a request chain.

## 3. Metrics

- Expose a `/metrics` endpoint (Prometheus format) from every service.
- Implement the **RED Method** for services: **R**ate (requests/sec), **E**rrors (error rate), **D**uration (latency percentiles: p50, p95, p99).
- Implement the **USE Method** for infrastructure: **U**tilization, **S**aturation, **E**rrors.
- Define SLOs (Service Level Objectives) and create alerts that fire before SLO burn-down budget is exhausted.

## 4. Distributed Tracing

- Instrument all inbound/outbound HTTP calls, database queries, and message queue operations with OpenTelemetry spans.
- Propagate trace context headers (`traceparent`, `tracestate`) across all service boundaries.

## 5. Alerting

- Alerts must be **actionable** — if an alert fires, a human must know exactly what to do. Document runbooks for every alert.
- Avoid alert fatigue: tune thresholds carefully. Prefer alerting on symptoms (high error rate) over causes (high CPU).
