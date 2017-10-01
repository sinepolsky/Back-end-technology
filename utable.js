/****************************************************************************/
function UTable(oParams){
  this.oTable = null;
  this.nColumnAutoInc = 0;
  this.aColumns = [];
  var cIdContainer = "";
  var oContainer = null;
  var aSize = [5,5];
  if (typeof(oParams.cIdContainer) === "string" && oParams.cIdContainer.length){
    oContainer = document.getElementById(oParams.cIdContainer);
  } else {
    return false;
  }
  if ((oParams.aSize instanceof Array) && (oParams.aSize.length === 2)
      && (typeof(oParams.aSize[0]) === "number")
      && (typeof(oParams.aSize[1]) === "number")
      && (oParams.aSize[0] > 0)
      && (oParams.aSize[1] > 0)){
    aSize = oParams.aSize;
  } 
  this.iniTableNode(oContainer,aSize);
  this.aIndexCoords = [];
  this.oCornerNode = null;
  this.setTableNode(this.oTable);
  this.oActiveCell = null;
  this.lEditCell = false;
  this.cOldValue = "";
};
UTable.oKeys = {
  kLeft: 37,
  kRight: 39,
  kUp: 38,
  kDown: 40,
  kHome: 36,
  kEnd: 35,
  kInsert: 45,
  kDelete: 46,
  kAsterisk: 106,
  kMinus: 189,
  kMinusNum: 109,
  kPlus: 107,
  kEqual: 187,
  kEnter: 13
};

UTable.prototype.quoteattr = function(s, preserveCR) {
  preserveCR = preserveCR ? '&#13;' : '\n';
  return ('' + s) /* Forces the conversion to string. */
      .replace(/'/g, '&apos;') /* The 4 other predefined entities, required.*/
      .replace(/"/g, '&quot;');
      //.replace(/</g, '&lt;')
      //.replace(/>/g, '&gt;');
}

UTable.prototype.getDefaultColumnHeadHtml = function(){
  var cHtml = "";
  var nCol = this.nColumnAutoInc+1;
  this.nColumnAutoInc++;
  cHtml = "<div class='ucolumn_name'>column"
    +((nCol<10)?"0":"")
    +nCol.toString()
    +"</div>";
  return cHtml;
};

UTable.prototype.iniTableNode = function(oContainer,aSize){
  var oTHead = document.createElement("THEAD");
  var oTBody = document.createElement("TBODY");
  var oTHeadRow = document.createElement("TR");
  for (var i = 0; i < aSize[1]; i++){
    var oTHeadTh = document.createElement("TH");
    oTHeadTh.innerHTML = this.getDefaultColumnHeadHtml();
    oTHeadRow.appendChild(oTHeadTh);
  }
  oTHead.appendChild(oTHeadRow);
  for (var i = 0; i < aSize[0]; i++){
    var oTBodyRow = document.createElement("TR");
    for (var j = 0; j < aSize[1]; j++){
      var oTBodyTd = document.createElement("TD");
      oTBodyTd.innerHTML = "("+(i+1).toString()+", "+(j+1).toString()+")";
      oTBodyRow.appendChild(oTBodyTd);
    }
    oTBody.appendChild(oTBodyRow);
  }
  this.oTable = document.createElement("TABLE");
  
  this.oTable.appendChild(oTHead);
  this.oTable.appendChild(oTBody);
  oContainer.appendChild(this.oTable);
  return this.oTable;
};

UTable.prototype.getTableNode = function(){
  return this.oTable;
};

UTable.prototype.getFirstChildNode = function(oParent,cNode){
  if (!(oParent && oParent.childNodes && oParent.childNodes.length)){
    return null;
  }
  for (var i = 0; i < oParent.childNodes.length; i++){
    var oNode = oParent.childNodes[i];
    if (oNode.nodeName === cNode){
      return oNode;
    }
  }
  return null;
};

UTable.prototype.getNthChildNode = function(oParent,cNode,nIndex){
  var cnt = 0;
  if (!(oParent && oParent.childNodes && oParent.childNodes.length)){
    return null;
  }
  for (var i = 0; i < oParent.childNodes.length; i++){
    var oNode = oParent.childNodes[i];
    if (oNode.nodeName === cNode){
      if (cnt === nIndex){
        return oNode;
      }
      cnt++;
    }
  }
  return null;
};

UTable.prototype.getAllChildNodes = function(oParent,cNode){
  var aNodes = [];
  if (!(oParent && oParent.childNodes && oParent.childNodes.length)){
    return aNodes;
  }
  for (var i = 0; i < oParent.childNodes.length; i++){
    var oNode = oParent.childNodes[i];
    if (oNode.nodeName === cNode){
      aNodes.push( oNode );
    }
  }
  return aNodes;
};

UTable.prototype.getTNode = function(cNode){
  if (!(this.oTable && this.oTable.childNodes && this.oTable.childNodes.length)){
    return null;
  }
  for (var i = 0; i < this.oTable.childNodes.length; i++){
    var oNode = this.oTable.childNodes[i];
    if (oNode.nodeName === cNode){
      return oNode;
    }
  }
  return null;
};

UTable.prototype.getTHead = function(){
  return this.getTNode("THEAD");
};

UTable.prototype.getTBody = function(){
  return this.getTNode("TBODY");
};

UTable.prototype.getColumnLength = function(){
  var oHead = this.getTNode("THEAD");
  var oTr = null;
  if (!oHead){
    return 0;
  }
  oTr = this.getFirstChildNode(oHead,"TR");
  if (!oTr){
    return 0;
  }
  return this.getAllChildNodes(oTr,"TH").length;
};

UTable.prototype.getRowLength = function(){
  var oTBody = this.getTNode("TBODY");
  var aRows = this.getAllChildNodes(oTBody,"TR");
  if (!aRows || !aRows.length){
    return 0;
  }
  return aRows.length;
}

UTable.prototype.getNthColumnNodes = function(nIndex){
  var aTDs = [];
  var oTHead = this.getTNode("THEAD");
  var oTBody = this.getTNode("TBODY");
  var oTHeadRow = null;
  var aTBodyRows = [];
  var oTh = null;
  if (!oTHead){
    return aTDs;
  }
  oTHeadRow= this.getFirstChildNode(oTHead,"TR");
  if (!oTHeadRow){
    return aTDs;
  }
  oTh = this.getNthChildNode(oTHeadRow,"TH",nIndex);
  if (oTh){
    aTDs.push(this.getNthChildNode(oTHeadRow,"TH",nIndex));
  }
  aTBodyRows = this.getAllChildNodes(oTBody,"TR");
  for (var i = 0; i < aTBodyRows.length; i++){
    var oTd = this.getNthChildNode(aTBodyRows[i],"TD",nIndex);
    if (oTd){
      aTDs.push(oTd);
    }
  }
  return aTDs;
};

UTable.prototype.getNthRowNodes = function(nIndex){
  var aTDs = [];
  var oTBody = this.getTNode("TBODY");
  var oRow = null;
  if (!oTBody){
    return aTDs;
  }
  oRow = this.getNthChildNode(oTBody,"TR",nIndex);
  if (!oRow){
    return aTDs;
  }
  aTDs = this.getAllChildNodes(oRow,"TD");
  return aTDs;
};

UTable.prototype.getCellDefaultHtml = function(nColumnIndex){
  var cHtml = "&nbsp;";
  if (this.aColumns[nColumnIndex].type === "boolean"){
    cHtml = "<input type='checkbox' "
      +((this.aColumns[nColumnIndex].xDefaultValue)? "checked":"")+" />";
  }
  return cHtml;
};

UTable.prototype.getNewEmptyRow = function(){
  var oRowNew = document.createElement("TR");
  var nCol = 0;
  nCol = this.getColumnLength();
  for (var i = 0; i < nCol; i++){
    oTd = document.createElement("TD");
    oTd.innerHTML = this.getCellDefaultHtml(i);
    oRowNew.appendChild(oTd);
  }
  return oRowNew;
}

UTable.prototype.insertRowBefore = function(nIndex){
  var oRow = null;
  var oRowNew = null;
  var oTBody = this.getTNode("TBODY");
  if (!oTBody){
    return null;
  }
  oRow = this.getNthChildNode(oTBody,"TR",nIndex);
  if (!oRow){
    return null;
  }
  oRowNew = this.getNewEmptyRow();
  var res=oTBody.insertBefore(oRowNew,oRow);
  this.resetTabIndexes();
  return res;
};

UTable.prototype.appendRow = function(){
  var oRowNew = null;
  var oTBody = this.getTNode("TBODY");
  if (!oTBody){
    return null;
  }
  oRowNew = this.getNewEmptyRow();
  var res=oTBody.appendChild(oRowNew);
  this.resetTabIndexes();
  return res;
};

UTable.prototype.deleteRow = function(nIndex){
  var oTBody = this.getTNode("TBODY");
  var oRow = null;
  if (!oTBody){
    return false;
  }
  oRow = this.getNthChildNode(oTBody,"TR",nIndex);
  if (!oRow){
    return false;
  }
  oRow.parentNode.removeChild(oRow);
  this.resetTabIndexes();
  return true;
};

UTable.prototype.swapRows = function(nIndex1,nIndex2){
  var oTBody = this.getTNode("TBODY");
  var oRow1 = null;
  var oRow2 = null;
  var aTds1 = [], aTds2 = [];
  var cHtml = "", cClass1=cClass2="", nH1 = 0, nH2 = 0;
  if (!oTBody){
    return false;
  }
  oRow1 = this.getNthChildNode(oTBody,"TR",nIndex1);
  if (!oRow1){
    return false;
  }
  aTds1 = this.getAllChildNodes(oRow1,"TD");
  oRow2 = this.getNthChildNode(oTBody,"TR",nIndex2);
  if (!oRow2){
    return false;
  }
  nH1 = oRow1.getAttribute("highlighted");
  nH2 = oRow2.getAttribute("highlighted");
  if (nH1 && !nH2){
    oRow1.removeAttribute("highlighted");
    oRow1.className = oRow1.className.replace(" highlighted","");
    oRow2.setAttribute("highlighted",1);
    oRow2.className += " highlighted";
  }
  if (!nH1 && nH2){
    oRow2.removeAttribute("highlighted");
    oRow2.className = oRow2.className.replace(" highlighted","");
    oRow1.setAttribute("highlighted",1);
    oRow1.className += " highlighted";
  }
  aTds2 = this.getAllChildNodes(oRow2,"TD");
  for (var i = 0; i < aTds1.length; i++){
    cHtml = aTds1[i].innerHTML;
    aTds1[i].innerHTML = aTds2[i].innerHTML;
    aTds2[i].innerHTML = cHtml;
  }
  this.resetTabIndexes();
  return true;
};

UTable.prototype.insertColumnBefore = function(nIndex){
  var oTHead = this.getTNode("THEAD");
  var oTBody = this.getTNode("TBODY");
  var oTHeadRow = null;
  var aTBodyRows = [];
  var oTh = null;
  var nIntIndex = -1, nLen = -1;
  var oColumn, oThNew, oTdNew;
  if (!oTHead || !oTBody || typeof(nIndex) !== "number"){
    return false;
  }
  nIntIndex = Math.round(nIndex,0);
  nLen = this.getColumnLength();
  if (nIntIndex < 0 || nIntIndex >= nLen){
    return false;
  }
  this.aColumns.push(new UColumn(this,nLen-1));
  for (var i = nLen; i > nIntIndex; i--){
    this.aColumns[i] = this.aColumns[i-1];
    this.aColumns[i].index=i;
  }
  oTHeadRow = this.getFirstChildNode(oTHead,"TR");
  if (!oTHeadRow){
    return false;
  }
  oTh = this.getNthChildNode(oTHeadRow,"TH",nIntIndex);
  if (!oTh){
    return false;
  }
  oThNew = document.createElement("TH");
  oThNew.innerHTML = this.getDefaultColumnHeadHtml();
  oTHeadRow.insertBefore(oThNew,oTh);
  aTBodyRows = this.getAllChildNodes(oTBody,"TR");
  if (!aTBodyRows || !aTBodyRows.length){
    return false;
  }
  for (var i = 0; i < aTBodyRows.length; i++){
    var oTd = this.getNthChildNode(aTBodyRows[i],"TD",nIntIndex);
    oTdNew = document.createElement("TD");
    oTdNew.innerHTML = "&nbsp;";
    if (!oTd){
      return false;
    }
    aTBodyRows[i].insertBefore(oTdNew,oTd);
  }
  oColumn = new UColumn(this,nIntIndex);
  this.aColumns[nIntIndex] = oColumn;
  this.resetTabIndexes();
  return oColumn;
};

UTable.prototype.appendColumn = function(){
  var oTHead = this.getTNode("THEAD");
  var oTBody = this.getTNode("TBODY");
  var oTHeadRow = null;
  var aTBodyRows = [];
  var oTh = null;
  var nLen = -1;
  var oColumn, oThNew, oTdNew;
  if (!oTHead || !oTBody){
    return false;
  }
  nLen = this.getColumnLength();
  oTHeadRow= this.getFirstChildNode(oTHead,"TR");
  if (!oTHeadRow){
    return false;
  }
  oThNew = document.createElement("TH");
  oThNew.innerHTML = this.getDefaultColumnHeadHtml();
  oTHeadRow.appendChild(oThNew);
  aTBodyRows = this.getAllChildNodes(oTBody,"TR");
  if (!aTBodyRows || !aTBodyRows.length){
    return false;
  }
  for (var i = 0; i < aTBodyRows.length; i++){
    oTdNew = document.createElement("TD");
    oTdNew.innerHTML = "&nbsp;";
    aTBodyRows[i].appendChild(oTdNew);
  }
  oColumn = new UColumn(this,nLen);
  this.aColumns.push(oColumn);
  this.resetTabIndexes();
  return oColumn;
};

UTable.prototype.swapColumns = function(nIndex1,nIndex2){
  var oTHead = this.getTNode("THEAD");
  var oTBody = this.getTNode("TBODY");
  var oTHeadRow = null;
  var aTBodyRows = [];
  var oTh1 = null, oTh2 = null;
  var nIntIndex1 = -1,nIntIndex2 = -1, nLen = -1;
  var oColumn, cTemp = "";
  if (!oTHead || !oTBody 
      || typeof(nIndex1) !== "number" || typeof(nIndex2) !== "number"){
    return false;
  }
  nIntIndex1 = Math.round(nIndex1,0);
  nIntIndex2 = Math.round(nIndex2,0);
  nLen = this.getColumnLength();
  if (nIntIndex1 < 0 || nIntIndex1 >= nLen
      || nIntIndex2 < 0 || nIntIndex2 >= nLen){
    return false;
  }
  oTHeadRow= this.getFirstChildNode(oTHead,"TR");
  if (!oTHeadRow){
    return false;
  }
  oTh1 = this.getNthChildNode(oTHeadRow,"TH",nIntIndex1);
  oTh2 = this.getNthChildNode(oTHeadRow,"TH",nIntIndex2);
  if (!oTh1 || !oTh2){
    return false;
  }
  cTemp = oTh1.innerHTML;
  oTh1.innerHTML = oTh2.innerHTML;
  oTh2.innerHTML = cTemp;
  aTBodyRows = this.getAllChildNodes(oTBody,"TR");
  if (!aTBodyRows || !aTBodyRows.length){
    return false;
  }
  for (var i = 0; i < aTBodyRows.length; i++){
    var oTd1 = this.getNthChildNode(aTBodyRows[i],"TD",nIntIndex1);
    var oTd2 = this.getNthChildNode(aTBodyRows[i],"TD",nIntIndex2);
    if (!oTd1 || !oTd2){
      return false;
    }
    cTemp = oTd1.innerHTML;
    oTd1.innerHTML = oTd2.innerHTML;
    oTd2.innerHTML = cTemp;
  }
  oColumn = this.aColumns[nIntIndex1];
  this.aColumns[nIntIndex1] = this.aColumns[nIntIndex2];
  this.aColumns[nIntIndex2] = oColumn;
  this.resetTabIndexes();
  return true;
};

UTable.prototype.deleteColumn = function(nIndex){
  var oTHead = this.getTNode("THEAD");
  var oTBody = this.getTNode("TBODY");
  var oTHeadRow = null;
  var aTBodyRows = [];
  var oTh = null;
  var nLen = -1, nIntIndex = -1;
  var oColumn;
  if (!oTHead || !oTBody || typeof(nIndex) !== "number"){
    return false;
  }
  nIntIndex = Math.round(nIndex,0);
  nLen = this.getColumnLength();
  if (nIntIndex < 0 || nIntIndex >= nLen){
    return false;
  }
  for (var i = nIntIndex; i < nLen-1; i++){
    this.aColumns[i] = this.aColumns[i+1];
    this.aColumns[i].index=i;
  }
  this.aColumns.pop();
  oTHeadRow= this.getFirstChildNode(oTHead,"TR");
  if (!oTHeadRow){
    return false;
  }
  oTh = this.getNthChildNode(oTHeadRow,"TH",nIntIndex);
  if (!oTh){
    return false;
  }
  aTBodyRows = this.getAllChildNodes(oTBody,"TR");
  if (!aTBodyRows || !aTBodyRows.length){
    return false;
  }
  oTh.parentNode.removeChild(oTh);
  for (var i = 0; i < aTBodyRows.length; i++){
    var oTd = this.getNthChildNode(aTBodyRows[i],"TD",nIntIndex);
    if (oTd){
      oTd.parentNode.removeChild(oTd);
    }
  }
  this.resetTabIndexes();
  return true;
};


UTable.prototype.getAllCellNodes = function(){
  var aNodes = [];
  var oTBody = this.getTNode("TBODY");
  var aRows = this.getAllChildNodes(oTBody,"TR");
  if (!aRows || !aRows.length){
    return aNodes;
  }
  for (var i = 0; i < aRows.length; i++){
    var aTds = this.getAllChildNodes(aRows[i],"TD");
    if (!aTds || !aTds.length){
      return aNodes;
    }
    var aNodeRow = [];
    for (var j =0; j < aTds.length; j++){
      aNodeRow.push(aTds[j]);
    }
    aNodes.push(aNodeRow);
  }
  return aNodes;
};

UTable.prototype.getActiveCoords = function(){
  if (!this.oActiveCell){
    return [-1,-1];
  }
  return this.aIndexCoords[this.oActiveCell.tabIndex];
};

UTable.prototype.stepCell = function(nKey){
  if (!this.oActiveCell){
    return false;
  }
  var aCoords = this.aIndexCoords[this.oActiveCell.tabIndex];
  var nRow = aCoords[0], nCol = aCoords[1];
  var oCurrentCell = this.oActiveCell, oCurrentRow = this.oActiveCell.parentNode;
  switch (nKey){
    case UTable.oKeys.kLeft:
      oCurrentCell = oCurrentCell.previousSibling;
      while (oCurrentCell && oCurrentCell.nodeName !== "TD"){
        oCurrentCell = oCurrentCell.previousSibling;
      }
      if (oCurrentCell && oCurrentCell.nodeName === "TD"){
        this.setActiveCell(oCurrentCell,true);
      }
    break;
    case UTable.oKeys.kRight:
      oCurrentCell = oCurrentCell.nextSibling;
      while (oCurrentCell && oCurrentCell.nodeName !== "TD"){
        oCurrentCell = oCurrentCell.nextSibling;
      }
      if (oCurrentCell && oCurrentCell.nodeName === "TD"){
        this.setActiveCell(oCurrentCell,true);
      }
    break;
    case UTable.oKeys.kUp:
      oCurrentRow = oCurrentRow.previousSibling;
      while (oCurrentRow && oCurrentRow.nodeName !== "TR"){
        oCurrentRow = oCurrentRow.previousSibling;
      }
      if (oCurrentRow
          && oCurrentRow.nodeName === "TR"){
        this.setActiveCell(this.getNthChildNode(oCurrentRow,"TD",nCol),true);
      }
    break;
    case UTable.oKeys.kDown:
      oCurrentRow = oCurrentRow.nextSibling;
      while (oCurrentRow && oCurrentRow.nodeName !== "TR"){
        oCurrentRow = oCurrentRow.nextSibling;
      }
      if (oCurrentRow
          && oCurrentRow.nodeName === "TR"){
        this.setActiveCell(this.getNthChildNode(oCurrentRow,"TD",nCol),true);
      }
    break;
  }
};

UTable.prototype.setFocusByKey = function(e){
  var keyCode = e.which || e.keyCode;
  var nCol = this.getColumnLength();
  var nRow = this.getRowLength();
  var oTBody = this.getTNode("TBODY");
  var aCoords = this.getActiveCoords();
  var oFirstRow = this.getNthChildNode(oTBody,"TR",0);
  var oLastRow = this.getNthChildNode(oTBody,"TR",nRow-1);
  var oCurrentRow = this.oActiveCell.parentNode;
  if (!e.ctrlKey && !e.shiftKey && keyCode === UTable.oKeys.kEnd){
    //End
    this.setActiveCell(this.getNthChildNode(oCurrentRow,"TD",nCol-1),true); 
  }
  if (!e.ctrlKey && !e.shiftKey && keyCode === UTable.oKeys.kHome){
    //Home
    this.setActiveCell(this.getNthChildNode(oCurrentRow,"TD",0),true); 
  }
  if (e.ctrlKey && !e.shiftKey && keyCode === UTable.oKeys.kEnd){
    //Ctrl+End
    this.setActiveCell(this.getNthChildNode(oLastRow,"TD",aCoords[1]),true); 
  }
  if (e.ctrlKey && !e.shiftKey && keyCode === UTable.oKeys.kHome){
    //Ctrl+Home
    this.setActiveCell(this.getNthChildNode(oFirstRow,"TD",aCoords[1]),true);
  }
};

UTable.prototype.addRowOrColumn = function(lColumn){
  var nSize = ((lColumn)? this.getColumnLength() : this.getRowLength());
  var nCoord = this.getActiveCoords()[((lColumn)? 1:0)];
  var cAction = "this."+((lColumn)? 
    "insertColumnBefore":"insertRowBefore")+"(nCoord+1)";
  if (nCoord+1 === nSize){
    cAction = "this."+((lColumn)? "appendColumn":"appendRow")+"()";
  }
  eval(cAction);
  this.stepCell(((lColumn)? UTable.oKeys.kRight : UTable.oKeys.kDown));
  return true;
};

UTable.prototype.removeRowOrColumn = function(lColumn){
  var nSize = ((lColumn)? this.getColumnLength() : this.getRowLength());
  var nCoord = this.getActiveCoords()[((lColumn)? 1:0)];
  var cAction = "this."+((lColumn)? "deleteColumn":"deleteRow")+"(nCoord)";
  var nKey1 = ((lColumn)? UTable.oKeys.kLeft : UTable.oKeys.kUp);
  var nKey2 = ((lColumn)? UTable.oKeys.kRight : UTable.oKeys.kDown);
  this.stepCell(((nCoord)? nKey1 : nKey2));
  var nNewCoord = this.getActiveCoords()[((lColumn)? 1:0)];
  if (nNewCoord !== nCoord){
    eval(cAction);
  }
  return true;
};

UTable.prototype.swapNeighbours = function(lColumns, lDirect){
  var nSize = ((lColumns)? this.getColumnLength() : this.getRowLength());
  var nCoord1 = this.getActiveCoords()[((lColumns)? 1:0)];
  var nCoord2 = nCoord1+
    (((lDirect)? (nCoord1===nSize):(nCoord1>0))? -1 : 1);
  var nKey = UTable.oKeys.kUp;
  var cAction = "this."+((lColumns)?
    "swapColumns":"swapRows")+"(nCoord1,nCoord2)";
  if ((lDirect)? (nCoord1===nSize):(nCoord1===0)) return false;
  eval(cAction);
  nKey = ((lColumns && lDirect)? UTable.oKeys.kRight :
    ((!lColumns && lDirect)? UTable.oKeys.kDown :
      ((lColumns && !lDirect)? UTable.oKeys.kLeft :
        UTable.oKeys.kUp )));
  this.stepCell(nKey);
  return true;
};

UTable.prototype.toggleRow = function(nIndex){
  var oRow = this.getNthChildNode(this.getTNode("TBODY"),"TR",nIndex);
  if (oRow.getAttribute("highlighted")){
    oRow.removeAttribute("highlighted");
    oRow.className = oRow.className.replace(" highlighted","");
  } else {
    oRow.setAttribute("highlighted",1);
    oRow.className += " highlighted";
  }
  this.stepCell(UTable.oKeys.kDown);
};

UTable.prototype.unMarkAllRows = function(){
  var oTBody = this.getTNode("TBODY");
  for (var i = 0; i < oTBody.childNodes.length; i++){
    var oNode = oTBody.childNodes[i];
    if (oNode.nodeName === "TR"){
      var oRow = oNode;
      if (!oRow.getAttribute("highlighted")){
        continue;
      }
      oRow.removeAttribute("highlighted");
      oRow.className = oRow.className.replace(" highlighted","");
    }
  }
};

UTable.prototype.markAllRows = function(){
  var oTBody = this.getTNode("TBODY");
  for (var i = 0; i < oTBody.childNodes.length; i++){
    var oNode = oTBody.childNodes[i];
    if (oNode.nodeName === "TR"){
      var oRow = oNode;
      if (oRow.getAttribute("highlighted")){
        continue;
      }
      oRow.setAttribute("highlighted",1);
      oRow.className += " highlighted";
    }
  }
};

UTable.prototype.setCellKeyEvent = function(oCell){
  var _self = this;
  if (!oCell || !oCell.nodeName){
    return false;
  }
  if (oCell.getAttribute("key-event") === "on"){
    return false;
  }
  oCell.onkeydown = function(e){
    var e = e || window.event; //IE does not pass the event object
    var keyCode = e.which || e.keyCode;
    if (!_self.lEditCell){
      if (e.ctrlKey  && 
          (keyCode === UTable.oKeys.kLeft 
          || keyCode === UTable.oKeys.kRight 
          || keyCode === UTable.oKeys.kDown 
          || keyCode === UTable.oKeys.kUp)){
        return false;
      }
      _self.stepCell(keyCode);
    }
  };
  
  oCell.onkeyup = function(e){
    var e = e || window.event; //IE does not pass the event object
    var keyCode = e.which || e.keyCode; //console.log(keyCode);
    if (!_self.lEditCell){
      if (keyCode === UTable.oKeys.kEnd 
           || keyCode === UTable.oKeys.kHome){
        _self.setFocusByKey(e);
      }
      if (e.ctrlKey && !e.shiftKey && 
           (keyCode === UTable.oKeys.kLeft 
           || keyCode === UTable.oKeys.kRight 
           || keyCode === UTable.oKeys.kDown 
           || keyCode === UTable.oKeys.kUp)){
        _self.swapNeighbours(
          (keyCode === UTable.oKeys.kLeft  
            || keyCode === UTable.oKeys.kRight),
          (keyCode === UTable.oKeys.kRight 
            || keyCode === UTable.oKeys.kDown) );
      }
      if (keyCode === UTable.oKeys.kInsert){
        _self.addRowOrColumn(e.ctrlKey);
      }
      if (keyCode === UTable.oKeys.kDelete){
        _self.removeRowOrColumn(e.ctrlKey);
      }
      if (keyCode === UTable.oKeys.kAsterisk 
           || (e.shiftKey && keyCode === 48+8)){
        _self.toggleRow(_self.getActiveCoords()[0]);
      }
      if (keyCode === UTable.oKeys.kMinus 
           || keyCode === UTable.oKeys.kMinusNum){
        _self.unMarkAllRows();
      }
      if (keyCode === UTable.oKeys.kPlus 
           || keyCode === UTable.oKeys.kEqual){
        _self.markAllRows();
      }
      if (keyCode === UTable.oKeys.kEnter){
        _self.editActiveCell();
      }
    }
  };
  oCell.setAttribute("key-event","on");
  return true;
};

UTable.prototype.editActiveCell = function(){
  if (this.oActiveCell){
    var aCoords = this.getActiveCoords();
    var cType = this.aColumns[aCoords[1]].type;
    switch (cType){
      case "boolean":
        var oFlagNode = this.getFirstChildNode(this.oActiveCell,"INPUT");
        if (oFlagNode.getAttribute("CHECKED")==="CHECKED"){
          oFlagNode.removeAttribute("CHECKED");
        } else {
          oFlagNode.setAttribute("CHECKED","CHECKED");
        }
        break;
      default:
        var cValue = this.oActiveCell.innerHTML;
        var cEditHtml = "";
        var oInput = {}, oForm = {}, oButtonOk = {}, 
          oButtonCancel = {}, lOnce = true;
        var _self = this;
        var fInput = function(_self,_oInput){
          var oInput = _oInput;
          if (!lOnce){return false;}
          lOnce = false;
          setTimeout(function(){
          var cValue = oInput.value;
          var oCell = oInput.parentNode.parentNode;
          _self.lEditCell = false;
          oCell.innerHTML = cValue;
          setTimeout(function(){oCell.focus();},100);
          _self.oCornerNode.style.display = "block";
          },100);
        };
        var fCancel = function(_self,_oInput){
          var oInput = _oInput;
          if (!lOnce){return false;}
          lOnce = false;
          setTimeout(function(){
          var oCell = oInput.parentNode.parentNode;
          _self.lEditCell = false;
          oCell.innerHTML = _self.cOldValue;
          setTimeout(function(){oCell.focus();},100);
          _self.oCornerNode.style.display = "block";
          },100);
        };
        this.lEditCell = true;
        cValue = this.quoteattr(cValue);
        if (cValue==="&nbsp;"){cValue="";}
        oForm = document.createElement("FORM");
        oForm.setAttribute("ACTION","");
        oInput = document.createElement("INPUT");
        oInput.setAttribute("TYPE","TEXT");
        oInput.setAttribute("TABINDEX",
          this.oActiveCell.getAttribute("TABINDEX"));
        oInput.value = cValue;
        oInput.style.display="block";
        this.cOldValue = cValue;
        oButtonOk = document.createElement("INPUT");
        oButtonOk.setAttribute("TYPE","SUBMIT");
        oButtonOk.setAttribute("VALUE","Ввести");
        oButtonOk.setAttribute("TABINDEX",
          this.oActiveCell.getAttribute("TABINDEX"));
        oButtonCancel = document.createElement("BUTTON");
        oButtonCancel.setAttribute("TABINDEX",
          this.oActiveCell.getAttribute("TABINDEX"));
        oButtonCancel.innerHTML = "Отмена";
        this.oCornerNode.style.display = "none";
        this.oActiveCell.innerHTML = "";
        oForm.appendChild(oInput);
        oForm.appendChild(oButtonOk);
        oForm.appendChild(oButtonCancel);
        this.oActiveCell.appendChild(oForm);
        oForm.onsubmit = function(){
          fInput(_self,oInput); return false;
        };
        oButtonCancel.onclick = function(){
          fCancel(_self,oInput); return false;
        };
        oInput.focus();
    }
  }
};

UTable.prototype.setActiveCell = function(oCell,lFocus){
  if (this.oActiveCell){
    this.oActiveCell.parentNode.className = 
      this.oActiveCell.parentNode.className.replace(" focused","");
    this.oActiveCell.className = 
      this.oActiveCell.className.replace(" focused","");
  }

  this.oActiveCell = oCell;
  this.oActiveCell.className += " focused";
  this.oCornerNode.style.top=(oCell.offsetTop+oCell.offsetHeight+2)+"px";
  this.oCornerNode.style.left=(oCell.offsetLeft+oCell.offsetWidth+2)+"px";
  this.oActiveCell.parentNode.className += " focused";
  if (lFocus){ this.oActiveCell.focus(); }
  return true;
};

UTable.prototype.setCellFocusEvent = function(oCell){
  var _self = this;
  if (!oCell || !oCell.nodeName){
    return false;
  }
  if (oCell.getAttribute("focus-event") === "on"){
    return false;
  }
  oCell.onfocus = function(e){
    if (!_self.lEditCell){
      _self.setActiveCell(this, false);
    }
  };
  oCell.setAttribute("focus-event","on");
  return true;
};

UTable.prototype.resetTabIndexes = function(){
  var oTBody = this.getTNode("TBODY");
  var aRows = this.getAllChildNodes(oTBody,"TR");
  this.aIndexCoords = [];
  this.aIndexCoords.push(null);
  for (var i = 0; i < aRows.length; i++){
    var oRow = aRows[i];
    var aTDs = this.getAllChildNodes(oRow,"TD");
    for (var j = 0; j < aTDs.length; j++){
      //aTDs[j].setAttribute("tabindex", 1 + j + i * aTDs.length);
      aTDs[j].tabIndex = 1 + j + i * aTDs.length;
      this.aIndexCoords.push(null);
      this.aIndexCoords[1 + j + i * aTDs.length] = [i,j];
      this.setCellFocusEvent(aTDs[j]);
      this.setCellKeyEvent(aTDs[j]);
    }
  }
  if (this.oActiveCell){
    this.setActiveCell(this.oActiveCell);
  }
  return true;
};

UTable.prototype.setTableNode = function(oTable){
  var nLen = -1;
  if (typeof(oTable) !== "object" 
      || !(oTable.nodeName) 
      || !(oTable.nodeName == "TABLE")){
    throw "oTable must be instance of HTMLTableElement";
  }
  this.oTable = oTable;
  var oTBody = this.getTNode("TBODY");
  var oTHead = this.getTNode("THEAD");
  if (!oTHead){
    throw "oTable must have THEAD node";
  }
  if (!oTBody){
    throw "oTable must have TBODY node";
  }
  var aRows = this.getAllChildNodes(oTBody,"TR");
  if (!aRows || !aRows.length){
    throw "oTable must have THEAD node with TR node inside";
  }
  nLen = this.getColumnLength();
  for (var i = 0; i < nLen; i++){
    var oColumn = new UColumn(this,i);
    this.aColumns.push(oColumn);
  }
  
  this.oCornerNode = document.createElement("DIV");
  this.oCornerNode.className = "corner";
  this.oTable.parentNode.appendChild(this.oCornerNode);
  this.resetTabIndexes();
  if (this.getRowLength() > 0){
    var _self = this;
    setTimeout(function(){
      _self.aColumns[0].getDataNodes()[0].focus();}
    ,0);
  }
};

/****************************************************************************/

function UColumn(oUTable,nIndex){
  this.name="c"+(new Date()).getTime().toString();
  this.namePattern = new RegExp('^[_a-zA-Z][_a-zA-Z0-9]*$');
  this.index = -1;
  this.aNodes = [];
  this.type = "";
  this.xDefaultValue = null;
  if (typeof(nIndex) === "number" && (oUTable instanceof UTable)){
    this.setNodes(oUTable,nIndex);
  }
};

UColumn.prototype.getIndex = function(){
  return this.index;
};

UColumn.prototype.setIndex = function(nIndex){
  if (typeof(nIndex) !== "number"){
    return false;
  }
  this.index = nIndex;
  this.setName("c"+nIndex.toString());
  return true;
};

UColumn.prototype.getName = function(){
  return this.name;
};

UColumn.prototype.setName = function(cName){
  if (typeof(cName) === "string" && this.namePattern.test(cName)){
    this.name = cName;
    return cName;
  }
  return false;
};

UColumn.prototype.getNodes = function(){
  return this.aNodes;
};

UColumn.prototype.getDataNodes = function(){
  var nLen = -1;
  var aDataNodes = [];
  nLen = this.aNodes.length;
  for (var i = 1; i < nLen; i++){
    aDataNodes.push(this.aNodes[i]);
  }
  return aDataNodes;
};

UColumn.prototype.setNodes = function(oUTable,nIndex){
  if (!oUTable || !this.setIndex(nIndex)){
    return false;
  }
  this.aNodes = oUTable.getNthColumnNodes(this.index);
};

UColumn.prototype.setType = function(cType){
  var aDataNodes = this.getDataNodes();
  if (cType === "boolean"){
    for (var i = 0; i < aDataNodes.length; i++){
      aDataNodes[i].innerHTML = "<input type='checkbox' />";
    }
  }
  if (cType === ""){
    aDataNodes[i].innerHTML = "&nbsp;";
  }
  this.type = cType;
};

/****************************************************************************/
window.onload = function(){
  window.u = new UTable({cIdContainer: "tcontainer", aSize: [10,10]});
  window.u.aColumns[0].setType("boolean");
  window.c = document.getElementById("corner");
  window.u.oTable.focus();
};
