# Data Engineering Guidelines

> Objective: Define standards for building reliable, scalable, and maintainable data pipelines and transformations.

## 1. Pipeline Design

- Design pipelines to be **idempotent**: re-running a pipeline on the same input should produce the same output. This is critical for safe retries.
- Apply the **medallion architecture** (or equivalent): raw/bronze → cleaned/silver → aggregated/gold. Never write directly to a gold-layer table from raw input.
- Make **data lineage** traceable. Use tools like dbt or OpenLineage to document how each dataset is derived.

## 2. dbt (if applicable)

- Every dbt model MUST have a `.yml` file with descriptions for the model and all key columns.
- Follow the naming convention: `stg_` (staging/source), `int_` (intermediate transforms), `fct_` (facts), `dim_` (dimensions).
- Write `schema.yml` tests for `not_null` and `unique` on all primary key columns.
- Run `dbt test` in CI after every `dbt run`.

## 3. Apache Spark (if applicable)

- Prefer **DataFrame/Dataset API** over RDD API for performance and readability.
- Cache (`cache()` / `persist()`) DataFrames only when they are used multiple times in a DAG. Always unpersist when done.
- Avoid using `collect()` on large DataFrames — this brings data to the driver and causes OOM errors.
- Partition data appropriately. Use `repartition()` before large shuffles and `coalesce()` before writing.

## 4. Streaming (Kafka, Spark Streaming, Flink)

- Design consumers to be **at-least-once** safe by default. Ensure downstream processing is idempotent.
- Set explicit schema for Kafka messages (Avro or Protobuf via Schema Registry). Never produce schema-less JSON in production.
- Monitor consumer lag as the primary health metric for streaming pipelines.

## 5. Data Quality & Testing

- Validate data quality at pipeline boundaries using tools like **Great Expectations** or **dbt tests**.
- Alert on data quality failures before they silently corrupt downstream datasets.
- Never delete raw source data. Archive it instead, with clear retention policies.
