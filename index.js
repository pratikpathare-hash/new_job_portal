var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session")
var fileupload = require("express-fileupload")

require("dotenv").config();
var app = express();



app.use(session({
    secret :"12wsdfj",
    resave : false,
    saveUninitialized : false
}))

function check_login(req, res, next) {
    if (req.session.comp_id) {
        next();
    } else {
        res.redirect("/");
    }
}

// only for company routes




app.use(express.static("public"));
app.use(fileupload())


app.use(bodyparser.urlencoded({extended : true}))

var admin = require("./routes/admin.js");
var comman = require("./routes/comman.js");
var employee = require("./routes/employee.js");
var company = require("./routes/company.js");


app.use("/",comman);
app.use("/company",company);
app.use("/employee",employee);
app.use("/admin",admin);

app.listen(process.env.PORT);