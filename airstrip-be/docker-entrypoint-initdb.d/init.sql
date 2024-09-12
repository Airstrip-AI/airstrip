CREATE ROLE airstrip LOGIN PASSWORD 'airstrip';
CREATE DATABASE airstrip;
GRANT CREATE ON DATABASE airstrip TO airstrip;
\c airstrip;
CREATE SCHEMA airstrip AUTHORIZATION airstrip;
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION vector;
