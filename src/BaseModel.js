import Repository from './Repository'
import DataTypes from './DataTypes'

const isFunction = p =>
  Object.prototype.toString.call(p) === '[object Function]'

export default class BaseModel {
  constructor(obj = {}) {
    this.setProperties(obj)
  }

  setProperties(props) {
    const cm = this.constructor.columnMapping
    Object.keys(cm).forEach(k => {
      if (props[k] !== undefined) {
        this[k] = DataTypes.propertyToModelValue(cm[k].type, props[k]);
      } else if (isFunction(cm[k].default)) {
        this[k] = cm[k].default()
      } else {
        this[k] = null
      }
    })
    return this
  }

  static get database() {
    throw new Error('Database not defined')
  }

  static get repository() {
    return new Repository(this.database, this.tableName, this.columnMapping)
  }

  static get tableName() {
    throw new Error('tableName not defined')
  }

  static get columnMapping() {
    return {}
  }

  static createTable() {
    return this.repository.createTable()
  }

  static dropTable() {
    return this.repository.dropTable()
  }

  static create(obj) {
    return this.repository.insert(obj).then(res => new this(res))
  }

  static createBulk(objs) {
    return this.repository.insertOrUpdateBulk(objs)
  }

  static update(obj) {
    return this.repository.update(obj).then(res => new this(res))
  }

  update(props) {
    this.setProperties(props);
  }

  save() {
    if (this.id) {
      return this.constructor.repository
        .update(this)
        .then(res => this.setProperties(res))
    } else {
      return this.constructor.repository
        .insert(this)
        .then(res => this.setProperties(res))
    }
  }

  destroy() {
    return this.constructor.repository.destroy(this.id)
  }

  static destroy(id) {
    return this.repository.destroy(id)
  }

  static destroyAll() {
    return this.repository.destroyAll()
  }

  static find(id) {
    return this.repository.find(id).then(res => (res ? new this(res) : res))
  }

  static findBy(where) {
    return this.repository
      .findBy(where)
      .then(res => (res ? new this(res) : res))
  }

  static findOrCreateBy(where, otherProps = {}) {
    return new Promise((resolve, reject) => {
      this.findBy(where)
        .then(res => {
          if (res) {
            resolve(res)
          } else {
            this.create(new this(Object.assign(where, otherProps))).then(resolve).catch(reject)
          }
        })
        .catch(reject)
    })
  }

  static all() {
    return this.query({ columns: '*' })
  }

  static executeSql(rawSql) {
    return this.repository.executeSql(rawSql)
  }

  /**
   * @param {columns: '*', page: 1, limit: 30, where: {}, order: 'id DESC'} options
   */
  static query(options) {
    return this.repository.query(options).then(rows => (rows ? rows.map(res => new this(res)) : []))
  }
}
