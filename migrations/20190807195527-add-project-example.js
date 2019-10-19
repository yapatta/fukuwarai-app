'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  db.insert('project', ['maker_id', 'type'], [12, 'sazae']);
  return null;
};

exports.down = function(db) {
  //db.delete('project', ['maker_id', 'type'], [12, 'sazae'], callback);
  return null;
};

exports._meta = {
  "version": 1
};
