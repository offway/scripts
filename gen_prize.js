var mysql = require("mysql");
var async = require("async");
const uuidv1 = require("uuid/v1");
const uniqueRandom = require("unique-random");
const random = uniqueRandom(10000000, 99999999);
var connection = mysql.createConnection({
    host: "rm-uf6bdv92a95017474oo.mysql.rds.aliyuncs.com",
    user: "puhao",
    password: "Puhao2018",
    database: "phweb"
});

var dict = {
    "喵咪便签本": {
        count: 300
    },
    "特步黑曜球鞋 43码": {
        count: 3
    },
    "特步黑曜球鞋 44码": {
        count: 1
    },
    "雅漾免洗洁面乳": {
        count: 10
    },
    "5元无门槛优惠券": {
        count: 60,
        id: 134
    },
    "满199-20优惠券": {
        count: 90,
        id: 135
    },
    "满399-40优惠券": {
        count: 60,
        id: 136
    },
    "满699-70优惠券": {
        count: 60,
        id: 137
    },
    "满999-100优惠券": {
        count: 30,
        id: 138
    }
};

async.series(
    [
        function (callback) {
            connection.connect();
            callback();
        },
        function (callback) {
            async.eachSeries(
                Object.keys(dict),
                function (key, next) {
                    var obj = dict[key];
                    async.timesSeries(
                        obj["count"],
                        function (i, timeCb) {
                            var voucher_project_id = obj.hasOwnProperty("id")
                                ? obj["id"]
                                : null;
                            connection.query(
                                "insert into ph_labor_prize(type,name,voucher_project_id,create_time,status,version,remark) values (?,?,?,?,?,?,?)",
                                ["0", key, voucher_project_id, new Date(), "0", "2", random()],
                                function (error, a, b) {
                                    timeCb(error);
                                }
                            );
                        },
                        next
                    );
                },
                function () {
                    callback();
                }
            );
        },
        function (callback) {
            connection.end();
            callback();
        }
    ],
    function (err, res) {
        console.log("END");
    }
);
