var mysql = require('mysql');
var async = require('async');
var request = require('request');
var connectionOld = mysql.createConnection({
    host: 'rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com',
    user: 'puhao',
    password: 'Puhao2018',
    database: 'phweb'
});

async.series([function (callback) {
    connectionOld.connect();
    callback();
}, function (callback) {
    connectionOld.query("SELECT id FROM phweb.ph_user_info", function (error, results, fields) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            var a = 0;
            var b = 0;
            async.eachLimit(results, 1000, function (item, next) {
                // console.log(item);
                // via DB
                // var INSERT = "insert into ph_voucher_info select null,?,id,type,`name`,merchant_id,used_min_amount,amount,begin_time,end_time,'0',NOW(),NULL,merchant_name from ph_voucher_project where id = ?";
                var INSERT = "insert into ph_voucher_info select null,?,id,type,`name`,merchant_id,used_min_amount,amount,NOW(),DATE_ADD(NOW(),INTERVAL 14 DAY),'0',NOW(),NULL,merchant_name from ph_voucher_project where id = ?";
                connectionOld.query(INSERT, [item["id"], 151], function (error) {
                    if (error) {
                        console.log(error);
                    }
                    next(error);
                });
                // via API
                // var url = "https://zeus.offway.cn/voucher/giveByVpId?userId=AAAA&voucherProjectId=151".replace("AAAA", item["id"]);
                // request.post({url: url, form: {}}, function (error, response, body) {
                //     if (error) {
                //         a++;
                //         console.log(error);
                //         console.log(item);
                //     } else {
                //         b++;
                //         // console.log("OK");
                //     }
                //     next();
                // });
            }, function (err, res) {
                console.log("a is " + a);
                console.log("b is " + b);
                callback();
            });
        }
    });
}, function (callback) {
    callback();
}, function (callback) {
    callback();
}, function (callback) {
    callback();
}, function (callback) {
    connectionOld.end();
    callback();
}], function (err, res) {
    console.log("END");
});
