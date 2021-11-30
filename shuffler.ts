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
  ID: number
  constructor(initialStudent: Student) {
    this.ID = podCount++
    this.added.push(initialStudent)
    while (this.added.length < NUM_IN_POD) {
      this.addLeastOverlappingStudent()
    }
  }

  addLeastOverlappingStudent() {
    let leastOverlap = null
    let student: Student;
    allStudents.forEach(s => {
      if (s.assigned) return
      const overlap = this.getOverlapCategoryLevel(s)
      leastOverlap ??= overlap
      if (overlap < leastOverlap) {
        leastOverlap = overlap
        student = s
      }
    })
    if (!student) {
      return
    }
    this.added.push(student)
    student.writePodId(this.ID)
  }
  getOverlapCategoryLevel(student: Student) {
    let overlap = 0
    for (const key in student.info) {
      for (const addedStudent of this.added) {
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
export function startShuffling() {
  const numPods = Math.ceil(allStudents.length / NUM_IN_POD)
  for (let i = numPods; i--;) {
    const pod = new Pod(allStudents[i])
  }
}