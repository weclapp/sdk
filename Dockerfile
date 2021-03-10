FROM node:14

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

ENTRYPOINT npm run gen:start && \
           npm run sdk:build && \
           if [[ -n "$RUN_TESTS" ]]; then npm run test; fi
