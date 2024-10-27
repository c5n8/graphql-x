# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
ARG PNPM_VERSION=9

FROM node:${NODE_VERSION}-slim AS node-base

####
FROM node-base AS pnpm

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

####
FROM pnpm AS deps

WORKDIR /app/

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile \
    && cp --recursive /root/.local/share/pnpm/ /pnpm/

####
FROM node-base AS code

COPY --from=node-base /opt/ /opt/
COPY --from=node-base /usr/local/bin/ /usr/local/bin/
COPY --from=node-base /usr/local/lib/node_modules/ /usr/local/lib/node_modules/

COPY --from=pnpm /usr/local/lib/node_modules/pnpm/ /usr/local/lib/node_modules/pnpm/
RUN --mount=type=bind,from=pnpm,source=/usr/local/bin,target=/context/ \
    cp -a /context/pnpm /context/pnpx /usr/local/bin/

WORKDIR /app/

RUN chown node:node ./

COPY --chown=node:node ./ ./
COPY --chown=node:node --from=deps /pnpm/ /pnpm/
COPY --chown=node:node --from=deps /app/node_modules/ ./node_modules/

USER node

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN pnpm config set store-dir /pnpm/store

CMD ["npm", "run", "dev"]
