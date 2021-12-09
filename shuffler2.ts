import { NUM_IN_POD, COL_POD, studentAdder, shuffleStarter } from "./info"
const allStudents_2: Student_2[] = []

type CetegoryID = number
class Student_2 {
  row: number
  info: {
    [key: CetegoryID]: string
  }
  sheet: GoogleAppsScript.Spreadsheet.Sheet
  podID: number
  overlapLevel: number
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) {
    this.sheet = sheet
    const info = {}
    catIDs.forEach(col => {
      info[col] = sheet.getRange(row, col).getDisplayValue()
    });
    this.row = row
    this.info = info
  }
  initOverlapLevel() {
    let overlap = 0
    for (const s of allStudents_2) {
      for (const key in this.info) {
        if(this.info[key] === s.info[key]) overlap++
      }
    }
    this.overlapLevel = overlap
  }
  assignPod(podID: number) {
    this.podID = podID
    this.sheet.getRange(this.row, COL_POD).setValue(podID)
  }

}

export const addStudent_2: studentAdder = (sheet, row, catIDs) => {
  const student = new Student_2(sheet, row, catIDs)
  allStudents_2.push(student)
}
export const startShuffling_2: shuffleStarter = (numInPod) => {

  const totalNumPods = Math.floor(allStudents_2.length / numInPod)
  for(const student of allStudents_2) {
    student.initOverlapLevel()
  }
  let i = 0
  allStudents_2.sort((a, b) => b.overlapLevel - a.overlapLevel).forEach(student => {
    i++
    if(i >= totalNumPods) i %= totalNumPods
    student.assignPod(i+1)
  })
}
