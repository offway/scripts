var mysql = require('mysql');
var async = require('async');
var connection = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phweb'
});

var csv = "";
async.series([function (callback) {
    connection.connect();
    callback();
}, function (callback) {
    connection.query('SELECT * FROM ph_limited_sale_op where limited_sale_id in (40,41,42) order by limited_sale_id,user_id', function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            async.eachSeries(results, function (item, next) {
                var str = "";
                var user_id = item["user_id"];
                var limited_sale_id = item["limited_sale_id"];
                var boost_user_id = item["boost_user_id"];
                console.log(user_id);
                console.log(limited_sale_id);
                console.log(boost_user_id);
                async.series([
                    function (cbb) {
                        connection.query('SELECT * FROM ph_user_info where id = ' + user_id, function (error, results, fields) {
                            str += user_id + ",";
                            if (error) {
                                str += "未知" + ",";
                            } else {
                                str += results[0]["phone"] + ",";
                            }
                            cbb(error);
                        });
                    },
                    function (cbb) {
                        connection.query('SELECT * FROM ph_limited_sale where id = ' + limited_sale_id, function (error, results, fields) {
                            if (error) {
                                str += "未知" + ",";
                            } else {
                                str += results[0]["name"] + ",";
                            }
                            cbb(error);
                        });
                    },
                    function (cbb) {
                        connection.query('SELECT * FROM ph_user_info where id = ' + boost_user_id, function (error, results, fields) {
                            str += boost_user_id + ",";
                            if (error) {
                                str += "未知";
                            } else {
                                str += results[0]["phone"];
                            }
                            cbb(error);
                        });
                    }
                ], function (err, res) {
                    csv += str + '\r\n';
                    next();
                });
            }, function () {
                callback();
            });
        }
    });
}, function (callback) {
    connection.end();
    callback();
}], function (err, res) {
    console.log(csv);
    console.log("END");
});
