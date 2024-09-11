CREATE TABLE responses (
  chat_message_id UUID NOT NULL,
  created_at DateTime64(3) NOT NULL,
  org_id UUID NOT NULL,
  app_id UUID NOT NULL,
  user_id UUID NOT NULL,
  chat_id UUID NOT NULL,
  ai_provider String NOT NULL,
  ai_model String NOT NULL,
  completion_tokens Int64 NULL,
  prompt_tokens Int64 NULL,
  total_tokens Int64 NULL,
  status String NULL
)
ENGINE = MergeTree
PRIMARY KEY (chat_message_id)
ORDER BY (chat_message_id, created_at);