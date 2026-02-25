# Data Engineering Guidelines

> Objective: Define standards for building reliable, scalable, and maintainable data pipelines and transformations, covering pipeline design, dbt, Spark, streaming, and data quality governance.

## 1. Pipeline Design Principles

### Core Design Rules

- Design pipelines to be **idempotent**: re-running a pipeline on the same input MUST produce the same output without double-counting, data corruption, or side effects. Idempotency is required for safe retries and backfills:

  ```python
  # ✅ Idempotent — overwrites the partition
  df.write.mode("overwrite").partitionBy("event_date").parquet("s3://bucket/events/")

  # ❌ Non-idempotent — appends duplicates on retry
  df.write.mode("append").parquet("s3://bucket/events/")  # unless data has a unique constraint
  ```

- Apply the **Medallion Architecture** (popularized by Databricks Delta Lake):
  ```text
  Bronze (Raw):   exact copy of source data — never modified, timestamped ingestion
  Silver (Clean): validated, deduplicated, cast to correct types, business key unified
  Gold (Curated): aggregated metrics, business-ready fact/dimension tables, domain marts
  ```
  Never write directly to Gold from raw input. Data flows through every layer sequentially.
- Make **data lineage** traceable end-to-end. Use **dbt** (SQL transforms with automatic lineage graph) or **OpenLineage** (runtime lineage events from Spark, Airflow) to document how each dataset derives from its sources.
- Prefer **incremental processing** (watermark-based loads) over full table scans as the default pattern. Full reloads should be exceptional:
  ```sql
  -- Incremental dbt model: only processes new/updated records
  {% if is_incremental() %}
    WHERE updated_at > (SELECT MAX(updated_at) FROM {{ this }})
  {% endif %}
  ```

### Pipeline Architecture

- **Orchestration**: Use **Apache Airflow** or **Prefect** for batch pipeline orchestration. Define DAGs as code — not via UI clicks. Version-control all DAG definitions.
- **Backfill strategy**: Design every DAG to support date-range backfills without code modification. Use `execution_date` / logical date as the primary partition key — not `NOW()`.
- **Monitoring**: Every pipeline step MUST produce observable outcomes: success/failure count, rows processed, rows rejected. Emit these to the observability platform as pipeline metrics.
- **Failure handling**: Use **dead-letter storage** for records that fail validation or processing — never silently discard failed records. Alert on dead-letter accumulation.

## 2. dbt (SQL Transformations)

### Documentation & Naming

- Every dbt model MUST have a `.yml` file with description for the model and all key columns. Documentation is the contract:
  ```yaml
  # models/silver/stg_orders.yml
  version: 2
  models:
    - name: stg_orders
      description: "Cleaned and standardized order events from the OLTP system. One row per order."
      columns:
        - name: order_id
          description: "Natural key from the source system"
          tests: [not_null, unique]
        - name: user_id
          tests: [not_null, { relationships: { to: ref('stg_users'), field: user_id } }]
        - name: status
          tests: [not_null, { accepted_values: { values: ["pending", "confirmed", "cancelled", "delivered"] } }]
  ```
- Follow naming conventions strictly:
  - `stg_` — staging: source mirror, minimal cleaning, one-to-one with source table
  - `int_` — intermediate: single-domain logic, not user-facing
  - `fct_` — fact tables: business events (orders, payments, sessions)
  - `dim_` — dimension tables: slowly-changing entities (users, products, accounts)
  - `mart_` / `rpt_` — business-facing aggregates and reporting models

### Testing & CI

- Run **`dbt build`** (combines `dbt run` + `dbt test`) in CI. Block on test failures — never ignore them:
  ```bash
  dbt build --target prod --select state:modified+  # only changed models + dependencies
  dbt source freshness                               # alert on stale sources
  ```
- Use **`dbt-expectations`** (port of Great Expectations) for statistical and distributional data quality tests:
  ```yaml
  - name: revenue
    tests:
      - dbt_expectations.expect_column_values_to_be_between:
          min_value: 0
          max_value: 10000000
      - dbt_expectations.expect_column_mean_to_be_between:
          min_value: 50 # average order should be > $50
          max_value: 5000
  ```

## 3. Apache Spark

### DataFrame API Patterns

- Use the **DataFrame/Dataset[T] API** over legacy RDD API for performance via Catalyst optimizer, query planning, and code generation.
- Cache DataFrames (`cache()` or `persist()`) only when they are **reused multiple times** in the same DAG. Call `unpersist()` when finished to release memory promptly:

  ```python
  # ✅ Cache only for multi-use paths
  enriched_users = base_users.join(profiles, "user_id").cache()

  by_country = enriched_users.groupBy("country").count()
  by_plan    = enriched_users.groupBy("plan_type").agg(avg("revenue"))

  enriched_users.unpersist()  # free memory
  ```

- **Never call `.collect()` on large DataFrames** — it transfers all partition data to the driver and causes OOM errors. Use `.take(n)`, `.count()`, aggregations, or `.show(n)` for inspection.
- Manage **partition count** carefully:
  - Use `repartition(n)` before wide transformations (shuffles, joins) to ensure even distribution
  - Use `coalesce(n)` before writing outputs to reduce file count without a full shuffle
  - Aim for partition sizes of 100-300 MB after compression for Parquet output
- Avoid **data skew**: detect with `df.groupBy("join_key").count().orderBy("count", ascending=False)`. Mitigate with salting, adaptive query execution (AQE), or skew hints.

## 4. Streaming (Kafka, Flink, Spark Streaming)

### At-Least-Once Safety

- Design consumers to be **at-least-once safe**. All downstream write operations must be idempotent or perform deduplication using a unique business key:
  ```python
  # Deduplicate using a unique event ID within a window
  df.dropDuplicates(["event_id"]).writeStream \
    .foreachBatch(upsert_to_db) \
    .trigger(processingTime="30 seconds") \
    .start()
  ```

### Schema Registry

- Define an explicit **schema** for all Kafka messages using **Apache Avro** or **Protobuf** with a **Confluent Schema Registry**. Never produce schema-less JSON for production topics:
  ```python
  # Producer with schema registry
  schema          = avro_schema_from_file("order_event.avsc")
  serializer      = AvroSerializer(schema_registry_client, schema)
  producer_config = {"bootstrap.servers": KAFKA_BROKERS, "value.serializer": serializer}
  ```

### Streaming Operations

- Monitor **consumer lag** as the primary health signal for streaming pipelines. Alert when lag exceeds your SLA threshold.
- Use **dead-letter topics** for messages that fail to process after retries. Never silently discard failed messages:
  ```python
  def process_event(event):
    try:
      transform_and_sink(event)
    except Exception as e:
      dlq_producer.produce(topic="orders.dlq", value=serialize_error(event, e))
  ```
- Use **Flink** for stateful stream processing with event-time semantics and exactly-once guarantees. Use **Kafka Streams** for lightweight per-topic stream transformations without a separate cluster.

## 5. Data Quality & Governance

### Validation Gates

- Validate data quality at every pipeline stage boundary. **Fail fast** on unexpected nulls, duplicates, schema drift, or statistical anomalies — before they propagate to downstream consumers:
  - **`dbt tests`** — SQL-based tests run at transformation time
  - **`Great Expectations`** — rich expectation suites for Python-based pipelines
  - **`Soda Core`** — YAML-configured data quality checks with Slack/PagerDuty integration

### Data Retention & Access Control

- **Never delete raw source data (Bronze layer).** Archive to low-cost object storage (S3 Glacier, GCS Archive, Azure Archive) with a documented retention policy and compliant deletion schedule.
- Implement **data access control**:
  - **Column masking** for PII fields in queries: Snowflake dynamic data masking, BigQuery policy tags
  - **Row-level security** for multi-tenant datasets
  - **Role-based access** to specific schemas and tables (GRANT SELECT ON SCHEMA schema_name TO role_name)
  - Catalog all PII fields in a data catalog (DataHub, Amundsen, OpenMetadata) for privacy impact assessment

### Data Catalog

- Register all datasets in a **data catalog** (DataHub, OpenMetadata, dbt Docs) with:
  - Owner team and primary contact
  - SLA for freshness (e.g., "updated daily by 08:00 UTC")
  - PII classification and retention policy
  - Upstream/downstream lineage graph
