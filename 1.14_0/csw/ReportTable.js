
import {Tools} from "./Tools.js";
import {PopupMenu} from "./PopupMenu.js";
import {PopupRelationMenu} from "./PopupRelationMenu.js";
import {AutoComplete1} from "./AutoComplete1.js";

export class ReportTable{

    constructor(dateTree){
        this.tree = dateTree;
        this.showFields = [];
        this.showRelatedFields = [];
        this.records = [];
        this.allRecords = [];
        this.sobjectname='Report';
        this.reportObjectName = 'Order';
        this.sortField = {};
        this.message='';
        this.fieldCondition = {};
        this.recordCondition= {include:'',exclude:'',fields:{}}
        this.searcherPiler;
        this.metadateTree;
        this.currentShow;
        this.updatedSelect = {};
        this.updatedReferSelect = {};
        this.referSelected = [];
        this.fieldGroupBy = [];
        this.isActived = false;
    }

    active(){
        if (this.isActived){
            return;
        }
        this.isActived =  true;
        this.createHead(this.rootId);
    }

    render(){
        return `
            <div>${this.message || ''}</dov>
            <table id="reporttableid" class="table">
                <thead>
                    <tr class="row blue">
                        ${this.showFields.map(e=>{
                            return `<th class="cell field-${e}" tabindex="0">${e=='RowNumber'?'No':e}
                                <button class="actions-button" name="${e}">
                                    <svg class="actions-icon">
                                        <use xlink:href="symbols.svg#${this.sortField[e]?.asc?'arrowdown':'arrowup'}"></use>
                                    </svg>
                                </button>
                            </th>`
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.allRecords.map(r=>{
                        return `
                <tr class="row ${r.__type=='dummy'?'dummy-record':''}" title="">

                ${this.showFields.map(e=>{
                    let fieldspan = '__'+e+'_rowspan';
                    let spanCount = r[fieldspan];
                    let span = this.counRecord(spanCount);
                    if (span === 0){
                        return ''
                    }

                    let val = this.apexlogWapper(r, e) || this.value2string(r, e)||'';
                    val = this.dateFormat(val);
                    return `<td class="cell field-${e}" ${span?'rowspan="'+span+'"':''} tabindex="0" title="${this.value2string(r, e) || 'Empty'}">${val}</td>`
                }).join('')}
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    value2string(recored, properties, value){
        
        if (!recored){
            return '-';
        }
        if (properties.indexOf('.') == -1){
            if (value){
                recored[properties] = value;
            }
            let val = recored[properties];
            return (val === undefined || val === null) ? '' : val;
        }
        else{
            if (recored.__type == 'dummy'){
                //return '';
            }
            let paths = properties.split('.');
            let firstProp = paths.shift();
            if (!recored[firstProp]){
                recored[firstProp] = {};
            }
            return this.value2string(recored[firstProp], paths.join('.'), value);
        }
    }

    apexlogWapper(record, prop){
        if (record?.attributes?.type=='ApexLog' && prop == 'Id' ){
            return  `<span class="download-apexlog" style="color:blue" name="${record.Id}">${record.Id}</span>`;
        }
        return null;
    }


    dateFormat(time){
        if (time && typeof time ==='string'){
            if (time.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{4}/)){
                return this.tree.Tools.formatDate(new Date(Date.parse(time)), 'yyyy-MM-dd hh:dd:ss')
            }else{
                return time;
            }
        }else{
            return time;
        }
       
    }


    get sobjectDescribe(){
         let dataMap = this.tree.dataMap[this.sobjectname];
         return dataMap.sobjectDescribe;
    }

    setSobjectname(sobjectname){
    }

    setReportObjectName(sobjectname){
        this.reportObjectName = sobjectname;
    }

    setOffset(offset){
        this.offset = offset;
    }

    
    load(id){
        this.createMessagePopup('', 'message', true);
        this.tree.getApexlogByid(id).then(e=>{
            this.createMessagePopup(e.data, 'message');
        });
    }

     createMessagePopup(content , title, loading){
        let dialog = $('.report-searchresult [role="dialog"]');
        if (dialog.length != 0){
            $('.report-searchresult [role="dialog"] .slds-modal__content').html(`<pre>${content}</pre>`);
            if(loading){
                Tools.createProgress($('.slds-modal__content'));
            }
            return ;
        }
      
        $('.report-searchresult').append(`
        <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true"
            aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open slds-modal_small">
            <div class="slds-modal__container second-level-modal">
                <header class="slds-modal__header">
                    <h2 id="modal-heading-01" class="slds-modal__title slds-hyphenate">
                    ${title}</h2>
                        <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close"
                            >
                            <span class="slds-assistive-text">Close</span>
                        </button>
                </header>
                <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                    <pre>${content}</pre>
                </div>
            </div>
        </section>`);
        $('.report-searchresult').on('click', '[role="dialog"] .slds-modal__close', this.removeDialog);
        if(loading){
            Tools.createProgress($('.slds-modal__content'));
        }
    }

    async doUpdaate(soql){
        $('.report-searchresult .recordsnumber').text(this.totalSize||0);
        let htmlId = 'report-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            rootdata.innerHTML = 'loading data from '+this.sobjectname;
            if (!this.sobjectname){
                rootdata.innerHTML = 'Miss sobject name';
                console.log('No data to show 1');
                return;
            }

            await this.loadData(soql);

            this.updateNotLoad();
        }
    }

    updateNotLoad(){
        let htmlId = 'report-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
            this.showMessage(JSON.stringify(e.stack), 'error')
        }

        $('.report-searchresult .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
      
    }

    async queryMore(){
        let relationshipNames = this.sobjectDescribe.fields.filter(e=>e.relationshipName).map(e=>e.relationshipName);
        let allChecked = Tools.getAllChecked();
        let selected = Object.keys(allChecked).filter(element => {
            return element.indexOf(this.sobjectname+'.')==0&&allChecked[element] && element.indexOf('undefined')==-1;
        }).map(e=>{
            return e.replace(this.sobjectname+'.','')
        }).filter(e=>{
            let s = e.split('.');
            return s.length>1 && relationshipNames.indexOf(s[0]) != -1;
        });

        this.showRelatedFields = selected.map(e=>{
            return {name:e,label:e}
        });

        let result = await this.tree.getRecordsByFields(this.sobjectname, this.showFields, this.records.length,this.fieldCondition, selected);
        this.totalSize = result.totalSize + this.records.length;
        this.records.push(...result.results.records ||[]);
        this.allRecords.push(...(result.results.records||[]));

        let htmlId = 'report-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
        }

        $('#report-searchresult .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize!=0 &&this.totalSize %2000 == 0){
            $('#sobjectsearchoffset').show();
        }else{
            $('#sobjectsearchoffset').hide();
        }
    }

    async loadData(soql){
        let result = await this.tree.getRecordsBySoql(soql);
        this.message = result.title;
        this.lastData = result.data || {records:[], totalSize:0};
        if (this.message){
            this.showMessage(this.message, 'error');
        }else{
            this.showMessage('');
        }
        await this.processData(this.lastData);

    }

    hasNext(){
        return this.lastData?.done == 'false' || this.lastData?.done === false;
    }


    async nextPgae(){
        if(this.lastData && this.lastData.nextRecordsUrl){
           let result =  await this.tree.loadNextRecords(this.lastData, false);
           this.lastData = result;
           await this.processData(result);
           this.updateNotLoad();
        }
    }

    async processData(result){
        this.totalSize = result.totalSize;
        this.records = [];
        this.allRecords = [];

        for (let item of result.records){
            let arry = [];
            let haveSonRecord = false;
            for (let key in item){
                if (item[key] && typeof item[key] == 'object' && item[key].records){
                    for(let r of item[key].records){
                        let newRec = {...item};
                        let keyRec = {...r};
                        newRec[key] = keyRec;
                        this.records.push(newRec);
                    }
                    haveSonRecord = true;
                }
            }
            if (!haveSonRecord){
                this.records.push({...item});
            }
            
        }
        //this.records = result.results ||[];
        this.allRecords.push(...this.records);

        // let fieldSet = new Set();
        // for (let item of this.allRecords){
        //     let entries = Object.entries(item);
        //     for (let entry of entries){
        //         let key  = entry[0];
        //         let value  = entry[1];
        //         if (value != null && value != undefined && typeof value !== 'object'){
        //             fieldSet.add(key);
        //         }
        //     }
        // }

        this.updateToGroupBy();
        this.showFields = ['RowNumber',...this.referSelected];
        if (this.records.length == 0){
            this.message = 'No data'
        }


        
        let sortGroup = [...this.referSelected].reverse().concat(['RowNumber']);
        this.showFields = this.showFields.toSorted((o1, o2)=>{
            let index1 = sortGroup.indexOf(o1);
            let index2 = sortGroup.indexOf(o2);

            return index2 - index1;
        })

        let k = 1;
        for (let i=0;i<this.allRecords.length;i++){
            if (this.allRecords[i].__type=='dummy'){
                continue;
            }
            this.allRecords[i].RowNumber = k++;
        }
        //this.totalReocrds((this.records||[]).length);
    }

    updateToGroupBy(){
        this.allRecords = this.allRecords.toSorted((o1, o2)=>{
            for (let field of this.fieldGroupBy){
                let v1 = this.value2string(o1, field);
                let v2 = this.value2string(o2, field);
                if (v1 && v2){
                    let ret = String(v1).localeCompare(String(v2));
                    if (ret != 0){
                        return ret;
                    }
                }
                if (v1){
                    return 1;
                }
                if (v2){
                    return -1;
                }
            }
            return 0;
        })
        let lenght = this.allRecords.length;
        for(let item of this.fieldGroupBy){
            this.insertGroupRecords(item, this.fieldGroupBy.indexOf(item) == 0);
        }
    }

    insertGroupRecords(field, addDummy){
        let length = this.allRecords.length;
        if(length==0){
            return this.allRecords;
        }
        let lastValue = this.value2string(this.allRecords[0], field);
        let newRecoeds = [this.allRecords[0]];
        let fieldspan = '__'+field+'_rowspan';
        let count = {start: this.allRecords[0], end: null};
        
        let lastRecord = this.allRecords[0];
        for (let i = 1;i<length;i++){
            let record = this.allRecords[i];
            
            if (record.__type=='dummy'){
                newRecoeds.push(record);
                if(i == length - 1){
                    count.end = this.allRecords[i-1];
                    lastRecord[fieldspan] = count;
                }else{
                    let lastNotDummyItem = null;
                    for (let j = i; j >= 0;j--){
                        if (this.allRecords[j].__type!='dummy'){
                            lastNotDummyItem = this.allRecords[j];
                            break;
                        }
                    }

                    let nextNotDummyItem = null;
                    for (let k = i; k <length;k++){
                        if (this.allRecords[k].__type!='dummy'){
                            nextNotDummyItem = this.allRecords[k];
                            break;
                        }
                    }
                    count.end = lastNotDummyItem;
                    lastRecord[fieldspan] = count;
                    count = {start: nextNotDummyItem, end: null};
                    lastRecord = nextNotDummyItem;
                }

                continue;
            }
            
            record[fieldspan] = 0;
            let fieldValue = this.value2string(record, field);

            if (fieldValue !== lastValue){
                let r = { __type:'dummy'};
                if (addDummy){
                    newRecoeds.push(r);
                }
                
                count.end = this.allRecords[i-1];
                lastRecord[fieldspan] = count;
                this.value2string(r, field, lastValue + ' ('+this.counRecord(count)+')');
                count = {start: record, end: null};

                lastValue = fieldValue;
                newRecoeds.push(record);
                lastRecord = record;

            }else{
                newRecoeds.push(record);
            }
            if(i == length - 1){
                
                count.end = record;
                lastRecord[fieldspan] = count;
                let r = { __type:'dummy'};
                this.value2string(r, field, lastValue + ' ('+this.counRecord(count)+')');
                if (addDummy){
                    newRecoeds.push(r);
                }
            }
        }
        this.allRecords = newRecoeds;
    }

    counRecord(count){
        if (count === 0){
            return 0;
        }
        if (!count || !count.end || !count.start){
            return null;
        }
        return this.allRecords.indexOf(count.end) - this.allRecords.indexOf(count.start) + 1;
    }

    addSearchFiler(container){
        let allSelected = [];
        new PopupMenu({container,
            open:()=>{
                
                let allChecked = Tools.getAllChecked();
                let selected = Object.keys(allChecked).filter(element => {
                    return element.indexOf(this.sobjectDescribe.name+'.')==0&&allChecked[element];
                }).map(e=>{
                    return e.replace(this.sobjectDescribe.name+'.','')
                });
                let allItems =this.sobjectDescribe.fields.sort((a, b)=>{
                    return (a.name||'').localeCompare(b.name||'');
                }).filter(e=>{
                    return selected.indexOf(e.name) != -1
                }).map(e=>{
                    return {value:e.name, label:e.label}
                });

                return {
                    allItems:allItems,
                    selected:allSelected
                }
            },
            close:(checked, unchecked)=>{
                allSelected.push(...checked);
                checked = checked.filter(e=>{
                    return unchecked.indexOf(e) != -1;
                })
                //this.doUpdaate();
                this.searcherPiler.items = allSelected.map(e=>{
                    return {value:'', name:e, label:e};
                })
            }});
    }

    addFieldFilter(container){
        let sobjectname = this.sobjectname;
        
        new PopupMenu({container,
            open:()=>{
                let allItems =this.sobjectDescribe.fields.sort((a, b)=>{
                    return (a.name||'').localeCompare(b.name||'');
                }).map(e=>{
                    return {value:this.sobjectDescribe.name+'.'+e.name, label:e.name}
                });

                let disabledItems = this.sobjectDescribe.fields.filter(e=>{
                    return e.name=='Id'|| e.nameField
                }).map(e=>{
                    return this.sobjectDescribe.name+'.'+e.name
                });
                
                let allChecked = Tools.getAllChecked();
                let selected = Object.keys(allChecked).filter(element => {
                    return element.indexOf(sobjectname+'.')==0&&allChecked[element];
                });
                return {
                    allItems:allItems,
                    disabledItems,
                    selected
                }
            },
            close:(checked, unchecked)=>{

                for(let attr of checked){
                    Tools.storageFieldCheck(this.sobjectname, attr.replace(this.sobjectDescribe.name+'.',''), true); 
                }
                for(let attr of unchecked){
                    Tools.storageFieldCheck(this.sobjectname, attr.replace(this.sobjectDescribe.name+'.',''), false);
                }

                this.doUpdaate();
            }});
    }

    addRelationFieldFilter(container){
        
        this.popRelaMenu = new PopupRelationMenu({container,
            open:()=>{
                if (!this.sobjectname || !this.sobjectDescribe){
                    return {allItems:[]}
                }
                let allItems =this.sobjectDescribe.fields.sort((a, b)=>{
                    return (a.name||'').localeCompare(b.name||'');
                }).map(e=>{
                    return {value:this.sobjectDescribe.name+'.'+e.name, label:e.name}
                });

                let disabledItems = this.sobjectDescribe.fields.filter(e=>{
                    return e.name=='Id'|| e.nameField
                }).map(e=>{
                    return this.sobjectDescribe.name+'.'+e.name
                });
                
                let allChecked = Tools.getAllChecked();
                let selected = Object.keys(allChecked).filter(element => {
                    return element.indexOf(this.sobjectname+'.')==0&&allChecked[element];
                });
                return {
                    allItems:allItems,
                    disabledItems,
                    selected
                }
            },
            close:(checked, unchecked)=>{
                if (!this.sobjectname || this.sobjectDescribe){
                    return;
                }
                for(let attr of checked){
                    Tools.storageFieldCheck(this.sobjectname, attr.replace(this.sobjectDescribe.name+'.',''), true); 
                }
                for(let attr of unchecked){
                    Tools.storageFieldCheck(this.sobjectname, attr.replace(this.sobjectDescribe.name+'.',''), false);
                }

                this.doUpdaate();
            },
            sobject:this.sobjectname,
            tree:this.tree});
    }

    filterRecords(){
        let searchKey = this.recordCondition.include.trim();
        let exsearchKey = this.recordCondition.exclude.trim();
        this.records.length = 0;
        for (let record of this.allRecords){
            let isExclude = false;
            let isInlcude = false;
            let isFieldInclude = true;
            let isFieldExclude = false;
            for (let k in record){
                let v = record[k];
                if (v){
                    if (exsearchKey && v.toString().toLocaleLowerCase().indexOf(exsearchKey.toLocaleLowerCase()) != -1){
                        isExclude = true;
                        break;
                    }

                    if (this.recordCondition.fields[k]){
                        let f = this.recordCondition.fields[k];
                        if (f.exclude && v.toString().toLocaleLowerCase().indexOf(f.exclude.toLocaleLowerCase()) != -1){
                            isFieldExclude = true;
                            break;
                        }
                        if (f.include && v.toString().toLocaleLowerCase().indexOf(f.include.toLocaleLowerCase()) == -1){
                            isFieldInclude = false;
                        }
                    }

                    if (!searchKey || v.toString().toLocaleLowerCase().indexOf(searchKey.toLocaleLowerCase()) != -1){
                        isInlcude = true;
                    }
                }
            }

            if (!isExclude && isInlcude && !isFieldExclude && isFieldInclude){
                this.records.push(record);
            }

        }
        this.updateNotLoad();
    }

    sort(fieldName){
        this.sortField[fieldName] = this.sortField[fieldName]||{}
        this.sortField[fieldName].asc = !this.sortField[fieldName]?.asc;

        this.records = this.records.sort((a, b)=>{
            let v1 = a[fieldName];
            let v2 = b[fieldName];
            if (v1 == null && v2==null){
                return 0;
            }
            if (!v1 || !v1.toString){
                return 1;
            } else if (!v2 || !v2.toString){
                return -1;
            }
            if (v1.toString && v2.toString){
                return v1.toString().localeCompare(b[fieldName].toString());
            }
        })
        if (!this.sortField[fieldName].asc){
            this.records.reverse();
        }

        this.updateNotLoad();
    }

    createHead(rootId){
        this.rootId = rootId;
        if (!this.isActived ){
            return;
        }
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <p>
            Object Search:<br/>
            <input class="search feedback-input no-border" id="report-sobjectsearch2" disabled type="input" value="Report" autocomplete="off" style="width:70%"></input>
            <input class="search feedback-input" id="report-sobjectsearch" type="input" value="Order" autocomplete="off" style="width:70%"></input>
            <button class="tablinks tabitem-btn" name="Reports" id="report-refreshSObjectReports">Reports</button>
            <button class="tablinks tabitem-btn" name="SOQL" id="report-refreshSObjectSoql">SOQL</button>
            <button class="tablinks tabitem-btn" name="XML" id="report-refreshSObjectXML">XML</button>
            <button class="tablinks tabitem-btn" name="Result" id="report-refreshSObjectSearch">Query</button>
            
        </p>
        <div class="report-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="report-notificationmessage"></div>

            <div class="report-body">
                
                <div class="left-panel" id="object-field-tree">
                    <button class="tablinks" name="load-tree">Open</button>
                    <button class="tablinks" name="load-show-name">Show Name</button>
                    <button class="tablinks" name="load-show-label">Show Label</button>
                    <button class="tablinks" name="load-show-save">Save</button>
                    <button class="tablinks" name="load-show-saveas">Save As</button>
                    <button class="tablinks" name="load-show-recoreds">Records</button>
                    <button class="tablinks" name="load-show-groupby">Group By</button>
                    <button class="tablinks" name="load-show-next">Next</button>
                    <button class="tablinks" name="load-show-reset">Reset</button>
                    <div>
                        <input class="search feedback-input hide"  type="input" value="" autocomplete="off" ></input>
                        <div class="search-box">
                            <input type="search" placeholder="Search here..." id="report-fieldearch"/>
                            <button type="submit" class="search-btn"><i class="fa fa-search"></i></button>
                        </div>
                    </div>
                    <div id="object-field-tree-content"></div>
                    <div id="object-field-tree-groupby"></div>
                </div>
                <div class="sibar"></div>
                <div class="right-panel">
                    <div class="objsearchresult tabitem Reports"></div>
                    <div class="report-view-soql tabitem SOQL">
                        <button class="tablinks" id="report-btn-reset">Reset</button>
                        <button class="tablinks" id="report-btn-format">Format</button><br/>
                        <textarea contenteditable="true" name="" id="report-soql" style="height: 428px;font-size: large;"></textarea>
                    </div>
                    <div class="report-view-xml tabitem XML">
                        <h2 id="report-xml-filename"></h2>
                        <div id="report-xml"></div>
                    </div>
                    <div class="report-view-result tabitem Result">
                        <div id="report-showallsobjectdatatable"></div>
                    </div>
                </div>
            </div>
            
            
        </div>

        <div class="modal modal-report-save main-style" data-modal>
        
            <div class="modal__content">
                <p class="is-light has-extra-margin-bottom">Message from <a href="mailto:dan@internet.com">dan@internet.com</a></p>
                <input class="search feedback-input" id="report-new-report-name" type="input" value="New Report Name" autocomplete="off" style="width:100%"></input>
            </div>
            <!-- /.modal__content -->

            <div class="modal__footer modal__footer--2-col">
                <a href="#" class="modal__button" data-text="Cancel" data-modal-close></a>
                <a href="#" class="modal__button" data-text="Reply" data-modal-close></a>
            </div>
            <!-- /.modal__footer -->

        </div>

        <div class="modal modal-report-select main-style" data-modal>
            <div class="modal__content">
                <p class="is-light has-extra-margin-bottom">Report Select</p>
                <div class="rado-container">
                    <div class="option">
                        <input type="radio" name="card" id="silver" value="silver">
                        <label for="silver" aria-label="Silver">
                            <span></span>
                            Default
                            <div class="card card--white card--sm">
                                <div class="card__chip"></div>
                                <div class="card__content">
                                <div class="card__text">
                                    <div class="text__row">
                                    <div class="text__loader"></div>
                                    <div class="text__loader"></div>
                                    </div>
                                    <div class="text__row">
                                    <div class="text__loader"></div>
                                    <div class="text__loader"></div>
                                    </div>
                                </div>
                                <div class="card__symbol">
                                    <span></span>
                                    <span></span>
                                </div>
                                </div>
                            </div>
                            </label>
                    </div>
            </div>
            <!-- /.modal__content -->

            <div class="modal__footer modal__footer--2-col">
                <a href="#" class="modal__button" data-text="Cancel" data-modal-close></a>
                <a href="#" class="modal__button" data-text="Reply" data-modal-close></a>
            </div>
            <!-- /.modal__footer -->

        </div>
        <!-- /.modal -->
        `
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
            this.initHeadData();
            this.createGroupByPanel();
    }

    createGroupByPanel(){
        
       let content = this.referSelected.map(e=>{
            return `
            <div class="checkbox-wrapper" name="${e}" draggable="true" data-effect="copy" data-drop="copy">
                <input id="${this.tree.getUuid()}" name="${e}" type="checkbox" ${this.fieldGroupBy.indexOf(e)==-1?'':'checked'}>
                <label class="terms-label" for="terms-checkbox-37">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 200 200" class="checkbox-svg">
                    <mask fill="white" id="path-1-inside-1_476_5-37">
                    <rect height="200" width="200"></rect>
                    </mask>
                    <rect mask="url(#path-1-inside-1_476_5-37)" stroke-width="40" class="checkbox-box" height="200" width="200"></rect>
                    <path stroke-width="15" d="M52 111.018L76.9867 136L149 64" class="checkbox-tick"></path>
                </svg>
                <span class="label-text">${e}</span>
                </label>
          </div>
          `
       })

       content.push(`<div class="checkbox-wrapper empty-check" name="rabush"  data-drop="delete">
       <label class="terms-label" for="terms-checkbox-37">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 200 200" class="checkbox-svg">
           <mask fill="white" id="path-1-inside-1_476_5-37">
             <rect height="200" width="200"></rect>
           </mask>
           <rect mask="url(#path-1-inside-1_476_5-37)" stroke-width="40" class="checkbox-box" height="200" width="200"></rect>
           <path stroke-width="15" d="M52 111.018L76.9867 136L149 64" class="checkbox-tick"></path>
         </svg>
         <span class="label-text">Waste Recycling Station</span>
       </label>
     </div> 
     `);
        $('#object-field-tree-groupby').html(`<div class="drag-container">${content.join('')}</div>` +  + this.createConditionPanel());

      $('.report-condition-input').val(this.referConditions.join('\n'));
    }

    createConditionPanel(){
       return `<textarea class="report-condition-input feedback-input" value="${this.referConditions.join('\n')}"></textarea>`
    }

    createNavigationTree(container, sobjectName, attr, currentPath){
        let ul = container.children('ul');
        if (ul.length == 0){
            container.append(`<ul class="open" name="${sobjectName}" relationship="${attr||''}"></ul>`)
        }
        container.attr('name', sobjectName);
        if (ul.is('.close')){
            ul.removeClass('close');
            ul.addClass('open');
            return;
        }
        if (currentPath?.length){
            currentPath[currentPath.length - 1] = attr;
        }
        this.updateItemContainer(container.children('ul'), sobjectName, currentPath);
    }

    setReportObjectName(sobjectname){
        sobjectname = this.tree.allSObjectApi.map(e=>e.global.name).find(e => e.toLocaleLowerCase() == sobjectname.toLocaleLowerCase());
        this.reportObjectName = sobjectname;
        
        this.createNavigationTree($('.report-searchresult #object-field-tree-content'), sobjectname);
    }

    async updateItemContainer(container, sobjectName, currentPath){
        this.disabledItems = [];
        this.selected = this.selected || [];
        currentPath = currentPath || [];

        let allItems = [];
        allItems.push(... await this.getAllItems(sobjectName))
        allItems.sort((a, b) =>{
            return a.label.toLocaleLowerCase().localeCompare(b.label.toLocaleLowerCase());
        })
        let prefix = currentPath.join('.');
        this.allItems = allItems;
        let labelAttr = this.showName ? 'name' :'label';

        let fieldItems = allItems.map(t=>{
            let ischeck = !!this.updatedReferSelect[prefix?prefix+'.'+t.name:t.name];
            let isDisabled = this.disabledItems.indexOf(t.name)>-1;
            let isReference = t.type=="reference"&&t.referenceTo&&t.referenceTo.length==1;
            let refererenceLink = isReference?`<a href="javascript:void;"><span r="${t.relationshipName}" link-to="${t.referenceTo}">view related fields...</span></a>`:'';
            return `<li class="pop-menu-item" name="${t.name}" title="${t.name}"><input type="checkbox"  ${ischeck?'checked':''} ${isDisabled?'disabled':''}></input><span class="item-name" name="${t.name}" label="${t.label}">${t[labelAttr]}</span> ${refererenceLink}</li>`;
        });

        let allChildrenItems =  await this.getAllChildrenItems(sobjectName);

        let childrenUIItems = allChildrenItems.map(t=>{
            let ischeck = !!this.updatedReferSelect[prefix?prefix+'.'+t.relationshipName:t.relationshipName];
            let refererenceLink = `<a href="javascript:void;"><span r="${t.relationshipName}" link-to="${t.childSObject}">view refer fields...</span></a>`;
            return `<li class="pop-menu-item refer" name="${t.field}" title="${t.field}">
                        <input type="checkbox"  ${ischeck?'checked':''}></input>
                        <span class="item-name" name="${t.field}" label="${t.field}">${t.relationshipName}</span> ${refererenceLink}
                  </li>`;
        });

        $(container).html(fieldItems.concat(childrenUIItems).join(''))
   }

   updatePaths(){

   }

   async getAllItems(sobjectname){
        let sobjectDescibe = await this.getDescribeSobject(sobjectname);
        return (sobjectDescibe?.fields||[]).toSorted((a, b)=>{
            return a.label.toLocaleLowerCase().localeCompare(b.label.toLocaleLowerCase());
        });
    }

    async getAllChildrenItems(sobjectname){
        let sobjectDescibe = await this.getDescribeSobject(sobjectname);
        return (sobjectDescibe?.childRelationships||[]).filter(e=>{
            return e.relationshipName;
        }).toSorted((a, b)=>{
            return a.relationshipName.toLocaleLowerCase().localeCompare(b.relationshipName.toLocaleLowerCase());
        });
    }

    async getDescribeSobject(sobjectname){
        await this.tree.getDescribeSobject(sobjectname);
        let dataMap = this.tree.dataMap[sobjectname] ||{};
        return dataMap.sobjectDescribe;
    }
    

    totalReocrds(qty){
        $('.report-searchresult .recordsnumber').text(qty);
    }

    turnOn(target){
        let tabName = $(target).attr('name');
        if (!$(target).is('.tabitem-btn') || !tabName){
            return;
        }
        $('.report-searchresult .tabitem').hide();
        $('.report-searchresult .tabitem').each((index, ele)=>{
            if ($(ele).is('.'+tabName)){
                $(ele).show();
            }
        })
    }

    showMessage(msg, type){
        $('#report-notificationmessage').html(msg);
        if (type == 'loading'){
            
            $('#report-notificationmessage').html(`<span style="color:blue">${msg}<span/><p/>
            ${Tools.createSpinner('LOADING DOTS', 'large')}`);
        }else if (type == 'error'){
            $('#report-notificationmessage').html(`<span style="color:red">${msg}<span/>`);
        }else if (type == 'info' || !type){
            $('#report-notificationmessage').html(`<span style="color:blue">${msg}<span/>`);
        }else if (type == 'warn'){
            $('#report-notificationmessage').html(`<span style="color:yellow">${msg}<span/>`);
        }
    }

    initHeadData(){
        this.updateReportCheck('default');
        $('#object-field-tree-content').removeClass('hide');
        $('#object-field-tree-groupby').addClass('hide');
    }

    updateReportCheck(reprotName , defaultConfig, isLocalStorage=true){
        let defaultStorage = null;
        if (isLocalStorage){
            let storage = localStorage.getItem('report.checkboxSelected');
            let storageArray = JSON.parse(storage || '[]');
            defaultStorage = storageArray.find(e=>{
                return e.lastSelected;
            })
            defaultStorage = defaultStorage || storageArray.find(e=>{
                return e.name == reprotName;
            })
            defaultStorage = defaultStorage ||  {name : reprotName, check: defaultConfig || {}};
        }else{
            defaultStorage = {check: defaultConfig};
        }

        let checkboxSelectedobj = defaultStorage.check;
        this.updatedSelect = checkboxSelectedobj.fields || {};
        this.updatedReferSelect = checkboxSelectedobj.refers || {};
        this.fieldGroupBy = checkboxSelectedobj.groupby || [];
        this.referSelected = checkboxSelectedobj.referSelected || [];
        this.referConditions = checkboxSelectedobj.referConditions || [];
        $('#report-soql').val(checkboxSelectedobj.sql||'');

        this.reportObjectName = checkboxSelectedobj.sobject || 'Order';
        $('#report-sobjectsearch').val(this.reportObjectName);
        this.setReportObjectName(this.reportObjectName);
    }

    initObjectAllDataHead(){
        this.initModalEvent();
        $('.report-searchresult .tabitem').hide();
        $('.report-searchresult .Result').show();
        $('#report-sobjectsearch2').on('change', (event)=>{
            let tableName = $(event.target).val();
            this.setSobjectname(tableName);
        })

        $('#report-sobjectsearch').on('change', (event)=>{
            let tableName = $(event.target).val();
            if (!tableName){
                tableName = this.reportObjectName;
            }
            if (this.reportObjectName != tableName && tableName){
                this.reportObjectName = tableName;
                let newCheckboxSelected = {
                    fields:{},
                    refers: {},
                    groupby:[],
                    referSelected:[],
                    referConditions:[],
                    sql:'',
                    sobject:tableName||'Order'
                }
                this.updateReportCheck('New Report '+this.reportObjectName + ' '+Math.floor(Math.random() * 1000), newCheckboxSelected, false);
                //this.setReportObjectName(tableName);
            }

        })

        

        $('#'+this.rootId + ' .tablinks').on('click', (event)=>{
            this.turnOn(event.target);
        })

        $('#report-btn-format').on('click', (event)=>{
            let soql = $('#report-soql').val();
            $('#report-soql').val(this.formatSQL(soql));
        })

        $('#report-btn-reset').on('click', (event)=>{
            this.fieldCondition = {};
            this.showMessage('generate SQL...', 'loading');
            this.reportObj = this.parseXML(this.getReportContent());
            this.generateSQL().catch(e=>{
                this.showMessage(e.message, 'error');
            }).then(e=>{
                if (!e){
                    return;
                }
                //$('#report-soql').html(this.metadateTree.wapper(e, 'a.sql'));
                $('#report-soql').val(this.formatSQL(e));
                this.showMessage('');
            });
        })

        $('.report-searchresult [name="load-tree"]').on('click', async (event)=>{
            let storage = localStorage.getItem('report.checkboxSelected');
            let storageArray = JSON.parse(storage || '[]');
            let newCheckboxSelected = {
                fields:{},
                refers: {},
                groupby:[],
                referSelected:[],
                referConditions:[],
                sql:'',
                sobject:this.reportObjectName||'Order'
            }

            if (this.reportObjectName){
                storageArray.push({name:'New Report '+this.reportObjectName + ' '+Math.floor(Math.random() * 1000), check:newCheckboxSelected});
            }
            for (let item of storageArray){
                item.id = item.id || this.tree.getUuid();
            }
            let selectItem = await this.openReportSelectModal(storageArray);

            if (!selectItem){
                return;
            }
            let selectedItem = storageArray.find(e =>e.id == selectItem.id);
            selectedItem.name = selectItem.name;
            let lastOne = storageArray.pop();
            if (lastOne.id == selectItem.id){
                storageArray.push(lastOne);
            }
            for (let item of storageArray){
                item.lastSelected = item.id == selectItem.id;
            }
            localStorage.setItem('report.checkboxSelected', JSON.stringify(storageArray));

            this.reportItemName = selectedItem.check.sobject || 'Order';
            this.reportItemId = selectedItem.id;
            this.updateReportCheck(selectedItem.name || 'default', newCheckboxSelected);
            this.setReportObjectName(selectedItem.check.sobject);
            this.createNavigationTree($('.report-searchresult #object-field-tree-content'), selectedItem.check.sobject);
            this.createGroupByPanel();
        })

        $('.report-searchresult [name="load-show-name"]').on('click', (event)=>{
            this.showName = true;
            $('li span.item-name').each((i, el)=>{
                $(el).text($(el).attr('name'));
            })
        })

        $('.report-searchresult [name="load-show-label"]').on('click', (event)=>{
            this.showName = false;
            $('li span.item-name').each((i, el)=>{
                $(el).text($(el).attr('label'));
            })
        })

        $('.report-searchresult [name="load-show-save"]').on('click', (event)=>{
            this.handleSave(event);
        })

        $('.report-searchresult [name="load-show-saveas"]').on('click', async (event)=>{
            this.handleSaveas(event);
        })

        

        $('.report-searchresult [name="load-show-recoreds"]').on('click', (event)=>{
            let checkboxSelected = {
                fields:this.updatedSelect,
                refers: this.updatedReferSelect,
                groupby:this.fieldGroupBy,
                referSelected:this.referSelected,
                referConditions:this.referConditions,
                sobject:this.reportObjectName
                
            }
            this.loadRecoeds(checkboxSelected);
        })

        $('.report-searchresult [name="load-show-groupby"]').on('click', (event)=>{
            if ($('#object-field-tree-groupby').is('.hide')){
                //$('#object-field-tree-content').removeClass('hide');
                $('#object-field-tree-groupby').removeClass('hide');
                this.createGroupByPanel();
            }else{
                //$('#object-field-tree-content').addClass('hide');
                $('#object-field-tree-groupby').addClass('hide');
            }
        })

        $('.report-searchresult [name="load-show-next"]').on('click', (event)=>{
            if (this.hasNext()){
                this.nextPgae();
            }else{
                alert('No next');
            }
        })

        $('.report-searchresult [name="load-show-reset"]').on('click', (event)=>{
            this.updatedSelect = {Id:true};
            this.updatedReferSelect = {Id:true};
            this.fieldGroupBy = [];
            this.referSelected = ['Id'];
            this.referConditions = [];
            this.createGroupByPanel();
            $('.report-condition-input').val();
            this.createNavigationTree($('.report-searchresult #object-field-tree-content'), this.reportObjectName);
            this.createGroupByPanel();

            let checkboxSelected = {
                fields:this.updatedSelect,
                refers: {},
                groupby:[],
                referSelected:this.referSelected,
                referConditions:[],
                sobject:this.reportObjectName
                
            }
            this.loadRecoeds(checkboxSelected);
        })

        

        $('.report-searchresult').on('change', '.report-condition-input', (event)=>{
            let val = $(event.target).val();
            let conditions = val.split('\n');

            this.referConditions = conditions.filter(e=>e);
        })

        $('.report-searchresult').on('click', 'span.download-apexlog', (event)=>{
            let logId = $(event.currentTarget).attr('name');
            this.load(logId);
        })

        
        

        $('#report-refreshSObjectReports').on('click', (event)=>{
            this.totalReocrds((this.metadataDetails||[]).length);
        })

        $('#report-refreshSObjectSearch').on('click', (event)=>{
            this.totalReocrds((this.records||[]).length);0
        })


        $('#report-refreshSObjectXML').on('click', (event)=>{
            $('#report-xml').html('<div>'+this.metadateTree.wapper(this.getReportContent(),'report.xml')+'<div/>');
        })

        $('#report-refreshSObjectSearch').on('click', (event)=>{
            let soql = $('#report-soql').val();
            this.doUpdaate(soql);
        })

        $('#report-objectsearchinput').on('keypress', (event)=>{
            if (event.keyCode==13){
                let searchKey = $(event.target).val();
                this.recordCondition.include = searchKey;
                this.filterRecords();
            }
        })

        this.reportObj = this.parseXML(this.getReportContent());

        this.showMessage('list Reports...', 'loading');
        
        this.listReports().then(metadataDetails=>{
            this.metadataDetails = metadataDetails.filter(e => e.type == 'Report'&&e.fileName);
            this.rootFolder = this.createReportFolder(this.metadataDetails);
            this.totalReocrds(this.metadataDetails.length);
            console.log('listMetadata metadata', this.metadataDetails);
            $('.report-searchresult .objsearchresult').html('<ul>' + this.createFolderTree(this.rootFolder) + '</ul>')

            this.showMessage('');
        })

        $('.report-searchresult .objsearchresult').on('click', 'button[name]', async (event)=>{

            event.stopPropagation();
            this.showMessage('loading...', 'loading');

            let isFoderLi = $(event.target).parents('li').attr('folder');
            if (isFoderLi == 'true'){
                this.clickFolderHandler(event);
            }else{
                await this.clickFileHandler(event);
            }
            
        })

        $('#object-field-tree-groupby').on('click', '.checkbox-wrapper', (event)=>{
            if ($(event.target).is('input')){
                return;
            }
            if (!$(event.target).is('rect')){
                return;
            }
            $(event.currentTarget).find('input').click();
            let name = $(event.currentTarget).attr('name');
            let isCheck = $(event.currentTarget).find('input').is(':checked');
            if (isCheck){
                this.fieldGroupBy.push(name);
            }else{
                let index = this.fieldGroupBy.indexOf(name);
                if (index != -1){
                    this.fieldGroupBy.splice(index, 1);
                }
            }

            this.referSelected.sort((e1, e2)=>{
                let i1 = this.fieldGroupBy.indexOf(e1);
                let i2 = this.fieldGroupBy.indexOf(e2);
                
                return i1 > -1? (i2 > -1? i1 - i2 : i2 - i1): (i2 >-1 ? i2 : i2 -i1)
            })

            this.createGroupByPanel()
        })

        $('#object-field-tree').on('click','span[link-to]',(event)=>{
            
            let linkTo = $(event.currentTarget).attr('link-to');
            let level = $(event.currentTarget).attr('level');
            let attr = $(event.currentTarget).attr('r');
            let container = $(event.currentTarget).parents('li').first();
            if (container.children('ul').is('.open')){
                container.children('ul').addClass('close');
                container.children('ul').removeClass('open');
                return;
            }
            this.currentPaths = this.getPathsByNode(container);
            
            this.updatePaths();
            this.createNavigationTree(container, linkTo, attr, this.currentPaths);
        })
      
        $('#object-field-tree').on('click','li>input[type="checkbox"]',(event)=>{
            let container = $(event.currentTarget).parents('li').first();
            this.currentPaths = this.getPathsByNode(container);
            let path = this.currentPaths.join('.');
            if ($(event.currentTarget).is(':checked')){
                if (container.is('.refer')){
                    this.referSelected.push(path);
                    this.updatedReferSelect[path] = true;
                }else{
                    this.referSelected.push(path);
                    this.updatedReferSelect[path] = true;
                }
            }else{
                if (container.is('.refer')){
                    let index = this.referSelected.indexOf(path);
                    if (index != -1){
                        this.referSelected.splice(index, 1);
                    }
                    this.updatedReferSelect[path]=false;
                }else{
                    let index = this.referSelected.indexOf(path);
                    if (index != -1){
                        this.referSelected.splice(index, 1);
                    }
                    this.updatedReferSelect[path]=false;
                }
            }
            this.createGroupByPanel();
        })

        $('#report-fieldearch').on('change', (event)=>{
            let searchkey = $(event.currentTarget).val();
            this.handleTreeSearch(searchkey);
        })

        $('#report-fieldearch').on('keyup', (event)=>{
            let searchkey = $(event.currentTarget).val();
            this.handleTreeSearch(searchkey);
        })

        $('.report-searchresult .sibar').on('dblclick', ()=>{
            if ($('.report-searchresult .left-panel').is('.hide-left')){
                $('.report-searchresult .left-panel').removeClass('hide-left');
            }else{
                $('.report-searchresult .left-panel').addClass('hide-left');
            }
            
        })

        Tools.setAutoComplete('report-sobjectsearch', this.tree);

        this.addDraggingEvent();
    }

    addDraggingEvent(){
        let getDropNode = (target)=>{
            while(target){
                if (target.dataset?.drop){
                    return target;
                }
                target = target.parentNode;
            }
            return null;
        }

        let effectAllowed = '';

        let sourceNode = null;
        let getDragparent = ()=>{
            return $('#object-field-tree-groupby .drag-container')[0];
        }

        $('#object-field-tree-groupby').on('dragstart','.drag-container',(e)=>{
            setTimeout(()=>{
                $(e.target).addClass('moving');
            },0);
            sourceNode = getDropNode(e.target);
        })

        $('#object-field-tree-groupby').on('dragenter','.drag-container',(e)=>{
            let targetNode = getDropNode(e.target);
            if(!sourceNode || !targetNode || e.target=== getDragparent() || targetNode ===sourceNode){
                return;
            }
            let children = [... getDragparent().children];
            let sourceIndex = children.indexOf(sourceNode);
            let targetIndex = children.indexOf(targetNode);
            console.log('enter:',targetNode);
            if (sourceIndex < targetIndex){
                getDragparent().insertBefore(sourceNode,targetNode.nextElementSibling);
            }else{
                getDragparent().insertBefore(sourceNode, targetNode);
            }
        })
        $('#object-field-tree-groupby').on('dragover','.drag-container',(e)=>{
            e.preventDefault();
        })

        $('#object-field-tree-groupby').on('dragend','.drag-container',(e)=>{
            if (sourceNode){
                $(sourceNode).removeClass('moving');
            }
        })

        $('#object-field-tree-groupby1').on('dragstart',(event)=>{
            let dropNode = getDropNode(event.target);
            $(dropNode).addClass('drop-start')
            effectAllowed = dropNode.dataset.effect;
            console.log('start', dropNode);
            console.log(dropNode.dataset.effect);
            this.source = event.target;
        })

        $('#object-field-tree-groupby1').on('dragover',(event)=>{
            event.preventDefault();
        })

        $('#object-field-tree-groupby1').on('dragenter',(event)=>{
            $('#object-field-tree-groupby .drop-over').removeClass('drop-over');
            $('#object-field-tree-groupby .drop-start').removeClass('drop-over-delete');

            
            let dropNode = getDropNode(event.target);
            console.log('dragenter',dropNode);
            console.log(event.dataTransfer?.effectAllowed);
            if (dropNode && dropNode.dataset.drop === effectAllowed && this.source != dropNode){
                $(dropNode).addClass('drop-over')
            }else if (dropNode && dropNode.dataset.drop === 'delete' && this.source != dropNode){
                $(dropNode).addClass('drop-over-delete')
            }
        })

        $('#object-field-tree-groupby1').on('drop',(event)=>{
            $('#object-field-tree-groupby .drop-over').removeClass('drop-over');
            $('#object-field-tree-groupby .drop-start').removeClass('drop-start');
            $('#object-field-tree-groupby .drop-start').removeClass('drop-over-delete');
            let dropNode = getDropNode(event.target);
            if (dropNode && dropNode.dataset.drop === effectAllowed && this.source && this.source != dropNode){
                if (dropNode.dataset.drop === 'copy'){
                    let cloned = this.source.cloneNode(true);
                    cloned.dataset.effect='copy';

                    $(dropNode).before(cloned);

                    this.source.remove();

                    this.sortSelected();
                }
            }else if (dropNode && dropNode.dataset.drop === 'delete' && this.source && this.source != dropNode){
                this.source.remove();
                this.sortSelected();
            }
        })
    }

    async handleSave(event){
        let soql = $('#report-soql').val();
        let checkboxSelected = {
            fields:this.updatedSelect,
            refers: this.updatedReferSelect,
            groupby:this.fieldGroupBy,
            referSelected:this.referSelected,
            referConditions:this.referConditions,
            sql:soql,
            sobject:this.reportObjectName
        }

        let storage = localStorage.getItem('report.checkboxSelected');
        let storageArray = JSON.parse(storage || '[]');

        let selectItem = this.reportItemId || 'default';
        let defaultStorage = storageArray.find(e=>{
            return e.id == selectItem;
        })
        if (!defaultStorage){
            storageArray.push({name:this.reportItemName || 'default', check:checkboxSelected, id:this.tree.getUuid()});
            this.reportItemId = storageArray[storageArray.length -1].id;
        }else{
            defaultStorage.check = checkboxSelected;
        }

        localStorage.setItem('report.checkboxSelected', JSON.stringify(storageArray));
    }

    async handleSaveas(event){
        let soql = $('#report-soql').val();
        let checkboxSelected = {
            fields:this.updatedSelect,
            refers: this.updatedReferSelect,
            groupby:this.fieldGroupBy,
            referSelected:this.referSelected,
            referConditions:this.referConditions,
            sql:soql,
            sobject:this.reportObjectName
        }
        let newReportName = await this.openModal();
        if (newReportName){
            let storage = localStorage.getItem('report.checkboxSelected');
            let storageArray = JSON.parse(storage || '[]');
            storageArray.push({name:newReportName.name, check:checkboxSelected, id:this.tree.getUuid()});
            localStorage.setItem('report.checkboxSelected', JSON.stringify(storageArray));
        }
    }
    handleTreeSearch(searchKey){
        if (!searchKey || !searchKey.trim()){
            $('#object-field-tree-content li.pop-menu-item').show();
        }
        let localLowercaseKey = searchKey.toLocaleLowerCase();
        $('#object-field-tree-content li.pop-menu-item').each((i, element)=>{
            if($(element).find('ul').length > 0){
                return;
            }
            let value = $(element).children('span.item-name').text();
            if (value.toLocaleLowerCase().indexOf(localLowercaseKey) != -1){
                $(element).show();
            }else{
                $(element).hide();
            }
        })
    }

    initModalEvent(){
        // Auto fade in

        
        
        $('#'+this.rootId + ' .open-modal').on('click', ()=> {
            $('#'+this.rootId + ' [data-modal]').addClass('modal--open').fadeIn();

        })
        
        // close on click of button
        $('#'+this.rootId + ' .modal-report-save [data-modal-close]').on('click', (event)=> {
            $('#'+this.rootId + ' [data-modal].modal-report-save').removeClass('modal--open').fadeOut();

            this.closeModal(event.target.dataset.text);
        })

        $('#'+this.rootId + ' .modal-report-select [data-modal-close]').on('click', (event)=> {
            $('#'+this.rootId + ' [data-modal].modal-report-select').removeClass('modal--open').fadeOut();

            this.closeReportSelectModal(event.target.dataset.text);
        })

        
        
        // open on click of button
        $('#'+this.rootId + ' [data-modal-open]').on('click', (event)=>{
            //$('#showreportinfo [data-modal]').addClass('modal--open').fadeOut();
        })

        $('#report-new-report-name').on('change', (event)=>{
            //$('#showreportinfo [data-modal]').addClass('modal--open').fadeOut();
        })

        $('.modal-report-select .rado-container').on('click', '.option', (event)=>{
            //$('#showreportinfo [data-modal]').addClass('modal--open').fadeOut();
            if ($(event.target).is('input')){
                $(event.target).prop("checked",true);
                return;
            }
            else{
                $(event.currentTarget).find('input').prop("checked",true);
            }
        })

        $('.modal-report-select').on('click', '.btn-class-name', (event)=>{
            //$('#showreportinfo [data-modal]').addClass('modal--open').fadeOut();
            event.stopPropagation();
            let newReportName = $(event.currentTarget).parent().siblings('input').val();
            let storage = localStorage.getItem('report.checkboxSelected');
            let storageArray = JSON.parse(storage || '[]');
    
            storageArray = storageArray.filter(e=>{
                return e.id == newReportName;
            })
            localStorage.setItem('report.checkboxSelected', JSON.stringify(storageArray));
            $(event.currentTarget).parents('div.option').remove();
        })
    }

    openModal(){
        $('#'+this.rootId + ' [data-modal].modal-report-save').addClass('modal--open').fadeIn();

        

        return new Promise((solved)=>{
            this.modalCallback = solved;
        })
    }

    openReportSelectModal(items){
        $('#'+this.rootId + ' [data-modal].modal-report-select').addClass('modal--open').fadeIn();

        let html = items.map(e=>{
            return `<div class="option">
            <input type="radio" name="card" value="${e.id}" ${e.id ==this.reportItemId?'checked':''}>
            <label for="${e.name}" aria-label="${e.name}">
                <span></span>
                
                <input class="report-select-name-input" type="text" value="${e.name}"></input>
                <div class="card card--white card--sm">
                    <div class="card__chip"></div>
                    <div class="card__content">
                    <div class="card__text">
                        <div class="text__row">
                        <div class="text__loader"></div>
                        <div class="text__loader"></div>
                        </div>
                        <div class="text__row">
                        <div class="text__loader"></div>
                        <div class="text__loader"></div>
                        </div>
                    </div>
                    <div class="card__symbol">
                        <span></span>
                        <span></span>
                    </div>
                    </div>
                </div>
                <button class="btn-class-name">
                    <span class="back"></span>
                    <span class="front"></span>
                </button>
            </label>
        </div>`
        }).join('')
        $('.rado-container').html(html);

        return new Promise((solved)=>{
            this.modalCallback = solved;
        })
    }

    closeModal(buttonType){
        let newReportName = null;
        if (buttonType == 'Reply'){
            newReportName = $('#report-new-report-name').val();
        }
        if (this.modalCallback){
            this.modalCallback({name:newReportName});
            this.modalCallback = null;
        }
    }

    closeReportSelectModal(buttonType){
        let newReportName = null;
        let newReportId = null;
        if (buttonType == 'Reply'){
            newReportId = $('.rado-container input[name="card"]:checked').val();
            
            newReportName = $('.rado-container input[name="card"]:checked+label>input.report-select-name-input').val()
        }
        if (this.modalCallback){
            this.modalCallback(newReportId?{id:newReportId, name:newReportName}:null);
            this.modalCallback = null;
        }
    }

     

    sortSelected(){
        this.referSelected = [];
        this.updatedReferSelect={};
        $('#object-field-tree-groupby .checkbox-wrapper:not(.empty-check)').each((index, e)=>{
            this.referSelected.push($(e).attr('name'));
            this.updatedReferSelect[$(e).attr('name')]=true;
        })
        this.effectSelectedToTree();
    }

    effectSelectedToTree(){
        $('#object-field-tree-content input:checked').each((i, ele)=>{
            $(ele).prop("checked",false);
        })
        for (let checked of this.referSelected){
            this.updateChildrenCheck($(`#object-field-tree-content>ul`), checked);
        }
    }

    updateChildrenCheck(parentUL, property){
        let paths = property.split('.');
        if(paths.length  == 1){
            parentUL.children(`li[name="${property}"]`).children(`input[type="checkbox"]`).prop("checked",true);
        }else{
            let firstEle = paths.shift();
            this.updateChildrenCheck(parentUL.find(`li>ul[relationship="${firstEle}"]`), paths.join('.'));
        }
    }

      getPathsByNode(liElement){
        let attr = liElement.attr('name');
        let paths = [attr];
        let parents = $(liElement).parents('ul')
        if (parents.length){
            parents.each((index, ele)=>{
                let r = $(ele).attr('relationship');
                if (r){
                    paths.push(r);
                }
            })
        }
        return paths.reverse();
      }

      clickFolderHandler(event){
        let parent = $(event.target).parents('li');
        let currentDirName = parent.attr('name');
        
        let m = this.findDir(currentDirName);
        if (parent.is('.off')){
            parent.addClass('on');
            parent.removeClass('off');
            $(parent).html(`<label>${m.name}</label>
            <button class="tablinks meta off" name="${m.fullName || m.name}" data-x-name="Report">${m.isFile?'Open':'List'}</button>
            <ul>` + this.createFolderTree(m) + '</ul>');
        }else{
            parent.addClass('off');
            parent.removeClass('on');
            $(parent).html(`<label>${m.name}</label>
            <button class="tablinks meta off" name="${m.fullName || m.name}" data-x-name="Report">${m.isFile?'Open':'List'}</button>`);
        }
        this.showMessage( '');
      }

      async clickFileHandler(event){
        let fileName = $(event.target).attr('name');
        let xName = $(event.target).attr('data-x-name');
        $(event.target).parents('li').addClass('selected');
        $('#report-xml-filename').html(fileName);

        let metadataFile = this.metadataDetails.find(e => e.fullName == fileName);
        let selectedMetadataObjects =  await this.tree.getMetadata(xName);

        this.metadateTree.download(selectedMetadataObjects, metadataFile, (data)=>{
        }).then(data=>{
            if (data.success){
                let content = Object.keys(data||{}).filter(e=>{
                    let m = e.match(/\.report$/);
                    return m;
                }).map(e=>{
                    return data[e];
                }).join('');
                this.reportContent = content;
                this.turnOn('#report-refreshSObjectSoql');
                $('#report-btn-reset').click();
            }else{
            }
        });
      }

      createFolderList(){
         return this.metadataDetails.map((m, index)=>{
            return `<li name="${m.fullName}" class="off" index="${index}">
                <label>${m.fullName}(${m.fileName})</label>
                <button class="tablinks meta off" name="${m.fullName}" data-x-name="Report">Open</button>
            </li>`
        }).join('')
      }

      createFolderTree(folder){
        return folder.files.concat(folder.folders).map((m, index)=>{
            let reportFile = m.report;
           return reportFile?`<li name="${m.name}" class="off" index="${index}" folder="false">
           <label>${m.name}</label>
           <button class="tablinks meta off" name="${reportFile.fullName}" data-x-name="Report">Open</button>
       </li>`:
       `<li name="${m.name}" class="off" index="${index}" folder="true">
               <label>${m.name}</label>
               <button class="tablinks meta off" name="${m.name}" data-x-name="Report">List</button>
           </li>`
       }).join('')
     }

      createReportFolder(metadataDetails){
        let root = {isFile:false, name:'*', folders: [], files:[]}
        for (let reportFile of metadataDetails){
            let dirPaths = reportFile.fileName.split(/\/|\\/);
            let folder = this.getFolder(root, dirPaths);
            folder.files.push({report:reportFile, name:dirPaths[0], isFile:true});
        }
        return root;
      }

      findDir(name, parentDir){
        parentDir = parentDir || this.rootFolder;
        for (let fd of parentDir.folders){
            if (name == fd.name){
                return fd;
            }else{
                let findInChild = this.findDir(name, fd);
                if (findInChild){
                    return findInChild;
                }
            }
        }
      }

      getFolder(root, path){
         if (path.length == 1){
            return root;
         }
         else {
             let fname = path.shift();
             let sonFolder = root.folders.find(e => e.name == fname);
             if (!sonFolder){
                sonFolder = {isFile:false, name:fname, folders: [], files:[]};
                root.folders.push(sonFolder);
             }
             return this.getFolder(sonFolder, path);
         }
      }

      async listReports(){
        let xmlName = 'Report';
        let metadataDetails = await this.tree.listMetadata(xmlName);
        if (!metadataDetails){
            return [];
        }
        if (!Array.isArray(metadataDetails)){
            metadataDetails = [metadataDetails];
        }
        
        
        metadataDetails = metadataDetails.sort((a,b)=>{
            return a.fullName.localeCompare(b.fullName);
        })
        this.metadataDetails = metadataDetails;

        return metadataDetails;
    }

    async loadRecoeds(referSelcted){
        let allFields = referSelcted.referSelected;
        let conditions = referSelcted.referConditions;
        let sobjectName = this.reportObjectName || 'Order';

        let allItems = await this.getAllItems(sobjectName);
        let allChildrenItems = await this.getAllChildrenItems(sobjectName);
        let soql = 'select {0} from {1} where {2} order by {3}';
        let rootFields = allFields.filter(e=>{
            return e.indexOf('.') == -1;
        })
        let rootFieldsRefer = [];
        let childrenObjectFields = {};
        let referFields = allFields.filter(e=>{
            return e.indexOf('.') != -1;
        })
        for (let referField of referFields){
            let paths = referField.split('.');
            if (childrenObjectFields[paths[0]]){
                let childObject = paths.shift();
                childrenObjectFields[childObject].push(paths.join('.'));
                continue;
            }
            let referFieldDef = allItems.find(e=>{
                return e.relationshipName == paths[0];
            })
            if (referFieldDef){
                rootFieldsRefer.push(referField);
            }else{
                
                referFieldDef = allChildrenItems.find(e=>{
                    return e.relationshipName == paths[0];
                })
                if (referFieldDef){
                    paths.shift();
                    childrenObjectFields[referFieldDef.relationshipName] = [paths.join('.')];
                }
            }
        }

        for (let key in childrenObjectFields){
            let childrenObject = childrenObjectFields[key];
            rootFieldsRefer.push(`(select ${childrenObject.join(',')} from ${key})`)
        }
        soql =`select ${rootFields.concat(rootFieldsRefer).join(',')} from ${sobjectName} ${conditions?.length?' where '+conditions.join(' and '):''} order by createdDate desc`;
        $('#report-soql').val(this.formatSQL(soql));
            this.doUpdaate(soql);
    }

      async generateSQL(){
        let soqlTemplate = 'select {0} from {1} where {2} order by {3}';
        let report = this.reportObj;
        if (report.field.length == 0){
            return ''
        }

        let tabMatch = report.field[0].match(/\b(.*?)\$/);
        let table = tabMatch ? tabMatch[1] : '';
        let descObj = await this.tree.getDescribeSobject(table);
        this.rootDescriptionSObject = descObj;
        let fieldList = [];
        for (let f of report.field){
            let s = await this.wapperField(f);
            fieldList.push(s);
        }

        let parentQuery = {table:table, fields:[],conditions:[]};
        let allSubQuery = [parentQuery];
        this.mergeChildrenFields(fieldList,  parentQuery, allSubQuery);
        

        let condition = '';
        let conditionList = [];
        for (let f of report.filter){
            let s = await this.wapperCondition(f);
            if (!s.expr){
                continue;
            }
            conditionList.push(s);
        }

        this.mergeChildrenConditions(conditionList,  parentQuery, allSubQuery);

        let fields = parentQuery.fields.map(e=>
            {
                return e.isGroup? this.groupFieldPath(e.ref) : e.fieldPath;
            }).join(',');
        condition = parentQuery.conditions.filter(e=>e&&e.expr).map(e => e.expr).join(' and ');

        let orderBy = 'id';
        let soql = `select ${fields} from ${parentQuery.table} where ${condition? condition : ' id <> null'} order by ${orderBy || 'id'}`;
        this.parentQuery = parentQuery;
        return soql;
      }

      groupFieldPath(sonQuery){
        let fields = sonQuery.fields.map(e=>
            {
                return e.isGroup? this.groupFieldPath(e.ref) : e.fieldPath;
            }).join(',');

        let condition = sonQuery.conditions.filter(e=>e&&e.expr).map(e => e.expr).join(' and ');
        let tableNames = sonQuery.table.split('.');

        return `(select ${fields} from ${tableNames[tableNames.length-1]} where ${condition? condition : ' id <> null'})`
      }

      mergeChildrenFields(childrenConditionList,  parentQuery, allSubQuery){
        let sonQuerys = [];
        for (let item of childrenConditionList){
            if (item.table == parentQuery.table){
                parentQuery.fields.push(item);
            }else{
                let sonTables = item.table.replace(parentQuery.table +'.', '');
                let tablePaths = sonTables.split('.');
                let sonTable = tablePaths.shift();
                if (tablePaths.length == 0){
                    let sonQuery = parentQuery[sonTable] || {fields:[],conditions:[], table:parentQuery.table +'.'+sonTable};
                    sonQuery.fields.push(item);
                    if (allSubQuery.indexOf(sonQuery)==-1){
                        allSubQuery.push(sonQuery);
                        parentQuery[sonTable] = sonQuery;
                        parentQuery.fields.push({isGroup:true, ref: sonQuery});
                    }
                }else if (tablePaths.length == 1){
                    parentQuery.fields.push(item);
                }else{
                    this.mergeChildrenFields([item], parentQuery[tablePaths[0]], allSubQuery)
                }
            }
        }

        // (select id from xxx)
        for (let query of sonQuerys){
           let queryFields = query[key];
           let tablePaths = key.split('.');
           tablePaths.shift();
           if (tablePaths.length == 1){
               query.query = `(select ${queryFields.map(e=>{
                return e.fieldPath;
               }).join(',')} from ${tablePaths[0]})`;
           }else{

           }
        }

    }
    mergeChildrenConditions(childrenConditionList,  parentQuery, allSubQuery){
        let sonQuerys = [];
        for (let item of childrenConditionList){
            if (item.table == parentQuery.table){
                parentQuery.conditions.push(item);
            }else{
                let sonTables = item.table.replace(parentQuery.table +'.', '');
                let tablePaths = sonTables.split('.');
                let sonTable = tablePaths.shift();
                let tab = parentQuery.table +'.'+sonTable;
                let sonQuery = null;
                for (let son of allSubQuery){
                    if (son.table == tab){
                        sonQuery = son;
                        break;
                    }
                }
                if (sonQuery){
                    sonQuery.conditions.push(item);
                }
            }
        }

        // (select id from xxx)
        for (let query of sonQuerys){
           let queryFields = query[key];
           let tablePaths = key.split('.');
           tablePaths.shift();
           if (tablePaths.length == 1){
               query.query = `(select ${queryFields.map(e=>{
                return e.fieldPath;
               }).join(',')} from ${tablePaths[0]})`;
           }else{

           }
        }

    }


      async wapperField(field){

        let tabMatch = field.match(/\b(.*?)\$/);
        let orgTables = tabMatch[1];
        let tablePaths = orgTables.split('.');

        let m = field.match(/\$(.+)\b/);
        let propertyPath = m[1];
        let propertyPaths = propertyPath.split('.');
        let newPropertyPaths = [];

        let descObj = this.rootDescriptionSObject;
        if (tablePaths.length > 1){
            let relationships = await this.getRelationshipObj(tablePaths, descObj.name, []);
            descObj = await this.getDescribeSobject(relationships[relationships.length - 1].childSObject);
        }

        let fieldObj = await this.getFieldObj(propertyPaths, descObj.name, newPropertyPaths);
        return {fieldPath:newPropertyPaths.join('.'), ref:fieldObj, table:orgTables, isChildSQL:tablePaths.length > 1};
      }

      async getRelationshipObj(tablePaths, sobjectname, newPropertyPaths){
        let descObj = this.rootDescriptionSObject;
        if (sobjectname == this.rootDescriptionSObject.name){
            descObj = this.rootDescriptionSObject;
        }else{
            descObj = await this.getDescribeSobject(sobjectname);
        }
        let currentRelationName = tablePaths.shift();
        if (currentRelationName == sobjectname){
            currentRelationName = tablePaths.shift();
        }

        let relationship =  descObj.childRelationships.find(e=>{
            return e.relationshipName == currentRelationName;
        })
        if (tablePaths.length > 0){
            return [relationship].concat(await this.getRelationshipObj(tablePaths, relationship.childSObject, newPropertyPaths));
        }
        return [relationship];
      }

      async getFieldObj(propertyPaths, sobjectname, newPropertyPaths){
        let descObj = this.rootDescriptionSObject;
        if (sobjectname == this.rootDescriptionSObject.name){
            descObj = this.rootDescriptionSObject;
        }else{
            descObj = await this.getDescribeSobject(sobjectname);
        }
        let fieldObj = descObj.fields.find((a)=>{
            return a.name == propertyPaths[0];
        });
        let propName = propertyPaths[0];
        let nameField = null;
        if (!fieldObj){
            fieldObj = descObj.fields.find((a)=>{
                return a.relationshipName == propertyPaths[0];
            });
            if (fieldObj){
                propName = fieldObj.name;
                nameField = await this.getNameField(fieldObj.referenceTo[0]);
                if (nameField){
                    propName = fieldObj.relationshipName+'.'+ nameField.name;
                }
            }
        }
        
        let firstElement = propertyPaths.shift();
        if (propertyPaths.length == 0){
            newPropertyPaths.push(propName);
            return fieldObj; 
        }else{
            if (fieldObj && fieldObj.type=="reference"){
                newPropertyPaths.push(fieldObj.relationshipName || fieldObj.referenceTo[0]);
                return await this.getFieldObj(propertyPaths, fieldObj.referenceTo[0], newPropertyPaths); 
            }
        }
        return {type:'unknow'};
      }

      async getNameField(sobjectname){
        let descObj = this.rootDescriptionSObject;
        if (sobjectname == this.rootDescriptionSObject.name){
            descObj = this.rootDescriptionSObject;
        }else{
            descObj = await this.getDescribeSobject(sobjectname);
        }
        let fieldObj = descObj.fields.find((a)=>{
            return a.nameField;
        });
        return fieldObj;
      }

      async wapperCondition(filter){
        let f = await this.wapperField(filter.column);
        if (!f.ref.filterable){
            return {};
        }

        let expr = '';
        if (filter.operator == 'equals'){
            if (f.ref.type == 'boolean'){
                expr = `${f.fieldPath}=${filter.value==1?true:false}`;
            }else if (f.ref.type == 'double'){
                expr = `${f.fieldPath}=${filter.value}`;
            }
            else if (f.ref.type == 'date' || f.ref.type == 'datetime'){
                expr =  `${f.fieldPath}=${filter.value}`;
            }
            let values = filter.value.split(',');
            if (values.length > 1){
                expr =  `${f.fieldPath} in (${values.map(e=> {
                    return "'"+e+"'";
                }).join(',')})`;
            }else {
                expr =  `${f.fieldPath}='${filter.value}'`;
            }
        }else if (filter.operator == 'notEqual'){

            if (f.ref.type == 'boolean'){
                expr = `${f.fieldPath}<>${filter.value==1?true:false}`;
            }else if (f.ref.type == 'double'){
                expr = `${f.fieldPath}<>${filter.value}`;
            }
            else if (f.ref.type == 'date' || f.ref.type == 'datetime'){
                expr =  `${f.fieldPath}<>${filter.value}`;
            }
            let values = filter.value.split(',');
            if (values.length > 1){
                expr =  `${f.fieldPath} not in (${values.map(e=> {
                    return "'"+e+"'";
                }).join(',')})`;
            }else {
                expr =  `${f.fieldPath}<>'${filter.value}'`;
            }
        }else if (filter.operator == 'contains'){
            expr =  f.fieldPath  + ' like \'%' + filter.value + '%\'';
        }

        f.expr = expr;
        return f;
      }

      async getDescribeSobject(sobjectname){
        await this.tree.getDescribeSobject(sobjectname);
        let dataMap = this.tree.dataMap[sobjectname] ||{};
        return dataMap.sobjectDescribe;
   }

      parseXML(content){
        let result = {type:'Report', field:[],filter:[]};
        let root = $(content);
        root.find('columns>field').each((index, ele)=>{
            let field = $(ele).text().trim();
            if (field.indexOf('BucketField_') != -1){
                let newField = '';
                root.find('buckets').each((index, ele)=>{
                    if ($(ele).children('developerName').text() == field){
                        newField = $(ele).children('sourceColumnName').text()
                    }
                })
                result.field.push(newField);
            }else{
                result.field.push(field)
            }
        })

        root.find('filter>criteriaItems').each((index, ele)=>{
            result.filter.push({
                column: $(ele).children('column').text(),
                operator: $(ele).children('operator').text(),
                value: $(ele).children('value').text()
            })
        })
        result.description = root.children('description').text();
        result.name = root.children('name').text();
        result.reportType = root.children('reportType').text();
        result.sortColumn = root.children('sortColumn').text();
        result.sortOrder = root.children('sortOrder').text();
        result.timeFrameFilter = {
            dateColumn : root.children('timeFrameFilter').children('dateColumn').text()
        };
        let fields = [...new Set(result.field)];
        result.field = fields;
        return result;
      }

      formatSQL(input){
          return this.tree.Tools.formatSQL(input);
      }


      getReportContent(){
            if (this.reportContent){
                return this.reportContent;
            }
      }
}
