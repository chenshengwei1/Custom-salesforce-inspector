import {sfConn1} from "./sfConn.js"
import {Tools} from "./Tools.js";

let sfConn = new sfConn1();
let apiVersion = "56.0";

class DescribeInfoEx{
    constructor(){
        this.sobjectAllDescribes = this.initialState();
        this.isReady = false;
    }
    initialState() {
        return {
          data: {global: {globalStatus: "pending", globalDescribe: null}, sobjects: null},
          tool: {global: {globalStatus: "pending", globalDescribe: null}, sobjects: null}
        };
    }

    apiIsReady(){
        return new Promise((resolve)=>{
            if(this.isReady===true){
                resolve(true);
            }else if(this.isReady===false){
                this.isReady = ()=>{
                    this.isReady = true;
                    resolve();
                };
            }else if(typeof this.isReady=='function'){
                let preReady= this.isReady;

                this.isReady = ()=>{
                    preReady();
                    resolve();
                };
            }
        });
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
                    console.log('getting tooling objects finnish ', res);
                    reslove(apiDescribes);
                    setTimeout(() => {
                        if (this.isReady === false){
                            this.isReady = true;
                        }else if (this.isReady === true){

                        }else if (typeof this.isReady=='function'){
                            this.isReady();
                        }
                    }, 0);
                }, () => {
                  apiDescribes.global.globalStatus = "loadfailed";
                  console.log('getting tooling objects loadfailed ');
                  reslove(apiDescribes);
                  setTimeout(() => {
                    if (this.isReady === false){
                        this.isReady = true;
                    }else if (this.isReady === true){

                    }else if (typeof this.isReady=='function'){
                        this.isReady();
                    }
                }, 0);
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
        if (!sobjectName){
            return {sobjectStatus: "notfound", sobjectDescribe: null};
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

export class QueryMananger{
    constructor({sfHost, args}) {
        this.sfHost = sfHost;
        this.queryInput = null;
        this.useToolingApi= false;
        this.initialQuery = "";
        this.autocompleteProgress = {};
        this.describeInfo = new DescribeInfoEx(this.useToolingApi);
        this.callbacks=[];
        this.dataMap={};
        this.Tools= Tools;
    }

    async start(){
        await this.getSession();
        let apiDescribes = this.describeInfo.getGlobal(this.useToolingApi);
        
    }

    getSession(){
        return sfConn.getSession(this.sfHost)
    }

    get sfConn(){
        return sfConn;
    }

    getUuid() {
        return Tools.getUuid();
    }

    get allSObjectApi(){
        if (this.useToolingApi){
            return Array.from(this.describeInfo.sobjectAllDescribes?.tool?.sobjects?.values()||[]) ||[];
        }
        return Array.from(this.describeInfo.sobjectAllDescribes?.data?.sobjects?.values()||[]) ||[];
    }

    tool(isTool){
        this.useToolingApi= isTool;
        this.describeInfo.getGlobal(isTool);
    }

    waitReady(){
        return this.describeInfo.apiIsReady();
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

    getAllChecked(){
        let allCheckeds = localStorage.getItem('sobject:field:check');
        if (!allCheckeds){
            allCheckeds = '{}'
        }
        let allchecked = JSON.parse(allCheckeds);
        return allchecked;
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
              }).catch(e=>{
                this.dataMap[sobjectName].entityParticle = [];
                resolved(null);
              })
        })
    }

    

    getSyncDescribeSobject(sobjectName){
        let v = this.dataMap[sobjectName];
        if (v && Object.keys(v).length > 0){
            return this.dataMap[sobjectName].sobjectDescribe;
        }
        return {};
    }

    async getDescribeSobject(sobjectName){
        let v = this.dataMap[sobjectName];
        if (v && Object.keys(v).length > 0){
            return this.dataMap[sobjectName].sobjectDescribe;
        }
        let {sobjectDescribe} = await this.describeInfo.describeSobject(this.useToolingApi, sobjectName);
        if(!sobjectDescribe){
            return {}
        }
        this.dataMap[sobjectDescribe.name] = {sobjectDescribe:sobjectDescribe, records:[]};
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
            acQuery = this.baseQueryAPI()+'?q=' + encodeURIComponent(acQuery);
        }else{
            acQuery = this.baseSObjectAPI() + sobjectName + "/"+value;
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

        let findCacheData = this.dataMap[sobjectDescribe.name]?.records?.find(e=>{return e.Id == value});
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
            acQuery = this.baseQueryAPI()+'?q=' + encodeURIComponent(acQuery);
        }else{
            acQuery = this.baseSObjectAPI() + sobjectDescribe.name + "/"+value;
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

    async getSObjectById(recordId){
        if (!recordId || recordId === 0){
            return {objectTypes:[]}
        }
        let {globalDescribe} = await this.describeInfo.describeGlobal(this.useToolingApi);
        let objectTypes;
        if (globalDescribe) {
          let keyPrefix = recordId.substring(0, 3);
          objectTypes = globalDescribe.sobjects.filter(sobject => sobject.keyPrefix == keyPrefix).map(sobject => sobject.name);
        } else {
          objectTypes = [];
        }
        return {objectTypes, recordId};
    }

    async getSObjectNameById(recordId){
        let {objectTypes} = await this.getSObjectById(recordId);
        return objectTypes[0];
    }
    

    async getRecordsByFields(sobjectName, fields, offset, condition, extfields, pageLength){
        offset = offset ||0;
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
        if (extfields){
            loadFields.push(...extfields)
        }
        let fieldNames = loadFields.join(", ");
        //let acQuery = "/services/data/v56.0/sobjects/Order/801BC0000078cNSYAY";
        // /services/data/v56.0/query/?q=select%20name%20from%20Order%20where%20name%3D'WYS'

        // filterable
        let allFilteralbleFields = sobjectDescribe.fields.filter(e=>e.filterable).map(e=>e.name);

        let acQuery = '';
        let conditionStr = '';
        if (condition){
            conditionStr = Object.keys(condition).filter(k=>condition[k]&&allFilteralbleFields.indexOf(k)!=-1).map(k =>{

                let option = condition[k+'.option'] || '=';
                if (condition[k] == 'null'){
                    return k+option+condition[k];
                }

                let referToField = sobjectDescribe.fields.find(e=>e.name == k);
                if (referToField.type=='boolean' || referToField.type=='date' || referToField.type=='datetime' || referToField.type=='double'){
                    return k+option+condition[k];
                }

                if (option=='in'){
                    return k+' '+option+" ('"+condition[k].split(',').join("','")+"') ";
                }
                if (option=='not in'){
                    return ' not ' + k+" in ('"+condition[k].split(',').join("','")+"') ";
                }
                return k+option+" '"+condition[k]+"' ";
            }).join(' and ');
            if (conditionStr){
                conditionStr = ' where ' + conditionStr;
            }
        }
        if (fieldNames){
            let idFieldDesc = sobjectDescribe.fields.find(e=>e.name=='CreatedDate');
             idFieldDesc = idFieldDesc || sobjectDescribe.fields.find(e=>'SystemModstamp'==e.name);
             idFieldDesc = idFieldDesc || sobjectDescribe.fields.find(e=>e.name=='Id');
            acQuery=`select ${fieldNames} from ${sobjectDescribe.name} ${conditionStr} ${idFieldDesc.sortable?'order by '+idFieldDesc.name+' desc':''} ${offset==0||offset>2000?'':'limit ' +offset}`;
            console.log(acQuery);
            acQuery = this.baseQueryAPI()+`?q=` + encodeURIComponent(acQuery);
        }else{
            acQuery = this.baseSObjectAPI() + sobjectDescribe.name + "/"+value;
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
                    //data.records = allData.allRecords;
                    data.allRecords = data.records; 
                    vm.autocompleteResults = {
                        sobjectName:sobjectDescribe.name,
                        title: sobjectDescribe.name + " values: "+data.totalSize,
                        results: data.records,
                        sobjectDescribe,
                        totalSize:data.totalSize,
                        data: data
                    }
                    console.log('success load data ', vm.autocompleteResults, this.dataMap[sobjectDescribe.name]);
                    resolved(vm.autocompleteResults);
                }else{
                    resolved(vm.autocompleteResults);
                }
                
            });
            vm.autocompleteResults = {
                sobjectName:sobjectDescribe.name,
                title: "Loading " + sobjectDescribe.name + " values...",
                results: []
            };
        })
    }

    baseQueryAPI(){
        return `/services/data/v56.0/${this.useToolingApi?'tooling/':''}query/`
    }
    baseSObjectAPI(){
        return  `/services/data/v56.0/${this.useToolingApi?'tooling/':''}sobjects/`;
    }

    getNetwork(){
        return sfConn.getNetwork();
    }

    async loadNextRecords(data, isLoadAll){
        if (data.done == true){
            data.allRecords = data.records; 
            return data;
        }else{
            let nextData = await sfConn.rest(data.nextRecordsUrl);
            nextData.allRecords = data.allRecords.concat(nextData.records);
            if (!isLoadAll){
                return nextData;
            }
            return await this.loadNextRecords(nextData, isLoadAll);
        }
    }

    async getRecordsBySoql(soql){
        let acQuery = soql;
        if (soql){
            acQuery = this.baseQueryAPI()+'?q=' + encodeURIComponent(soql);
        }
        let vm = this;
        return await new Promise((resolved)=>{
            sfConn.rest(acQuery, {progressHandler: vm.autocompleteProgress})
            .catch(err => {
                if (err.name != "AbortError") {
                    vm.autocompleteResults = {
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
                    //data.records = allData.allRecords;
                    data.allRecords = data.records; 
                    vm.autocompleteResults = {
                        results: data.records,
                        totalSize:data.totalSize,
                        data: data
                    }
                    resolved(vm.autocompleteResults);
                }else{
                    resolved(vm.autocompleteResults);
                }
                
            });
            vm.autocompleteResults = {
                results: []
            };
        })
    }
    

    async getApexlogByid(id){
        let acQuery = id;
        if (id){
            acQuery = `/services/data/v59.0/tooling/sobjects/ApexLog/${id}/Body`;
        }
        let vm = this;
        return await new Promise((resolved)=>{
            sfConn.rest(acQuery, {progressHandler: vm.autocompleteProgress, responseType:'text'})
            .catch(err => {
                if (err.name != "AbortError") {
                    vm.autocompleteResults = {
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
                    //data.records = allData.allRecords;
                    vm.autocompleteResults = {
                        results: data,
                        totalSize:data.totalSize,
                        data: data
                    }
                    resolved(vm.autocompleteResults);
                }else{
                    resolved(vm.autocompleteResults);
                }
                
            });
            vm.autocompleteResults = {
                results: []
            };
        })
    }

    async getAllMetadata() {
        // Code below is originally from forcecmd
        if (this.metadataObjects){
            return this.metadataObjects;
        }
        let metadataApi = sfConn.wsdl(apiVersion, "Metadata");
        let res = await sfConn.soap(metadataApi, "describeMetadata", {apiVersion});
        let availableMetadataObjects = res.metadataObjects
            .filter(metadataObject => metadataObject.xmlName != "InstalledPackage");
        // End of forcecmd code
        this.metadataObjects = availableMetadataObjects;
        for (let metadataObject of this.metadataObjects) {
            metadataObject.selected = true;
        }
        return availableMetadataObjects;
    }

   
    async getMetadata(xmlName){
        if (!this.metadataObjects){
            await this.getAllMetadata();
        }
        return this.metadataObjects.find(e=>{
            
            return e.xmlName==xmlName;
        })
    }

    async listMetadata(xmlName){
        let metadataObject = await this.getMetadata(xmlName);
        if (metadataObject.listMetadata){
            return metadataObject.listMetadata;
        }
        let folderMap = {};
        let metadataApi = sfConn.wsdl(apiVersion, "Metadata");
        let xmlNames = sfConn.asArray(metadataObject.childXmlNames).concat(metadataObject.xmlName);

        let x = xmlNames.map(e=>{
            if (metadataObject.inFolder == "true"){
                if (xmlName == "EmailTemplate") {
                    folderMap["EmailFolder"] = "EmailTemplate";
                    return "EmailFolder";
                } else {
                    folderMap[xmlName + "Folder"] = xmlName;
                    return xmlName + "Folder";
                }
            }
            return e;
        })

        let res = await Promise.all(this.groupByThree(this.flattenArray(x)).map(async xmlNames => {

            let item = await sfConn.soap(metadataApi, "listMetadata", {queries: xmlNames.map(xmlName => {return {type: xmlName}})});

            let someItems = this.asArray(item);


            let folders = someItems.filter(folder => folderMap[folder.type]);
            let nonFolders = someItems.filter(folder => !folderMap[folder.type]);
            let p = await Promise
              .all(this.groupByThree(folders).map(async folderGroup =>
                this.asArray(await sfConn.soap(metadataApi, "listMetadata", {queries: folderGroup.map(folder => ({type: folderMap[folder.type], folder: folder.fullName}))})
                )
              ));
            return this.flattenArray(p).concat(
              folders.map(folder => ({type: folderMap[folder.type], fullName: folder.fullName})),
              nonFolders,
              xmlNames.map(xmlName => ({type: xmlName, fullName: "*"}))
            );
          }));
        
        xmlNames = x;
        //let result = await sfConn.soap(metadataApi, "listMetadata", {queries: xmlNames.map(xmlName => ({type: xmlName}))});
        metadataObject.listMetadata = this.flattenArray(res) || [];
        return metadataObject.listMetadata;
    }

    flattenArray(x) {
        return [].concat(...x);
    }

    asArray(x) {
        if (!x) return [];
        if (x instanceof Array) return x;
        return [x];
    }

    groupByThree(list) {
        let groups = [];
        for (let element of list) {
          if (groups.length == 0 || groups[groups.length - 1].length == 3) {
            groups.push([]);
          }
          groups[groups.length - 1].push(element);
        }
        return groups;
      }

    async retrieveMetadata(res, selectedMetadataObjects, loogwait){
        let metadataApi = sfConn.wsdl(apiVersion, "Metadata");
        let folderMap = {};
        let x = selectedMetadataObjects
          .map(metadataObject => {
            let xmlNames = sfConn.asArray(metadataObject.childXmlNames).concat(metadataObject.xmlName);
            return xmlNames.map(xmlName => {
              if (metadataObject.inFolder == "true") {
                if (xmlName == "EmailTemplate") {
                  folderMap["EmailFolder"] = "EmailTemplate";
                  xmlName = "EmailFolder";
                } else {
                  folderMap[xmlName + "Folder"] = xmlName;
                  xmlName = xmlName + "Folder";
                }
              }
              return xmlName;
            });
          });

        let types = this.flattenArray(res);
        if (types.filter(x => x.type == "StandardValueSet").map(x => x.fullName).join(",") == "*") {
          // We are using an API version that supports the StandardValueSet type, but it didn't list its contents.
          // https://success.salesforce.com/ideaView?id=0873A000000cMdrQAE
          // Here we hardcode the supported values as of Winter 17 / API version 38.
          types = types.concat([
            "AccountContactMultiRoles", "AccountContactRole", "AccountOwnership", "AccountRating", "AccountType", "AddressCountryCode", "AddressStateCode", "AssetStatus", "CampaignMemberStatus", "CampaignStatus", "CampaignType", "CaseContactRole", "CaseOrigin", "CasePriority", "CaseReason", "CaseStatus", "CaseType", "ContactRole", "ContractContactRole", "ContractStatus", "EntitlementType", "EventSubject", "EventType", "FiscalYearPeriodName", "FiscalYearPeriodPrefix", "FiscalYearQuarterName", "FiscalYearQuarterPrefix", "IdeaCategory1", "IdeaMultiCategory", "IdeaStatus", "IdeaThemeStatus", "Industry", "InvoiceStatus", "LeadSource", "LeadStatus", "OpportunityCompetitor", "OpportunityStage", "OpportunityType", "OrderStatus1", "OrderType", "PartnerRole", "Product2Family", "QuestionOrigin1", "QuickTextCategory", "QuickTextChannel", "QuoteStatus", "SalesTeamRole", "Salutation", "ServiceContractApprovalStatus", "SocialPostClassification", "SocialPostEngagementLevel", "SocialPostReviewedStatus", "SolutionStatus", "TaskPriority", "TaskStatus", "TaskSubject", "TaskType", "WorkOrderLineItemStatus", "WorkOrderPriority", "WorkOrderStatus"
          ].map(x => ({type: "StandardValueSet", fullName: x})));
        }

        types = types.map(x => ({name: x.type, members: decodeURIComponent(x.fullName)}));
        let result = await sfConn.soap(metadataApi, "retrieve", {retrieveRequest: {apiVersion, unpackaged: {types, version: apiVersion}}})

        let longRes = ()=>{
            return new Promise((solved)=>{
                let tick = setInterval(async ()=>{
                    let res1 = await sfConn.soap(metadataApi, "checkRetrieveStatus", {id: result.id});
                    if (res1.done != 'false'){
                        clearInterval(tick)
                        solved(res1);
                        return;
                    }
                    if (loogwait){
                        loogwait({zipBin:null, downloadLink:'', statusLink:'',result:res1,success:false});
                    }
                }, 2000)
            })
        }

        let res1 = await longRes();

        let statusJson = JSON.stringify({
            fileProperties: sfConn.asArray(res1.fileProperties)
              .filter(fp => fp.id != "000000000000000AAA" || fp.fullName != "")
              .sort((fp1, fp2) => fp1.fileName < fp2.fileName ? -1 : fp1.fileName > fp2.fileName ? 1 : 0),
            messages: res1.messages
          }, null, "    ");

        let zipBin = Uint8Array.from(atob(res1.zipFile), c => c.charCodeAt(0));
        let downloadLink = URL.createObjectURL(new Blob([zipBin], {type: "application/zip"}));
        let statusLink = URL.createObjectURL(new Blob([statusJson], {type: "application/json"}));
        return {zipBin, downloadLink, statusLink,success:true}

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
