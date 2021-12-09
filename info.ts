const NUM_IN_POD = 4
const COL_POD = 10

export type studentAdder = (sheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, catIDs: number[]) =>void
export type shuffleStarter = (numInPod: number) => void

export { COL_POD, NUM_IN_POD }