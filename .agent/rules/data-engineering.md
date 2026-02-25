# Data Engineering Guidelines

> Objective: Define standards for building reliable, scalable, and maintainable data pipelines and transformations.

## 1. Pipeline Design Principles

- Design pipelines to be **idempotent**: re-running a pipeline on the same input must produce the same output without double-counting or data corruption. This is critical for safe retries and backfills.
- Apply the **medallion architecture**: Raw/Bronze (data as-is from source) → Cleaned/Silver (validated, deduplicated, enriched) → Aggregated/Gold (business-ready aggregates, metrics). Never write directly to Gold from raw input.
- Make **data lineage** traceable end-to-end. Use tools like **dbt** (for SQL transforms) or **OpenLineage** (for runtime lineage events) to document how each dataset derives from its sources.
- Design pipelines with **incremental processing**: prefer incremental loads (watermark-based) over full table scans. Full reloads should be exceptional, require explicit justification, and not be the default pattern.

## 2. dbt (SQL Transformations)

- Every dbt model MUST have a `.yml` file with `description` for the model and all key columns. Good descriptions are the documentation.
- Follow naming conventions strictly: `stg_` (staging/source mirror), `int_` (intermediate, single-domain logic), `fct_` (fact tables), `dim_` (dimension tables), `mart_` (business-facing aggregates).
- Write `schema.yml` tests for `not_null` and `unique` on **all primary key columns**. Add `relationships` tests for foreign key integrity.
- Run `dbt build` (combines `dbt run` + `dbt test`) in CI. Use `dbt source freshness` to alert on stale source data above SLA thresholds.
- Use **`dbt-expectations`** (Great Expectations port) for statistical data quality tests: value ranges, distribution checks, and completeness ratios.

## 3. Apache Spark

- Prefer the **DataFrame/Dataset[T] API** over legacy RDD API for performance, query optimization via Catalyst, and readability.
- Cache (`cache()` / `persist()`) DataFrames only when they are reused multiple times in the same DAG. Always call `unpersist()` when done to release memory.
- **Never call `.collect()` on large DataFrames** — it transfers all data to the driver and causes OOM errors. Use `.count()`, aggregations, or `.show(n)` for inspection.
- Partition data appropriately: use `repartition()` before wide transformations (shuffles); use `coalesce()` before writing to reduce output file count without a full shuffle.

## 4. Streaming (Kafka, Flink, Spark Streaming)

- Design consumers to be **at-least-once safe**. Ensure all downstream write operations are idempotent or de-duplicated using a deduplication key.
- Define an explicit **schema** for all Kafka messages using **Avro** or **Protobuf** with a **Schema Registry**. Never produce schema-less JSON in production — it creates fragility and hidden coupling.
- Monitor **consumer lag** (via Kafka's `__consumer_offsets` or Cruise Control) as the primary health metric for streaming pipelines. Alert when lag exceeds SLA thresholds.
- Use **dead-letter topics/queues** for messages that consistently fail to process — never silently discard failed messages.

## 5. Data Quality & Governance

- Validate data quality at every pipeline stage boundary using **dbt tests**, **Great Expectations**, or **Soda Core**. Fail fast on unexpected nulls, duplicates, schema drift, and value range violations.
- Alert on data quality failures before they silently propagate to downstream consumers and dashboards.
- **Never delete raw source data.** Archive it to low-cost object storage (S3 Glacier, GCS Archive) with a documented retention policy and compliant deletion schedule.
- Implement **data access control**: apply row-level security and column masking for PII fields in data warehouse (BigQuery row-level security, Snowflake dynamic data masking). Document all PII fields in the data catalog.
