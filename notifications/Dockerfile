FROM node:20.17.0-alpine AS builder

WORKDIR /app
ENV HUSKY_INIT=false
COPY app ./

RUN yarn install && \
    yarn lint-check && \
    yarn build && \
    rm -rf node_modules && \
    yarn install --production

FROM node:20.17.0-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
RUN chown -R 1000:1000 /app
USER 1000
EXPOSE 3333
CMD ["node", "dist/main.js"]
