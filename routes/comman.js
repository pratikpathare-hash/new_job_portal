var express = require("express");
var router = express.Router();
var exe = require("./../connection.js")

router.get("/",(req,res)=>{
     res.render("comman/home.ejs")
})

router.get("/login",(req,res)=>{
    res.render("comman/employee_login.ejs");
})

router.get("/register",(req,res)=>{
    res.render("comman/register_employee.ejs");
})
router.get("/register_company",(req,res)=>{
    res.render("comman/register_company.ejs")
})
router.get("/login_company",(req,res)=>{
    res.render("comman/login_company.ejs");
})
router.post("/save_employee",async(req,res)=>{
    var d = req.body;
    var sql = `insert into employees (emp_name,emp_email,emp_mobile,emp_password)value(?,?,?,?)`;
    var result = await exe(sql,[d.name,d.email,d.mobile,d.password]);
    res.redirect("/login")
})

router.post("/save_comp",async (req,res)=>{
    var d = req.body ;
    var sql = `insert into company(company_name,location,hr_name,hr_designation,hr_mobile,hr_email,hr_password)value(?,?,?,?,?,?,?)`
    var result = await exe(sql,[d.comp_name,d.location,d.hr_name,d.hr_designation,d.hr_mobile,d.hr_email,d.hr_password]);
   res.redirect("/login_comp")
})

router.post("/login_comp",async(req,res)=>{
    var d = req.body;
    var sql = `select * from company where hr_email=? and hr_password=? `;
    var result = await exe(sql,[d.email,d.password]);
     
     if(result.length > 0 )
     {
        req.session.comp_id =result[0].id;
       
        res.redirect("/company");

     }else{
        res.redirect("/login_company")
     }

})
router.post("/login_emp",async(req,res)=>{
    var sql = `select * from employees where emp_password=? and emp_email=?`;
    var result = await exe(sql,[req.body.password , req.body.email]);
    if(result.length >0)
    {
        req.session.emp_id=result[0].emp_id;
        res.redirect("/employee");
    }else{
        res.redirect("/login");
    }
})

module.exports = router;