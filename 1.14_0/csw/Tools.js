import {AutoComplete1} from "./AutoComplete1.js";
export class Tools {
    static getUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }

    static getAllChecked(){
        let allCheckeds = localStorage.getItem('sobject:field:check');
        if (!allCheckeds){
            allCheckeds = '{}'
        }
        let allchecked = JSON.parse(allCheckeds);
        return allchecked;
    }

    static storageFieldCheck(sobject, fieldName, value){
      let allchecked = Tools.getAllChecked();
      allchecked[sobject+'.'+fieldName] = value;
      localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

    static createProgress(div){
      div.html(Tools.createSpinner('LOADING DOTS'))
    }

    static createSpinner(type){
      if (type == 'GRADIENT SPINNER'){
          return `<!-- GRADIENT SPINNER -->
          <div class="spinner-box">
            <div class="circle-border">
              <div class="circle-core"></div>
            </div>  
          </div>`;
      }else if (type == 'SPINNER ORBITS'){
          return `<!-- SPINNER ORBITS -->
          <div class="spinner-box">
            <div class="blue-orbit leo">
            </div>
          
            <div class="green-orbit leo">
            </div>
            
            <div class="red-orbit leo">
            </div>
            
            <div class="white-orbit w1 leo">
            </div><div class="white-orbit w2 leo">
            </div><div class="white-orbit w3 leo">
            </div>
          </div>`;
      }else if (type == 'GRADIENT CIRCLE PLANES'){
          return `<!-- GRADIENT CIRCLE PLANES -->
          <div class="spinner-box">
            <div class="leo-border-1">
              <div class="leo-core-1"></div>
            </div> 
            <div class="leo-border-2">
              <div class="leo-core-2"></div>
            </div> 
          </div>`;
      }else if (type == 'SPINNING SQUARES'){
          return `<!-- SPINNING SQUARES -->
          <div class="spinner-box">
            <div class="configure-border-1">  
              <div class="configure-core"></div>
            </div>  
            <div class="configure-border-2">
              <div class="configure-core"></div>
            </div> 
          </div>`;
      }else if (type == 'LOADING DOTS'){
          return `<!-- LOADING DOTS... -->
          <div class="spinner-box">
            <div class="pulse-container">  
              <div class="pulse-bubble pulse-bubble-1"></div>
              <div class="pulse-bubble pulse-bubble-2"></div>
              <div class="pulse-bubble pulse-bubble-3"></div>
            </div>
          </div>`;
      }else if (type == 'SOLAR SYSTEM'){
          return `<!-- SOLAR SYSTEM -->
          <div class="spinner-box">
            <div class="solar-system">
              <div class="earth-orbit orbit">
                <div class="planet earth"></div>
                <div class="venus-orbit orbit">
                  <div class="planet venus"></div>
                  <div class="mercury-orbit orbit">
                    <div class="planet mercury"></div>
                    <div class="sun"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      }else if (type == 'Three Quarter Spinner'){
          return `<!-- Three Quarter Spinner -->
      
          <div class="spinner-box">
            <div class="three-quarter-spinner"></div>
          </div>`;
      }
      return `<!-- GRADIENT SPINNER -->
      <div class="spinner-box">
        <div class="circle-border">
          <div class="circle-core"></div>
        </div>  
      </div>
      
      <!-- SPINNER ORBITS -->
      <div class="spinner-box">
        <div class="blue-orbit leo">
        </div>
      
        <div class="green-orbit leo">
        </div>
        
        <div class="red-orbit leo">
        </div>
        
        <div class="white-orbit w1 leo">
        </div><div class="white-orbit w2 leo">
        </div><div class="white-orbit w3 leo">
        </div>
      </div>
      
      <!-- GRADIENT CIRCLE PLANES -->
      <div class="spinner-box">
        <div class="leo-border-1">
          <div class="leo-core-1"></div>
        </div> 
        <div class="leo-border-2">
          <div class="leo-core-2"></div>
        </div> 
      </div>
      
      <!-- SPINNING SQUARES -->
      <div class="spinner-box">
        <div class="configure-border-1">  
          <div class="configure-core"></div>
        </div>  
        <div class="configure-border-2">
          <div class="configure-core"></div>
        </div> 
      </div>
      
      <!-- LOADING DOTS... -->
      <div class="spinner-box">
        <div class="pulse-container">  
          <div class="pulse-bubble pulse-bubble-1"></div>
          <div class="pulse-bubble pulse-bubble-2"></div>
          <div class="pulse-bubble pulse-bubble-3"></div>
        </div>
      </div>
      
      <!-- SOLAR SYSTEM -->
      <div class="spinner-box">
        <div class="solar-system">
          <div class="earth-orbit orbit">
            <div class="planet earth"></div>
            <div class="venus-orbit orbit">
              <div class="planet venus"></div>
              <div class="mercury-orbit orbit">
                <div class="planet mercury"></div>
                <div class="sun"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Three Quarter Spinner -->
      
      <div class="spinner-box">
        <div class="three-quarter-spinner"></div>
      </div>`
  }

  static setAutoComplete(inputId, tree){
      let autoComplete1 = new AutoComplete1(inputId,()=>{
          return tree.allSObjectApi.map(e=>{return e.global});
      });
      autoComplete1.setItemProvider({
          value:(item)=>{
              return item.name;
          },
          label:(item, defval)=>{
              let queryable = item.queryable;
              if (!queryable){
                  return `<span style="color:yellow">${defval}</span> `;
              }
              return item.label + '('+defval+')';
          },
          filter:(valueArr, word)=>{
              try{
                  var reg = new RegExp("(" + word + ")","i");
              }
              catch (e){
                  var reg = new RegExp("(.*)","i");
              }
              let matchItems = [];
              for(var i=0;i<valueArr.length;i++){
                  let item=valueArr[i];
                  if(reg.test(item.name) || reg.test(item.label)){
                      matchItems.push(item);
                  }
              }
              return matchItems;
          }
      })
      autoComplete1.createApi();
    }

    static formatDate (inputDate, format)  {
      if (!inputDate) return '';
  
      const padZero = (value) => (value < 10 ? `0${value}` : `${value}`);
      const parts = {
          yyyy: inputDate.getFullYear(),
          MM: padZero(inputDate.getMonth() + 1),
          dd: padZero(inputDate.getDate()),
          HH: padZero(inputDate.getHours()),
          hh: padZero(inputDate.getHours() > 12 ? inputDate.getHours() - 12 : inputDate.getHours()),
          mm: padZero(inputDate.getMinutes()),
          ss: padZero(inputDate.getSeconds()),
          tt: inputDate.getHours() < 12 ? 'AM' : 'PM'
      };
  
      return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|tt/g, (match) => parts[match]);
  }

  static formatSQL(input){
      let config = {"language":"sql",
        "tabWidth":"4",
        "useTabs":false,
        "keywordCase":"preserve",
        "indentStyle":"standard",
        "logicalOperatorNewline":"before",
        "expressionWidth":"50",
        "lineBetweenQueries":"1",
        "denseOperators":false,
        "newlineBeforeSemicolon":false
    }
    try{
      return sqlFormatter.format(input, config);
    }catch(e){
      console.log('format soql error:', e.stack);
      return input;
    }
  }

  static discoverColumns(expRecords){
    let columnIdx = new Map();
    let header = ["_"];
    
    function discoverColumns1(record, prefix, row) {
      for (let field in record) {
        if (field == "attributes") {
          continue;
        }
        let column = prefix + field;
        let c;
        if (columnIdx.has(column)) {
          c = columnIdx.get(column);
        } else {
          c = header.length;
          columnIdx.set(column, c);
          
          header[c] = column;
        }
        row[c] = record[field];
        if (typeof record[field] == "object" && record[field] != null) {
          discoverColumns1(record[field], column + ".", row);
        }
      }
    }

    
    for (let record of expRecords) {
      let row = new Array(header.length);
      row[0] = record;
      
      discoverColumns1(record, "", row);
    }
    return header;
  }


  static exportExcel(dataList){

    let columnIdx = new Map();
    let header = ["_"];
    let records = [];
    let rowVisibilities = [];
    let table = [];

    function discoverColumns(record, prefix, row) {
      for (let field in record) {
        if (field == "attributes") {
          continue;
        }
        let column = prefix + field;
        let c;
        if (columnIdx.has(column)) {
          c = columnIdx.get(column);
        } else {
          c = header.length;
          columnIdx.set(column, c);
          for (let row of table) {
            row.push(undefined);
          }
          header[c] = column;
        }
        row[c] = record[field];
        if (typeof record[field] == "object" && record[field] != null) {
          discoverColumns(record[field], column + ".", row);
        }
      }
    }

    let addToTable=(expRecords) =>{
      records = records.concat(expRecords);
      if (table.length == 0 && expRecords.length > 0) {
        table.push(header);
        rowVisibilities.push(true);
      }
      for (let record of expRecords) {
        let row = new Array(header.length);
        row[0] = record;
        table.push(row);
        discoverColumns(record, "", row);
      }
    }

    addToTable(dataList);

   
    function cellToString(cell) {
      if (cell == null) {
        return "";
      } else if (typeof cell == "object" && cell.attributes && cell.attributes.type) {
        return "[" + cell.attributes.type + "]";
      } else {
        return "" + cell;
      }
    }
    
  let csvSerialize = separator => table.map(row => row.map(cell => "\"" + cellToString(cell).split("\"").join("\"\"") + "\"").join(separator)).join("\r\n");
  
  
  
   function copyToClipboard(value) {
    // Use execCommand to trigger an oncopy event and use an event handler to copy the text to the clipboard.
    // The oncopy event only works on editable elements, e.g. an input field.
    let temp = document.createElement("input");
    // The oncopy event only works if there is something selected in the editable element.
    temp.value = "temp";
    temp.addEventListener("copy", e => {
      e.clipboardData.setData("text/plain", value);
      e.preventDefault();
    });
    document.body.appendChild(temp);
    try {
      // The oncopy event only works if there is something selected in the editable element.
      temp.select();
      // Trigger the oncopy event
      let success = document.execCommand("copy");
      if (!success) {
        alert("Copy failed");
      }
    } finally {
      document.body.removeChild(temp);
    }
  }
  copyToClipboard(csvSerialize("\t"));
  }
}


