import { resolve as resolvePath } from 'path';
import PgConverter from './PgConverter';
import { readFile } from 'fs';

/**
 * The introspection query SQL string. We read this from it’s SQL file
 * synchronously at runtime. It’s just like requiring a file, except that file
 * is SQL.
 */
const introspectionQuery = new Promise((resolve, reject) => {
  readFile(resolvePath(__dirname, './introspect.sql'), (error, data) => {
    if (error) reject(error);
    else resolve(data.toString());
  });
});

/**
 * Takes a Postgres client and introspects it, returning an instance of
 * `PgObjects` which can then be consumed. Note that some translation is done
 * from the raw Postgres catalog to the friendlier `PgObjects` interface.
 */
export default async function introspect(client, schemas) {
  // Run our single introspection query in the database.
  const result = await client.query({
    name: 'introspectionQuery',
    text: await introspectionQuery,
    values: [schemas]
  });

  const objects = result.map(({ object }) => object);

  // Extract out the objects from the query.
  return new PgConverter(objects);
}
