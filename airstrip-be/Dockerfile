FROM node:20.15.0-alpine

RUN apk add jose

WORKDIR /app

COPY src src
COPY nest-cli.json package.json tsconfig.build.json tsconfig.json yarn.lock ./

RUN jose jwk gen -i '{"alg": "RS256"}' -o airstrip.rsa.jwk && jose jwk pub -i airstrip.rsa.jwk -o airstrip.rsa.jwk.pub

RUN yarn && yarn build

CMD ["yarn", "start"]

EXPOSE 3001