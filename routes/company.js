var express = require("express");
var router = express.Router();
var sendmail = require("./../mail.js");
var exe = require("./../connection.js");
const session = require("express-session");





router.get("/",async(req,res)=>{
    var sql = `select * from company where id=?`
    var result = await exe(sql,[req.session.comp_id]);
    var jobs = await exe('select *,(select count(*) from job_applications where jobs.job_id=job_applications.job_id and comp_id=?) as application_count from jobs where comp_id',[req.session.comp_id,req.session.comp_id])
    var sql2 = `select 
                    (select count(*) from job_applications where comp_id=?) as total_applications,
                    (select count(*) from job_applications where stage='Shortlisted' and comp_id=?) shortlisted_count,
                    (select count(*) from jobs where comp_id=? and status='Active') as active_jobs_count ;
                     `
    var count = await exe(sql2,[req.session.comp_id,req.session.comp_id,req.session.comp_id])
    var sql3 = `select emp_name,current_designation,stage from employees,job_applications where job_applications.employee_id=employees.emp_id and comp_id=? order by job_applications.created_at desc limit 3` 
    var letest_application = await exe(sql3,[req.session.comp_id])
    res.render("company/home.ejs",{result,jobs,count,letest_application})
    // res.send(letest_application)
    
});
router.get("/post_job",async(req,res)=>{
    var sql = `select * from company where id=?`
    var result = await exe(sql,[req.session.comp_id]);
    res.render("company/post_job.ejs",{result});
})
router.post("/save_job",async(req,res)=>{
    var d = req.body
    var sql = `insert into jobs(comp_id,job_title,details,job_type,experience_min,experience_max,skill_require,vacancies,reference_link)value(?,?,?,?,?,?,?,?,?)`
    var result = await exe(sql,[req.session.comp_id,d.title,d.discription,d.job_type,d.experience_min,d.experience_max,d.skills,d.vacancies,d.refference_link]);
    res.redirect("/company")
})
router.get("/manage_job",async(req,res)=>{
    var sql = `select * ,
      (select count(*) from job_applications where comp_id=? and job_applications.job_id=jobs.job_id) as applications_count
    from jobs where comp_id = ?`
    var result = await exe(sql,[req.session.comp_id,req.session.comp_id])

    res.render("company/manage_jobs.ejs",{result});
})

router.get("/applications/:job_id",async(req,res)=>{
    var sql = `select * from job_applications,employees where job_id=? and job_applications.employee_id=employees.emp_id`
    var data = await exe(sql,[req.params.job_id])
    res.render("company/job_applications.ejs",{data})
})

router.get("/shortlist/:id",async(req,res)=>{
    var sql = `update job_applications set stage ='shortlisted' where application_id = ?`
    var result = await exe(sql,[req.params.id])
    var mail = await exe("select emp_email from employees,job_applications where job_applications.employee_id=employees.emp_id and job_applications.application_id=?",[req.params.id]);
    await sendmail(mail[0].emp_email,"Congratulations Your Resume is ShortListed For Job")
    res.send("<script> location.href = document.referrer </script>");
})

router.get("/reject/:id",async(req,res)=>{
    var sql = `update job_applications set stage ='rejected' where application_id = ?`
    var result = await exe(sql,[req.params.id])
     var mail = await exe("select emp_email from employees,job_applications where job_applications.employee_id=employees.emp_id and job_applications.application_id=?",[req.params.id]);
    sendmail(mail[0].emp_email,"Sorry For This Your  Resume is Rejected For Job")
    res.send("<script> location.href = document.referrer </script>");

})

router.get("/inactive/:job_id",async(req,res)=>{
    var sql = `update jobs set status='Inactive' where job_id=?`
    var result = await exe(sql,[req.params.job_id]);
    res.send(result)
})


router.get("/closed/:job_id",async(req,res)=>{
    var sql = `update jobs set status='Closed' where job_id=?`
    var result = await exe(sql,[req.params.job_id]);
    res.send(result)
})


router.get("/profile",async (req,res)=>{
     var sql = ` select * from company where id = ? `
     var data = await exe(sql,[req.session.comp_id])
     var jobs = await exe("select * from jobs where comp_id=? and status!='Closed'",[req.session.comp_id])
     var sql2 = ` select (select count(*) from job_applications where comp_id=?) as application_count ,(select count(*) from job_applications where comp_id=? and stage='shortlisted') as shortlisted_count `
    var count = await exe(sql2,[req.session.comp_id,req.session.comp_id])
     res.render("company/profile.ejs",{data,jobs,count});
    // res.send(jobs)
})

router.post("/update_profile_photo",async(req,res)=>{


    // res.send(req.body)
    if(req.body.logo)
    {  req.files.profile_photo.mv("public/logo/"+req.body.logo)
       res.send("<script> location.href = document.referrer </script>")
    // res.send("already photo")
    }else{
    
    // res.send("no profile")
    var filename = Date.now()+".jpg"
       var sql = `update company set logo=? where id=?`
       var result = await exe(sql,[filename,req.session.comp_id])
       req.files.profile_photo.mv("public/logo/"+filename)
       res.send("<script> location.href = document.referrer </script>")
    }   

})

router.get("/edit_profile",async(req,res)=>{
    var sql =  ` select * from company where id=?`
    var company = await exe(sql,[req.session.comp_id])
    res.render("company/update_profile.ejs",{company})
})


router.post("/save_profile",async(req,res)=>{
    var d=req.body;
    var sql = `update company set company_name=?,location=?,hr_mobile=? , hr_email=? , company_type=? , industry =? , hr_name=? , hr_designation = ? , about_company=? ,website_url=? where id=?`
    var result = await exe(sql,[d.company_name,d.address,d.mobile,d.email,d.company_type,d.industry,d.hr_name,d.hr_designation,d.description,d.website,req.session.comp_id])
    res.send("<script> location.href = document.referrer </script>")
    // res.send(result)
})

router.get("/all_applications",async (req,res)=>{
    var sql = `select emp_name,emp_email,emp_mobile,stage,application_id,resume_file,job_applications.job_id  from job_applications,employees where comp_id=? and job_applications.employee_id=employees.emp_id  ;`
    var emp = await exe(sql,[req.session.comp_id]);

    var sql2 = ` select job_id,job_title from jobs where comp_id=?`
    var jobs = await exe(sql2,[req.session.comp_id])
     res.render("company/all_applications.ejs",{emp,jobs})
    // res.send(emp)
}) 

router.get("/logout",(req,res)=>{
     req.session.destroy();
     res.redirect("/")
})

module.exports = router ;