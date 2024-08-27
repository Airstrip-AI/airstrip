ALTER TABLE ai_integrations DROP CONSTRAINT ai_integrations_ai_provider_api_key_key;

DROP TABLE message_token_usage_data;

ALTER TABLE ai_integrations ADD COLUMN ai_model TEXT;

UPDATE ai_integrations SET ai_model = a.ai_model FROM apps a WHERE ai_integrations.id = a.ai_provider_id;

ALTER TABLE ai_integrations ALTER COLUMN ai_model SET NOT NULL;

ALTER TABLE apps DROP COLUMN ai_model;