// TODO: add JSON BLOB support
export const customTypes = { JSON: 'TEXT' }

/* Creates a string with the columns to create a table like:
 *  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER
 */
export function _createTableColumns(columnMapping) {
  return Object.entries(columnMapping)
    .map(i => {
      const type = i[1].type
      const parts = [i[0], customTypes[type] || type]
      if (i[1].primary_key) {
        parts.push('NOT NULL PRIMARY KEY AUTOINCREMENT')
      } else {
        if (i[1].unique) parts.push('UNIQUE')
        if (i[1].not_null) parts.push('NOT NULL')
      }
      return parts.join(' ')
    })
    .join(', ')
}

// Creates the "CREATE TABLE" sql statement
export function createTable(tableName, columnMapping) {
  const columns = _createTableColumns(columnMapping)
  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`
}

// Creates the "ALTER TABLE" sql statement
//
// The process described here
// -- disable foreign key constraint check
// PRAGMA foreign_keys=off;

// -- start a transaction
// BEGIN TRANSACTION;

// -- Here you can drop column
// CREATE TABLE IF NOT EXISTS new_table(
//    column_definition,
//    ...
// );
// -- copy data from the table to the new_table
// INSERT INTO new_table(column_list)
// SELECT column_list
// FROM table;

// -- drop the table
// DROP TABLE table;

// -- rename the new_table to the table
// ALTER TABLE new_table RENAME TO table;

// -- commit the transaction
// COMMIT;

// -- enable foreign key constraint check
// PRAGMA foreign_keys=on;

// export function updateTableSchema(tableName, columnMapping, oldColumns) {
//   let sqls = []
//   // disable foreign key constraint check
//   sqls.push('PRAGMA foreign_keys=off;');
//   // Start a transaction
//   sqls.push('BEGIN TRANSACTION;');
//   // Create temp table with new schema
//   sqls.push(createTable(`new_${tableName}`, columnMapping));
//   // Copy data from the table to the new_table
//   // let oldColumns = Loan.executeSql('pragma table_info(loans);').then(({ rows }) => console.log(rows.map(row => row.name)));

//   return `ALTER TABLE ADD COLUMNS ${tableName} (${columns});`
// }

// Creates the "DROP TABLE" sql statement
export function dropTable(tableName) {
  return `DROP TABLE IF EXISTS ${tableName};`
}

export default { createTable, dropTable, updateTableSchema }
