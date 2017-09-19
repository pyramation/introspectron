import { getConnection, closeConnection } from '../utils/SQLTest';

import introspect from '../../src/introspect';
import PgToSchemaJson from '../../src/PgToSchemaJson';

let db;
let json;
let objects;

describe('introspect', () => {
  beforeAll(async () => {
    db = await getConnection();
    objects = await introspect(db, ['test_schema']);
    json = new PgToSchemaJson(objects);
  });
  afterAll(async () => {
    await closeConnection(db);
  });
  describe('converts to JSON schema', () => {
    it('tables', async () => {
      var output = json.toTables();
      expect(output).toMatchSnapshot();
    });
    it('procedures', async () => {
      var output = json.toProcs();
      expect(output).toMatchSnapshot();
    });
  });
});
