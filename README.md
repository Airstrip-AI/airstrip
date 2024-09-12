<p align="center">
<img src="https://github.com/user-attachments/assets/a17ffb83-2acb-4531-bb1c-6d297e35d097" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Airstrip: Open-source enterprise generative AI platform

Airstrip is an open-source enterprise generative AI platform. Airstrip combines the best-in-class open-source tools to provide a complete and secure platform that allows you to build generative AI apps easily.

- [x] Teams and RBAC.
- [x] LLM Integrations.
  - [x] API keys encryption.
- [x] Memory layer for enhanced context. (Use your mem0 API key or run https://github.com/Airstrip-AI/mem0-rest/ for self-hosting Airstrip)
- [x] LLM usage analytics.
- [x] RAG and Chunking.
- [] ( :bulb: ) Rate-limits
- [] ( :bulb: ) REST APIs.

| **Legend**     |         |
| -------------- | ------- |
| :bulb:         | Planned |
| :construction: | WIP     |

## Getting started

The fastest way to try Airstrip is signing up for free at [Airstrip Cloud](https://airstrip.pro/).

> [!NOTE]  
> We treat your API keys seriously. All API keys are encrypted and only decrypted at the point of usage. We also use [Infisical](https://infisical.com/) for storing our keys securely and access to them are restricted.

### Run Airstrip locally

**Prereqs**: Make sure you have Git and Docker installed.

```
cp airstrip-fe/sample.env airstrip-fe/.env
cp airstrip-be/sample.env airstrip-be/.env
docker compose up
```

That's all you need to get started. The default setup uses the sample encryption key in `sample.env`. It is advisable to change it for production usage. If you are already using [Infisical](https://infisical.com/) and you wish to store and use your encryption key in it, you may do so by updating the `.env` file.

For details on the default values and how to change them, refer to [this (optional) section](#default-configuration).

## Features

|                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <h3>Manage AI integrations</h3> Bring your own API keys and connect to different LLM providers. We currently support **OpenAI**, **Mistral**, **Google**, **Cohere**, **Anthropic**, and **self-hosted LLMs** with an OpenAI-compatible interface. |                                                       <img width="1512" alt="ai-integrations" src="https://github.com/user-attachments/assets/ee742fc0-0790-44ff-a2ae-55d47ecd5493">                                                        |
| <h3>Teams and role-based access control</h3> Manage teams and control access to different AI integrations.                                                                                                                                         |                                                            <img width="1512" alt="teams" src="https://github.com/user-attachments/assets/c3623b8e-a7c2-4af4-92dd-d06c21b47056">                                                             |
| <h3>Build and use internal AI apps</h3> Build internal AI apps by adding prompts and specifying which LLM provider to connect to.                                                                                                                  | <img width="1512" alt="edit-app" src="https://github.com/user-attachments/assets/9511ee23-e42e-4d63-8dad-9f2762ca0af8"> <img width="1512" alt="chat" src="https://github.com/user-attachments/assets/891079db-5c8d-47f4-8c84-18a5fcc38b38"> |
| <h3>Usage analytics</h3> View LLM token usages and requests. | <img width="1512" alt="Screenshot 2024-09-11 at 12 32 26" src="https://github.com/user-attachments/assets/9a728ca2-ef49-4915-91eb-c4c941436ccd">|

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

<details>
  <summary>You can skip this section if you are happy with the default values. Advisable to read and change the values if you are deploying on a server.</summary>

### Backend

#### .env

`.env` is used as `env_file` in `docker-compose.yml` to provide environment variables. If you update the database values (e.g. credentials), make sure to update the [SQL init script](/airstrip-be/docker-entrypoint-initdb.d/init.sql).

#### AIRSTRIP_JWT_PUBLIC_JWK and AIRSTRIP_JWT_PRIVATE_JWK

When building the Docker image, a pair of public/private key is generated inside the image. They are used to sign JWT tokens. You can use another pair of keys by setting the environment variables `AIRSTRIP_JWT_PUBLIC_JWK` and `AIRSTRIP_JWT_PRIVATE_JWK` to your keys' file paths.

#### AIRSTRIP_SMTP_HOST, AIRSTRIP_SMTP_PORT, AIRSTRIP_SMTP_USER, AIRSTRIP_SMTP_PASSWORD, and AIRSTRIP_EMAIL_SENDER

These values are for sending emails. These are left blank by default. **Without these values, email functionality is disabled**. Currently, email functionality is only used for sending a password reset link and organization invite link.

#### AIRSTRIP_INFISICAL\*

Update these values to store and use encryption key (for encrypting your API keys) in Infisical.

```
AIRSTRIP_USE_INFISICAL_FOR_ENCKEY=true

AIRSTRIP_INFISICAL_API_URL=
AIRSTRIP_INFISICAL_CLIENT_ID=
AIRSTRIP_INFISICAL_CLIENT_SECRET=
AIRSTRIP_INFISICAL_PROJECT_ID=
AIRSTRIP_INFISICAL_SECRET_NAME=

# defaults to prod
AIRSTRIP_INFISICAL_PROJECT_ENV=
# defaults to /
AIRSTRIP_INFISICAL_SECRET_PATH=
# defaults to shared
AIRSTRIP_INFISICAL_SECRET_TYPE=
```

### Postgres

#### Database credentials

The credentials are used in the environment variables and SQL init script. They have to be updated together.

</details>

## Feature requests/Bug reports

Please submit any feature requests or issues in Github issues.
