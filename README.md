<p align="center">
<img src="https://github.com/user-attachments/assets/a17ffb83-2acb-4531-bb1c-6d297e35d097" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Airstrip: Open-source Enterprise AI Management Platform

Airstrip is an open-source enterprise AI management platform. You can think of it as a proxy service with access control that allows you to build internal AI apps.

With Airstrip, you can manage your integrations with different LLM providers and control which members can use them.

The goal is to have the engineering/ops team manage the integrations while everyone else, including non-technical teams, can create internal AI apps easily.

## Get started

Everything has been dockerized. Simply run:

```
PGDATA_DIR=<directory for postgres data> docker compose up
```

That's all you need to get started. For details on the default values and how to change them, refer to [this (optional) section](#default-configuration).

## Features

|                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <h3>Manage AI integrations</h3> Bring your own API keys and connect to different LLM providers. We currently support **OpenAI**, **Mistral**, **Google**, **Cohere**, **Anthropic**, and **self-hosted LLMs** with an OpenAI-compatible interface. |                                                       <img width="1512" alt="ai-integrations" src="https://github.com/user-attachments/assets/ee742fc0-0790-44ff-a2ae-55d47ecd5493">                                                        |
| <h3>Teams and role-based access control</h3> Manage teams and control access to different AI integrations.                                                                                                                                         |                                                            <img width="1512" alt="teams" src="https://github.com/user-attachments/assets/c3623b8e-a7c2-4af4-92dd-d06c21b47056">                                                             |
| <h3>Build and use internal AI apps</h3> Build internal AI apps by adding prompts and specifying which LLM provider to connect to.                                                                                                                  | <img width="1512" alt="edit-app" src="https://github.com/user-attachments/assets/9511ee23-e42e-4d63-8dad-9f2762ca0af8"> <img width="1512" alt="chat" src="https://github.com/user-attachments/assets/891079db-5c8d-47f4-8c84-18a5fcc38b38"> |
| <h3>Usage analytics</h3> View usages across all apps and AI integrations in one place. (To be honest, it's quite basic for now. Still working on this.)                                                                                            |                                                          <img width="1511" alt="analytics" src="https://github.com/user-attachments/assets/167d7e9b-caf3-4b42-b3c1-098357610ed8">                                                           |

## How to use

#### Roles

- Upon creating an account, you will be assigned an organization which you are an owner of. You can invite people to your organization.
- There are 3 types of roles: **Owner**, **Admin**, and **Member**.
- There is no difference between Owner and Admin at the moment other than Admin is unable to change an Owner's role.
- Whatever an Admin can do, an Owner can do too. When you see the term "admin", it means "Admins and Owners" unless otherwise specified.
- The 3 roles also apply to team members.

#### Teams

- Each organization can have many teams. Only org admins can create teams.
- Org admins and team admins can invite members to the team.

#### AI (LLM) integrations

- AI integrations can only be created by org admins and are created at the org level.
- AI integrations can be restricted to a team, i.e. only apps created in the team can use the AI integration.
- Org-wide AI integrations can be used by any team.

#### Apps

- Only org/team admins can create apps in the org/team respectively.
- Org-wide apps can be used by any org member.
- Team apps can only be used by the team's members or org admins.

## Default configuration

**You can skip this section if you are happy with the default values.**

The `docker compose up` command will spin up 4 containers:

1. **Frontend** - This is the webapp and will be available at `http://localhost:3000`.
2. **Backend** - This is the backend and will be available at `http://localhost:3001`.
3. **Postgres database** - Postgres database at port `5432`.
4. **Flyway** - This is for running database migrations at startup. Once complete, the container will stop running.

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

## We are working on...

- Allow data sources to be added to AI apps (currently everything needs to be in the text prompt.)
- Exposing the apps as REST API endpoints.
- Better usage analytics in dashboard.

Please submit any feature requests or issues in Github issues.
