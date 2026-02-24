# Monitoring & Observability Guidelines

> Objective: Define standards for logging, metrics, and distributed tracing to ensure system health and fast debuggability.

## 1. The Three Pillars of Observability

- Implement all three pillars: **Logs** (what happened), **Metrics** (how the system performs over time), and **Traces** (where time was spent across services).
- Use **OpenTelemetry** (OTel) as the single vendor-neutral instrumentation standard. Export to your chosen backends (Prometheus, Jaeger, Loki, Datadog, Honeycomb).
- Instrument every service automatically (OTel auto-instrumentation) and supplement with manual spans for critical business operations.
- Establish a correlation ID strategy: generate a `traceId`/`requestId` at the entry point (API gateway or first service) and propagate through all downstream services and log fields.

## 2. Logging

- Use **structured logging** (JSON output). Every log entry must include: `timestamp` (ISO 8601), `level`, `service`, `traceId`, `spanId`, `message`, and relevant context fields.
- Use log levels correctly:
  - `DEBUG`: Verbose development detail. Disabled in production by default.
  - `INFO`: Normal operations, key lifecycle events (service started, job completed).
  - `WARN`: Unexpected but handled conditions (retry triggered, degraded mode).
  - `ERROR`: Failures requiring attention. Include the error type, message, and stack trace.
- **Never log sensitive data**: passwords, API keys, tokens, PII, or raw HTTP request/response bodies.
- Log at the boundary: log requests entering and leaving the service. Do not log every internal function call.

## 3. Metrics

- Expose a `/metrics` endpoint (Prometheus text format) from every service. Use a Prometheus client library for your language.
- Implement the **RED Method** for user-facing services: **R**ate (requests/sec), **E**rror rate (% of failed requests), **D**uration (latency percentiles: p50, p95, p99).
- Implement the **USE Method** for infrastructure resources: **U**tilization, **S**aturation, **E**rrors.
- Define **Service Level Indicators (SLIs)** and **Service Level Objectives (SLOs)** for each service. Create Prometheus Alerting Rules that fire before the SLO error budget is 5% exhausted.
- Add business-level metrics (orders processed, payments failed, user signups) alongside technical metrics.

## 4. Distributed Tracing

- Instrument all inbound/outbound HTTP calls, gRPC calls, database queries, cache operations, and message queue operations with OpenTelemetry spans.
- Propagate **W3C Trace Context** headers (`traceparent`, `tracestate`) across all service and async boundaries. Do not propagate via custom headers.
- Add meaningful span attributes: `http.method`, `db.statement` (sanitized), `messaging.system`, `error.message`.
- Set an appropriate **sampling rate** (e.g., 10% for high-volume, head-based sampling; 100% for errors and specific operations).

## 5. Alerting & Dashboards

- Alerts MUST be **actionable**: when an alert fires, an on-call engineer must know exactly what service is impacted and what the immediate mitigation action is.
- Document a **runbook URL** in every alert's annotations: `annotations: runbook: https://wiki.example.com/alerts/high-error-rate`.
- Avoid alert fatigue: alert on **symptoms** (user-visible error rate, latency) not causes (high CPU usage, low disk). Causes are useful in dashboards, not pagers.
- Maintain a **centralized Grafana dashboard** for each service with: request rate, error rate, latency percentiles, resource utilization, and SLO burn rate.
- Run **scheduled synthetic health checks** (uptime monitors) against public endpoints from multiple geographic regions.
