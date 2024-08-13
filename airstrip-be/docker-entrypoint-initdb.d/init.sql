CREATE ROLE airstrip LOGIN PASSWORD 'airstrip';
CREATE DATABASE airstrip;
\c airstrip;
CREATE SCHEMA airstrip AUTHORIZATION airstrip;
CREATE EXTENSION "uuid-ossp";