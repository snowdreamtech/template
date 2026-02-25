# Monitoring & Observability Guidelines

> Objective: Define standards for logging, metrics, and distributed tracing to ensure system health and fast debuggability, covering the three pillars of observability, alerting, SLOs, and production operations.

## 1. The Three Pillars of Observability

### Foundational Principles

- Implement all three pillars: **Logs** (what happened), **Metrics** (how the system performs over time), and **Traces** (where time was spent across services). All three are complementary — each answers different questions.
- Use **OpenTelemetry (OTel)** as the single vendor-neutral instrumentation standard. Export to your chosen backends (Prometheus/Grafana, Jaeger, Loki, Datadog, Honeycomb, Grafana Cloud) without changing application code.
- Instrument every service automatically using OTel auto-instrumentation where available (HTTP, gRPC, database drivers). Supplement with manual spans for critical business operations (payment processing, order fulfillment).

### Correlation Strategy

- Establish a **correlation ID strategy**: generate a `traceId`/`requestId` at the entry point (API gateway or first service) and propagate it through all downstream services in logs and response headers:
  ```yaml
  # Example correlation flow
  User → API Gateway (generates: X-Request-ID: abc123, traceparent: 00-xxx-yyy-01)
      → Service A (reads and propagates headers)
      → Service B (continues same trace)
      → DB calls (adds DB span to same trace)
  All logs include: { "requestId": "abc123", "traceId": "xxx", "spanId": "zzz" }
  ```
- Track **DORA metrics** (Deployment Frequency, Lead Time for Changes, Change Failure Rate, Mean Time to Recovery) as engineering-level health KPIs alongside technical system metrics.

## 2. Logging

### Structured Logging

- Use **structured logging with JSON output**. Every log entry MUST include a consistent set of fields that can be queried and filtered in any log aggregation system (Loki, Elasticsearch, CloudWatch):
  ```json
  {
    "timestamp": "2025-01-15T10:30:00.123Z",
    "level": "INFO",
    "service": "order-service",
    "version": "2.3.1",
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "spanId": "00f067aa0ba902b7",
    "requestId": "req-abc-123",
    "message": "Order created",
    "userId": "usr-456",
    "orderId": "ord-789",
    "total": 49.99
  }
  ```
- Use recommended logging libraries:
  - **Go**: `slog` (stdlib, Go 1.21+) with JSON handler, or `zap`/`zerolog`
  - **Python**: `structlog` with JSON renderer
  - **Java/Kotlin**: Logback + `logstash-logback-encoder`
  - **Node.js**: Pino (fastest) or Winston with JSON transport
  - **Rust**: `tracing` crate with `tracing-subscriber` JSON layer

### Log Level Discipline

- Use log levels correctly and consistently:
  - **`DEBUG`**: Verbose development detail: function entry/exit, variable values. **Disabled by default in production** — enable on-demand with dynamic log level control.
  - **`INFO`**: Normal operations: service started, job completed, user logged in, payment processed.
  - **`WARN`**: Unexpected but handled conditions: retry triggered, degraded mode, slow query detected, configuration missing with fallback.
  - **`ERROR`**: Failures requiring attention: unhandled exceptions, external service unavailable, transaction rollback. Always include error type, message, and stack trace.
  - **`FATAL`**: Application cannot continue — used sparingly, triggers paging.

### Logging Boundaries

- Log at **service boundaries**: HTTP requests entering (method, path, user agent, client IP), HTTP responses leaving (status code, duration). Do NOT log every internal function call.
- **Never log sensitive data**: passwords, API keys, tokens, credit card numbers, PII (SSN, full name + email together), session cookies, or raw HTTP request/response bodies containing personal data.
- Log **intent, not implementation**: "User login failed — invalid credentials" not "SELECT query returned 0 rows from users table".

## 3. Metrics

### Prometheus & RED/USE Methods

- Expose a **`/metrics` endpoint** (Prometheus text format) from every service. Each service is responsible for its own metrics endpoint:
  ```go
  // Go example with prometheus client
  import "github.com/prometheus/client_golang/prometheus/promhttp"
  http.Handle("/metrics", promhttp.Handler())
  ```
- Implement the **RED Method** for all user-facing services:
  - **R**ate: requests processed per second
  - **E**rror rate: percentage of failed requests (4xx, 5xx)
  - **D**uration: latency percentiles (p50, p90, p95, p99, p999)
  ```yaml
  # Prometheus alerting rule example
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01
    for: 5m
    annotations:
      summary: "Error rate above 1% for 5 minutes"
  ```
- Implement the **USE Method** for infrastructure resources:
  - **U**tilization: % of time the resource is busy (CPU, disk I/O)
  - **S**aturation: degree to which work is queued (memory pressure, run queue length)
  - **E**rrors: error events per second

### SLIs & SLOs

- Define **Service Level Indicators (SLIs)** and **Service Level Objectives (SLOs)** for each critical service:
  ```yaml
  # Example SLO definition
  service: payment-api
  slos:
    availability:
      target: 99.9%
      indicator: success_rate # requests with status != 5xx
    latency:
      target: "p99 < 500ms over 30-second windows"
  ```
- Create alerting rules that fire when the SLO **error budget** is being consumed too rapidly (multiwindow, multi-burn-rate alerting):
  ```yaml
  - alert: SLOBurnRateHigh
    expr: |
      (
        sum(rate(http_requests_total{status=~"5.."}[1h])) /
        sum(rate(http_requests_total[1h]))
      ) > 14 * (1 - 0.999)  # 14x burn rate = SLO breach in ~2 hours
    annotations:
      summary: "SLO error budget burning too fast"
      runbook: "https://wiki.example.com/runbooks/high-error-budget"
  ```
- Add **business-level metrics** (orders processed, payments failed, user signups, active sessions) alongside infrastructure metrics.

## 4. Distributed Tracing

### OpenTelemetry Spans

- Instrument all inbound/outbound **HTTP calls**, **gRPC calls**, **database queries**, **cache operations**, and **message queue operations** with OTel spans:

  ```python
  from opentelemetry import trace
  from opentelemetry.trace import SpanKind

  tracer = trace.get_tracer("order-service")

  with tracer.start_as_current_span("process-payment", kind=SpanKind.CLIENT) as span:
    span.set_attribute("payment.provider", "stripe")
    span.set_attribute("payment.amount",   order.total)
    span.set_attribute("payment.currency", "USD")
    result = stripe.charge(order)
    span.set_attribute("payment.charge_id", result.id)
  ```

- Propagate **W3C Trace Context** (`traceparent`, `tracestate`) across all service and async (message queue) boundaries. Never use custom trace ID headers.
- Add meaningful **span attributes**:
  - HTTP: `http.method`, `http.route`, `http.status_code`, `http.url`
  - DB: `db.system`, `db.name`, `db.operation`, `db.statement` (sanitized — never include bind parameters or PII)
  - Messaging: `messaging.system`, `messaging.destination`, `messaging.operation`
- Set an appropriate **sampling rate**: 10-20% head-based for high-volume traffic; 100% for errors, critical user journeys, and specific operations via tail-based sampling.

## 5. Alerting, Dashboards & Operations

### Alert Design

- Alerts MUST be **actionable**: when an alert fires, the on-call engineer must immediately understand what is impacted and what the mitigation step is.
- Include a **runbook URL** in every alert's annotations:
  ```yaml
  annotations:
    summary: "High error rate in payment service"
    description: "Error rate {{ $value | humanizePercentage }} over last 5m"
    runbook: "https://wiki.example.com/runbooks/payment-high-error-rate"
    dashboard: "https://grafana.example.com/d/abc123"
  ```
- Alert on **symptoms** (user-visible error rate, latency degradation, SLO burn rate) — not causes (high CPU, low disk). Causes belong in dashboards for diagnosis, not in pagers.
- Avoid alert fatigue: each team's pager should fire for fewer than 5 alerts per day on average in steady state.

### Dashboards

- Maintain a **per-service Grafana dashboard** with:
  - Request rate, error rate, latency percentiles (RED panel)
  - SLO burn rate and remaining error budget
  - Resource utilization (CPU, memory, connections)
  - Service-specific business KPIs

### Infrastructure

- Use **Grafana Alloy** (formerly Grafana Agent) as an OTel-compatible collector — unifies metrics scraping, log collection, and trace forwarding in a single agent:
  ```yaml
  # alloy config — scrapes metrics, collects logs, receives traces
  prometheus.scrape "app" { targets = [{"__address__" = "app:8080", "__metrics_path__" = "/metrics"}] }
  loki.source.journal "journal" { }
  otelcol.receiver.otlp "default" { grpc { endpoint = "0.0.0.0:4317" } }
  ```
- Run **scheduled synthetic health checks** (uptime monitors) against public endpoints from multiple geographic regions. Trigger alerts if uptime < SLO target from any region.
- Maintain **incident runbooks** for each alert. Review and update runbooks during post-mortem to ensure accuracy. Conduct quarterly blameless post-mortems for every P1/P2 incident.
