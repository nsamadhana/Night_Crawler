// ** TRAVERSES ENGINEERING FOLDER TO SEARCH FOR INCORRECTLY NAMED FILES/FOLDERS ** //

//FINDS CHILDREN OF ENGINEERING FOLDER// 
function engineering(){
  
  //CLEARS EACH DOCUMENT// 
  var everybody = DocumentApp.openByUrl("https://docs.google.com/document/d/1uqPBiChUh9AYSUHbTv3ZP5vE9FN_ur3VBe7i_ACpmkA/edit"); 
  everybody.getBody().setText("");
  
  var reiley = DocumentApp.openByUrl("https://docs.google.com/document/d/17kMKdz6Ev1SgE2j3By3ta6zftdiIdbaVlz-IpzaVB1M/edit"); 
  reiley.getBody().setText("");
  
  var alec = DocumentApp.openByUrl("https://docs.google.com/document/d/1fQHIKW6KJGZpQkc1EsS26-6Y4xJOcrLDgNP7nVJCLh8/edit"); 
  alec.getBody().setText("");
  
  var kyle = DocumentApp.openByUrl("https://docs.google.com/document/d/1Ztkp0tpy-7--SCm_seot0m3RD4OHcCxsLznK-eVMcfU/edit"); 
  kyle.getBody().setText("");
  
  var andy = DocumentApp.openByUrl("https://docs.google.com/document/d/1xrQ2VDlTgiE6cegBS4ObbsTQ8N1WM2eXZw__QonZ9yY/edit"); 
  andy.getBody().setText("");
  
  var allFolders = DriveApp.getFolders();
  while(allFolders.hasNext()) { //Traverse all folders
   var folder = allFolders.next();
    if(folder.getName() == 'Engineering'){
      ESMC(folder);
      break;
    }
  }
}

// ENGINES | SYSTEMS | MILITARY | COMMERCIAL //
function ESMC(folder) {
  var esmcFolders = folder.getFolders();
  while(esmcFolders.hasNext()) {
    var esmc = esmcFolders.next();
    if(esmc.getName() == '1 - Engines') {
      SubESMC(esmc);
    } else if(esmc.getName() == '2 - Systems') {
      SubESMC(esmc);
    } else if(esmc.getName() == '3 - Military') {
      SubESMC(esmc);
    } else if(esmc.getName() == '4 - Commercial') {
      SubESMC(esmc);
    }       
  }
}

//  --- INSIDE EITHER ENGINES, SYSTEMS, MILITARY OR COMMERCIAL ---  //
function SubESMC(parent) {
  var subESMCs = parent.getFolders();
  while(subESMCs.hasNext()) {
    var subESMC = subESMCs.next();
// GO THROUGH DOC AND STEVE IN EACH FOLDER //
    var steveDocs = subESMC.getFolders(); 
    while(steveDocs.hasNext()){
      var steveDoc = steveDocs.next();
      if(steveDoc.getName() == 'Documents') {
        Documents(steveDoc, subESMC); 
      }else if( steveDoc.getName() == 'STEVE') {
        Steve(steveDoc, subESMC);
      }
    }
  }
}


//  --- INSIDE STEVE ---  //

                                                      // CURRENT NAMING CONVENTION EXAMPLE //

// 1001-ENG-01 | 1001-ENG-01-001 | 1001-ENG-01A01 | 1001-ENG-01A01-001 | 1001-ENG-01B02-001 | 1001-ENG-02B01 |    1001-ENG-01C01-001    | //
//    ASM 1    | PART 1 OF ASM 1 | SUBASM 1 OF 01 | PART 1 OF SUBASM 1 | PART 1 OF SUBASM 2 | SUBASM 1 OF 02 | PART 1 OF SUBASM 3 OF 01 | //

function Steve(steveDoc, projectFolder) {
  var max = 0;
  // ITERATE ONCE TO COUNT FOLDERS AND TWICE TO CHECK NAMES
  var steveFolders = steveDoc.searchFolders("title contains '" + projectFolder + '-' + "'");
  while(steveFolders.hasNext()) {
    var steveFolder = steveFolders.next();
    var tens = steveFolder.getName().charAt(9);
    var ones = steveFolder.getName().charAt(10);
    var i = tens + ones;
    if (parseInt(i) > max) { 
     // RETRIEVE HIGHEST DOUBLE DIGIT FOLDER // 
     max = i; 
    }
  }

  // LOGS INCORRECTLY NAMED FOLDERS THAT DON'T INCLUDE THE PROJECT NAME//
  var steveFolders = steveDoc.getFolders();
  while(steveFolders.hasNext()) {
    var steveFolder = steveFolders.next();
    if(steveFolder.getName().indexOf(projectFolder+'-') != 0) {
       addToDoc('incorrect', projectFolder + ' STEVE', steveFolder.getName(), steveFolder);
    }
  }

 // LOOP FOR EACH DOUBLE DIGIT FOLDERS //
  for(var i = 1; i <= max; i++) {
    var j = 1;
    var letterLevels = [];
    
    // IF FOLDER IS SINGLE DIGIT //
    if(i < 10) { 
      var twoDigit = projectFolder + '-0' + i.toString(); // ALL FOLDERS OF 100-ENG-01 NAMING CONVENTION //
    }else {
      var twoDigit = projectFolder + '-' + i.toString(); // ALL FOLDERS OF 1001-ENG-10 NAMING CONVENTION //
    }
      
    var iFolders = steveDoc.searchFolders("title contains '" + twoDigit + "'");
    while(iFolders.hasNext()) {
      var iFolder = iFolders.next();
      var flag = false;
      // SEPARATES MAIN AND SUB FOLDERS //
      if(iFolder.getName().length == 11) { // FIRST LEVEL ASSEMBLY //
        
        flag = true;
        asmFiles(iFolder); // GO INTO ASM FOLDER //
        
      } else if (iFolder.getName().length == 15 || iFolder.getName().length == 18) { // FIRST LEVEL PART OR SUB LEVEL PART//
        
        flag = true;
        part(iFolder); // GO INTO PART FOLDER //

        checkPart(steveDoc, twoDigit, projectFolder, iFolder); // CHECKS PART ITERATION //
        
      } else if (iFolder.getName().length == 14 && iFolder.getName().charAt(11).match(/[A-Z]/i)) { // SUB ASSEMBLY //
        
        flag = true;
        asmFiles(iFolder); // GO INTO SUB ASM FOLDER //
        
        var letter = iFolder.getName().charAt(11); 
        
        if(letterLevels.length == 0 || letterLevels.indexOf(letter) == -1){ // MAKES SURE TO ONLY RUN ONCE FOR EVERY SUB LEVEL/LETTER //
            letterLevels = checkSubAsm(steveDoc, twoDigit, projectFolder, iFolder, letterLevels, letter); // CHECKS SUB ASM ITERATION //
         }
      
      } 
      // NOT TRIGGERED WHEN THERE IS A MISSING DOUBLE DIGIT FOLDER // 
      if(!flag) {
        addToDoc("incorrect",projectFolder + " STEVE" , iFolder.getName(), 'blank');
      }
    } // END OF FOLDER.NEXT //
  }
}


  //  --- INSIDE ASM FOLDERS ---  //


function asmFiles(projectFolder) {
  var sldasmFiles = projectFolder.getFiles();
  while(sldasmFiles.hasNext()) {
    var sldasmFile = sldasmFiles.next();
    if(sldasmFile.getName().indexOf(projectFolder.getName()) != 0) { // projectFolder NAME == 3001-MIL-01 //
      addToDoc("incorrect",projectFolder ,sldasmFile.getName(), sldasmFile);
    }
  }
}


// MAKE SURE PART FOLDERS ARE ITERATING CORRECTLY //
// FOLDERS OF LENGTH 15 AND 18 HAVE SLIGHT DIFFERENCES IN NAMING CONVENTION //

function checkPart(steveDoc, twoDigit, projectFolder, iFolder) {
  
  if(iFolder.getName().length == 15) { // FIRST LEVEL ASM FOLDER //
    var tens = iFolder.getName().charAt(13); 
    var ones = iFolder.getName().charAt(14);
  } else if (iFolder.getName().length == 18) { // SUB LEVEL ASM FOLDER //
    twoDigit = iFolder.getName().substring(0,14); // FORMAT THE STRING TO BE THE FOLDER NAME //
    var tens = iFolder.getName().charAt(16); 
    var ones = iFolder.getName().charAt(17);
  }
  
  // PRINTS FOLDERS WITH MISSING TRIPLE DIGITS BY CHECKING IF THE PREVIOUS FOLDER NUMBER EXISTS //
  if(tens == 0){
    var counter = ones;
  } else {
   var counter = tens + ones; 
  }
  while(counter != 0) {
    if(counter < 10){
     var filler = "-00";
    } else{
     var filler = "-0"; 
    }
    if(!folderExists(steveDoc, twoDigit + filler + counter, twoDigit + filler + counter)) {
      addToDoc("missing",projectFolder + " STEVE" ,twoDigit + filler + counter, 'blank');
    }
    counter--;
  }  
}


//  --- INSIDE SUB ASM FOLDER ---  //


// CHECKS SUB ASM ITERATION //
function checkSubAsm(steveDoc, twoDigit, projectFolder, iFolder, letterLevels, letter) { 
  letterLevels.push(letter);
  var max = 0;
  var subAsmName = iFolder.getName().substring(0,12);
  var steveFolders = steveDoc.searchFolders("title contains '" + subAsmName + "'");
  while(steveFolders.hasNext()) {
    var steveFolder = steveFolders.next();
    var tens = steveFolder.getName().charAt(12);
    var ones = steveFolder.getName().charAt(13);
    var i = tens + ones;
    if (parseInt(i) > max) { 
      // RETRIEVE HIGHEST DOUBLE DIGIT SUB ASM FOLDER // 
      max = i; 
    }
  }

  for(var i = 1; i <= max; i++) { // ITERATES THROUGH ALL SUBASM AND PARTS OF THAT LEVEL //
    if(i < 10) {
      var title = subAsmName + '0' + i; 
    } else {
      var title = subAsmName + i;
    }
    if(!folderExists(steveDoc, title, title)) { // IF ITERATING SUB ASM FOLDER DOESNT EXIST THAN ADD TO DOC //
      addToDoc("missing",projectFolder + " STEVE", title, 'blank');
    }
  }
  
  return letterLevels;
}


//  --- INSIDE PART FOLDERS ---  //


function part(projectFolder) {
  
  if(projectFolder.getName().length == 15) { // IF PART FOLDER IS FIRST LEVEL //
    var maxFileLen = 26;
    var maxFolderLen = 27;
  } else if(projectFolder.getName().length == 18) { // IF PART FOLDER IS SUB LEVEL //
    var maxFileLen = 29;
    var maxFolderLen = 30;
  }
  
  // CHECKS FOR WRONG FILE NAMES //
  var allFiles = projectFolder.getFiles();
  while(allFiles.hasNext()) {
    var allFile = allFiles.next();
    if(allFile.getName().indexOf(projectFolder.getName() + '-M') != 0 || allFile.getName().length > maxFileLen) {
      addToDoc("incorrect",projectFolder ,allFile.getName(), allFile);
    }
  }
  
  // CHECKS FOR WRONG FOLDER NAMES //
  var allFolders = projectFolder.getFolders();
  while(allFolders.hasNext()) {
    var allFolder = allFolders.next();
    if(allFolder.getName().indexOf(projectFolder.getName() + '-M') != 0 || allFolder.getName().length > maxFolderLen) {
      addToDoc("incorrect",projectFolder ,allFolder.getName(), allFolder);
    }
  }
  
  var max = 0;
  // ITERATE ONCE TO COUNT FOLDERS //
  var simFolders = projectFolder.searchFolders("title contains '" + projectFolder.getName() + '-M' + "'");
  while(simFolders.hasNext()) {
    var simFolder = simFolders.next();
    
    if(projectFolder.getName().length == 15) { // IF PART FOLDER IS FIRST LEVEL //
      var tens = simFolder.getName().charAt(17);
      var ones = simFolder.getName().charAt(18);
    } else if(projectFolder.getName().length == 18) { // IF PART FOLDER IS SUB LEVEL //
      var tens = simFolder.getName().charAt(20);
      var ones = simFolder.getName().charAt(21);
    }
    var i = tens + ones;
    if (parseInt(i) > max) { 
      // RETRIEVE HIGHEST DOUBLE DIGIT FOLDER // 
      max = i; 
    }
  }
  var fileMax = 0;
  // ITERATE ONCE TO COUNT FILES //
  var simFiles = projectFolder.searchFiles("title contains '" + projectFolder.getName() + '-M' + "'");
  while(simFiles.hasNext()) {
    var simFile = simFiles.next();
    if(projectFolder.getName().length == 15) { // IF PART FOLDER IS FIRST LEVEL //
      var tens = simFile.getName().charAt(17);
      var ones = simFile.getName().charAt(18);
    } else if(projectFolder.getName().length == 18) { // IF PART FOLDER IS SUB LEVEL //
      var tens = simFile.getName().charAt(20);
      var ones = simFile.getName().charAt(21);
    }
    var x = tens + ones;
    if (parseInt(i) > max) { 
      // RETRIEVE HIGHEST DOUBLE DIGIT FOLDER // 
      fileMax = x; 
    }
  }
  
  // ITERATE TO CHECK FILE NAMES //
  for(var x = 1; x <= fileMax; x++) {
    var fileFlag = false;
    if(x<10) {
      var twoDigit = projectFolder.getName() + '-M0' + x.toString();
    } else {
      var twoDigit = projectFolder.getName() + '-M' + x.toString();
    }
    
    // CHECKS FOR CORRECT FILE NUMBER //
    var allFiles = projectFolder.searchFiles("title contains '" + twoDigit + "'");
    while(allFiles.hasNext()) {
      var allFile = allFiles.next();
      fileFlag = true;
    }
    if(!fileFlag) {
      addToDoc("missing",projectFolder.getName() + " STEVE" , twoDigit,'blank');
    }
  }
  
  // ITERATE TO CHECK FOLDER NAMES //
  for(var i = 1; i <= max; i++) {
    var correctMark = false;
    
    if(i < 10) { 
      var twoDigit = projectFolder.getName() + '-M0' + i.toString(); // IF FOLDER IS SINGLE DIGIT //
    } else {
      var twoDigit = projectFolder.getName() + '-M' + i.toString();  // IF FOLDER IS DOUBLE DIGIT //
    }
    
    var markFolders = projectFolder.searchFolders("title contains '" + twoDigit + "'");
    while(markFolders.hasNext()) {
      var markFolder = markFolders.next();
      var markName = markFolder.getName();
      var flag = false;
      correctMark = true;
      
      // RETRIEVES LAST TWO DIGITS OF FOLDER FOR RUNS //
      if(markName.length == 23) { // ASM TST FOLDER //
        
        flag = true;
        
      } else if(markName.length == 27) { // ASM FLU FOLDER //
        
        flag = true;
        var tens = markFolder.getName().charAt(25);
        var ones = markFolder.getName().charAt(26);
        var markFolderType = markName.substring(0, 24); // UP TO THE RUN NUMBER //
        
      }else if(markName.length == 26) { // SUB ASM TST FOLDER //
        
        flag = true;
        
      }else if(markName.length == 30) { // SUB ASM FLU FOLDER //
        
        flag = true;
        var tens = markFolder.getName().charAt(28);
        var ones = markFolder.getName().charAt(29);
        var markFolderType = markName.substring(0, 27); // UP TO THE RUN NUMBER //
      }
      
      if(tens == 0){
        var counter = ones;
      } else {
        var counter = tens + ones; 
      }
      
      while(counter != 0 && flag == true && markFolderType != undefined) { // ONLY FLU FOLDERS //
        // PRINTS FOLDERS WITH MISSING TRIPLE DIGITS //
        if(counter < 10) {
          var run = 'R0';
        } else {
          var run = 'R';
        }   
        // CHECKING FOR MISSING FLU RUN FOLDERS //
        if(!folderExists(projectFolder, markFolderType + run + counter, markFolderType + run + counter)) { 
          addToDoc("missing", projectFolder.getName() + " STEVE" , markFolderType + run + counter, 'blank');
        }
        counter--;
      }
      
      // TRIGGERED WHEN THERE IS A MISSING FLU OR TST FOLDER // 
      if(!flag) {
        addToDoc("incorrect",projectFolder.getName() + " STEVE" , markName ,'blank');
      }
    }
    // TRIGGERED WHEN THERE IS A INCORRECT MARK NUMBER // 
    if(!correctMark) {
      addToDoc("missing",projectFolder.getName() + " STEVE" , twoDigit ,'blank');
    }
  }
}


// GOES INSIDE DOCS //
function Documents(documents, projectFolder){
  var prjSplit = projectFolder.getName().split("-");
  var prjNumber = prjSplit[0];
  var docs = documents.getFolders();
  while(docs.hasNext()){
    var doc = docs.next();
    if(doc.getName()=="Diagrams"){
      checkDiagrams(doc, prjNumber, projectFolder);
    }else if(doc.getName()=="BOMs")
    {
      checkBOMs(doc, prjNumber, projectFolder);
    }else if(doc.getName()=="Meetings")
    {
      checkMeetings(doc, projectFolder);
    }
  }//End of while loop
}

//CHECKS DIAGRAMS FOLDER FOR CONSISTENCY//
function checkDiagrams(diagrams,prjNumber, projectFolder){ //Parameters will include(parentFolder)
  /*
  Split[0] = 1001 (PRJ #) 
  Split[1] = PRJ 
  Split[2] = PNID or EICD 
  Split[3] = Version #
  */ 
  var pnidTitle = "PNID"; 
  var eicdTitle = "EICD";
  //var prjNumber = "1001";
  var pnidCounter = 0; //# of pnid files 
  var eicdCounter = 0; //# of eicd files 
  
  var diagramFiles = diagrams.getFiles();
  
  while(diagramFiles.hasNext()){
    var file = diagramFiles.next(); 
    if((file.getName().indexOf("PNID")==-1 || file.getName().indexOf("EICD")==-1) && file.getName() != projectFolder+"-TREE")
    {
      addToDoc("incorrect", projectFolder+" Diagrams",file.getName(),file );
    }
  }
  
  //PNID//
  var pnid = diagrams.searchFiles('title contains "PNID"');
  while(pnid.hasNext()){
    var pnidFile = pnid.next();
    var pnidName = pnidFile.getName();
    var pnidSplit = pnidName.split("-"); //Split at the dash 
    if(pnidSplit[0]==prjNumber && pnidName.length==15 ){
      pnidCounter++;
    }
  }
  
  //CHECK EXISTENCE OF CORRECT PNID FILES// 
  for(var i=1; i<=pnidCounter; i++){
    var pnidTarget = projectFolder+"-PNID-"+i;
    if(!fileExists(diagrams, pnidTarget, pnidTitle)){
      addToDoc("missing", projectFolder+" Diagrams",pnidTarget,"blank");
    }
  }
  
  //EICD//
  var eicd = diagrams.searchFiles('title contains "EICD"');
  while(eicd.hasNext()){
    var eicdFile = eicd.next()
    var eicdName = eicdFile.getName();
    var eicdSplit = eicdName.split("-"); //Split at the dash 
    if(eicdSplit[0]==prjNumber && pnidName.length==15){
      eicdCounter++;
    }
  }
  
  //CHECK EXISTENCE OF CORRECT EICD FILES// 
  for(var i=1; i<=eicdCounter; i++){
    var eicdTarget = projectFolder+"EICD-"+i;
    if(!fileExists(diagrams, eicdTarget, eicdTitle)){
      addToDoc("missing", projectFolder+ " Diagrams",eicdTarget,"blank");
    }
  } 
}//End of method


//CHECKS MEETINGS FOLDER FOR CONSISTENCY//
function checkMeetings(meetings, projectFolder){
  //var meetings = getFolder("Meetings");
  var meetFiles = meetings.getFiles();
  while(meetFiles.hasNext()){
    var file = meetFiles.next(); 
    var fileName = file.getName(); 
    if(!meetingHelp(fileName)){
      addToDoc("incorrect",projectFolder+ " Meetings" ,fileName, file); //ADD FILE NAME TO LIST// 
    } 
  }
}

//HELPER METHOD TO CHECK FILES IN MEETINGS//
function meetingHelp(fileName){
  var flag = true;
  var nameArray = fileName.split(" "); //Splits file name at whitespace 
  if(nameArray[0].length!=10){//Checks date for correct length 
    flag = false;
  }else if(nameArray[1]!="Client" && nameArray[1]!="Team")
  {
    flag = false; 
  }
  return flag;
}


//CHECKS BOMs FOLDER FOR CONSISTENCY//
function checkBOMs(boms, prjNumber, projectFolder){
  var prjFolderSplit = projectFolder.getName().split("-"); 
  var prj = prjFolderSplit[1];
  var digitFlag = false;
  var bomsCounter = 0; 
  var bomsLength = 15; 
  var bomsFiles = boms.getFiles(); //Retrieves all files inside of BOMs 
  //Count the # of files inside of BOMs
  while(bomsFiles.hasNext()){
    var bomsFile = bomsFiles.next();
    var bomsSplit = bomsFile.getName().split("-");
    if(bomsFile.getName().length==bomsLength && bomsSplit[0] == prjNumber){ 
      bomsCounter++; 
    }else{
      addToDoc("incorrect",projectFolder + " BOMs" ,bomsFile.getName(), bomsFile);
    }
  }
  
  //SEARCH FOR BOMS THAT SHOULD EXIST//
  for(var i=1; i<=bomsCounter;i++){
    if(i>9){//Checks for single or double digit
      digitFlag = true;
    }else{
      digitFlag = false;
    } 
    
    if(digitFlag){
      var bomsTarget = projectFolder+"-BOM-"+i; 
      if(!fileExists(boms,bomsTarget,"-"+prj+"-BOM-")){
        addToDoc("missing",projectFolder+" BOMs" ,bomsTarget,"blank");
      }
    }else{
      var bomsTarget = projectFolder+"-BOM-0"+i;
      if(!fileExists(boms,bomsTarget,"-"+prj+"-BOM-")){
        addToDoc("missing",projectFolder+" BOMs", bomsTarget,"blank");
      }
    }
  }//END OF FOR LOOP//
  
}//END OF FUNCTION//
 

//RETURNS TRUE IF FILE EXISTS WITHIN PARENT, FALSE OTHERWISE// 
function fileExists(parent,target,title){
  var flag = false; 
  var parentFiles = parent.searchFiles("title contains '" + title + "'");
  while(parentFiles.hasNext()){
    var fileName = parentFiles.next();
    if(fileName.getName() == target){
      flag = true;
      break;
    }
  }
  return flag;
}

//RETURNS TRUE IF FILE EXISTS WITHIN PARENT, FALSE OTHERWISE// 
function folderExists(parent,target,title){
  var flag = false; 
  var parentFolders = parent.searchFolders("title contains '" + title + "'");
  while(parentFolders.hasNext()){
    var folderName = parentFolders.next();
    if(folderName.getName() == target){
      flag = true;
      break;
    }
  }
  return flag;
}


/*
METHODS BELOW ARE FOR DOCUMENT/EMAIL MANIPULATION
*/

//ADDS INCORRECTLY NAMED FILE/FOLDER TO DOC// 
function addToDoc(error,location, toAdd, folder){
  
  //MAKE SURE FOLDER/FILE IS INCORRECTLY NAMED AND NOT MISSING//
  if(folder != "blank") {
      var owner = folder.getOwner().getName();
      if(owner == "Reiley Weekes"){
        var doc = DocumentApp.openByUrl("https://docs.google.com/document/d/17kMKdz6Ev1SgE2j3By3ta6zftdiIdbaVlz-IpzaVB1M/edit");
      }else if(owner == "A K")
      {
        var doc = DocumentApp.openByUrl("https://docs.google.com/document/d/1fQHIKW6KJGZpQkc1EsS26-6Y4xJOcrLDgNP7nVJCLh8/edit");
      }else if(owner == "Kyle Adriany")
      {
        var doc = DocumentApp.openByUrl("https://docs.google.com/document/d/1Ztkp0tpy-7--SCm_seot0m3RD4OHcCxsLznK-eVMcfU/edit");
      }else if(owner == "Andy Kieatiwong")
      {
        var doc = DocumentApp.openByUrl("https://docs.google.com/document/d/1xrQ2VDlTgiE6cegBS4ObbsTQ8N1WM2eXZw__QonZ9yY/edit");
      }else
      {
        var doc = DocumentApp.openByUrl("https://docs.google.com/document/d/1uqPBiChUh9AYSUHbTv3ZP5vE9FN_ur3VBe7i_ACpmkA/edit"); 
      }
    
    var docText = doc.getBody().editAsText();
    if(error == "missing") {
      docText.appendText("\n"+ toAdd + " - MISSING FROM " + location); 
    }else if(error == "incorrect") {
      docText.appendText("\n"+ toAdd + " - INCORRECT IN " + location); 
    }
    
  }else{
    var doc =  DocumentApp.openByUrl("https://docs.google.com/document/d/1uqPBiChUh9AYSUHbTv3ZP5vE9FN_ur3VBe7i_ACpmkA/edit");
    var docText = doc.getBody().editAsText();
    if(error == "missing") {
      docText.appendText("\n"+ toAdd + " - MISSING FROM " + location); 
    }else if(error == "incorrect") {
      docText.appendText("\n"+ toAdd + " - INCORRECT IN " + location); 
    }
  }//end of else 
}

