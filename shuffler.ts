/*
 https://docs.google.com/spreadsheets/d/1ZFP1QGj8zE2jrvSP3_hKDSGKWsZBxtPM_StQzl6ZAnQ/edit#gid=0

 Shuffling students by multiple characteristics and assigning them to small pod groups.
*/

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
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) {
    this.sheet = sheet
    const info = {}
    catIDs.forEach(col => {
      info[col] = sheet.getRange(row, col).getDisplayValue()
    });
    // @ts-ignore
    this.id = sheet.getRange(row, 0).getDisplayValue() | 0
    this.row = row
    this.info = info
  }
  writePodId(podID: number) {
    this.sheet.getRange(this.row, COL_POD).setValue(podID)
    this.assigned = true
  }
}
let podCount = 0
class Pod {
  added: Student[] = []
  candidates: {
    [overlap: number]: Student[]
  } = {}
  ID: number
  constructor() {
    this.ID = podCount++
  }

  addLeastOverlappingStudent(){
    const student = allStudents.filter(student => !student.assigned).sort((a, b) => this.getOverlapCategoryLevel(a) - this.getOverlapCategoryLevel(b))[0]
    if(!student){
      return
    }
    this.added.push(student)
    student.writePodId(this.ID)
  }
  getOverlapCategoryLevel(student: Student) {
    let overlap = 0
    for(const addedStudent of this.added){
      for(const key in addedStudent.info){
        student.info[key] === addedStudent.info[key] ? overlap++ : null
      }
    }
    return overlap
  }
}

export function addStudent(sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) {
  const student = new Student(sheet, row, catIDs)
  allStudents.push(student)
}