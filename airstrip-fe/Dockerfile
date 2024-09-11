FROM node:20.15.0-alpine

WORKDIR /app

COPY public public
COPY src src
COPY clickhouse clickhouse
COPY next.config.mjs package.json postcss.config.cjs tailwind.config.ts tsconfig.json drizzle.config.ts yarn.lock ./

# Section for env vars that will be built into the image

# Special arg for making api calls from browser side
ARG NEXT_PUBLIC_BROWSER_BE_API_HOST=http://localhost:3001

ARG NEXT_PUBLIC_BE_API_HOST=http://be:3001
ARG AIRSTRIP_DB_HOST=db
ARG AIRSTRIP_DB_PORT=5432
ARG AIRSTRIP_DB_USER=airstrip
ARG AIRSTRIP_DB_PASSWORD=airstrip
ARG AIRSTRIP_DB_NAME=airstrip
ARG CLICKHOUSE_HOST=http://clickhouse-db:8123
ARG CLICKHOUSE_USER=default
ARG CLICKHOUSE_PASSWORD=
ARG CLICKHOUSE_DB=default

# End of section for env vars that will be built into the image

RUN yarn && yarn build

CMD ["yarn", "docker-start"]

EXPOSE 3000