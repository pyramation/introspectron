create schema test_schema;

CREATE TABLE test_schema.products (
    product_no integer UNIQUE NOT NULL,
    name text,
    price numeric,
    tags text[]
);

CREATE TABLE test_schema.example (
  a integer,
  b integer,
  c integer,
  PRIMARY KEY (a, c)
);

COMMENT ON TABLE test_schema.example is 'example table description';
COMMENT ON COLUMN test_schema.example.a is 'field a description';
COMMENT ON COLUMN test_schema.example.b is 'field b description';
COMMENT ON COLUMN test_schema.example.c is 'field c description';

CREATE FUNCTION test_schema.myfunc2 (_name text) RETURNS void
AS $$
UPDATE
    test_schema.products
SET
    name = _name
$$
LANGUAGE 'sql' VOLATILE;

COMMENT ON FUNCTION test_schema.myfunc2 (text) is 'description for function here';
