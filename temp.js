'use strict';

const fs = require('fs');

fs.readFile('student.json', (err, data) => {
  if (err) 
    console.log(err);
  let student = JSON.parse(data);
  for(var i=0; i<student.length; i++)
  {
    if(student.year==="2019")
    {
      Slot.findOne({branch: student[i].branch, year: student[i].year, shift: student[i].class}, (err, foundSlot) => {
          if(err){
            console.log(err);
          } else {
            const newStudent = new Student({
              enrollNo: student[i].EnrollNo,
              name: student[i].NameOfStudent,
              branch: student[i].branch,
              Shift: student[i].class,
              year: student[i].year,
              present: 0,
              slotId: foundSlot.id
            });
          }
      });
    } else {
      Slot.findOne({branch: student[i].branch, year: student[i].year}, (err, foundSlot) => {
        if(err){
          console.log(err);
        } else {
          const newStudent = new Student({
            enrollNo: student[i].EnrollNo,
            name: student[i].NameOfStudent,
            branch: student[i].branch,
            Shift: "",
            year: student[i].year,
            present: 0,
            slotId: foundSlot.id
          });
        }
      });
    }
  }
});

console.log('This is after the read call');