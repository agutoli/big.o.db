const DynamoDB = require('aws-sdk/clients/dynamodb') ;

class HashID extends String {
  constructor(a) { super(a) }
}

class Enum extends Array {
  constructor(a) { super(a) }
}

/**
 * Data types
 */
const DataTypes = {
  Enum: () => Enum,
  String: () => String,
  Boolean: () => Boolean,
  HashID: () => HashID,
}

class Relation {}

const Relations = {
  has: {
    One: (model, opts) => {
      function One() {
        this.require = true;
      }

      Object.defineProperty(One.prototype, "__type__", {
        get: function() {
          return new Relation();
        }
      });

      Object.defineProperty(One, 'name', { writable: true });
      One.name = `has.One(${model.name})`
      const value = new One();

      Object.defineProperty(value, "get", {
        get: function() {
          return model.findOne.bind(model, { ID: 'my-id' });
        }
      });

      return value;
    },
    Many: (model, opts) => {
      function Many() {
        this.require = true;
      }

      Object.defineProperty(Many.prototype, "__type__", {
        get: function() {
          return new Relation();
        }
      });

      Object.defineProperty(Many, 'name', { writable: true });
      Many.name = `has.Many(${model.name})`

      const value = new Many();

      Object.defineProperty(value, "all", {
        get: function() {
          return model.all.bind(model, { ID: 'my-id' });
        }
      });

      return value;
    }
  }
}

class Table {
  constructor({ name, opts }) {
    this.name = name;
    this.documentClient = new DynamoDB.DocumentClient({
      region: 'us-east-1'
    });
  }

  scan() {
    return this.documentClient.scan({
      TableName: this.name
    }).promise().then(x => x.Items);
  }

  get(value) {
    return this.documentClient.get({
      TableName: this.name,
      Key: {
        Node: '#ck96qgay80000i0egtpkcr5jh',
        Type: 'Published'
      }
    }).promise().then(x => x.Item);
  }
}

class List extends Array {
  constructor(data) {
    super(...data)
  }
  debug() {
    // for (let key of this) {
    //   console.log(key);
    // }
  }
}

class QuerySet {
  constructor(data) {
    Object.assign(this, { ...data })
  }

  static record(ctx, dataItem) {
    function DataItem() {};
    Object.defineProperty(DataItem, 'name', { writable: true });
    DataItem.name = ctx.name;

    const dataRecord = Object.assign(new DataItem(), { ...dataItem });

    for (let property in ctx.schema) {
      if (ctx.schema[property].__type__ instanceof Relation) {
        dataRecord[property] = ctx.schema[property];
      }
    }

    return dataRecord;
  }

  static recordList(ctx, dataList) {
    return new List(dataList.map(x => QuerySet.record(ctx, x)));
  }
}

/**
 * Model
 */
class Model {
  constructor({ name, schema, opts }) {
    this.name = name;
    this.opts = opts;
    this.schema = schema;
  }

  async all() {
    return this.opts.table.scan()
      .then(items => QuerySet.recordList(this, items))
      .catch(err => console.log(err))
  }

  async filter(params) {
    return this.opts.table.scan()
      .then(items => QuerySet.recordList(this, items))
      .catch(err => console.log(err))
  }

  async create(data) {
    // console.log(this.constructor.name, 'data: ', data);
    return Promise.resolve();
  }

  async bulkCreate() {
    return Promise.resolve();
  }

  async findOne(key) {
    return this.opts.table.get(key)
      .then(item => QuerySet.record(this, item))
      .catch(err => console.log(err))
  }
}

module.exports = {
  ...DataTypes,
  ...Relations,
  Table: (name) => new Table({ name }),
  Model: (name, schema, opts) => new Model({ name, schema, opts }),
}
