var express = require("express");
var router = express.Router();
var exe = require("./../connection.js")



const applyJobController= async(req,res)=>{
     var sql = `select * from employees where emp_id = ?`
     var data = await exe(sql,[req.session.emp_id])

      var sql2 = `select * from education where emp_id=?`
      var education = await exe(sql2,[req.session.emp_id]);

      if(req.path != "/applications")
      {
      var sql3 = `select
           * ,
            (select count(*) from job_applications where job_applications.job_id=jobs.job_id and job_applications.employee_id=?) as application_count ,
            (select count(*) from saved_jobs where saved_jobs.job_id=jobs.job_id and saved_jobs.emp_id=?)as saved_count

      from jobs,company where jobs.comp_id=company.id `
      var jobs = await exe(sql3,[req.session.emp_id,req.session.emp_id])
      }
       
       
      
       var sql4 = `select *
       from saved_jobs,jobs,company where saved_jobs.emp_id = ? and saved_jobs.job_id=jobs.job_id and jobs.comp_id=company.id`
      var saved_jobs = await exe(sql4,[req.session.emp_id])
     

      var application_count = await exe("select count(*) as count,sum(case when stage='shortlisted' then 1 else 0 end) as shortlist_count from job_applications where employee_id=? ",[req.session.emp_id]);


     if(req.path=="/applications")
     {
      var sql3= `select * from job_applications,jobs,company where job_applications.job_id = jobs.job_id and job_applications.employee_id=? and jobs.comp_id=company.id  `
      var applications = await exe(sql3,[req.session.emp_id])
     }

     var profile_complition = 0 ;
     if(data[0].emp_name)
     {
          profile_complition += 12.5 ;
     }
     if(data[0].emp_email)
     {
          profile_complition += 12.5 ;
     }
     if(data[0].emp_mobile)
     {
          profile_complition += 12.5 ;
     }
     if(data[0].skill_summary)
     {
          profile_complition += 12.5 ;
     }
     
     if(education.length > 0)
     {
          profile_complition += 50 ;
     }
    
     if(req.path=="/")
     {
          //  res.send(jobs)
            res.render("employee/home.ejs",{data,profile_complition,jobs,saved_jobs,application_count});
     }
     if(req.path=="/saved_jobs")
     {
          res.render("employee/saved_jobs.ejs",{data,profile_complition,jobs,saved_jobs,application_count})
          // res.send({data,profile_complition,jobs,saved_jobs})
     }
     if(req.path == "/applications")
     {
          res.render("employee/applications.ejs",{data,profile_complition,applications,saved_jobs,application_count})
     }
     
};





router.get("/", applyJobController);
router.get("/saved_jobs", applyJobController);
router.get("/applications", applyJobController);








router.get("/profile",async(req,res)=>{
     var sql = `select * from employees where emp_id= ?`
     var data = await exe(sql,[req.session.emp_id]);
     var sql1 = `select * from education where emp_id = ?`
     var education = await exe(sql1,[req.session.emp_id]);
     
      
     res.render("employee/profile.ejs",{data,education});
})

router.get("/add_education",(req,res)=>{
     res.render("employee/add_education.ejs")
})
router.post("/save_education",async(req,res)=>{
     var d= req.body;
      var sql = `insert into education(emp_id,course_title,univercity,passing_year,marks,status)value(?,?,?,?,?,?)`
     var result = await exe(sql,[req.session.emp_id,d.title,d.univercity,d.passing_year,d.marks,d.status])
     res.redirect("/employee/profile")

})

router.get("/edit_edu/:edu_id",async(req,res)=>{
     var sql = `select * from education where edu_id=?`
     var education = await exe(sql,[req.params.edu_id]);
     res.render("employee/edit_edu.ejs",{education})
})
router.post("/update_edu",async(req,res)=>{
     var d= req.body
     var sql = ` update education set course_title = ? , univercity = ? , passing_year = ? , marks=?,status=? where edu_id=? `;
     var result = await exe(sql,[d.title,d.univercity,d.passing_year,d.marks,d.status,d.edu_id]);
     res.redirect("/profile")
})

router.get("/delet_edu/:edu_id",async(req,res)=>{
     var sql = `delete  from education where edu_id = ?`;
     var result = await exe(sql,[req.params.edu_id])
     res.redirect("/employee/profile")
})

router.get("/edit_profile",async(req,res)=>{
     var data = await exe("select * from employees where emp_id=?",[req.session.emp_id])
     res.render("employee/edit_profile.ejs",{data});
})

router.post("/save_profile",async(req,res)=>{
     var d = req.body
     var sql = `update  employees set emp_name=?,emp_mobile=?,alternative_mobile=?,emp_email=?,emp_address=?,emp_pincode=?,
     emp_dob=?,emp_married_status=?,current_designation=?,experience_year=?,current_salary=?,expected_salary=?,preferred_job_type=?,preferred_location=?,skill_summary=?,
     languages_known=?,linkedin_url=?,portfolio_url=?  where emp_id=?  `;

     var result = await exe(sql,[d.name,d.mobile,d.alternative_mobile,d.email,d.address,d.pincode,d.dob,d.married_status,d.current_desingnation,d.expereance_year,d.current_salary,d.expected_salary,d.prefered_job_type,d.preferred_location,d.skill_summary,d.languages_known,d.linkedin_url,d.portfolio_url,req.session.emp_id]) 
     res.redirect("/employee/profile")
})

router.post("/apply_job",async(req,res)=>{
       var filename = Date.now() + ".pdf" 
         
       req.files.resume.mv("public/Resumes/" +filename)
       var sql = `insert into job_applications(job_id,comp_id,employee_id,resume_file) value(?,?,?,?)`
       var result = await exe(sql,[req.body.job_id,req.body.comp_id,req.session.emp_id,filename])
       res.send("<script>location.href = document.referrer</script>");
    

})

router.get("/saved_jobs/:job_id",(req,res)=>{
     var sql = `insert into saved_jobs (job_id,emp_id)values(?,?)`
     var result = exe(sql,[req.params.job_id,req.session.emp_id])
     res.send("<script>location.href = document.referrer</script>");
     
})


router.get("/logout",(req,res)=>{
   req.session.destroy();
   res.redirect("/")
})

router.post('/upload_resume',async(req,res)=>{
     
     var sql = `select emp_resume from employees where emp_id=?`
     var result = await exe(sql,[1])
     if (result[0].emp_resume === null) {
          var filename = Date.now()+".pdf" ;
          req.files.resume.mv("public/Resumes/"+filename);
          var sql2=`update employees set emp_resume=? where emp_id=? `
          var insert = await exe(sql2,[filename,req.session.emp_id]);
          res.send("<script> location.href=document.referrer </script>")
       }else{
          req.files.resume.mv("public/Resumes/"+result[0].emp_resume);
          res.send("<script> location.href=document.referrer </script>")
       }

})

router.post("/upload_profile_photo",async(req,res)=>{
     var sql = `select emp_profile_photo from employees where emp_id=?`
     var data = await exe(sql,[req.session.emp_id]);
     if(data[0].emp_profile_photo===null)
     {
     var filename = Date.now()+".jpg";
     req.files.profile_photo.mv("public/profile_photo/"+filename);
     var result=await exe("update employees set emp_profile_photo=? where emp_id=?",[filename,req.session.emp_id])
     res.send('<script>location.href = document.referrer </script>')
     }else{
          req.files.profile_photo.mv("public/profile_photo/"+data[0].emp_profile_photo)
          res.send('<script>location.href = document.referrer </script>')
     }
})

router.get("/unsave_jobs/:job_id",async(req,res)=>{
     var sql = `delete from saved_jobs where job_id=? and emp_id=?`
     var data = await exe(sql,[req.params.job_id,req.session.emp_id]);
     res.send("<script> location.href = document.referrer </script>")
})

module.exports = router ;
