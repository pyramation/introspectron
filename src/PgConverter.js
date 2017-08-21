import PgCatalog from './PgCatalog';

export default class PgConverter extends PgCatalog {
  getTypeName(type) {
    return type.namespaceName === 'pg_catalog'
      ? type.name
      : `${type.namespaceName}/${type.name}`;
  }

  getAttr(attr) {
    var type = this.getType(attr.typeId);
    var { kind, classId, typeId, num, isNotNull, hasDefault, ...rest } = attr;
    if (type.arrayItemTypeId) {
      var itemType = this.getType(type.arrayItemTypeId);
      return Object.assign(rest, {
        type: 'array',
        items: {
          type: this.getTypeName(itemType)
        }
      });
    } else {
      return Object.assign(rest, {
        type: this.getTypeName(type)
      });
    }
  }

  toTables() {
    return this.getTables().reduce((m, v) => {
      m[`${v.namespaceName}/${v.name}`] = {
        type: 'object',
        description: v.description,
        properties: this.getAttributes(v.id)
          .map(attr => this.getAttr(attr))
          .reduce((m, { name, ...attr }) => {
            m[name] = attr;
            return m;
          }, {}),
        required: this.getAttributes(v.id)
          .filter(attr => attr.isNotNull)
          .map(attr => this.getAttr(attr).name)
      };
      return m;
    }, {});
  }

  toProcs() {
    return this.getProcedures().reduce((m, v) => {
      m[`${v.namespaceName}/${v.name}`] = {
        description: v.description,
        type: 'object',
        properties: v.argTypeIds.reduce((m, argTypeId, i) => {
          var type = this.getType(argTypeId);
          m[v.argNames[i]] = {
            type: this.getTypeName(type)
          };
          return m;
        }, {}),
        required: v.argNames
      };
      return m;
    }, {});
  }
}
