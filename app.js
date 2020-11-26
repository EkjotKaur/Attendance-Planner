//jshint esverion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/images"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  "mongodb+srv://admin-EkjotKaur:Test123@attendance.e3ui6.mongodb.net/attendanceDB",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const classSchema = {
  branch: String,
  Shift: String,
  year: String,
  subject: String,
  userId: String,
  slotId: String
};

const slotSchema = {
  branch: String,
  Shift: String,
  year: String,
};

const attendanceSchema = {
  Days: {
    type: [Number],
  },
  stdId: String,
  month: Number,
  classId: String,
  totalDays: Number,
  present: Number,
};

const studentSchema = {
  enrollNo: String,
  name: String,
  branch: String,
  Shift: String,
  year: String,
  present: Number,
  slotId: String,
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
const Class = mongoose.model("Class", classSchema);
const Slot = mongoose.model("Slot", slotSchema);
const Student = mongoose.model("Student", studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login", {req, req});
});

app.get("/signup", (req, res) => {
  res.render("signup", {req: req});
});

app.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    Class.find({ userId: req.user.id }, (err, classes) => {
      if (err) {
        console.log(err);
      } else {
        res.render("home", {
          classList: classes,
          name: req.user.name,
          username: req.user.username,
          len: classes.length
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/newclass", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("newClass");
  } else {
    res.redirect("/login");
  }
});

app.get("/:presentClassId/:presentBatchId/updateClass", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("updateClass", {
      presentClassId: req.params.presentClassId,
      presentBatchId: req.params.presentBatchId,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/:presentClassId/:presentBatchId/deleteClass", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("deleteClass", {
      presentClassId: req.params.presentClassId,
      presentBatchId: req.params.presentBatchId,
    });
  } else {
    res.redirect("/login");
  }
});


app.get("/:presentClassId/:presentBatchId/attendance", (req, res) => {
  if (req.isAuthenticated()) {
    // For No of Days In Month------------------------------
    var TodayDate = new Date();
    var Month = TodayDate.getMonth();
    var NoOfDays;
    var year = TodayDate.getFullYear();
    if (
      Month === 0 ||
      Month === 2 ||
      Month === 4 ||
      Month === 6 ||
      Month === 7 ||
      Month === 9 ||
      Month === 11
    ) {
      NoOfDays = 31;
    } else if (Month === 1) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
        NoOfDays = 29;
      else NoOfDays = 28;
    } else {
      NoOfDays = 30;
    }
    // For No of Days In Month End-------------------------

    Student.find({ slotId: req.params.presentBatchId }, (err, studentItem) => {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < studentItem.length; i++) {
          Attendance.findOne(
            { stdId: studentItem[i].id, classId: req.params.presentClassId },
            (err, foundRecord) => {
              if (err) {
                console.log(err);
              } else {
                if (!foundRecord) {
                  const record = new Attendance({
                    month: Month,
                    stdId: studentItem[i].id,
                    classId: req.params.presentClassId,
                    totalDays: 0,
                    present: 0,
                  });
                  
                  record.save();
                  console.log(record);
                } else {
                  console.log(foundRecord);
                  // console.log(foundRecord.totalDays);
                  if(Month!=foundRecord.month){
                      Attendance.findOneAndDelete({_id: foundRecord.id}, (err, delAtt) => {
                        if(err){
                          console.log(err);
                        } else {
                          console.log(delAtt);
                          const record = new Attendance({
                            month: Month,
                            stdId: studentItem[i].id,
                            classId: req.params.presentClassId,
                            totalDays: 0,
                            present: 0,
                          });
                          record.save();
                        }
                      });
                  }
                  if(foundRecord.Days.length>0 && foundRecord.totalDays>0){
                    // console.log(foundRecord.totalDays);
                    // console.log("ABC"+foundRecord.Days[0]);
                    const index = foundRecord.Days.length-1;
                    dd = new Date().getDate();
                    // console.log("DD"+dd);
                    // console.log("fr"+foundRecord.Days[index]);
                    
                    if(foundRecord.Days[index]==dd){
                      console.log("Already Submitted");
                    }
                    
                  }
                  // if(foundRecord.Day[foundRecord.totalDays-1]==dd)
                    // res.redirect("/submitted");
                    
                  // console.log(foundRecord);
                }
              }
            }
          );
        }

        res.render("attendance", {
          presentClassId: req.params.presentClassId,
          presentBatchId: req.params.presentBatchId,
          presentBatchId: req.params.presentBatchId,
          studentList: studentItem,
          sno: 0,
          totalDays: NoOfDays,
          Month: Month,
          Year: year,
          TodayDate: TodayDate,
          dd: TodayDate.getDate(),
          name: req.user.name,
          username: req.user.username
        });
      } 
    }); 
  } else {
    res.redirect("/login");
  }
});

app.get("/:presentClassId/:presentBatchId/newStudent", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("newStudent", {
      presentClassId: req.params.presentClassId,
      presentBatchId: req.params.presentBatchId,
    });
  } else {
    res.redirect("/login");
  }
});



app.get("/:presentClassId/:presentBatchId/record", (req, res) => {
  if (req.isAuthenticated()){
    Attendance.find({classId: req.params.presentClassId}, (err, att) => {
      Student.find({slotId: req.params.presentBatchId},(err, std) => {
        console.log(std[0]);
        Class.findOne({_id: req.params.presentClassId}, (err, cl) => {
          res.render("record", {record: att, std: std, Class: cl});
        });

        
      });
    });
  }  else {
    res.redirect("/login");
  }
});

app.get("/:presentClassId/:presentBatchId/:presentStudentId/deleteStudent", (req, res) =>{
  if (req.isAuthenticated()){
    res.render("deleteStudent", {classId: req.params.presentClassId, batchId: req.params.presentBatchId, stdId: req.params.presentStudentId});
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.post("/signup", (req, res) => {
  const password = req.body.password;
  const confirm = req.body.confirm;
  console.log(password!=confirm);
  if(password!=confirm){
    req.session.signuperror="Passwords don't match";
    res.redirect("/signup");
  } else {
  User.register(
    { name: req.body.name, username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        req.session.signuperror="Username Already Exists";
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/home");
        });
      }
    }
  );
  }
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.render("/login");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    }
  });

});

app.post("/newclass", (req, res) => {
  if (req.body.year == "2019") {
    Slot.findOne(
      { branch: req.body.branch, Shift: req.body.Shift, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: req.body.Shift,
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
            canOpen: true
          });

          batch.save();
          res.redirect("home");
        }
      }
    );
  } else {
    Slot.findOne(
      { branch: req.body.branch, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: "",
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
          });

          batch.save();
          res.redirect("home");
        }
      }
    );
  }
});

app.post("/newclass", (req, res) => {
  if (req.body.year == "2019") {
    Slot.findOne(
      { branch: req.body.branch, Shift: req.body.Shift, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: req.body.Shift,
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
            canOpen: true
          });

          batch.save();
          res.redirect("home");
        }
      }
    );
  } else {
    Slot.findOne(
      { branch: req.body.branch, year: req.body.year },
      (err, foundShift) => {
        if (err) {
          console.log(err);
        } else {
          const batch = new Class({
            branch: req.body.branch,
            Shift: "",
            year: req.body.year,
            subject: req.body.subject,
            userId: req.user.id,
            slotId: foundShift.id,
          });
          
          batch.save();
          res.redirect("home");
        }
      }
    );
  }
});

app.post("/:presentClassId/:presentBatchId/updateClass", (req, res) => {
  Class.findOneAndUpdate(
    { _id: req.params.presentClassId },
    { subject: req.body.subject },
    (err, updatedBatch) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/home");
      }
    }
  );
});

app.post("/:presentClassId/:presentBatchId/deleteClass", (req, res) => {
  // Class.findOne({_id: req.params.presentClassId}, (err, foundC) => {
  //   console.log(foundC);
  // });
  Class.findByIdAndDelete(
    { _id: req.params.presentClassId },
    (err, deletedClass) => {
      if (err) {
        console.log(err);
      } else {
        console.log(deletedClass);
        // Attendance.find({classId: req.params.presentClassId}, (err, delA) => {
        //   console.log(delA);
        // });
        Attendance.deleteMany({classId: req.params.presentClassId}, (err, deletedAtt) => {
          if(err){
            console.log(err);
          } else {
            console.log(deletedAtt);
            res.redirect("/home");
          }
        });  
      }
    }
  );
});

app.post("/:presentClassId/:presentBatchId/newStudent", (req, res) => {

  Slot.findById({_id: req.params.presentBatchId}, (err, foundSlot) => {
    if(err){

      console.log(err);
    } else {
      newStudent = new Student({
        enrollNo: req.body.enrollno,
        name: req.body.stdname,
        branch: foundSlot.branch,
        Shift: foundSlot.Shift,
        year: foundSlot.year,

        slotId: foundSlot.id,
      });
      newStudent.save();
      res.redirect(
        "/" +
          req.params.presentClassId +
          "/" +
          req.params.presentBatchId +
          "/attendance"
      );
    }
  });
});


app.post("/:presentClassId/:presentBatchId/attendance", (req, res) => {
  Student.find({ slotId: req.params.presentBatchId }, (err, foundStudent) => {
    if (err) {
      console.log(err);
    } else {
      const day = new Date().getDate();

      for (let i = 0; i < foundStudent.length; i++) {
        Attendance.findOne(
          { stdId: foundStudent[i].id, classId: req.params.presentClassId },
          (err, att) => {
            if (err) {
              console.log(err);
            } else {
              console.log(att.Days);
              if (att.Days.length === 0) {
                let total;
                console.log(req.body.dd[i]);
                if (req.body.dd[i] == 1) {
                  console.log("doesn't");
                  console.log(att.id);
                  console.log(foundStudent[i].name);
                  total = 1;
                  Attendance.updateOne(
                    { _id: att.id },
                    { $push: { Days: [day] } },
                    (err, updateAtt) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(updateAtt);
                      }
                    }
                  );
                } else {
                  total = 0;
                  Attendance.updateOne(
                    { _id: att.id },
                    { $push: { Days: [-day] } },
                    (err, updateAtt) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(updateAtt);
                      }
                    }
                  );
                }
                console.log(att.Days.length);
                let totalDaysAttendance = att.Days.length + 1;
                Attendance.findOneAndUpdate(
                  { _id: att.id },
                  { present: total, totalDays: totalDaysAttendance },
                  (err, updateAtt) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(updateAtt);
                    }
                  }
                );
              } else {
               let totalDaysAttendance = att.Days.length;
               console.log(att.Days.length);
               let total = att.present;
               if(att.Days[totalDaysAttendance-1]==day || att.Days[totalDaysAttendance-1]==-day){
                //  res.redirect("/submitted");
                console.log("Already Submitted!!!!");
               } else {
                if (req.body.dd[i] == 1) {
                  total += 1;
                  console.log(foundStudent[i].name);
                  Attendance.updateOne(
                    { _id: att.id },
                    { $push: { Days: [day] } },
                    (err, updateAtt) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(updateAtt);
                      }
                    }
                  );
                } else {
                  total += 0;
                  Attendance.updateOne(
                    { _id: att.id },
                    { $push: { Days: [-day] } },
                    (err, updateAtt) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(updateAtt);
                      }
                    }
                  );
                }
                totalDaysAttendance = totalDaysAttendance + 1;
                Attendance.findOneAndUpdate(
                  { _id: att.id },
                  { present: total, totalDays: totalDaysAttendance },
                  (err, updateAtt) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(updateAtt);
                    }
                  }
                );
               }
              }
            }
          }
        );
      }
    }
  });
  res.redirect("/" +req.params.presentClassId +"/" +req.params.presentBatchId +"/attendance");
});

app.post('/:presentClassId/:presentBatchId/:presentStudentId/deleteStudent', (req, res) => {
  Student.findOneAndDelete({_id: req.params.presentStudentId}, (err, deletedStudent) => {
    if(err){
      console.log(err);
    } else {
      Attendance.deleteMany({stdId: req.params.presentStudentId}, (err, deletedAtt) => {
        if(err){
          console.log(err);
        } else {
          res.redirect("/"+req.params.presentClassId+'/'+req.params.presentBatchId+'/attendance');
        } 
      });
    }
  }); 
});


app.listen(process.env.PORT || 8080 , function () {

  console.log("Server running at port 8080");
});
