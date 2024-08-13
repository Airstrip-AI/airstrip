FROM node:20.15.0-alpine

WORKDIR /app

COPY public public
COPY src src
COPY next.config.mjs package.json postcss.config.cjs tailwind.config.ts tsconfig.json yarn.lock ./
COPY sample.env .env

RUN yarn && yarn build

CMD ["yarn", "start"]

EXPOSE 3000