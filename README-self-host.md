<p align="center">
<img src="https://github.com/user-attachments/assets/a17ffb83-2acb-4531-bb1c-6d297e35d097" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Airstrip: Open-source enterprise generative AI platform

## Self-hosting

**Prereqs**: Make sure you have Git and Docker installed.

### 1. Setup Infisical

Airstrip uses [Infisical](https://github.com/Infisical/infisical) for vault storage of API keys. You can either self-host or use Infisical Cloud. If you don't already have an Infisical server running or are not using Infisical cloud, you can run it locally with:

```
cd ext-services/infisical
cp sample.env .env
docker compose -f docker-compose.infisical.yml up
```

Infisical will now be running at http://localhost:4000.

**Note**: The setup uses default values from Infisical's example. It is advisable to change the values for self-hosting. For details, refer to [Infisical's documentation](https://infisical.com/docs/self-hosting/configuration/envars).

Go to Infisical web on your browser, create a [project](https://infisical.com/docs/documentation/platform/project) and [create a client ID and secret](https://infisical.com/docs/documentation/platform/identities/universal-auth#guide) for Airstrip.

### 2. Run Airstrip

Change into project's root directory. This command assumes you were in `ext-services/infisical`.

```
cd ../../
cp airstrip-be/sample.env airstrip-be/.env
```

Replace with actual values for Infisical

```
AIRSTRIP_INFISICAL_API_URL=http://localhost:4000
AIRSTRIP_INFISICAL_CLIENT_ID=aaaa-bbb
AIRSTRIP_INFISICAL_CLIENT_SECRET=xxxx-yyyy
AIRSTRIP_INFISICAL_PROJECT_ID=zzzz-cccc
AIRSTRIP_INFISICAL_PROJECT_ENV=prod
```

```
docker compose -f docker-compose.db.yml -f docker-compose.airstrip.yml up
```

That's all you need to get started. For details on the default values and how to change them, refer to [this (optional) section](#default-configuration).

## Default configuration

<details>
  <summary>You can skip this section if you are happy with the default values. Advisable to read and change the values if you are deploying on a server.</summary>

### Backend

#### .env

`.env` is used as `env_file` in `docker-compose.yml` to provide environment variables. If you update the database values (e.g. credentials), make sure to update the [SQL init script](/airstrip-be/docker-entrypoint-initdb.d/init.sql) and flyway section in [docker-compose.yml](./docker-compose.yml).

#### AIRSTRIP_JWT_PUBLIC_JWK and AIRSTRIP_JWT_PRIVATE_JWK

When building the Docker image, a pair of public/private key is generated inside the image. They are used to sign JWT tokens. You can use another pair of keys by setting the environment variables `AIRSTRIP_JWT_PUBLIC_JWK` and `AIRSTRIP_JWT_PRIVATE_JWK` to your keys' file paths.

#### AIRSTRIP_SMTP_HOST, AIRSTRIP_SMTP_PORT, AIRSTRIP_SMTP_USER, AIRSTRIP_SMTP_PASSWORD, and AIRSTRIP_EMAIL_SENDER

These values are for sending emails. These are left blank by default. **Without these values, email functionality is disabled**. Currently, email functionality is only used for sending a password reset link and organization invite link.

### Postgres

#### Database credentials

The credentials are used in the environment variables, SQL init script, and `docker-compose.yml` (in flyway's command section). They have to be updated together.
</details>
