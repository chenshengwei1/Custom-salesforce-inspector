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
      autoComplete1.start(AutoComplete1);
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
}
