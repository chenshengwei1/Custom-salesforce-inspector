/* global React ReactDOM */
//import {sfConn, apiVersion} from "./inspector.js";

//const  {sfConn, apiVersion,Enumerable, DescribeInfo, copyToClipboard, initScrollTable}=window.globalData;


let apiVersion = "56.0";

class sfConn1{
    constructor(){
        this.instanceHostname;
        this.sessionId;
        this.conversation = {};
    }
    async getSession(sfHost) {
        let message = await new Promise(resolve =>
          chrome.runtime.sendMessage({message: "getSession", sfHost}, resolve));
        if (message) {
            this.instanceHostname = message.hostname;
            this.sessionId = message.key;

            let conversation = JSON.parse(localStorage['conversation']||'{}');
            this.conversation = conversation;

            let currentConversation = this.conversation[this.instanceHostname];
            if (!currentConversation){
                currentConversation = {};
                this.conversation[this.instanceHostname]=currentConversation;
            }
            if (!currentConversation[message.key]){
                currentConversation[message.key] = new Date().getTime();
            }
            localStorage['conversation'] = JSON.stringify(this.conversation);
        }
    }

    getAllSessions(sfHost){
        let conversation = JSON.parse(localStorage['conversation']||'{}');
        let convt = conversation[sfHost]||{};
        return Object.keys(convt).map(e=>{return {sfHost, sectionId:e,  createdDate:convt[e]}});
    }

    getSfHosts(){
        let conversation = JSON.parse(localStorage['conversation']||'{}');
        return Object.keys(conversation);
    }

    async rest(url, {logErrors = true, method = "GET", api = "normal", body = undefined, bodyType = "json", headers = {}, progressHandler = null} = {}) {
        if (!this.instanceHostname || !this.sessionId) {
          throw new Error("Session not found");
        }
    
        let history = JSON.parse(localStorage['urls']||'[]');
        if (history.indexOf(url)==-1){
          history.push(url);
          localStorage['urls'] = JSON.stringify(history);
        }
    
        let xhr = new XMLHttpRequest();
        url += (url.includes("?") ? "&" : "?") + "cache=" + Math.random();
        xhr.open(method, "https://" + this.instanceHostname + url, true);
    
        xhr.setRequestHeader("Accept", "application/json; charset=UTF-8");
    
        if (api == "bulk") {
          xhr.setRequestHeader("X-SFDC-Session", this.sessionId);
        } else if (api == "normal") {
          xhr.setRequestHeader("Authorization", "Bearer " + this.sessionId);
        } else {
          throw new Error("Unknown api");
        }
    
        if (body !== undefined) {
          if (bodyType == "json") {
            body = JSON.stringify(body);
            xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
          } else if (bodyType == "raw") {
            // Do nothing
          } else {
            throw new Error("Unknown bodyType");
          }
        }
    
        for (let [name, value] of Object.entries(headers)) {
          xhr.setRequestHeader(name, value);
        }
    
        xhr.responseType = "json";
        await new Promise((resolve, reject) => {
          if (progressHandler) {
            progressHandler.abort = () => {
              let err = new Error("The request was aborted.");
              err.name = "AbortError";
              reject(err);
              xhr.abort();
            };
          }
    
          xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
              resolve();
            }
          };
          xhr.send(body);
        });
        if (xhr.status >= 200 && xhr.status < 300) {
          return xhr.response;
        } else if (xhr.status == 0) {
          if (!logErrors) { console.error("Received no response from Salesforce REST API", xhr); }
          let err = new Error();
          err.name = "SalesforceRestError";
          err.message = "Network error, offline or timeout";
          throw err;
        } else {
          if (!logErrors) { console.error("Received error response from Salesforce REST API", xhr); }
          let err = new Error();
          err.name = "SalesforceRestError";
          err.detail = xhr.response;
          try {
            err.message = err.detail.map(err => `${err.errorCode}: ${err.message}${err.fields && err.fields.length > 0 ? ` [${err.fields.join(", ")}]` : ""}`).join("\n");
          } catch (ex) {
            err.message = JSON.stringify(xhr.response);
          }
          if (!err.message) {
            err.message = "HTTP error " + xhr.status + " " + xhr.statusText;
          }
          throw err;
        }
      }
    
      wsdl(apiVersion, apiName) {
        let wsdl = {
          Enterprise: {
            servicePortAddress: "/services/Soap/c/" + apiVersion,
            targetNamespaces: ' xmlns="urn:enterprise.soap.sforce.com" xmlns:sf="urn:sobject.enterprise.soap.sforce.com"'
          },
          Partner: {
            servicePortAddress: "/services/Soap/u/" + apiVersion,
            targetNamespaces: ' xmlns="urn:partner.soap.sforce.com" xmlns:sf="urn:sobject.partner.soap.sforce.com"'
          },
          Apex: {
            servicePortAddress: "/services/Soap/s/" + apiVersion,
            targetNamespaces: ' xmlns="http://soap.sforce.com/2006/08/apex"'
          },
          Metadata: {
            servicePortAddress: "/services/Soap/m/" + apiVersion,
            targetNamespaces: ' xmlns="http://soap.sforce.com/2006/04/metadata"'
          },
          Tooling: {
            servicePortAddress: "/services/Soap/T/" + apiVersion,
            targetNamespaces: ' xmlns="urn:tooling.soap.sforce.com" xmlns:sf="urn:sobject.tooling.soap.sforce.com" xmlns:mns="urn:metadata.tooling.soap.sforce.com"'
          }
        };
        if (apiName) {
          wsdl = wsdl[apiName];
        }
        return wsdl;
      }
    
    async soap(wsdl, method, args, {headers} = {}) {
        if (!this.instanceHostname || !this.sessionId) {
          throw new Error("Session not found");
        }
    
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "https://" + this.instanceHostname + wsdl.servicePortAddress + "?cache=" + Math.random(), true);
        xhr.setRequestHeader("Content-Type", "text/xml");
        xhr.setRequestHeader("SOAPAction", '""');
    
        let sessionHeader = {SessionHeader: {sessionId: this.sessionId}};
        let requestBody = XML.stringify({
          name: "soapenv:Envelope",
          attributes: ` xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"${wsdl.targetNamespaces}`,
          value: {
            "soapenv:Header": Object.assign({}, sessionHeader, headers),
            "soapenv:Body": {[method]: args}
          }
        });
    
        xhr.responseType = "document";
        await new Promise(resolve => {
          xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
              resolve(xhr);
            }
          };
          xhr.send(requestBody);
        });
        if (xhr.status == 200) {
          let responseBody = xhr.response.querySelector(method + "Response");
          let parsed = XML.parse(responseBody).result;
          return parsed;
        } else {
          console.error("Received error response from Salesforce SOAP API", xhr);
          let err = new Error();
          err.name = "SalesforceSoapError";
          err.detail = xhr.response;
          try {
            err.message = xhr.response.querySelector("faultstring").textContent;
          } catch (ex) {
            err.message = "HTTP error " + xhr.status + " " + xhr.statusText;
          }
          throw err;
        }
      }
    
    asArray(x) {
        if (!x) return [];
        if (x instanceof Array) return x;
        return [x];
    }
}

class XML {
  static stringify({name, attributes, value}) {
    function buildRequest(el, params) {
      if (params == null) {
        el.setAttribute("xsi:nil", "true");
      } else if (typeof params == "object") {
        for (let [key, value] of Object.entries(params)) {
          if (key == "$xsi:type") {
            el.setAttribute("xsi:type", value);
          } else if (value === undefined) {
            // ignore
          } else if (Array.isArray(value)) {
            for (let element of value) {
              let x = doc.createElement(key);
              buildRequest(x, element);
              el.appendChild(x);
            }
          } else {
            let x = doc.createElement(key);
            buildRequest(x, value);
            el.appendChild(x);
          }
        }
      } else {
        el.textContent = params;
      }
    }
    let doc = new DOMParser().parseFromString("<" + name + attributes + "/>", "text/xml");
    buildRequest(doc.documentElement, value);
    return '<?xml version="1.0" encoding="UTF-8"?>' + new XMLSerializer().serializeToString(doc).replace(/ xmlns=""/g, "");
  }

  static parse(element) {
    function parseResponse(element) {
      let str = ""; // XSD Simple Type value
      let obj = null; // XSD Complex Type value
      // If the element has child elements, it is a complex type. Otherwise we assume it is a simple type.
      if (element.getAttribute("xsi:nil") == "true") {
        return null;
      }
      let type = element.getAttribute("xsi:type");
      if (type) {
        // Salesforce never sets the xsi:type attribute on simple types. It is only used on sObjects.
        obj = {
          "$xsi:type": type
        };
      }
      for (let child = element.firstChild; child != null; child = child.nextSibling) {
        if (child instanceof CharacterData) {
          str += child.data;
        } else if (child instanceof Element) {
          if (obj == null) {
            obj = {};
          }
          let name = child.localName;
          let content = parseResponse(child);
          if (name in obj) {
            if (obj[name] instanceof Array) {
              obj[name].push(content);
            } else {
              obj[name] = [obj[name], content];
            }
          } else {
            obj[name] = content;
          }
        } else {
          throw new Error("Unknown child node type");
        }
      }
      return obj || str;
    }
    return parseResponse(element);
  }
}



class DescribeInfoEx{
    constructor(useToolingApi){
        this.sobjectAllDescribes = this.initialState();
        this.getGlobal(useToolingApi)
    }
    initialState() {
        return {
          data: {global: {globalStatus: "pending", globalDescribe: null}, sobjects: null},
          tool: {global: {globalStatus: "pending", globalDescribe: null}, sobjects: null}
        };
    }

    getGlobal(useToolingApi) {
        let apiDescribes = this.sobjectAllDescribes[useToolingApi ? "tool" : "data"];

        return new Promise((reslove)=>{
            if (apiDescribes.global.globalStatus == "pending") {
                apiDescribes.global.globalStatus = "loading";
                console.log(useToolingApi ? "getting tooling objects" : "getting objects");
                sfConn.rest(useToolingApi ? "/services/data/v" + apiVersion + "/tooling/sobjects/" : "/services/data/v" + apiVersion + "/sobjects/").then(res => {
                    apiDescribes.global.globalStatus = "ready";
                    apiDescribes.global.globalDescribe = res;
                    apiDescribes.sobjects = new Map();
                    for (let sobjectDescribe of res.sobjects) {
                        apiDescribes.sobjects.set(sobjectDescribe.name.toLowerCase(), {global: sobjectDescribe, sobject: {sobjectStatus: "pending", sobjectDescribe: null}});
                    }
                    reslove(apiDescribes);
                }, () => {
                  apiDescribes.global.globalStatus = "loadfailed";
                  reslove(apiDescribes);
                })
            }else{
                reslove(apiDescribes);
            }
        });
    }

    async describeGlobal(useToolingApi) {
        let g = await this.getGlobal(useToolingApi);
        return g.global;
    }

    // Returns an object with two properties:
    // - sobjectStatus: a string with one of the following values:
    //    "pending": (has not started loading, never returned by this function)
    //    "notfound": The object does not exist
    //    "loading": Describe info for the object is being downloaded
    //    "loadfailed": Downloading of describe info for the object failed
    //    "ready": Describe info is available
    // - sobjectDescribe: contains a DescribeSObjectResult if the object exists and has been loaded
    async describeSobject(useToolingApi, sobjectName) {
        let apiDescribes = await this.getGlobal(useToolingApi);
        if (!apiDescribes.sobjects) {
            return {sobjectStatus: apiDescribes.global.globalStatus, sobjectDescribe: null};
        }
        let sobjectInfo = apiDescribes.sobjects.get(sobjectName.toLowerCase());
        if (!sobjectInfo) {
            return {sobjectStatus: "notfound", sobjectDescribe: null};
        }
        if (sobjectInfo.sobject.sobjectStatus == "pending") {
            sobjectInfo.sobject.sobjectStatus = "loading";
            console.log("getting fields for " + sobjectInfo.global.name);
            return  await new Promise((resolved)=>{
                sfConn.rest(sobjectInfo.global.urls.describe).then(res => {
                    sobjectInfo.sobject.sobjectStatus = "ready";
                    sobjectInfo.sobject.sobjectDescribe = res;
                    resolved(sobjectInfo.sobject);
                }, () => {
                    sobjectInfo.sobject.sobjectStatus = "loadfailed";
                    resolved(sobjectInfo.sobject);
                });
            })
        }
        return sobjectInfo.sobject;
    }

    async reloadAll() {
        this.sobjectAllDescribes = this.initialState();
    }
}

// autocomplete
class AutoComplete1{
    constructor(inputElementId,autoArray){
        this.inputElementId=inputElementId;
        this.autoElementId="auto_997_"+this.inputElementId;
        this.autoObj = this.createAutoObj();//DIV的根节点
        this.value_arr=autoArray;        //不要包含重复值
        this.index=-1;          //当前选中的DIV的索引
        this.search_value="";   //保存当前搜索的字符
        this.cursorPos=0;
    }
    get obj(){
        return document.getElementById(this.inputElementId);
    }

    getAutoCompleteValues(){
        if (typeof this.value_arr == 'function'){
            return this.value_arr();
        }
        return this.value_arr;
    }

    createAutoObj(){
        let autoObj = document.getElementById(this.autoElementId);
        if (autoObj){
            return autoObj;
        }
        var div = document.createElement("div");
        div.className="auto_hidden";
        div.id=this.autoElementId;
        document.body.appendChild(div);
        return document.getElementById(this.autoElementId);
    }

    init(){
        if (!this.obj){
            return;
        }
        var cursorPos = this.obj.selectionStart;
        var cursorCoords = this.obj.getBoundingClientRect();
        var cursorX = cursorCoords.left + cursorPos;
        var cursorY = cursorCoords.top;

        this.autoObj.style.left = cursorX + "px";
        this.autoObj.style.top  = cursorY + this.obj.offsetHeight + "px";
        this.autoObj.style.width= this.obj.offsetWidth - 2 + "px";//减去边框的长度2px
        this.autoObj.style.height= "auto";//减去边框的长度2px
        this.autoObj.style.maxHeight= "400px";//减去边框的长度2px
        this.autoObj.style.fontSize= '14';
        this.autoObj.style.position= 'fixed';


    }

    deleteDIV(){
        while(this.autoObj.hasChildNodes()){
            this.autoObj.removeChild(this.autoObj.firstChild);
        }
        this.autoObj.className="auto_hidden";
    }

    setValue(target){
        this.updateObjectValue(target.seq);
        this.autoObj.className="auto_hidden";
        $(this.obj).change();
    }

    updateObjectValue(newText){
        var cursorPos = this.cursorPos;
        console.log('selectionStart='+this.obj.selectionStart)
        let leftChar = cursorPos - 1;
        let rightChar = cursorPos;
        while(leftChar>=0 && /[\d\w_]/.test(this.search_value.charAt(leftChar))){
            leftChar--;
        }
        while(rightChar<=this.search_value.length && /[\d\w_]/.test(this.search_value.charAt(rightChar))){
            rightChar++;
        }
        let word = this.search_value.substring(0, cursorPos).match(/[a-zA-Z0-9_]*$/)[0];
        this.obj.value = this.search_value.substring(0, leftChar+1)+newText+this.search_value.substring(rightChar);
    }

    autoOnmouseover(target, _div_index){

        this.index=_div_index;
        var length = this.autoObj.children.length;
        for(var j=0;j<length;j++){
            if(j!=_div_index ){
                this.autoObj.childNodes[j].className='auto_onmouseout';
            }else{
                this.autoObj.childNodes[j].className='auto_onmouseover';
                this.updateObjectValue(target.seq);
            }
        }

    }

    changeClassname(length){
        for(var i=0;i<length;i++){
            if(i!=this.index ){
                this.autoObj.childNodes[i].className='auto_onmouseout';
            }else{
                this.autoObj.childNodes[i].className='auto_onmouseover';
                this.updateObjectValue(this.autoObj.childNodes[i].seq);
            }
        }
    }

    //响应键盘
    pressKey(event){
        var length = this.autoObj.children.length;
        //光标键"↓"
        if(event.keyCode==40){
            ++this.index;
            if(this.index>length){
                this.index=0;
            }else if(this.index==length){
                this.updateObjectValue(this.search_value);
            }else{
                this.changeClassname(length);
            }
            
        }
        //光标键"↑"
        else if(event.keyCode==38){
            this.index--;
            if(this.index<-1){
                this.index=length - 1;
            }else if(this.index==-1){
                this.updateObjectValue(this.search_value);
            }else{
                this.changeClassname(length);
            }
        }
        //回车键
        else if(event.keyCode==13){
            this.autoObj.className="auto_hidden";
            this.index=-1;
        }else{
            this.index=-1;
        }
    }
    //程序入口
    start(event){
        if(this.obj&&event.keyCode!=13&&event.keyCode!=38&&event.keyCode!=40){
            this.init();
            this.deleteDIV();
            this.search_value=this.obj.value;
            this.cursorPos = this.obj.selectionStart;
            let word = this.search_value.substring(0, this.cursorPos).match(/[a-zA-Z0-9_]*$/)[0];

            var valueArr=this.getAutoCompleteValues();
            valueArr.sort();
            if(word.replace(/(^\s*)|(\s*$)/g,'')==""){
                return;
            }//值为空，退出

            try{
                var reg = new RegExp("^(" + word + ")","i");
            }
            catch (e){
                return;
            }
            var div_index=0;//记录创建的DIV的索引
            let matchItems = [];
            for(var i=0;i<valueArr.length;i++){
                if(reg.test(valueArr[i])){
                    matchItems.push(valueArr[i]);
                }
            }
            matchItems = matchItems.sort((a, b)=>{
                return reg.exec(a).index - reg.exec(b).index;
            });
            for(var i=0;i<matchItems.length;i++){
                var div = document.createElement("div");
                div.className="auto_onmouseout autocompleteitem";
                div.seq=matchItems[i];
                div.title=matchItems[i];
                div.innerHTML=matchItems[i].replace(reg,"<strong>$1</strong>");//搜索到的字符粗体显示
                this.autoObj.appendChild(div);
                this.autoObj.className="auto_show";
                div_index++;
            }
        }
        this.pressKey(event);
        window.οnresize=this.bind(this,function(){this.init();});
    }

    render(autoArray){
        this.value_arr=autoArray;
        this.start(this);
    }

    bindAutoCompleteItemEvent(){
        $('#'+this.autoElementId).on('click','.autocompleteitem', (e)=>{
            this.setValue(e.target);
        })

        $('#'+this.autoElementId).on('mοuseοver', '.autocompleteitem',(e)=>{
            console.log(e.target.seq)
            this.autoOnmouseover(e.target, div_index);
        })
    }

    createApi(){
        $('body').on('blur', '#'+this.inputElementId, ()=>{//点击下拉选项得到获取值
            //alert("auto_hidden");//点击获取选择的值。
            this.autoObj.className="auto_hidden";
            this.index=-1;
        });


        $('body').on('keyup','#'+this.inputElementId, (e)=>{
            this.start(e)
        })

        this.bindAutoCompleteItemEvent();
    }

    bind(object, fun){
        return function() {
            return fun.apply(object, arguments);
        }
    }
}



$(document).ready(function(){
    // autocomplete
    let autoComplete1 = new AutoComplete1('query',()=>{
        return window.autocompleteResults.map(e=>e.value);
    });
    autoComplete1.createApi();
    autoComplete1.start(AutoComplete1);

    window.autocompleteResults=function(datalist){
        autoComplete1.render(datalist.map(e=>e.value));
    }
});

function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

$('.tab .tablinks').on('click', (event)=>{
    openCity(event, event.target.name);
})

document.getElementById("dataexportbtn").click();
let sfConn = new sfConn1();

class DateTree{
    constructor({sfHost, args}) {
        let useToolingApi = args.has("useToolingApi");
        this.sfHost = sfHost;
        this.queryInput = null;
        this.useToolingApi= useToolingApi;
        this.initialQuery = "";
        this.autocompleteProgress = {};
        this.describeInfo = new DescribeInfoEx(this.useToolingApi);
        this.callbacks=[];
        this.dataMap={};
    }

    get allSObjectApi(){
        return Array.from(this.describeInfo.sobjectAllDescribes?.data?.sobjects?.values()||[]) ||[];
    }

    /**
     * Show the spinner while waiting for a promise.
     * didUpdate() must be called after calling spinFor.
     * didUpdate() is called when the promise is resolved or rejected, so the caller doesn't have to call it, when it updates the model just before resolving the promise, for better performance.
     * @param promise The promise to wait for.
     */
    spinFor(promise) {
        this.spinnerCount++;
        promise
        .catch(err => {
            console.error("spinFor", err);
        })
        .then(() => {
            this.spinnerCount--;
            this.didUpdate();
        })
        .catch(err => console.log("error handling failed", err));
    }

    /**
     * Notify React that we changed something, so it will rerender the view.
     * Should only be called once at the end of an event or asynchronous operation, since each call can take some time.
     * All event listeners (functions starting with "on") should call this function if they update the model.
     * Asynchronous operations should use the spinFor function, which will call this function after the asynchronous operation completes.
     * Other functions should not call this function, since they are called by a function that does.
     * @param cb A function to be called once React has processed the update.
     */
    didUpdate(cb) {
        if (this.reactCallback) {
            this.reactCallback(cb);
        }
        if (this.testCallback) {
            this.testCallback();
        }

        for(let cb of this.callbacks||[]){
            try{
                cb();
            }catch(e){

            }
        }
        this.callbacks.length = 0;
    }

    push(cb){
        this.callbacks = this.callbacks||[];
        this.callbacks.push(cb);
    }

    async getSObjects(){
        let vm = this;
        let {globalStatus, globalDescribe} = await this.describeInfo.describeGlobal(this.useToolingApi);
        if (!globalDescribe) {
            switch (globalStatus) {
                case "loading":
                    vm.autocompleteResults = {
                    sobjectName: "",
                    title: "Loading metadata...",
                    results: []
                    };
                    return;
                case "loadfailed":
                    vm.autocompleteResults = {
                    sobjectName: "",
                    title: "Loading metadata failed.",
                    results: [{value: "Retry", title: "Retry"}]
                    };
                    vm.autocompleteClick = vm.autocompleteReload.bind(vm);
                    return;
                default:
                    vm.autocompleteResults = {
                    sobjectName: "",
                    title: "Unexpected error: " + globalStatus,
                    results: []
                    };
                    return;
            }
        }

        vm.autocompleteResults = {
            sobjectName: "",
            title: "Objects:",
            results: globalDescribe
        };
        return globalDescribe;
    }

    getEntityParticle(sobjectName){
        if (this.dataMap[sobjectName].entityParticle){
            return Promise.resolve([this.dataMap[sobjectName].entityParticle]);
        }
        return new Promise((resolved)=>{
            sfConn.rest("/services/data/v" + apiVersion + "/tooling/query/?q=" + encodeURIComponent("select QualifiedApiName, Label, DataType, ReferenceTo, Length, Precision, Scale, IsAutonumber, IsCaseSensitive, IsDependentPicklist, IsEncrypted, IsIdLookup, IsHtmlFormatted, IsNillable, IsUnique, IsCalculated, InlineHelpText, FieldDefinition.DurableId from EntityParticle where EntityDefinition.QualifiedApiName = '" + sobjectName + "'")).then(res => {
                for (let entityParticle of res.records) {
                    if (!this.dataMap[entityParticle.QualifiedApiName]){
                        this.dataMap[entityParticle.QualifiedApiName]={};
                    }
                }
                this.dataMap[sobjectName].entityParticle=res.records;
                console.log('getEntityParticle ', res);
                resolved(res);
              })
        })
    }

    async getDescribeSobject(sobjectName){
        if (this.dataMap[sobjectName]){
            return this.dataMap[sobjectName].sobjectDescribe;
        }
        let {sobjectDescribe} = await this.describeInfo.describeSobject(this.useToolingApi, sobjectName);
        this.dataMap[sobjectDescribe.name] = this.dataMap[sobjectDescribe.name]||{sobjectDescribe:sobjectDescribe, records:[]};
        return sobjectDescribe;
    }

    async getRelationshipData(sobjectName, fieldApi, value){
        let vm = this;
        vm.queryAll = true;
        let queryMethod = this.useToolingApi ? "tooling/query" : vm.queryAll ? "queryAll" : "query";
        let {sobjectDescribe} =await vm.describeInfo.describeSobject(this.useToolingApi, sobjectName);
        sobjectName = sobjectDescribe.name;

        this.dataMap[sobjectName] = this.dataMap[sobjectName]||{sobjectDescribe:sobjectDescribe, records:[]};
        let nameFieldDesc = this.dataMap[sobjectName].nameField || sobjectDescribe.fields.find(e=>e.nameField==true);
        this.dataMap[sobjectName].nameField = nameFieldDesc;
        //let acQuery = "/services/data/v56.0/sobjects/Order/801BC0000078cNSYAY";
        // /services/data/v56.0/query/?q=select%20name%20from%20Order%20where%20name%3D'WYS'

        if(!sobjectDescribe.queryable){
            vm.autocompleteResults = {
                sobjectName,
                title: "Not Support query for object: " + sobjectName,
                results: []
            };
            return vm.autocompleteResults;
        }

        let acQuery = '';
        if (fieldApi){
            acQuery=`select id ${nameFieldDesc?.name?','+nameFieldDesc?.name:''} from ${sobjectName} where ${fieldApi}='${value}'`;
            acQuery = '/services/data/v56.0/query/?q=' + encodeURIComponent(acQuery);
        }else{
            acQuery = "/services/data/v" + apiVersion + "/sobjects/" + sobjectName + "/"+value;
        }

        await this.getEntityParticle(sobjectName);

        return await new Promise((resolved)=>{
            sfConn.rest(acQuery, {progressHandler: vm.autocompleteProgress})
            .catch(err => {
                if (err.name != "AbortError") {
                    vm.autocompleteResults = {
                        sobjectName:sobjectName,
                        title: "Error: " + err.message,
                        results: []
                    };
                }
                resolved(vm.autocompleteResults);
                return null;
            })
            .then(data => {
                vm.autocompleteProgress = {};
                if (data) {
                    vm.autocompleteResults = {
                        sobjectName:sobjectDescribe.name,
                        title: sobjectDescribe.name + " values:",
                        results: data,
                        sobjectDescribe
                    }
                };
                resolved(vm.autocompleteResults);
            });
            vm.autocompleteResults = {
                sobjectName:sobjectDescribe.name,
                title: "Loading " + sobjectDescribe.name + " values...",
                results: []
            };
        })
    }

    async getData(sobjectName, value){
        let fieldName;
        let vm = this;
        vm.queryAll = true;
        let queryMethod = this.useToolingApi ? "tooling/query" : vm.queryAll ? "queryAll" : "query";
        let {sobjectStatus, sobjectDescribe} =await vm.describeInfo.describeSobject(this.useToolingApi, sobjectName);

        if (!sobjectDescribe) {
            switch (sobjectStatus) {
                case "loading":
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Loading " + sobjectName + " metadata...",
                    results: []
                };
                this.push(()=>{
                    //this.getData(sobjectName, value);
                })
                return vm.autocompleteResults;
                case "loadfailed":
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Loading " + sobjectName + " metadata failed.",
                    results: [{value: "Retry", title: "Retry"}]
                };
                vm.autocompleteClick = vm.autocompleteReload.bind(vm);
                return vm.autocompleteResults;
                case "notfound":
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Unknown object: " + sobjectName,
                    results: []
                };
                return vm.autocompleteResults;
                default:
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Unexpected error for object: " + sobjectName + ": " + sobjectStatus,
                    results: []
                };
                return vm.autocompleteResults;
            }
        }

        this.dataMap[sobjectDescribe.name] = this.dataMap[sobjectDescribe.name]||{sobjectDescribe:sobjectDescribe, records:[]};

        let findCacheData = this.dataMap[sobjectDescribe.name].records.find(e=>{return e.Id == value});
        if (findCacheData){
            vm.autocompleteResults = {
                sobjectName:sobjectDescribe.name,
                title: " values:",
                results: findCacheData,
                sobjectDescribe
            }
            return vm.autocompleteResults;
        }

        if(!sobjectDescribe.queryable){
            vm.autocompleteResults = {
                sobjectName,
                title: "Not Support query for object: " + sobjectName,
                results: []
            };
            return vm.autocompleteResults;
        }

        let fieldNames = sobjectDescribe.fields.map(contextValueField => sobjectDescribe.name + "." + contextValueField.name).join(", ");
        let nameFieldDesc = sobjectDescribe.fields.find(e=>e.nameField==true);
        this.dataMap[sobjectDescribe.name].nameField = nameFieldDesc;
        //let acQuery = "/services/data/v56.0/sobjects/Order/801BC0000078cNSYAY";
        // /services/data/v56.0/query/?q=select%20name%20from%20Order%20where%20name%3D'WYS'
        let acQuery = '';
        if (fieldName){
            acQuery=`select * from ${sobjectDescribe.name} where ${fieldName}='${value}'`;
            acQuery = '/services/data/v56.0/query/?q=' + encodeURIComponent(acQuery);
        }else{
            acQuery = "/services/data/v" + apiVersion + "/sobjects/" + sobjectDescribe.name + "/"+value;
        }

        await this.getEntityParticle(sobjectDescribe.name);

        return await new Promise((resolved)=>{
            sfConn.rest(acQuery, {progressHandler: vm.autocompleteProgress})
            .catch(err => {
                if (err.name != "AbortError") {
                    vm.autocompleteResults = {
                        sobjectName:sobjectDescribe.name,
                        title: "Error: " + err.message,
                        results: []
                    };
                }
                resolved(vm.autocompleteResults);
                return null;
            })
            .then(data => {
                vm.autocompleteProgress = {};
                if (data) {
                    vm.autocompleteResults = {
                        sobjectName:sobjectDescribe.name,
                        title: sobjectDescribe.name + " values:",
                        results: data,
                        sobjectDescribe
                    }
                    this.dataMap[sobjectDescribe.name].records = this.dataMap[sobjectDescribe.name].records ||[];
                    this.dataMap[sobjectDescribe.name].records.push(data);
                };
                console.log('success load data ', vm.autocompleteResults, this.dataMap[sobjectDescribe.name]);
                resolved(vm.autocompleteResults);
            });
            vm.autocompleteResults = {
                sobjectName:sobjectDescribe.name,
                title: "Loading " + sobjectDescribe.name + " values...",
                results: []
            };
        })
    }

    async getRecordsByFields(sobjectName, fields){
        let fieldName;
        let vm = this;
        vm.queryAll = true;
        let queryMethod = this.useToolingApi ? "tooling/query" : vm.queryAll ? "queryAll" : "query";
        let {sobjectStatus, sobjectDescribe} =await vm.describeInfo.describeSobject(this.useToolingApi, sobjectName);

        if (!sobjectDescribe) {
            switch (sobjectStatus) {
                case "loading":
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Loading " + sobjectName + " metadata...",
                    results: []
                };
                this.push(()=>{
                    //this.getData(sobjectName, value);
                })
                return vm.autocompleteResults;
                case "loadfailed":
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Loading " + sobjectName + " metadata failed.",
                    results: [{value: "Retry", title: "Retry"}]
                };
                vm.autocompleteClick = vm.autocompleteReload.bind(vm);
                return vm.autocompleteResults;
                case "notfound":
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Unknown object: " + sobjectName,
                    results: []
                };
                return vm.autocompleteResults;
                default:
                vm.autocompleteResults = {
                    sobjectName,
                    title: "Unexpected error for object: " + sobjectName + ": " + sobjectStatus,
                    results: []
                };
                return vm.autocompleteResults;
            }
        }

        if(!sobjectDescribe.queryable){
            vm.autocompleteResults = {
                sobjectName,
                title: "Not Support query for object: " + sobjectName,
                results: []
            };
            return vm.autocompleteResults;
        }

        this.dataMap[sobjectDescribe.name] = this.dataMap[sobjectDescribe.name]||{sobjectDescribe:sobjectDescribe, records:[]};

        let nameFieldDesc = sobjectDescribe.fields.find(e=>e.nameField==true);
        this.dataMap[sobjectDescribe.name].nameField = nameFieldDesc;
        let loadFields = fields.map(contextValueField => contextValueField.name);
        let fieldNames = loadFields.join(", ");
        //let acQuery = "/services/data/v56.0/sobjects/Order/801BC0000078cNSYAY";
        // /services/data/v56.0/query/?q=select%20name%20from%20Order%20where%20name%3D'WYS'
        let acQuery = '';
        if (fieldNames){
            acQuery=`select ${fieldNames} from ${sobjectDescribe.name} limit 10000`;
            acQuery = '/services/data/v56.0/query/?q=' + encodeURIComponent(acQuery);
        }else{
            acQuery = "/services/data/v" + apiVersion + "/sobjects/" + sobjectDescribe.name + "/"+value;
        }

        await this.getEntityParticle(sobjectDescribe.name);

        return await new Promise((resolved)=>{
            sfConn.rest(acQuery, {progressHandler: vm.autocompleteProgress})
            .catch(err => {
                if (err.name != "AbortError") {
                    vm.autocompleteResults = {
                        sobjectName:sobjectDescribe.name,
                        title: "Error: " + err.message,
                        results: []
                    };
                }
                resolved(vm.autocompleteResults);
                return null;
            })
            .then(data => {
                vm.autocompleteProgress = {};
                if (data) {
                    vm.autocompleteResults = {
                        sobjectName:sobjectDescribe.name,
                        title: sobjectDescribe.name + " values:",
                        results: data,
                        sobjectDescribe
                    }
                };
                console.log('success load data ', vm.autocompleteResults, this.dataMap[sobjectDescribe.name]);
                resolved(vm.autocompleteResults);
            });
            vm.autocompleteResults = {
                sobjectName:sobjectDescribe.name,
                title: "Loading " + sobjectDescribe.name + " values...",
                results: []
            };
        })
    }

    getRecords(){
        return Object.keys(this.dataMap).flatMap(e=>this.dataMap[e].records||[]);
    }

    getSobjectDescribe(sobjectName){
        return this.dataMap[sobjectName]?.sobjectDescribe;
    }

    getNameField(sobjectName){
        return this.dataMap[sobjectName]?.nameField;
    }

    getAllChecked(){
        let allCheckeds = localStorage.getItem('sobject:field:check');
        if (!allCheckeds){
            allCheckeds = '{}'
        }
        let allchecked = JSON.parse(allCheckeds);
        return allchecked;
    }
}

class DataExpendAsTree{
    constructor(dateTree){
        this.dateTree = dateTree;
    }

    init(sobjectDescribe, data){
        this.sobjectDescribe=sobjectDescribe;
        this.data=data;
        return this;
    }

    getUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }

    toHtml(sobjectDescribe, data){
        sobjectDescribe = sobjectDescribe||this.sobjectDescribe;
        data = data||this.data;
        if (!sobjectDescribe){
            return '';
        }

        let listData = sobjectDescribe.fields.map(e=>{
            return {name:e.name,label:e.label, value:data[e.name],type:e.type, referenceTo:e.referenceTo}
        })
        return `<div><div class="block-head">${sobjectDescribe.name}</div>
            ${listData.map(field=>{
                if (field.type=="reference"){
                    let uuid = this.getUuid();
                    field.uuid = uuid;
                    return `<div class="field-item ${field.value?'':'null-value'} ${field.name=='Id'?'requirment-item':''}" name="${sobjectDescribe.name+'.'+field.name}">
                        <span class="field-item-name"> ${field.name}</span>
                        <span class="field-item-label">(${field.label})</span>:
                        <span class="reference field-item-value" name="${sobjectDescribe.name+'.'+field.name}" value="${field.value}">${field.value}</span>
                        <div class="childblock" id="${uuid}">${this.getChildHtml(sobjectDescribe, field)}</div>
                    </div>`
                }
                return `<div class="field-item ${field.value?'':'null-value'}" name="${sobjectDescribe.name+'.'+field.name}">
                    <span class="field-item-name">${field.name}</span>
                    <span class="field-item-label">(${field.label})</span>:
                    <span class="field-item-value">${field.value}</span>
                    </div>`
            }).join('')}
            <div class="field-item field-hor requirment-item"></div>
            ${sobjectDescribe.childRelationships.map(field=>{
                let uuid = this.getUuid();
                field.uuid = uuid;
                return `<div class="field-item" name="${sobjectDescribe.name+'.'+field.childSObject+'.'+field.field}">
                    <span class="field-item-name ${this.isQueryable(field.childSObject)?'queryable':''}">${field.childSObject}</span>:
                    <span class="relationship field-item-attr" name="${field.childSObject+'.'+field.field}" value="${field.field}">
                ${field.field}</span>
                    <span class="relationshipname field-item-value">(${field.relationshipName||'Blank'})</span>
                <div class="childblock" id="${uuid}"></div>
                </div>`
            }).join('')}
        </div>`
    }

    isQueryable(sobject){
        
        return this.dateTree.describeInfo.sobjectAllDescribes.data.sobjects.get(sobject.toLocaleLowerCase()).global.queryable

    }

    toRelationshipHtml(refs){
        
        return `${refs.map(field=>{
                let uuid = this.getUuid();
                field.uuid = uuid;
                let sobjectDescribe =field.sobjectDescribe;
                let nameFieldDesc = sobjectDescribe.fields.find(e=>e.nameField==true);
                let idField = sobjectDescribe.fields.find(f => f.name=='Id');
                return `<div class="field-item requirment-item" name="${sobjectDescribe.name+'.'+field.name}">
                    ${idField.label}
                    <span class="reference" name="${sobjectDescribe.name+'.'+field.name}" value="${field.value.Id}">
                        ${field.value[nameFieldDesc.name]}-${field.value.Id}
                    </span>
                    <div class="childblock" id="${uuid}"></div>
                </div>`
            
        }).join('')}`
    }

    getChildHtml(parentSobjectDescribe, field){
            return '';
    }

    applyFieldsCheck(sObjectTable, htmlId){
        let allChecked = sObjectTable.getAllChecked();
        $(`#${htmlId} .field-item[name]`).hide();
        $(`#${htmlId} .requirment-item`).show();
        Object.keys(allChecked).forEach(element => {
            if (element.indexOf(this.sobjectDescribe.name+'.')==0&&allChecked[element]){
                $(`#${htmlId} [name="${element}"]`).show();
            }
        });
    }

    showAll(htmlId){
        $(`#${htmlId} .field-item`).show();
    }

    hideAll(sObjectTable, htmlId){
        $(`#${htmlId} .field-item`).hide();
        let allChecked = sObjectTable.getAllChecked();
        $(`#${htmlId} .requirment-item`).show();
        Object.keys(allChecked).forEach(element => {
            if (allChecked[element]){
                $(`#${htmlId} [name="${element}"]`).show();
            }
        });;
    }

    checkShowAll(tab){
        let showAll = $('#showAllFields').is(':checked');
        if (showAll){
            this.showAll('rootdata');
        }else{
            this.hideAll(tab, 'rootdata');
        }
    }
}

class SObjectTable{
    constructor(dateTree){
        this.dateTree = dateTree;
        this.sobject = '';
        this.recorrdId = '';
        this.fieldRows=[{
            name:'Field API Name'
        }];
        this.fieldColumns=[{
            name:'Field API Name'
        }];
    }

    storage(key, value){
        let allchecked = this.getAllChecked();
        allchecked[key] = value;
        localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

    storageAllRelationship(value){
        let allchecked = this.getAllChecked();
        let dataMap = this.dateTree.dataMap[this.sobject];
        let sobjectDescribe = dataMap.sobjectDescribe;
        sobjectDescribe.childRelationships.forEach(e=>{
            allchecked[this.sobject+'.'+e.childSObject+'.'+e.field] = value;
        })
        allchecked = Object.keys(allchecked).filter(e=>allchecked[e]).map(e=>{e:true});

        localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

    storageAllFields(value){
        let allchecked = this.getAllChecked();
        let dataMap = this.dateTree.dataMap[this.sobject];
        let sobjectDescribe = dataMap.sobjectDescribe;
        sobjectDescribe.fields.forEach(e=>{
            allchecked[this.sobject+'.'+e.name] = value;
        })
        allchecked = Object.keys(allchecked).filter(e=>allchecked[e]).map(e=>{e:true});

        localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

    getAllChecked(){
        let allCheckeds = localStorage.getItem('sobject:field:check');
        if (!allCheckeds){
            allCheckeds = '{}'
        }
        let allchecked = JSON.parse(allCheckeds);
        return allchecked;
    }
    
    rowtostring(value, attr){
        if (!value){
            return value;
        }
        if (typeof value ==='string'){
            return value;
        }
        if (typeof value ==='object'){
            if (value.length===0){
                return  '';
            }
            if (value.length>0 && value.join){
                return value.map(e=>`<span class="relationship">${e}</span>`).join(',');
            }
            return JSON.stringify(value);
        }
        return value;
    }

    fieldsFilter(fieldMatch){
        if (!this.sobject){
            return;
        }
        try{
            var reg = new RegExp("(" + fieldMatch + ")","i");
        }
        catch (e){
            return;
        }
        let dataMap = this.dateTree.dataMap[this.sobject];
        let sobjectDescribe = dataMap.sobjectDescribe;
        let showFields = sobjectDescribe.fields.filter(e=>{
            if (!fieldMatch){
                return true;
            }
            
            return reg.test(e.name) || reg.test(e.label);
        }).map(e=>e.name)

        let showRelationships = sobjectDescribe.childRelationships.filter(e=>{
            if (!fieldMatch){
                return true;
            }
            
            return reg.test(e.childSObject) || reg.test(e.field) || reg.test(e.relationshipName||'');
        }).map(e=>e.childSObject+'.'+e.field)

        $('tbody tr').each((index, ele)=>{
            let row = $(ele).attr('name');
            if (showFields.indexOf(row)!=-1 || showRelationships.indexOf(row)!=-1){
                $(ele).show();
            }else{
                $(ele).hide();
            }
        })
    }

    render(){
        return `
            <table>
                <thead>
                    <tr>
                        ${this.fieldColumns.map(e=>{
                            return `<th class="field-${e.name}" tabindex="0">${e.label||e.name}</th>`
                        }).join('')}
                        <th class="field-value" tabindex="0">Value</th>
                        <th class="field-action" tabindex="0">Action</th>
                        <th class="field-action" tabindex="0">Show In Tree<input name="${this.sobject}.field.all" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                    </tr>
                </thead>
                <tbody>
                    ${this.fieldRows.map(r=>{
                        return `
                <tr class="${r.name}" title="${r.label}" name="${r.name}">
                    
                ${this.fieldColumns.map(e=>{
                    return `<td class="field-${e.name}" tabindex="0">${this.rowtostring(r[e.name], e.name)}</td>`
                }).join('')}
                    <td class="field-value" tabindex="0">${this.record[r.name]||''}</td>
                    <td class="field-actions">
                        <div class="pop-menu-container">
                            <button class="actions-button">
                                <svg class="actions-icon">
                                    <use xlink:href="symbols.svg#down"></use>
                                </svg>
                            </button>
                            <div class="pop-menu">
                                <span class="relationship">All field metadata</span>
                            </div>
                        </div>
                    </td>
                    <td class="field-value" tabindex="0"><input name="${this.sobject}.${r.name}" class="show-in-tree check-in-${r.name}" ${r.name=='Id'?'checked disabled':''} type="checkbox"></input>
                    </td>
                </tr>`
                    }).join('')}
                </tbody>
            </table>
            <h1>Relationship</h1>
            <table>
                <thead>
                    <tr>
                        ${this.relationshipColumns.map(e=>{
                            return `<th class="field-${e.name}" tabindex="0">${e.label||e.name}</th>`
                        }).join('')}
                        <th class="field-action" tabindex="0">Action</th>
                        <th class="field-action" tabindex="0">Show In Tree<input name="${this.sobject}.field.relationship" class="show-in-tree selectAll object-relationship" type="checkbox"></input></th>
                    </tr>
                </thead>
                <tbody>
                    ${this.relatinoshipRows.map(r=>{
                        return `
                <tr class="" title="${r.label}" name="${r.childSObject+'.'+r.field}">
                    
                ${this.relationshipColumns.map(e=>{
                    return `<td class="field-${e.name}" tabindex="0">${this.rowtostring(r[e.name], e.name)}</td>`
                }).join('')}
                    <td class="field-actions">
                        <div class="pop-menu-container">
                            <button class="actions-button">
                                <svg class="actions-icon">
                                    <use xlink:href="symbols.svg#down"></use>
                                </svg>
                            </button>
                            <div class="pop-menu">
                                <span class="relationship">All field metadata</span>
                            </div>
                        </div>
                    </td>
                    <td class="field-value" tabindex="0"><input name="${this.sobject}.${r.childSObject}.${r.field}" class="show-in-tree check-in-${r.name}.${r.label}"  type="checkbox"></input>
                    </td>
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    doUpdaate(){
        
        let htmlId = 'showalldatatable';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            if (!this.sobject){
                rootdata.innerHTML = 'No data to show';
                console.log('No data to show 1');
                return;
            }
            let dataMap = this.dateTree.dataMap[this.sobject];
            if (!dataMap){
                rootdata.innerHTML = 'No data to show';
                console.log('No data to show 2');
                return;
            }
            this.record = dataMap.records.find(e=>{
                return e.Id == this.recorrdId;
            })
            this.record = this.record||{};

            let sobjectDescribe = dataMap.sobjectDescribe;
            let entityParticle = dataMap.entityParticle;
            this.fieldRows = sobjectDescribe.fields.map(t=>{
                return t
            })
            this.relatinoshipRows = sobjectDescribe.childRelationships.map(t=>{
                let {childSObject,field, relationshipName}=t;
                return {childSObject,field, relationshipName};
            })

            this.fieldColumns = [{name:'name', label:'Field API Name'},{name:'label', label:''},{name:'type'},{name:'referenceTo'}];
            this.relationshipColumns = [{name:'childSObject', label:'Field API Name'},{name:'field', label:''},{name:'relationshipName'}]
            try{
                rootdata.innerHTML=this.render();
                $('.field-actions .pop-menu').hide();
                $('.field-actions .actions-button').on('click', (event)=>{
                    if ($(event.currentTarget).siblings(".pop-menu").css("display")=='none'){
                        $(event.currentTarget).siblings(".pop-menu").show();
                    }else{
                        $(event.currentTarget).siblings(".pop-menu").hide();
                    }
                });
                
                $('.recordsnumber').html(this.fieldRows.length);
                this.applyFieldsCheck();
            }
            catch(e){
                rootdata.innerHTML=JSON.stringify(e.stack);
            }
        }
    }

    applyFieldsCheck(){
        let allChecked = this.getAllChecked();
        Object.keys(allChecked).forEach(element => {
            if (element.indexOf(this.sobject+'.')==0 && allChecked[element]){
                $(`input[name="${element}"]`).prop('checked',true);
            }
        });;
    }
}

class SObjectAllDataTable{

    constructor(dateTree){
        this.dateTree = dateTree;
        this.showFields = [];
        this.records = [];
        this.sobjectname=null;
    }
    render(){
        return `
            <table>
                <thead>
                    <tr>
                        ${this.showFields.map(e=>{
                            return `<th class="field-${e.name}" tabindex="0">${e.label||e.name}</th>`
                        }).join('')}
                        <th class="field-action" tabindex="0">Show In Tree<input name="${this.sobject}.field.all" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                    </tr>
                </thead>
                <tbody>
                    ${this.records.map(r=>{
                        return `
                <tr class="${this.sobjectname}" title="${this.sobjectDescribe.lael}" name="${this.sobjectname}">
                    
                ${this.showFields.map(e=>{
                    return `<td class="field-${e.name}" tabindex="0">${r[e.name]}</td>`
                }).join('')}
                    <td class="field-value" tabindex="0">
                    </td>
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    get sobjectDescribe(){
         let dataMap = this.dateTree.dataMap[this.sobjectname];
         return dataMap.sobjectDescribe;
    }

    setSobjectname(sobjectname){
        
        sobjectname = this.dateTree.allSObjectApi.map(e=>e.global.name).find(e => e.toLocaleLowerCase() == sobjectname.toLocaleLowerCase());
        if (!sobjectname){
            return;
        }
        this.sobjectname = sobjectname;
        
        this.doUpdaate();
    }

    async doUpdaate(){
        
        let htmlId = 'showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            rootdata.innerHTML = 'loading data from '+this.sobjectname;
            if (!this.sobjectname){
                rootdata.innerHTML = 'No data to show';
                console.log('No data to show 1');
                return;
            }
            await this.dateTree.getDescribeSobject(this.sobjectname);
            let dataMap = this.dateTree.dataMap[this.sobjectname];
            if (!dataMap){
                rootdata.innerHTML = 'No data to show';
                console.log('No data to show 2');
                return;
            }

            let sobjectDescribe = this.sobjectDescribe;

            let allChecked = this.dateTree.getAllChecked();
            let checkFields = Object.keys(allChecked).filter(element => {
                return element.indexOf(sobjectDescribe.name+'.')==0&&allChecked[element];
            });

            this.showFields = sobjectDescribe.fields.filter(t=>{
                return checkFields.indexOf(sobjectDescribe.name+'.'+t.name)>-1 || t.name=='Id' || t.nameField;
            })

            await this.loadData();

            try{
                rootdata.innerHTML=this.render();
            }
            catch(e){
                rootdata.innerHTML=JSON.stringify(e.stack);
            }

            $('#showallsobjectdata .recordsnumber').text(this.records.length);
        }
    }

    async loadData(){
        let result = await this.dateTree.getRecordsByFields(this.sobjectname, this.showFields)
        this.records = result.results.records;
    }
}

function createTreeHead(){
    let treeroot = document.getElementById('treeroot');
        let searchAear = `
        <p>
            <label>SF Host</label>
            <select name="select-sfhost" id="select-sfhost">
                <option value="">Please select SFHost</option>
            </select>
            <br/>
            <label>Sessions</label>
            <select name="select-session" id="select-session">
                <option value="">Please select SFHost</option>
            </select>
        </p>
    <p class="searchp">
        Object Search: <input id="objectsearch" class="search" type="input" value="" name="apiName" type="text" autocomplete="off" style="width:395px;height:30px;font-size:15pt;"></input>
        Exclude Object Search: <input class="search" id="exobjectsearch" type="input" value="" ></input>
        Metadata: <input class="" id="inmdtsearch" type="checkbox" value="N" ></input>
        Event: <input class="" id="ineventsearch" type="checkbox" value="N" ></input>
        History: <input class="" id="inhissearch" type="checkbox" value="N" ></input>
        Share: <input class="" id="insharesearch" type="checkbox" value="N" ></input>
        Chang Event: <input class="" id="inchangeeventsearch" type="checkbox" value="N" ></input>
        Custom: <input class="" checked id="incustomsearch" type="checkbox" value="Y" ></input>
        No Null Field: <input class="" checked id="noNullField" type="checkbox" value="Y" ></input>
        Show All: <input class="" id="showAllFields" type="checkbox" value="Y" ></input>
    </p>
    <p>
        Fields Search: <input class="search" id="fieldssearch" type="input" value="" autocomplete="off" ></input>
    </p>
    <p>
        Fields Value: <input class="search" id="fieldvalyuesearch" type="input" value=""></input>
    </p>
    <p>
        <label>History Records:</label>
        <select name="select-data" id="historysearch">
            <option value="">Please select object</option>
        </select>
    </p>
    <p>
        <button class="tablinks" name="SearchSObject" id="SearchSObject">Search</button>
        <button class="tablinks" name="filterBlankValue" id="filterBlankValue">Filter Blank Value</button>
    </p>
    <div class="searchresult">
        <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
        <div class="totalbar" id="notificationmessage"></div>

        <div class="objsearchresult"></div>
        <div class="detailearchresult"></div>
    </div>`
        var div = document.createElement("div");
        div.innerHTML=searchAear;
        treeroot.appendChild(div);
}

function updateSelectUI(htmlId, items){
    let v = $('#'+htmlId).val();
    $('#'+htmlId).html(`<option value="-1">Please select...</option>`+items.map((e,index)=>{
        return `<option value="${index}">${e.label}</option>`;
    }).join(''));
     $('#'+htmlId).val(v);
}

function createSObjectAllDataHead(){
    let treeroot = document.getElementById('showallsobjectdata');
    let searchAear = `
    <p>
        Fields Search: <input class="search" id="sobjectsearch2" type="input" value="" autocomplete="off" ></input>
    </p>
    <p>
        Fields Value: <input class="search" id="fieldvalyuesearch" type="input" value=""></input>
    </p>
    <div class="searchresult">
        <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
        <div class="totalbar" id="notificationmessage3"></div>

        <div class="objsearchresult"></div>
        <div class="detailearchresult"></div>
        <div id="showallsobjectdatatable"></div>
    </div>`
        var div = document.createElement("div");
        div.innerHTML=searchAear;
        treeroot.appendChild(div);
}


{

    let args = new URLSearchParams(location.search.slice(1));
    
    console.log('url args=' + args);
    let sfHost = args.get("host");
    let sobjectName = args.get("objectType");
    let useToolingApi = args.has("useToolingApi");
    let recordId = args.get("recordId");
    initButton(sfHost, true);
    createTreeHead();

    let addTreeHeadEvent=()=>{
        let sfHosts = sfConn.getSfHosts();
        updateSelectUI('select-sfhost', sfHosts.map((e,index)=>{return {index,value:e,label:e}}));

        $('#treeroot').on('change', '#select-sfhost', (event)=>{
            let sfHost = $('#select-sfhost').val();
            if (!sfHost || sfHost==-1){
                return;
            }
            let sessions = sfConn.getAllSessions(sfHosts[sfHost]);
            updateSelectUI('select-session', sessions.map(e=>{return {value:e.sectionId,label:new Date(e.createdDate)}}));
        })

        $('#treeroot').on('change', '#select-session', (event)=>{
            let sfHost = $('#select-sfhost').val();
            let sessionId = $('#select-session').val();
            if (sessionId==-1){
                return;
            }
            sfConn.instanceHostname = sfHost;
            sfConn.sessionId = sessionId;
        })
    }
    
    addTreeHeadEvent();

    
    sfConn.getSession(sfHost).then(() => {

      let tree = new DateTree({sfHost, args});
      let tab = new SObjectTable(tree);
      let dataTree = new DataExpendAsTree(tree);
      let dataTable = new SObjectAllDataTable(tree);
      let createHead = ()=>{
        
          let sfHosts = sfConn.getSfHosts();
          let sessions = sfConn.getAllSessions(sfHosts[sfConn.instanceHostname]);
          updateSelectUI('select-sfhost', sfHosts.map(e=>{return {name:e,label:e}}));
          $('#select-sfhost').val(sfHosts.indexOf(sfConn.instanceHostname));
          $('#select-sfhost').change();
          let s = sessions.find(e=>{return e.sectionId == sfConn.sectionId});
          $('#select-session').val(sessions.indexOf(s));
        
        // autocomplete
        let autoComplete1 = new AutoComplete1('objectsearch',()=>{
            return tree.allSObjectApi.map(e=>e.global.name);
        });
        autoComplete1.createApi();

        $('#treeroot').addClass('ctrl-null');
        $('#objectsearch').val(sobjectName);
        $('#fieldvalyuesearch').val(recordId);

        $('#SearchSObject').on('click',()=>{
            let sobjectname = $('#objectsearch').val();
            let field = $('#fieldssearch').val();
            let fieldvalue = $('#fieldvalyuesearch').val();
            if (fieldvalue){
                doUpdate(sobjectname, fieldvalue);
            }
            
        })

        $('#filterBlankValue').on('click',()=>{
            $('.null-value').hide();
        })

        $('#noNullField').on('click',()=>{
            let filterNull = $('#noNullField').is(':checked');
            if (filterNull){
                $('#treeroot').addClass('ctrl-null');
            }else{
                $('#treeroot').removeClass('ctrl-null');
            }
        })

        $('#showAllFields').on('click', ()=>{
            let showAll = $('#showAllFields').is(':checked');
            if (showAll){
                dataTree.showAll('rootdata');
            }else{
                dataTree.hideAll(tab, 'rootdata');
            }
        })

        $('#historysearch').on('change', (event)=>{
            let field = $('#historysearch').val();
            let allRecords = tree.getRecords();
            let sobject = allRecords.find(e=>e.Id==field).attributes.type;
            doUpdate(sobject, field);
        })


        setInterval(()=>{
            let notificationmessage = document.getElementById('notificationmessage');
            if (notificationmessage){
                notificationmessage.innerHTML=(tree.autocompleteResults||{}).title;
            }
        }, 500);
      }

      let createTableHead=()=>{
            let treeroot = document.getElementById('showalldata');
            let searchAear = `
            <p>
                <label for="cars">Choose a SObject:</label>
                <select name="cars" id="select-sobject">
                    <option value="">Please select object</option>
                </select>

                <label for="cars">Choose a Record ID:</label>
                <select name="select-data" id="select-sobject-data">
                    <option value="">Please select object</option>
                </select>

                <button class="tablinks" name="updateSelectObject" id="updateSelectObject">Update</button>

                <div>
                <label for="cars">Object Search: </label>
                <input id="objectdetailsearch" class="search" type="input" value="" name="apiName" type="text" autocomplete="off"
                style="width:395px;height:30px;font-size:15pt;"></input>
                </div>

                <div>
                    <label for="cars">Object Search: </label>
                    <input id="objectdetailsearch2" class="search" type="input" value=""  type="text" autocomplete="off"
                    style="width:395px;height:30px;font-size:15pt;"></input>
                </div>
                <div>
                    <label for="cars">Field Search: </label>
                    <input id="fielddetailsearch" class="search" type="input" value=""  type="text" autocomplete="off"
                    style="width:395px;height:30px;font-size:15pt;"></input>
                </div>
                
            </p>
            <div class="searchresult">
                <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>

                <div id="showalldatatable"></div>
            </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);

            $('#showalldatatable').on('click','.show-in-tree',(event)=>{
                 let isCheck = $(event.target).is(':checked');
                 if ($(event.target).is('.selectAll')){
                    if ($(event.target).is('.object-fields')){
                        tab.storageAllfields(isCheck);
                    }else{
                        tab.storageAllRelationship(isCheck);
                    }
                 }else{
                     tab.storage($(event.target).attr('name'), isCheck);
                 }
            })

            $('#showalldatatable').on('click','.show-in-tree',(event)=>{
                let isCheck = $(event.target).is(':checked');
                tab.storage($(event.target).attr('name'), isCheck);
           })

            

            $('#select-sobject').on('change', ()=>{
                let opt = $('#select-sobject').val();
                tab.sobject = opt;
                $('#select-sobject').attr('disabled','');

                let selectsjdata = document.getElementById('select-sobject-data');
                selectsjdata.innerHTML=`${tree.dataMap[opt]?.records?.map(e=>{
                    return `<option value="${e.Id}">${e.Id}</option>`
                }).join('')}`;
                tree.getDescribeSobject(opt).then(e=>{
                    tab.doUpdaate();
                    $('#select-sobject').removeAttr('disabled');
                })

            })

            $('#select-sobject-data').on('change', ()=>{
                let opt = $('#select-sobject-data').val();
                tab.recorrdId = opt;
                tab.doUpdaate();
            })

            $('#updateSelectObject').on('click', ()=>{
                updateSObjectSelect();
            })


            $('#showalldatatable').on('click','span.relationship', (event)=>{
                let sobject = $(event.target).html();
                $('#select-sobject').val(sobject);
                $('#select-sobject').change();
            })

            $('#objectdetailsearch').on('change', ()=>{
                let opt = $('#objectdetailsearch').val();
                let selectedObjectAPI = tree.allSObjectApi.find(e=>{
                    return e.global.name.toLowerCase() == opt.toLowerCase();
                })
                if (!selectedObjectAPI){
                    return;
                }
                tab.sobject = selectedObjectAPI.global.name;
                $('#select-sobject').val(tab.sobject);
                $('#select-sobject').attr('disabled','');

                let selectsjdata = document.getElementById('select-sobject-data');
                selectsjdata.innerHTML=`${tree.dataMap[opt]?.records?.map(e=>{
                    return `<option value="${e.Id}">${e.Id}</option>`
                }).join('')}`;
                tree.getDescribeSobject(opt).then(e=>{
                    tab.doUpdaate();
                    $('#select-sobject').removeAttr('disabled');
                })
            })

            $('#fielddetailsearch').on('change', ()=>{
                let opt = $('#fielddetailsearch').val();
                tab.fieldsFilter(opt);
            })

            

            let autoComplete1 = new AutoComplete1('objectdetailsearch',()=>{
                return tree.allSObjectApi.map(e=>{return e.global.name});
            });
            autoComplete1.createApi();
            autoComplete1.start(AutoComplete1);
            
      }

      let updateSObjectSelect = ()=>{
            let selctonj = document.getElementById('select-sobject');
            console.log('updateSObjectSelect ', tree.allSObjectApi);
            selctonj.innerHTML=`${tree.allSObjectApi?.map(e=>{
                return `<option value="${e.global.name}">${e.global.name}</option>`
            }).join('')}`;
        }

      let doUpdateRelationship = (sobjectName, fieldApi, id, htmlId)=>{
            htmlId = htmlId || 'rootdata';
            let rootdata = document.getElementById(htmlId);
            if (rootdata){
                rootdata.innerHTML=`loading relationship sobject=${sobjectName} id=${id}`;
            }

            tree.getRelationshipData(sobjectName, fieldApi, id.trim()).then((e)=>{
                if (!e || !e.sobjectDescribe){
                    if (rootdata == null){
                        rootdata = document.createElement("div");
                        rootdata.id=htmlId;
                        treeroot.appendChild(rootdata);
                    }
                    rootdata.innerHTML=tree.autocompleteResults.title;
                    return
                }
                console.log('loaded relationship ', e);

                if (rootdata == null){
                    rootdata = document.createElement("div");
                    rootdata.id=htmlId;
                    treeroot.appendChild(rootdata);
                }
                if (!e.results.records.length){
                    rootdata.innerHTML = 'No referenced data.';
                    $(rootdata).addClass('loaded');
                    return
                }
                rootdata.innerHTML = dataTree.init(e.sobjectDescribe,e.results).toRelationshipHtml(e.results.records.map(value=>{
                    return {sobjectDescribe:e.sobjectDescribe, value, name:e.sobjectDescribe.name};
                }));
                $(rootdata).addClass('loaded');
                dataTree.applyFieldsCheck(tab, htmlId);
                dataTree.checkShowAll(tab);

                let refsobject = e.sobjectDescribe.name;

                $('#'+htmlId+' .reference').on('click',(event)=>{
                    let fieldPath = $(event.target).attr('name');
                    let fieldPaths = fieldPath.split('.');
                    let field = tree.dataMap[fieldPaths[0]].sobjectDescribe.fields.find(e=>{
                        return e.name==fieldPaths[1];
                    })

                    let refBlockId = $(event.target).parent().children('.childblock').attr('id');
                    if ($('#'+refBlockId).css("display")=='none' || !$('#'+refBlockId).is('.loaded')){
                        $('#'+refBlockId).show();
                        if ($('#'+refBlockId).is('.loaded')){
                            return;
                        }
                        doUpdate(refsobject, $(event.target).attr('value'), refBlockId);
                    }else{
                        $('#'+refBlockId).hide();
                    }
                })
            })
      }

        let doUpdateHead = ()=>{
            let selectsjdata = document.getElementById('historysearch');
            let allRecords = tree.getRecords();
            let fieldvalue = $('#historysearch').val();

            selectsjdata.innerHTML=`${allRecords.map(e=>{
                let nameFieldName = tree.getNameField(e.attributes.type).name;
                return `<option value="${e.Id}">${e.attributes.type}##${e[nameFieldName]}&lt;${e.Id}&gt;</option>`
            }).join('')}`;
            $('#historysearch').val(fieldvalue);
        }

      let doUpdate = (sobject, id, htmlId)=>{
            $('#SearchSObject').attr('disabled','');
            htmlId = htmlId || 'rootdata';
            let rootdata = document.getElementById(htmlId);
            if (rootdata){
                rootdata.innerHTML=`loading sobject=${sobject} id=${id}`;
            }
            tree.getData(sobject,id.trim()).then(e=>{
                let treeroot = document.getElementById('treeroot');

                

                if (!e || !e.sobjectDescribe){
                    if (rootdata == null){
                        rootdata = document.createElement("div");
                        rootdata.id=htmlId;
                        treeroot.appendChild(rootdata);
                    }
                    rootdata.innerHTML=tree.autocompleteResults.title;
                    $('#SearchSObject').removeAttr('disabled');
                    return
                }
                
                if (rootdata == null){
                    rootdata = document.createElement("div");
                    rootdata.id=htmlId;
                    treeroot.appendChild(rootdata);
                }
                rootdata.innerHTML=dataTree.init(e.sobjectDescribe,e.results).toHtml();

                dataTree.applyFieldsCheck(tab, htmlId);
                dataTree.checkShowAll(tab);

                $(rootdata).addClass('loaded');
                tab.recorrdId = id;
                tab.sobject = e.sobjectDescribe.name;
                tab.doUpdaate();
                updateSObjectSelect();
                doUpdateHead();
                $('#SearchSObject').removeAttr('disabled');

                $('#'+htmlId+' .reference').on('click',(event)=>{
                    let fieldPath = $(event.target).attr('name');
                    let fieldPaths = fieldPath.split('.');
                    let field = tree.dataMap[fieldPaths[0]].sobjectDescribe.fields.find(e=>{
                        return e.name==fieldPaths[1];
                    })

                    let refBlockId = $(event.target).parent().children('.childblock').attr('id');
                    if ($('#'+refBlockId).css("display")=='none' || !$('#'+refBlockId).is('.loaded')){
                        $('#'+refBlockId).show();
                        if ($('#'+refBlockId).is('.loaded')){
                            return;
                        }
                        doUpdate(field.referenceTo[0], $(event.target).attr('value'), refBlockId);
                    }else{
                        $('#'+refBlockId).hide();
                    }
                })

                $('#'+htmlId+' .relationship').on('click',(event)=>{
                    let fieldPath = $(event.target).attr('name');
                    let fieldPaths = fieldPath.split('.');

                    let refBlockId = $(event.target).parent().children('.childblock').attr('id');
                    if ($('#'+refBlockId).css("display")=='none' || !$('#'+refBlockId).is('.loaded')){
                        $('#'+refBlockId).show();
                        if ($('#'+refBlockId).is('.loaded')){
                            return;
                        }
                        doUpdateRelationship(fieldPaths[0],fieldPaths[1], id, refBlockId);
                    }else{
                        $('#'+refBlockId).hide();
                    }
                })
          })
      }

      let initObjectAllDataHead= ()=>{
        
        $('#sobjectsearch2').on('change', (event)=>{
            let tableName = $(event.target).val();
            dataTable.setSobjectname(tableName);
        })

        let autoComplete1 = new AutoComplete1('sobjectsearch2',()=>{
            return tree.allSObjectApi.map(e=>{return e.global.name});
        });
        autoComplete1.createApi();
        autoComplete1.start(AutoComplete1);
      }
      createHead();
      createTableHead();
      createSObjectAllDataHead();
      initObjectAllDataHead();
      //doUpdate('OrderItem', '802BU000000F38tYAC');


      $('#Retry').on('click',()=>{
        doUpdate(sobjectName, recordId);
      })

      
    });

}