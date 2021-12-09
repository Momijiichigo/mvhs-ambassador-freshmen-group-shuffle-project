/*
 https://docs.google.com/spreadsheets/d/1ZFP1QGj8zE2jrvSP3_hKDSGKWsZBxtPM_StQzl6ZAnQ/edit#gid=0

*/
import { NUM_IN_POD, COL_POD, shuffleStarter, studentAdder } from "./info"
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
    console.log(`${this.id} assigned to pod ${this.podID}`);
    
  }

}
let podCount = 1
class Pod {
  added: Student[] = []
  ID: number
  constructor(initialStudent: Student) {
    
    this.ID = podCount++
    this.addStudent(initialStudent)
    /* @ts-ignore */
    const { NUM_IN_POD } = exports

    while (this.added.length < NUM_IN_POD) {
      if(!this.addLeastOverlappingStudent()) break;
    }
  }

  addLeastOverlappingStudent() {
    let leastOverlap = Infinity
    let student: Student;
    allStudents.forEach(s => {
      if (s.assigned) return;
      const overlap = this.getOverlapCategoryLevel(s)
      if (overlap < leastOverlap) {
        leastOverlap = overlap
        student = s
      }
    })
    //console.log('least overlap:',leastOverlap);

    if (!student) {
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

export const addStudent: studentAdder = (sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) => {
  const student = new Student(sheet, row, catIDs)
  allStudents.push(student)
}
export const startShuffling: shuffleStarter = (numInPod: number) => {
  
  const totalNumPods = Math.ceil(allStudents.length / numInPod)

  for (let i = 0, numPods = 0; numPods < totalNumPods; i++) {
    const student = allStudents[i]
    if (student.assigned) {
      continue
    }
    new Pod(student)
    numPods++
  }
}
