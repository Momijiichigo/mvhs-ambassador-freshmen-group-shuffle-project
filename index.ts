/*
// ts support of GAS sucks. I need to make weird codes for module resolving.
// when there is  `exports.`, that's the place messed up by GAS spec.

import { addStudent, startShuffling, dispose } from './shuffler'
*/
import type { studentAdder, shuffleStarter } from "./shuffler"
/**
 * IDs of each categories.
 * 
 * The value is column of the sheet.
 */
const categoryIDs: number[] = []

globalThis.libName = ''
function init(libName: string) {
  globalThis.libName = libName + '.'
  onOpen()
}
/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Student Shuffler')
    .addItem('How To', globalThis.libName + 'showInstruction')
    .addSeparator()
    .addItem('Start Shuffling', globalThis.libName + 'shuffleFlow')
    .addToUi();
}
function showInstruction() {
  Browser.msgBox(
    `Please select column names (Hold ⌘ or Ctrl)
 to select the characteristic factor you would like to consider
 within the shuffle. (e.g. 'Gender', 'Last School', and etc. )`
  )
  Browser.msgBox(`Then select 'Start Shuffling' from the menu to shuffle the pod groups.`)

}
const RESULT_SHEET_NAME = 'Pods Result'
function shuffleFlow() {
  /* @ts-ignore */
  const addStudent: studentAdder = exports.addStudent;
  /* @ts-ignore */
  const shuffler: shuffleStarter = exports.startShuffling;

  const ui = SpreadsheetApp.getUi();
  const spreadSheet = SpreadsheetApp.getActive()


  const sheet = spreadSheet.getActiveSheet()
  const rangeList = sheet.getActiveRangeList().getRanges()
  const catNames = []
  rangeList.forEach(range => {
    catNames.push(...range.getValues())
    const colStart = range.getColumn()
    const colEnd = range.getLastColumn()
    for (let i = colStart; i <= colEnd; i++) {
      categoryIDs.push(i)
    }
  })
  if (ui.alert('Shuffle based on ' + catNames.join(', ') + '. Proceed?', ui.ButtonSet.OK_CANCEL) === ui.Button.OK) {
    const numInPod = parseInt(
      ui
        .prompt('please input the minimum number of students in a pod', ui.ButtonSet.OK_CANCEL)
        .getResponseText()
    ) || 10

    let row = rangeList[0].getRow() + 1;
    const MAX_ROW = sheet.getLastRow()
    const MAX_COL = sheet.getLastColumn()
    
    while (row <= MAX_ROW) {
      if (!sheet.getRange(row, 1).getValue()) continue;
      addStudent({
        sheet,
        row,
        catIDs: categoryIDs,
        MAX_COL
      })
      row++
    }
    
    // remove old result sheet
    const oldResultSheet = spreadSheet.getSheetByName(RESULT_SHEET_NAME)
    if (oldResultSheet) spreadSheet.deleteSheet(oldResultSheet)
    // add result sheet
    const resultSheet = spreadSheet.insertSheet();
    resultSheet.setName(RESULT_SHEET_NAME)

    // prepare field names (First row in result sheet)
    sheet.getRange(1, 1, 1, MAX_COL).copyTo(resultSheet.getRange(1,2))
    // shuffle
    shuffler(numInPod, resultSheet)
    ui.alert('Shuffled.', ui.ButtonSet.OK)
  }
}