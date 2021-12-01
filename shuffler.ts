/*
 https://docs.google.com/spreadsheets/d/1ZFP1QGj8zE2jrvSP3_hKDSGKWsZBxtPM_StQzl6ZAnQ/edit#gid=0

 Shuffling students by multiple characteristics and assigning them to small pod groups.
*/
const ui = SpreadsheetApp.getUi();
const NUM_IN_POD = 4;
const COL_POD = 10
const allStudents: Student[] = []

type CetegoryID = number
type StudentID = number
class Student {
  id: StudentID
  row: number
  info: {
    [key: CetegoryID]: string
  }
  assigned: boolean = false
  sheet: GoogleAppsScript.Spreadsheet.Sheet
  podID: number
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) {
    this.sheet = sheet
    const info = {}
    catIDs.forEach(col => {
      info[col] = sheet.getRange(row, col).getDisplayValue()
    });
    // @ts-ignore
    this.id = sheet.getRange(row, 1).getDisplayValue() | 0
    this.row = row
    this.info = info
  }
  assignPod(podID: number) {
    this.podID = podID
    this.assigned = true
    this.writePodIdToSheet()
  }
  writePodIdToSheet() {
    this.sheet.getRange(this.row, COL_POD).setValue(this.podID)
  }

}
let podCount = 1
class Pod {
  added: Student[] = []
  ID: number
  constructor(initialStudent: Student) {
    
    this.ID = podCount++
    this.addStudent(initialStudent)
    ui.alert(`Pod ${this.ID} created`)
    while (this.added.length < NUM_IN_POD) {
      if(!this.addLeastOverlappingStudent()) break;
    }
    ui.alert(this.added.length+this.added.map(s => JSON.stringify(s.info)).join(','));
    
  }

  addLeastOverlappingStudent() {
    let leastOverlap = null
    let student: Student;
    allStudents.forEach(s => {
      if (s.assigned) return;
      const overlap = this.getOverlapCategoryLevel(s)
      if (leastOverlap === null || overlap < leastOverlap) {
        leastOverlap = overlap
        student = s
      }
    })
    //console.log('least overlap:',leastOverlap);

    if (!student) {
      ui.alert('No more students to add')
      return false;
    }
    this.addStudent(student)
    return true;
  }
  getOverlapCategoryLevel(student: Student) {
    let overlap = 0
    for (const addedStudent of this.added) {
      for (const key in student.info) {
        if(student.info[key] === addedStudent.info[key]) overlap++
      }
    }
    return overlap
  }
  addStudent(student: Student) {
    this.added.push(student)
    student.assignPod(this.ID)
  }
}

export function addStudent(sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) {
  const student = new Student(sheet, row, catIDs)
  allStudents.push(student)
}
export function startShuffling() {
  const numPods = Math.ceil(allStudents.length / NUM_IN_POD)
  for (let i = 0; i < numPods;) {
    const student = allStudents[i]
    if (student.assigned) {
      continue
    }
    new Pod(student)
    i++
  }
  // for(const student of allStudents){
  //   student.writePodIdToSheet()
  // }
}