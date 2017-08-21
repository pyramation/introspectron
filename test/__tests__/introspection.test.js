import { getConnection, closeConnection } from '../utils/SQLTest';

import introspect from '../../src/introspect';

let db;
let catalog;

describe('introspect', () => {
  beforeAll(async () => {
    db = await getConnection();
    catalog = await introspect(db, ['test_schema']);
  });
  afterAll(async () => {
    await closeConnection(db);
  });
  describe('converts to JSON schema', () => {
    it('tables', async () => {
      var output = catalog.toTables();
      expect(output).toMatchSnapshot();
    });
    it('procedures', async () => {
      var output = catalog.toProcs();
      expect(output).toMatchSnapshot();
    });
  });
});
