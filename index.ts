/*
// GAS ts support sucks. I need to make weird codes for module resolving.
// when there is  `exports.`, that's the place messed up by GAS spec.

import { addStudent, startShuffling, dispose } from './shuffler'
import { addStudent_2, startShuffling_2, dispose_2 } from './shuffler2'

const studentAdderList = [addStudent, addStudent_2]
const shufflerList = [startShuffling, startShuffling_2]
const disposers = [dispose, dispose_2]
*/

/**
 * IDs of each categories.
 * 
 * The value is column of the sheet.
 */
const categoryIDs: number[] = []
/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Student Shuffler')
    .addItem('How To', 'showInstruction_')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('Start Shuffling')
        .addItem('Algorithm A', 'startShuffle_A_')
        .addItem('Algorithm B', 'startShuffle_B_')
    )
    .addToUi();
  // const spreadsheet = SpreadsheetApp.getActive()
  // const menuItems = [
  //   { name: 'Start...', functionName: 'shuffleFlow_' },
  //   //{ name: 'Generate step-by-step...', functionName: 'generateStepByStep_' }
  // ];
  // spreadsheet.addMenu('Student Shuffle', menuItems);
}
function showInstruction_() {
  Browser.msgBox(`Please select column names (Hold ⌘ or Ctrl) 
to select the characteristic factor you would like to consider within the shuffle. (e.g. 'Gender', 'Last School', and etc. )`)
  Browser.msgBox(`Then select 'Start Shuffling' from the menu to shuffle the pod groups.`)
  Browser.msgBox(`You can choose the algorithm of shuffling. (Algorithm B is experimental. A is recommended.)`)

}
function startShuffle_A_() {
  shuffleFlow_(1)
}
function startShuffle_B_() {
  shuffleFlow_(0)
}
function shuffleFlow_(algorithm: number) {
  /* @ts-ignore */
  const studentAdderList = [exports.addStudent, exports.addStudent_2];
  /* @ts-ignore */
  const shufflerList = [exports.startShuffling, exports.startShuffling_2];

  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActive().getActiveSheet()
  const rangeList = sheet.getActiveRangeList().getRanges()
  const catNames = []
  rangeList.forEach(range => {
    catNames.push(...range.getValues())
    const colStart = range.getColumn()
    const colEnd = range.getLastColumn()
    for(let i=colStart;i<=colEnd;i++){
      categoryIDs.push(i)
    }
  })
  if (ui.alert('Shuffle based on ' + catNames.join(', ') + '. Proceed?', ui.ButtonSet.OK_CANCEL) === ui.Button.OK) {
    const numInPod = parseInt(ui.prompt('please input the minimum number of students in a pod', ui.ButtonSet.OK_CANCEL).getResponseText()) || 10
    
    let row = rangeList[0].getRow() + 1;
    while (true) {
      if (!sheet.getRange(row, 1).getValue()) break;
      studentAdderList[algorithm](sheet, row, categoryIDs)
      row++
    }
    shufflerList[algorithm](numInPod)
    ui.alert('Shuffled.', ui.ButtonSet.OK)
  } else {
    ui.alert('Cancelled')
  }
}