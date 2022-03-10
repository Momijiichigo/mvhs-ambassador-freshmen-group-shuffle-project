const COL_POD = 10

export type studentAdder = (obj: {
  sheet: GoogleAppsScript.Spreadsheet.Sheet
  row: number
  catIDs: number[]
  MAX_COL: number
}) => void
export type shuffleStarter = (numInPod: number, resultSheet: GoogleAppsScript.Spreadsheet.Sheet) => void

const allStudents: Student[] = []

const pods = {
  podList: [] as Student[][],
  add(student: Student){
    // GAS TS support sucks
    // pods.podList[student.podID] ??= []
    if(!pods.podList[student.podID]) pods.podList[student.podID] = []
    pods.podList[student.podID].push(student)    
  },
  outputResult(resultSheet: GoogleAppsScript.Spreadsheet.Sheet){
    let row = 2
    pods.podList.forEach((students, podID)=>{
      resultSheet.getRange(row, 1).setValue('Pod '+podID)
      students.forEach(student=>{
        const toRange = resultSheet.getRange(row, 2)
        student.range.copyTo(toRange)
        row++
      })
      row++
    })
  }
}


type CetegoryID = number
class Student {
  row: number
  info: {
    [key: CetegoryID]: string
  }
  podID: number
  overlapLevel: number
  range: GoogleAppsScript.Spreadsheet.Range
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[], MAX_COL: number) {
    const info = {}
    catIDs.forEach(col => {
      info[col] = sheet.getRange(row, col).getDisplayValue()
    });
    this.range = sheet.getRange(row, 1, 1, MAX_COL)
    this.row = row
    this.info = info
  }
  initOverlapLevel() {
    let overlap = 0
    for (const s of allStudents) {
      for (const key in this.info) {
        if (this.info[key] === s.info[key]) overlap++
      }
    }
    this.overlapLevel = overlap
  }
  assignPod(podID: number) {
    this.podID = podID
    pods.add(this)
  }

}

export const addStudent: studentAdder = ({ sheet, row, catIDs, MAX_COL }) => {
  const student = new Student(sheet, row, catIDs, MAX_COL)
  allStudents.push(student)
}
export const startShuffling: shuffleStarter = (numInPod, resultSheet) => {

  const totalNumPods = Math.floor(allStudents.length / numInPod)
  for (const student of allStudents) {
    student.initOverlapLevel()
  }
  let i = 0
  allStudents.sort((a, b) => b.overlapLevel - a.overlapLevel).forEach(student => {
    i++
    if (i >= totalNumPods) i %= totalNumPods
    student.assignPod(i + 1)
  })
  pods.outputResult(resultSheet)
}