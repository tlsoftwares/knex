// MSSQL Client
// -------
var inherits       = require('inherits')
var assign         = require('lodash/object/assign')

var Client         = require('../../client')
var Promise        = require('../../promise')

// Always initialize with the "QueryBuilder" and "QueryCompiler"
// objects, which extend the base 'lib/query/builder' and
// 'lib/query/compiler', respectively.
function Client_MSSQL(config) {
  Client.call(this, config);
}
inherits(Client_MSSQL, Client);

assign(Client_MSSQL.prototype, {

  dialect: 'mssql',

  driverName: 'tedious',

  _driver: function() {
    return require('tedious')
  },
  
  acquireRawConnection: function() {
    var client     = this
    console.log(this.connectionSettings);
    var connection = new this.driver.Connection(this.connectionSettings)
    return new Promise(function(resolver, rejecter) {
      connection.on('connect', function(err) {
        if (err) return rejecter(err)
        connection.on('error', connectionErrorHandler.bind(null, client, connection))
        connection.on('end', connectionErrorHandler.bind(null, client, connection))
        resolver(connection)
      });
    });
  }
})

// MSSQL Specific error handler
function connectionErrorHandler(client, connection, err) {
  if (connection && err && err.fatal) {
    if (connection.__knex__disposed) return
    connection.__knex__disposed = true
    client.pool.destroy(connection)
  }
}

module.exports = Client_MSSQL