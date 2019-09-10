const promise = require("bluebird");
const options = {
  promiseLib: promise
};
const pgp = require("pg-promise")(options);
const connectionString = `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_SERVER}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;
const db = pgp(connectionString);

module.exports = db;
