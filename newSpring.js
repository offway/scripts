var redis = require('redis');
var async = require('async');
var mysql = require('mysql');
var fs = require('fs');

var connection = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phweb'
});

var client = redis.createClient();

client.on('connect', function () {
    console.log('connected');
});

client.on('error', function (err) {
    console.log('Error ' + err);
});

var keyList;
var csv = '';
async.series([function (callback) {
    client.auth('baidu@001');
    connection.connect();
    callback();
}, function (callback) {
    client.keys('NewSpring_REWARD_LIST_*', function (err, res) {
        console.log(err);
        //console.log(res);
        keyList = res;
        callback();
    });
}, function (callback) {
    async.eachSeries(keyList, function (key, next) {
        console.log(key);
        var uid = key.split('_')[3];
        client.lrange(key, 0, 100, function (err, res) {
            console.log(err);
            //console.log(res);
            var index = 0;
            async.eachSeries(res, function (it, innerNext) {
                var addr;
                async.series([
                    function (cbb) {
                        connection.query('SELECT * FROM ph_address where user_id =' + uid + ' limit 1', function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(results);
                                addr = results;
                            }
                            cbb(error);
                        });
                    },
                    function (cbb) {
                        connection.query('SELECT * FROM ph_user_info where id =' + uid + ' limit 1', function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(results);
                                var str = uid + ',';
                                if (results.length != 0) {
                                    str += results[0]['nickname'] + ',';
                                    str += it + ",";
                                    // str += results[0]['province'] + results[0]['city'] + results[0]['county'] + results[0]['content'];
                                } else {
                                    str += '未知,';
                                    str += it + ",";
                                    // str += '未知';
                                    // str += '未知';
                                }
                                if (addr && addr.length != 0) {
                                    str += addr[0]['province'] + addr[0]['city'] + addr[0]['county'] + addr[0]['content'];
                                } else {
                                    str += '未知';
                                }
                                // console.log(index);
                                console.log(str);
                                csv += str + '\r\n';
                            }
                            index++;
                            cbb(error);
                        });
                    }
                ], innerNext);
            }, function (err, res) {
                next();
            });
        });
    }, function () {
        connection.end();
        callback();
    });
}], function (err, res) {
    // console.log(csv);
    fs.writeFile('newSpring.csv', csv, 'utf8', function (err, res) {
        console.log('END');
    });
});
