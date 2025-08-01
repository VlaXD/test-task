FROM node:20.17.0-alpine
WORKDIR /app
COPY app/ ./
RUN yarn
CMD ["yarn", "migration:run"]
