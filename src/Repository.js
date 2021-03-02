import DataTypes from './DataTypes'
import DatabaseLayer from './DatabaseLayer'

export default class Repository {
  constructor(database, tableName, columnMapping) {
    this.columnMapping = columnMapping
    this.databaseLayer = new DatabaseLayer(database, tableName, columnMapping)
  }

  createTable() {
    return this.databaseLayer.createTable()
  }

  dropTable() {
    return this.databaseLayer.dropTable()
  }

  insert(_obj) {
    const obj = DataTypes.toDatabaseValue(this.columnMapping, this._sanitize(_obj))
    return this.databaseLayer.insert(obj).then(res => DataTypes.toModelValue(this.columnMapping, res))
  }

  // Returns Promise to be resolved as success or failed.
  insertOrUpdateBulk(_objs) {
    const objs = _objs.map(_obj => DataTypes.toDatabaseValue(this.columnMapping, this._sanitize(_obj)))
    return this.databaseLayer.bulkInsertOrReplace(objs)
  }

  update(_obj) {
    const obj = DataTypes.toDatabaseValue(this.columnMapping, this._sanitize(_obj))
    return this.databaseLayer.update(obj)
  }

  destroy(id) {
    return this.databaseLayer.destroy(id)
  }

  destroyAll() {
    return this.databaseLayer.destroyAll()
  }

  find(id) {
    return this.databaseLayer.find(id).then(res => (res ? DataTypes.toModelValue(this.columnMapping, res) : null))
  }

  findBy(where = {}) {
    return this.databaseLayer.findBy(where).then(res => (res ? DataTypes.toModelValue(this.columnMapping, res) : null))
  }

  query(options = {}) {
    return this.databaseLayer.query(options).then(res => res.map(p => DataTypes.toModelValue(this.columnMapping, p)))
  }

  executeSql(rawSql) {
    return this.databaseLayer.executeSql(rawSql)
  }

  _sanitize(obj) {
    const allowedKeys = Object.keys(this.columnMapping)
    return Object.keys(obj).reduce((ret, key) => {
      return allowedKeys.includes(key) ? { ...ret, [key]: obj[key] } : ret
    }, {})
  }
}
