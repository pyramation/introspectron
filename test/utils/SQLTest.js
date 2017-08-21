const pgp = require('pg-promise')({});
const v4 = require('uuid/v4');

if (typeof process.env.GRAPHQL_USER === 'undefined') {
  require('dotenv').load();
}

import { createDb, dropDb, createSchema } from './db';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const config = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  port: process.env.POSTGRES_PORT,
  host: process.env.POSTGRES_HOST
};
export const getConnection = async () => {
  const dbName = `testingdb-${v4()}`;
  const connection = Object.assign(
    {
      database: dbName
    },
    config
  );
  await createDb(dbName);
  await createSchema(dbName);
  const cn = await pgp(connection);
  const db = await cn.connect();
  return db;
};

export const connect = async (dbName, role) => {
  const connection = Object.assign(
    {
      database: dbName,
      user: role,
      password: ''
    },
    config
  );
  const cn = await pgp(connection);
  const db = await cn.connect();
  return db;
};

export const closeConnection = async db => {
  const dbName = db.client.database;
  db.done();
  db.client.end();
  await dropDb(dbName);
};

export const close = db => {
  const dbName = db.client.database;
  db.done();
  db.client.end();
};
