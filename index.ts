import { addStudent, startShuffling } from './shuffler'
//aaaa
/**
 * IDs of each categories.
 *
 * The value is column of the sheet.
 */
let categoryIDs: number[] = []
/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Student Shuffler!!!')
      .addItem('How To', 'showInstruction_')
      .addSeparator()
      .addItem('Start Shuffling', 'shuffleFlow_')
      .addToUi();
  // const spreadsheet = SpreadsheetApp.getActive()
  // const menuItems = [
  //   { name: 'Start...', functionName: 'shuffleFlow_' },
  //   //{ name: 'Generate step-by-step...', functionName: 'generateStepByStep_' }
  // ];
  // spreadsheet.addMenu('Student Shuffle', menuItems);
}
function showInstruction_(){
  Browser.msgBox('Please select column names (Hold ⌘ or Ctrl) to select the characteristic factor you would like to consider within the shuffle. Then select \'Start Shuffling\' to shuffle the pod groups.')
}
function shuffleFlow_(){
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActive().getActiveSheet()
  const rangeList = sheet.getActiveRangeList().getRanges()
  const catNames = []
  categoryIDs = rangeList.map(range=>{
    catNames.push(...range.getValues())
    return range.getColumn()
  })
  if(ui.alert('Shuffle based on '+catNames.join(', ')+'. Proceed?', ui.ButtonSet.OK_CANCEL) === ui.Button.OK){
    let row = rangeList[0].getRow()+1;
    while(true){
      if(!sheet.getRange(row, 1).getValue()) break;
      addStudent(sheet, row, categoryIDs)
      row++
    }
    startShuffling()
    ui.alert('Shuffled.', ui.ButtonSet.OK)
  }else {
    ui.alert('Cancelled')
  }
}
