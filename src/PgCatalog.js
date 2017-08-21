/**
 * A utility class for interacting with the `PgCatalogObject`s returned from the
 * introspection query.
 */
export default class PgCatalog {
  constructor(objects) {
    this._namespaces = new Map();
    this._classes = new Map();
    this._attributes = new Map();
    this._types = new Map();
    this._constraints = new Set();
    this._procedures = new Set();
    // Build an in-memory index of all our objects for ease of use:
    for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
      var object = objects_1[_i];
      switch (object.kind) {
        case 'namespace':
          this._namespaces.set(object.id, object);
          break;
        case 'class':
          this._classes.set(object.id, object);
          break;
        case 'attribute':
          this._attributes.set(object.classId + '-' + object.num, object);
          break;
        case 'type':
          this._types.set(object.id, object);
          break;
        case 'constraint':
          this._constraints.add(object);
          break;
        case 'procedure':
          this._procedures.add(object);
          break;
        default:
          throw new Error(
            "Object of kind '" + object['kind'] + "' is not allowed."
          );
      }
    }
  }
  /**
     * Gets all of the namespace objects.
     */
  getNamespaces() {
    return Array.from(this._namespaces.values());
  }
  /**
     * Gets a single namespace object of the provided id.
     */
  getNamespace(id) {
    return this._namespaces.get(id);
  }
  /**
     * Gets a single namespace object by the provided id, and if no namespace
     * object exists an error is thrown instead of returning `undefined`.
     */
  assertGetNamespace(id) {
    var namespace = this.getNamespace(id);
    if (!namespace) throw new Error('No namespace was found with id ' + id);
    return namespace;
  }
  /**
     * Gets a namespace by its name. Helpful in tests where we know the name, but
     * not the id it has been assigned, and it is helpful for user input.
     */
  getNamespaceByName(namespaceName) {
    return this.getNamespaces().find(function(namespace) {
      return namespace.name === namespaceName;
    });
  }
  /**
     * Gets all of the tables.
     */
  getTables() {
    return this.getClasses().filter(c => {
      return (
        c.isSelectable === true &&
        c.isInsertable === true &&
        c.isUpdatable === true &&
        c.isDeletable === true
      );
    });
  }
  /**
     * Gets all of the class objects.
     */
  getClasses() {
    return Array.from(this._classes.values());
  }
  /**
     * Gets a single class object of the provided id.
     */
  getClass(id) {
    return this._classes.get(id);
  }
  /**
     * Gets a single class object by the provided id, and if no class object
     * exists an error is thrown instead of returning `undefined`.
     */
  assertGetClass(id) {
    var clazz = this.getClass(id);
    if (!clazz) throw new Error('No class was found with id ' + id);
    return clazz;
  }
  /**
     * Gets a class by its name, also use the namespace name to ensure
     * there are no naming collisions. Helpful in tests where we know the name,
     * but not the id it has been assigned, and it is helpful for user input.
     */
  getClassByName(namespaceName, className) {
    var namespace = this.getNamespaceByName(namespaceName);
    if (!namespace) return;
    return this.getClasses().find(function(klass) {
      return klass.namespaceId === namespace.id && klass.name === className;
    });
  }
  /**
     * Gets all of the attribute objects.
     */
  getAttributes() {
    return Array.from(this._attributes.values());
  }
  /**
     * Gets a single attribute object by the provided class id and number.
     */
  getAttribute(classId, num) {
    return this._attributes.get(classId + '-' + num);
  }
  /**
     * Gets a single attribute object by the provided class id and position
     * number. If no attribute object exists an error is thrown instead of
     * returning `undefined`.
     */
  assertGetAttribute(classId, num) {
    var attribute = this.getAttribute(classId, num);
    if (!attribute)
      throw new Error(
        'No attribute found for class ' + classId + ' in position ' + num
      );
    return attribute;
  }
  /**
     * Gets all of the attributes for a single class.
     *
     * If provided an array of `nums`, we will get only those attributes in the
     * enumerated order. Otherwise we get all attributes in the order of their
     * definition.
     */
  getClassAttributes(classId, nums) {
    var _this = this;
    // Currently if we get a `nums` array we use a completely different
    // implementation to preserve the `nums` order..
    if (nums)
      return nums.map(function(num) {
        return _this.assertGetAttribute(classId, num);
      });
    return Array.from(this._attributes.values()).filter(function(pgAttribute) {
      return pgAttribute.classId === classId;
    });
  }
  /**
     * Gets an attribute by its name and the name of the class and namespace it
     * is in. This is helpful in tests where we know the name of an attribute,
     * but not its `classId` or `num`.
     */
  getAttributeByName(namespaceName, className, attributeName) {
    var klass = this.getClassByName(namespaceName, className);
    if (!klass) return;
    return this.getAttributes().find(function(attribute) {
      return attribute.classId === klass.id && attribute.name === attributeName;
    });
  }
  /**
     * Gets all of the type objects.
     */
  getTypes() {
    return Array.from(this._types.values());
  }
  /**
     * Gets a single type object by the provided id.
     */
  getType(id) {
    return this._types.get(id);
  }
  /**
     * Determines if our instance has this *exact* `PgType` instance.
     */
  hasType(type) {
    return this._types.get(type.id) === type;
  }
  /**
     * Gets a single type object by the provided id, and if no type object
     * exists an error is thrown instead of returning `undefined`.
     */
  assertGetType(id) {
    var type = this.getType(id);
    if (!type) throw new Error('No type was found with id ' + id);
    return type;
  }
  /**
     * Gets a type by its name, also use the namespace name to ensure
     * there are no naming collisions. Helpful in tests where we know the name,
     * but not the id it has been assigned, and it is helpful for user input.
     */
  getTypeByName(namespaceName, typeName) {
    var namespace = this.getNamespaceByName(namespaceName);
    if (!namespace) return;
    return this.getTypes().find(function(type) {
      return type.namespaceId === namespace.id && type.name === typeName;
    });
  }
  /**
     * Gets all of the constraints found by our catalog.
     */
  getConstraints() {
    return Array.from(this._constraints);
  }
  /**
     * Returns all of the procedures in our catalog.
     */
  getProcedures() {
    return Array.from(this._procedures);
  }
  /**
     * Gets a procedure by its name, also use the namespace name to ensure
     * there are no naming collisions. Helpful in tests where we know the name,
     * but not the id it has been assigned, and it is helpful for user input.
     */
  getProcedureByName(namespaceName, procedureName) {
    var namespace = this.getNamespaceByName(namespaceName);
    if (!namespace) return;
    return this.getProcedures().find(function(procedure) {
      return (
        procedure.namespaceId === namespace.id &&
        procedure.name === procedureName
      );
    });
  }
}
