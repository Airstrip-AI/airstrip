FROM node:20.15.0-alpine

WORKDIR /app

COPY public public
COPY src src
COPY next.config.mjs package.json postcss.config.cjs tailwind.config.ts tsconfig.json yarn.lock ./

# Section for env vars that will be built into the image

ARG NEXT_PUBLIC_BE_API_HOST=http://localhost:3001

# End of section for env vars that will be built into the image

RUN yarn && yarn migrate-db-schema && yarn build

CMD ["yarn", "start"]

EXPOSE 3000