import { promisify } from 'util';
import { exec } from 'child_process';
import { resolve as pathResolve } from 'path';

const asyncExec = promisify(exec);

if (typeof process.env.POSTGRES_USER === 'undefined') {
  require('dotenv').load();
}

export const dropDb = async dbname =>
  await asyncExec(
    `dropdb -U ${process.env.POSTGRES_USER} -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} ${dbname}`,
    {
      env: Object.assign(
        {
          PGPASSWORD: process.env.POSTGRES_PASS
        },
        process.env
      ),
      cwd: pathResolve(__dirname + '/../../')
    }
  );

export const createDb = async dbname =>
  await asyncExec(
    `createdb -U ${process.env.POSTGRES_USER} -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} ${dbname}`,
    {
      env: Object.assign(
        {
          PGPASSWORD: process.env.POSTGRES_PASS
        },
        process.env
      ),
      cwd: pathResolve(__dirname + '/../../')
    }
  );

export const createSchema = async dbname => {
  await asyncExec(`POSTGRES_DATABASE=${dbname} ./bin/provision`, {
    env: Object.assign(
      {
        PGPASSWORD: process.env.POSTGRES_PASS
      },
      process.env
    ),
    cwd: pathResolve(__dirname + '/../../')
  });
};
