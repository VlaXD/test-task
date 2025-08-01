const user = process?.env?.MONGO_USER || "admin";
const password = process?.env?.MONGO_PASSWORD || "password";
const host = process?.env?.MONGO_HOST || "localhost";
const port = process?.env?.MONGO_PORT || "27017";
const db = process?.env?.MONGO_DB || "users";
const url = `mongodb://${user}:${password}@${host}:${port}/${db}`;

const config = {
  mongodb: {
    url,
  },
  migrationsDir: "migrations",
  changelogCollectionName: "migration_history",
  migrationFileExtension: ".ts",
  useFileHash: false,
  moduleSystem: "commonjs",
};

module.exports = config;
