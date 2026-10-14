# Service layer (empty on purpose)

Each integration gets its own module here so UI code never talks to a vendor SDK directly:

- `supabase/`   auth + database client
- `groq/`       LLM client (server-side only)
- `rag/`        chunking, embeddings, retrieval
- `documents/`  upload + text extraction

Pages and components import from these modules, never from the SDKs.
