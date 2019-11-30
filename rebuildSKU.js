var mysql = require('mysql');
var async = require('async');
var connectionOld = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phsr'
});

var connectionNew = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phfsr'
});

var INSERT = `INSERT INTO \`phfsr\`.\`ph_goods_property\`(\`goods_id\`,\`goods_stock_id\`,\`name\`,\`value\`,\`sort\`,\`create_time\`,\`remark\`)VALUES(?,?,?,?,?,?,?);`;

async.series([function (callback) {
    connectionOld.connect();
    connectionNew.connect();
    callback();
}, function (callback) {
    connectionNew.query('SELECT * FROM ph_goods_stock', function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            async.eachSeries(results, function (item, next) {
                async.series([function (cb) {
                    connectionNew.query(INSERT, [item["goods_id"], item["id"], '颜色', item["color"], 0, new Date(), "颜色_" + item["color"]], function (error, a, b) {
                        cb(error);
                    });
                }, function (cb) {
                    connectionNew.query(INSERT, [item["goods_id"], item["id"], '尺寸', item["size"], 1, new Date(), "尺寸_" + item["size"]], function (error, a, b) {
                        cb(error);
                    });
                }], function (err, res) {
                    next(err);
                    console.log("OK", err, res);
                });
            }, function () {
                callback();
            });
        }
    });
}, function (callback) {
    connectionOld.end();
    connectionNew.end();
    callback();
}], function (err, res) {
    console.log("END");
});
