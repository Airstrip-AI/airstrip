<p align="center">
<img src="https://github.com/user-attachments/assets/a17ffb83-2acb-4531-bb1c-6d297e35d097" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Airstrip: Open-source Enterprise AI Management Platform

Airstrip is an open-source enterprise AI management platform. You can think of it as a proxy service with access control that allows you to build internal AI apps.

With Airstrip, you can manage your integrations with different LLM providers and control which members or teams can use them.

The goal is to have the engineering/ops team manage the integrations and access while everyone else, including non-technical teams, can create internal AI apps easily.

## Features

- Bring your own API keys and connect to different LLM providers.
  - We currently support **OpenAI**, **Mistral**, **Google**, **Cohere**, **Anthropic**, and **self-hosted LLMs** with an OpenAI-compatible interface.
- Manage teams and control access to different AI integrations.
- Build internal AI apps by adding prompts and specifying which LLM provider to connect to.
- View usages across all apps and LLM integrations in one place.

## Get started

Everything has been dockerized.

Run:

```
PGDATA_DIR=<directory to store postgres database data> docker compose up
```

The command above will spin up 4 containers:

1. **Frontend** - This is the webapp and will be available at `http://localhost:3000`.
2. **Backend** - This is the backend and will be available at `http://localhost:3001`.
3. **Postgres database** - Postgres database at port `5432`.
4. **Flyway** - This is for running database migrations at startup. Once complete, the container will stop running.

## Default configuration

You can skip this section if you are happy with the default values.

To make it easy to get started, default values are supplied. You can still run the app without changing any of these values. But if you intend to run this in prod or in public, you should either harden your servers or use non-default values, especially for database credentials.

### Backend

#### AIRSTRIP_JWT_PUBLIC_JWK and AIRSTRIP_JWT_PRIVATE_JWK

When building the Docker image, a pair of public/private key is generated inside the image. They are used to sign JWT tokens. You can use another pair of keys by setting the environment variables `AIRSTRIP_JWT_PUBLIC_JWK` and `AIRSTRIP_JWT_PRIVATE_JWK` to your keys' file paths in `docker-compose.yml`.

#### .env

`sample.env` is copied as `.env` inside the image. If you update the database values (e.g. credentials), make sure to update the [SQL init script](/airstrip-be/docker-entrypoint-initdb.d/init.sql) and flyway section in [docker-compose.yml](./docker-compose.yml).

#### AIRSTRIP_SMTP_HOST, AIRSTRIP_SMTP_PORT, AIRSTRIP_SMTP_USER, AIRSTRIP_SMTP_PASSWORD, and AIRSTRIP_EMAIL_SENDER

These values in `.env` are for sending emails. These are left blank by default. **Without these values, email functionality is disabled**. Currently, email functionality is only used for sending a password reset link and organization invite link.

### Postgres

#### Database credentials

The credentials are used in `.env`, SQL init script, and `docker-compose.yml` (in flyway's command section). They have to be updated together.

## How to use (role-based access control)

- Upon creating an account, you will be assigned an organization. You can invite people to your organization.
- There are 3 types of roles: **Owner**, **Admin**, and **Member**.
  - There is no difference between Owner and Admin at the moment other than Admin is unable to change an Owner's role.
  - Whatever an Admin can do, an Owner can do too. When you see the term "admin", it means "Admins and Owners" unless otherwise specified.
  - The 3 roles also apply to team members.
- Each organization can have many teams. Only org admins can create teams.
- Org admins and team admins can invite members to the team.
- AI integrations can only be created by org admins and are created at the org level.
- AI integrations can be restricted to a team, i.e. only apps created in the team can use the AI integration.
- Only org/team admins can create apps in the org/team respectively.
- Org-wide AI integrations can be used by any team.
- Org-wide apps can be used by any org member.
- Team apps can only be used by the team's members or org admins.

## Roadmap

- Exposing the apps as REST API endpoints.
- Better usage data in dashboard.

Please submit any feature requests in Github issues.
