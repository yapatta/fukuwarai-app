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
  db.createTable('project', {
	  id: {type: 'int(121)', primaryKey: true, autoIncrement: true },
	maker_id: 'int(121)',
    type: 'string',
	explanation: 'string',
  })
	.then(
		function(result) {
			db.createTable('part', {
				id: { type: 'int(121)', primaryKey: true, autoIncrement: true},
				name: 'string',
        		project_id: 'int(121)',
				participant_id: 'int(121)',
				picture: 'string',
			});
		}
	);
  return null;
};

exports.down = function(db) {
  db.dropTable('project')
	.then(
      function(result) {
        db.dropTable('part');
      },
     );
  return null;
};

exports._meta = {
  "version": 1
};
