# Next Home AI Workflow - Documentation

This project provides a production-ready property processing pipeline using n8n, Flowise, PostgreSQL, and Qdrant.

## 🚀 Setup Instructions

### 1. Database Migration
Execute the `migrations.sql` file in your PostgreSQL `saas_db` database. This will create the `properties` table and the `ai_errors` table.

### 2. Flowise Configuration
Refer to `flowise_config.md`. You need to create three chains:
- **SEO Chain**: For generating meta tags and descriptions.
- **Persona Chain**: For classifying buyers.
- **Embedding Chain**: For vectorizing property data.

Update the `seo-chain-id`, `persona-chain-id`, and `embedding-endpoint` placeholders in the n8n workflow with your actual Flowise chain IDs.

### 3. Qdrant Collection
Run the API call specified in `qdrant_setup.md` to create the `properties` collection. Ensure the vector size matches your embedding model (default is 1536 for OpenAI).

### 4. n8n Import
1. Import `error_workflow.json` first.
2. Import `main_workflow.json`.
3. In `main_workflow.json` settings, ensure the "Error Workflow" is set to the imported error handler.
4. Configure your PostgreSQL credentials in the Postgres nodes.
5. Update the HTTP Request nodes with the correct Flowise and Qdrant URLs.

## 🛡️ Multi-Tenancy
The workflow is designed for SaaS:
- Every SQL query filters by `tenant_id`.
- Qdrant payloads include `tenant_id` for filtered vector searches.
- Notifications are routed using `assigned_agent_id`.

## 📈 Features
- **Idempotency**: Polling checks `ai_processed = false`.
- **Competitiveness**: Real-time percentile calculation against similar local listings.
- **Auto-Retries**: HTTP nodes are configured to retry on transient failures.
- **Error Logging**: Comprehensive logging to a dedicated database table.
