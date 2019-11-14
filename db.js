var mysql      = require('mysql');
var async      = require('async');
var connection = mysql.createConnection({
  host     : 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
  user     : 'puhao',
  password : 'Puhao2018',
  database : 'phweb'
});

async.series([function(callback){
	connection.connect();
	callback();
},function(callback){
	connection.query('SELECT * FROM ph_goods where price <= 20', function (error, results, fields) {
		if(error){
			console.log(error);
			callback(error);
		}else{
			async.eachSeries(results,function(item,next){
				var id = item["id"];
				console.log(id);
				var tag = item["tag"];
				//console.log(tag);
				//console.log(tag.toString('hex'));
				console.log(tag.readInt8());
				//0100 & 0100
				var isSpecial = tag.readInt8() & 1 << 2;
				console.log(isSpecial);
				if(isSpecial === 0){
					async.series([function(cb){
						connection.query('insert into ph_goods_special(goods_id) values (?)',[id], function (error, a, b) {
							cb(error);
						});
					},function(cb){
						var newTag = tag.readInt8() | 1 << 2;
						connection.query('update ph_goods set tag = ? where id = ? ',[newTag,id], function (error, a, b) {
							cb(error);
						});
					}],function(err,res){
						next(err);
						console.log("OK",err,res);
					});
				}else{
					next();
				}
			},function(){
				callback();
			});
		}
	});
},function(callback){
	connection.end();
	callback();
}],function(err,res){
	console.log("END");
}); 