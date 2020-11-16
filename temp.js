
// 
'use strict';

const fs = require('fs');



fs.readFile('student.json', (err, data) => {
  if (err) 
    console.log(err);
  let student = JSON.parse(data);
  for(var i=0; i<student.length; i++)
  {
    const s = student[i];
    if(s.year===2019)
    {
      Slot.findOne({branch: s.branch, year: s.year, Shift: s.class},(err, foundSlot) => {
        // console.log(foundSlot.id);
        if(err){
          console.log(err);
        } else{
          const newStudent = new Student({
            enrollNo: s.EnrollNo,
            name: s.NameOfStudent,
            branch: s.branch,
            Shift: s.class,
            year: s.year,
            present: 0,
            slotId: foundSlot.id
          });
          newStudent.save();
        }
      });
    } else {
      Slot.findOne({branch: s.branch, year: s.year},(err, foundSlot) => {
        if(err){
          console.log(err);
        } else{
          const newStudent = new Student({
            enrollNo: s.EnrollNo,
            name: s.NameOfStudent,
            branch: s.branch,
            Shift: s.class,
            year: s.year,
            present: 0,
            slotId: foundSlot.id
          });
          newStudent.save();
        }
      });
    }
  }
});

// 