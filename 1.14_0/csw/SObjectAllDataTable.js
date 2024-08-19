import {AutoComplete1} from "./AutoComplete1.js";
import {Tools} from "./Tools.js";
import {PopupMenu} from "./PopupMenu.js";
import {PopupRelationMenu} from "./PopupRelationMenu.js";
import {Pilles} from "./Pilles.js";

export class SObjectAllDataTable{

    constructor(dateTree){
        this.tree = dateTree;
        this.showFields = [];
        this.showRelatedFields = [];
        this.records = [];
        this.allRecords = [];
        this.sobjectname='Order';
        this.sortField = {};
        this.message='';
        this.fieldCondition = {};
        this.recordCondition= {include:'',exclude:'',fields:{}}
        this.searcherPiler;
        this.maxPageSize = 100;
        this.apexLogs = {};
    }
    render(){
        return `
            <div>${this.message}</div>
            <table id="datatable" class="table">
                <thead>
                    <tr class="row header blue">
                        ${this.showFields.concat(this.showRelatedFields).map(e=>{
                            return `<th class="field-${e.name} cell" tabindex="0" title="${e.name}">${e.label||e.name}
                                <button class="actions-button .comp-btn" name="${e.name}">
                                    <svg class="actions-icon">
                                        <use xlink:href="symbols.svg#${this.sortField[e.name]?.asc?'arrowdown':'arrowup'}"></use>
                                    </svg>
                                </button>
                            </th>`
                        }).join('')}
                        <th class="field-action cell" tabindex="0">Show In Tree<input name="${this.sobject}.field.all" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                    </tr>
                </thead>
                <tbody>
                    ${this.records.map(r=>{
                        return `
                <tr class="${this.sobjectname} row" title="${this.sobjectDescribe.label}" name="${this.sobjectname}">

                ${this.showFields.concat(this.showRelatedFields).map(e=>{
                    return `<td class="cell field-${e.name}" tabindex="0" title="${e.name}">${this.valuetostring(r, e.name, e)}</td>`
                }).join('')}
                    <td class="cell field-value" tabindex="0">
                    </td>
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    valuetostring(record, prop, attr){

        if (record?.attributes?.type=='ApexLog' && prop == 'Id' ){
            return  `<span class="download-apexlog" style="color:blue" name="${record.Id}">${record.Id}</span>`;

        }
        let value = record;
        let props = prop.split('.');
        while(props.length && value){
            let first = props.shift();
            value = value[first];
        }
        if (value===true){
            return `<input type="checkbox" disabled checked></input>`;
        }
        if (value===false){
            return `<input type="checkbox" disabled></input>`;
        }

        if (value === undefined || value === null){
            return '';
        }
        if (typeof value ==='string'){
            return value;
        }
        if (typeof value ==='object'){
            if (value.length===0){
                return  '';
            }
            if (value.length>0 && value.join){
                return value.map(e=>`<span class="relationship">${this.valuetostring(e, '', attr)}</span>`).join(',');
            }
            return JSON.stringify(value);
        }
        return value;
    }

    get sobjectDescribe(){
         let dataMap = this.tree.dataMap[this.sobjectname];
         return dataMap?.sobjectDescribe || {};
    }

    setSobjectname(sobjectname){
        this.fieldCondition = {};
        sobjectname = this.tree.allSObjectApi.map(e=>e.global.name).find(e => e.toLocaleLowerCase() == sobjectname.toLocaleLowerCase());
        if (!sobjectname){
            return;
        }
        this.sobjectname = sobjectname;
        this.popRelaMenu.reset(sobjectname);
        this.totalSize = 0;
        $('#sobjectsearchoffset').hide();
        this.doUpdaate();
    }

    setOffset(offset){
        this.offset = offset;
    }

    async doUpdaate(){
        $('#showallsobjectdata .recordsnumber').text(this.totalSize||0);
        this.maxPageSize = $('#objectsearchpagesizeinput').val();
        let htmlId = 'showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            rootdata.innerHTML = 'loading data from '+this.sobjectname;
            if (!this.sobjectname){
                rootdata.innerHTML = 'Miss sobject name';
                console.log('No data to show 1');
                return;
            }
            await this.tree.getDescribeSobject(this.sobjectname);
            let dataMap = this.tree.dataMap[this.sobjectname];
            if (!dataMap){
                rootdata.innerHTML = 'miss sobject describe';
                console.log('No data to show 2');
                return;
            }

            let sobjectDescribe = this.sobjectDescribe;

            let allChecked = this.tree.getAllChecked();
            let checkFields = Object.keys(allChecked).filter(element => {
                return element.indexOf(sobjectDescribe.name+'.')==0&&allChecked[element];
            });

            
            this.showFields = sobjectDescribe.fields.filter(t=>{
                return checkFields.indexOf(sobjectDescribe.name+'.'+t.name)>-1 || t.name=='Id' || t.nameField;
            }).sort((a, b)=>{
                if (a.name == 'Id'){
                    return -100000;
                }
                if (b.name == 'Id'){
                    return 100000;
                }
                if (a.nameField){
                    return -90000;
                }
                if (b.nameField){
                    return 90000;
                }
                return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
            })

            await this.loadData();

            this.updateNotLoad();
        }
    }

    updateNotLoad(){
        let htmlId = 'showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
        }

        $('#sobjectdatainfo .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize!=0 &&this.records.length < this.totalSize){
            $('#sobjectsearchoffset').show();
        }else{
            $('#sobjectsearchoffset').hide();
        }

        $('#datatable').on('click', '.actions-button', (event)=>{
            let fieldName = $(event.currentTarget).attr('name');
            this.sort(fieldName);
        })

        $('#datatable').on('click', 'span.download-apexlog', (event)=>{
            let logId = $(event.currentTarget).attr('name');
            this.load(logId);
        })


        
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

        if (this.totalSize == this.maxPageSize){
            let result = await this.tree.getRecordsByFields(this.sobjectname, this.showFields, 0,this.fieldCondition, selected);
            this.lastResult = result.data;
            this.totalSize = result.totalSize;
            this.records = result.results ||[];
            //this.allRecords.push(...(result.results||[]));
            this.allRecords = [].concat(this.records);
        }else if (this.lastResult){
            let result = await this.tree.loadNextRecords(this.lastResult, false);
            this.lastResult = result;
            this.records = result.allRecords ||[];
            //this.allRecords.push(...(result.allRecords||[]));
            this.allRecords = [].concat(this.records);
            if (this.allRecords.length>=this.maxPageSize){
                this.lastResult   =   null;
            }
        }

        let htmlId = 'showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
        }

        $('#sobjectdatainfo .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize == this.maxPageSize || (this.lastResult && !this.lastResult.done)){
            $('#sobjectsearchoffset').show();
        }else{
            $('#sobjectsearchoffset').hide();
        }

        $('#datatable').on('click', '.actions-button', (event)=>{
            let fieldName = $(event.currentTarget).attr('name');
            this.sort(fieldName);
        })
    }

    load(id){
        this.apexLogs[id]="loading....";
        this.addApexlog2Bar();
        this.createMessagePopup('', 'message', true);
        this.tree.getApexlogByid(id).then(e=>{
            this.apexLogs[id]=e.data;
            this.createMessagePopup(e.data, 'message');
        });
    }

    addApexlog2Bar(){
        let apexLogIds = Object.keys(this.apexLogs);
        if (apexLogIds.length != 0){
            $('.objsearchApexlogBar').show();
            let apexLogBarHtml = apexLogIds.map(e=>{
                return `<span class="apexlog-bar-item" data-logid="${e}"><span class="apexlog-bar-label">${e}</span><img class="apexlog-bar-btn" src="./images/flags.png"></img></span>`;
            }).join('');
            $('.objsearchApexlogBar').html(apexLogBarHtml);
        }else{
            $('.objsearchApexlogBar').hide();
        }
    }

     createMessagePopup(content , title, loading){
        let dialog = $('#sobjectdatainfo [role="dialog"]');
        if (dialog.length != 0){
            $('#sobjectdatainfo [role="dialog"] .slds-modal__content').html(`<pre>${content}</pre>`);
            if(loading){
                Tools.createProgress($('.slds-modal__content'));
            }
            return ;
        }
      
        $('#sobjectdatainfo').append(`
        <section role="dialog" tabindex="-1" aria-labelledby="modal-heading-01" aria-modal="true"
            aria-describedby="modal-content-id-1" class="slds-modal slds-fade-in-open slds-modal_small">
            <div class="slds-modal__container second-level-modal">
                <header class="slds-modal__header">
                    <h2 id="modal-heading-01" class="slds-modal__title slds-hyphenate">
                    ${title}</h2>
                        <button class="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse" title="Close">
                            <ul class="svgicon">
                                <li class="slds-assistive-text icon-close"></li>
                                <li class="icon-delete">
                                    <svg class="icon" aria-hidden="true">
                                        <use href="#icon-delete"></use>
                                    </svg>
                                </li>
                            </ul>
                        </button>
                </header>
                <div class="slds-modal__content slds-p-around_medium" id="modal-content-id-1">
                    <pre>${content}</pre>
                </div>
            </div>
        </section>`);
        $('#sobjectdatainfo').on('click', '[role="dialog"] .slds-modal__close', this.removeDialog);
        if(loading){
            Tools.createProgress($('.slds-modal__content'));
        }
    }

    addApexlogEvent(){
        $('.objsearchApexlogBar').on('click','.apexlog-bar-btn', (e)=>{
            let logId = $(e.target).parents('[data-logid]').attr('data-logid');
            console.log('delete apex log content='+logId);
            delete this.apexLogs[logId];
            this.addApexlog2Bar();
        })

        $('.objsearchApexlogBar').on('click','.apexlog-bar-label', (e)=>{
            let logId = $(e.target).parents('[data-logid]').attr('data-logid');
            console.log('open apex log content='+logId);
            let data =  this.apexLogs[logId] || 'loading';
            this.createMessagePopup(data, 'message');
        })
    }


    removeDialog(event){
        $('#sobjectdatainfo [role="dialog"]').remove();
    }

    async loadData(){
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

        let result = await this.tree.getRecordsByFields(this.sobjectname, this.showFields, -1, this.fieldCondition, selected);

        if (result.results?.length > this.maxPageSize && this.maxPageSize > 0){
            result.results = result.results.slice(0, this.maxPageSize);
            this.querySoql = result.data.query;
        }
        this.lastResult = result.data;
        this.totalSize = result.totalSize;
        this.message = result.title;
        this.records = result.results ||[];
        this.allRecords = [].concat(this.records);
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
                if (!this.sobjectname || !this.sobjectDescribe){
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
        let digital = /^[\d]+$/;

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
                if (digital.test(v1.toString()) && digital.test(v2.toString()) ){
                    return Number(v1.toString()) - Number(v2.toString());
                }
                return v1.toString().localeCompare(b[fieldName].toString());
            }
        })
        if (!this.sortField[fieldName].asc){
            this.records.reverse();
        }

        this.updateNotLoad();
    }

    createHead(){
        let treeroot = document.getElementById('sobjectdatainfo');
        let searchAear = `
        <p>
            Object Search:
            <input class="search feedback-input" id="sobjectsearch2" type="input" value="Order" autocomplete="off" style="width:80%"></input>
            <button class="tablinks comp-btn" name="updateSelectObject" id="refreshSObjectSearch">Refersh</button>
            <button class="tablinks comp-btn copysoql" name="copysoql" id="refreshSObjectSearch">Copy SOQL</button>
            <br/>
            Page Size:
                <input class="search feedback-input" id="objectsearchpagesizeinput" type="number" value="100" style="width:30%;line-height:1.5rem" autocomplete="off"></input>
        </p>
        <p>
            <div id="searchFilter"></div>
            Fields Value: <input class="search feedback-input" id="fieldvalyuesearch1" type="input" value=""></input>
            <button class="search comp-btn" id="sobjectsearchoffset" type="input" value="">More</button>
            <button class="search comp-btn" id="sobjectmorecondition" type="input" value="">More Condition</button>
            <div class="field-value-filter">
                <div class="c-item">
                    <input type="input" value="Id" id="uuid1" class="fieldname feedback-input" autocomplete="off"></input><input autocomplete="off" class="fieldvalue feedback-input" id="uuid2" type="input" value=""></input><button class="btn-delete">-</button>
                </div>
                <button class="search btn-add comp-btn">Add</button>
                <button class="search btn-add2 comp-btn">Add2</button>
            </div>
        </p>
        <div class="searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="notificationmessage3"></div>
            <div class="totalbar" id="fieldShowFilterContainer"></div>
            <div class="totalbar" id="relationShowFilterContainers"></div>

            <div class="objsearchApexlogBar"></div>
            <div class="objsearchresult"></div>
            <div class="detailearchresult"></div>
            <div id="showallsobjectdatatable"></div>
            <div id="objsearchApexlogContainter"></div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            $('#sobjectsearchoffset').hide();
            this.initObjectAllDataHead();
            //this.addFieldFilter('#fieldShowFilterContainer');
            this.addRelationFieldFilter('#relationShowFilterContainers');
            //this.addSearchFiler('#searchFilter');
            this.searcherPiler = new Pilles('.field-value-filter');

            this.searcherPiler.valueChange = (items)=>{
                this.recordCondition.fields = {};
                for(let item of items){
                    if (!item.value){
                        continue;
                    }
                    this.recordCondition.fields[item.name]= {include:item.value};
                }
                this.filterRecords();
            }
            
    }

    initObjectAllDataHead(){

        this.addApexlogEvent();

        $('#sobjectsearch2').on('change', (event)=>{
            let tableName = $(event.target).val();
            this.setSobjectname(tableName);
        })

        $('.field-value-filter .btn-add').on('click', (event)=>{
            let sobjectDescribe = this.sobjectDescribe;
            let uuid = this.tree.getUuid();
            let opuuid = this.tree.getUuid();

            let fieldNames = sobjectDescribe.fields.map(e =>e.name);
            fieldNames.sort();
            let allSelections = fieldNames.map(e=>`<option value="${e}">${e}</option>`);

            let options = ['=','<','>','>=','<=','<>','in','not in','like'];
            let allOptions = options.map(e=>`<option value="${e}">${e}</option>`);
            $(`<div class="c-item">
            <select id="${uuid}" class="fieldname feedback-input main-style">
                <option value="">Please select object</option>
                ${allSelections}
            </select>
            <select id="${opuuid}" class="fieldoption">
                ${allOptions}
            </select>
            <span class="fieldvalue-container"><input class="fieldvalue feedback-input" type="input" value=""></input></span>
            <button class="btn-delete">-</button></div>`).insertBefore( $( event.target));
            //new AutoComplete1(uuid,sobjectDescribe.fields.map(e=>e.name)).createApi();
        })

        $('.field-value-filter .btn-add2').on('click', (event)=>{
            $(`<div class="c-item inputonly">
            <input class="fieldname feedback-input main-style"></input>
            <span class="fieldvalue-container">
                <input class="fieldvalue feedback-input" type="input" value=""></input>
            </span>
            <button class="btn-delete">-</button></div>`).insertBefore( $( event.target));

            //new AutoComplete1(uuid,sobjectDescribe.fields.map(e=>e.name)).createApi();
        })

        $('.field-value-filter').on('change', '.c-item select.fieldname',(event)=>{
            let selectVal = $(event.currentTarget).val();
            let seelctField = this.sobjectDescribe.fields.find(e =>e.name==selectVal);
            if (seelctField){
                let valueHtml = '<input class="fieldvalue feedback-input" type="input" value=""></input>';
                if (seelctField.type == 'reference'){

                }else if (seelctField.type == 'boolean'){
                    let allSelections = seelctField.picklistValues.filter(e=>e.active).map(e=>`<option value="${e.value}">${e.label}</option>`)
                    valueHtml = `<input class="fieldvalue feedback-input" type="checkbox" value=""></input><span class="checkbox-wapper"></span>`
                }
                else if (seelctField.type == 'date'){
                    valueHtml = `<input class="fieldvalue feedback-input" type="input" value="${this.formatDate(new Date(), 'yyyy-MM-ddThh:mm:ss.000+0000')}"></input>`;
                }else if (seelctField.type == 'picklist'){
                    let allSelections = seelctField.picklistValues.filter(e=>e.active).map(e=>`<option value="${e.value}">${e.label}</option>`)
                    valueHtml = `<select class="fieldvalue feedback-input">
                        <option value="">Please select object</option>
                        ${allSelections}
                    </select>`
                    
                }else if (seelctField.type == 'textarea'){
                    
                }else if (seelctField.type == 'double'){
                    valueHtml = `<input class="fieldvalue feedback-input" type="number" value=""></input>`;
                }else if (seelctField.type == 'datetime'){ //2023-12-23T05:27:22.000+0000	
                    valueHtml = `<input class="fieldvalue feedback-input" type="input" value="${this.formatDate(new Date(), 'yyyy-MM-ddThh:mm:ss.000+0000')}"></input>`;
                }else if (seelctField.type == 'percent'){
                    
                }else {
                    valueHtml = '<input class="fieldvalue feedback-input" type="input" value=""></input>';
                }
                $(event.currentTarget).siblings('.fieldvalue-container').html(valueHtml);
            }
        })

        $('.field-value-filter').on('click', '.checkbox-wapper',(event)=>{
            $(event.target).parent().children('input[type="checkbox"]').click();
        })

        $('.field-value-filter').on('click', '.btn-delete',(event)=>{
            $(event.target).parent('.c-item').remove();
        })

        $('#sobjectsearchoffset').on('click', (event)=>{
            $('#sobjectsearchoffset').attr('disabled', true);
            this.queryMore().then(()=>{
                $('#sobjectsearchoffset').removeAttr('disabled');
            });
        })

        $('#refreshSObjectSearch').on('click', (event)=>{
            this.fieldCondition = {};
            $('.field-value-filter .c-item').each((index, elem)=>{
                let field = $(elem).find('select.fieldname').val();
                field = field || $(elem).find('input.fieldname').val();

                let option = $(elem).find('select.fieldoption').val();

                let value = $(elem).find('input.fieldvalue').val()||$(elem).find('select.fieldvalue').val();
                if (!value){
                    value =  $(elem).find('input.fieldvalue').is(':checked');
                    value = value && (value+'');
                }
                if (value){
                    value = value.trim();
                    let options = ['<=','>=','=','<>','<','>','like','in','not in'];
                    for (let opt of options){
                        if (value.startsWith(opt)){
                            option = opt;
                            value = value.substr(opt.length).trim();
                            break;
                        }
                    }
                }
                if (value && field){
                    this.fieldCondition[field]=value.trim();
                    this.fieldCondition[field+'.option'] = option;
                }
            })
            this.doUpdaate();
        })


        $('button.copysoql').on('click', (event)=>{
            this.tree.Tools.copyToClipboard(this.querySoql || '');
        })

        let autoComplete1 = new AutoComplete1('sobjectsearch2',()=>{
            return this.tree.allSObjectApi.map(e=>{return e.global});
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
                    let match = reg.exec(item.name) || reg.exec(item.label)
                    if(match){
                        let m = {...item};
                        m.__index = match.index;
                        matchItems.push(m);
                    }
                }
                matchItems.sort((a, b)=>{return a.__index - b.__index})
                return matchItems;
            }
        })
        autoComplete1.createApi();

        
        let autoComplete2 = new AutoComplete1('uuid1',()=>{
            let sobjectDescribe = this.sobjectDescribe;
            let fieldNames = sobjectDescribe?.fields;
            return fieldNames||[];
        });
        autoComplete2.setItemProvider({
            value:(item)=>{
                return item.name;
            },
            label:(item, defval)=>{
                let queryable = item.queryable;
                if (!queryable){
                    return `<span style="">${defval}</span> `;
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
        autoComplete2.createApi();

        let autoCompleten = new AutoComplete1('.c-item>input.fieldname',()=>{
            let sobjectDescribe = this.sobjectDescribe;
            let fieldNames = sobjectDescribe?.fields;
            return fieldNames||[];
        });
        autoCompleten.setItemProvider({
            value:(item)=>{
                return item.name;
            },
            label:(item, defval)=>{
                let queryable = item.queryable;
                if (!queryable){
                    return `<span style="">${defval}</span> `;
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
        autoCompleten.createApi2();

        let autoCompleten2 = new AutoComplete1('.c-item.inputonly input.fieldvalue',()=>{
            if (!autoCompleten.currentFocus){
                return;
            }
            let selectField = $(autoCompleten.currentFocus).val();
            if (!selectField){
                return [];
            }
            let sobjectDescribe = this.sobjectDescribe;
            let fieldObj = sobjectDescribe?.fields?.find(e=>e.name == selectField);
            return fieldObj?.picklistValues || [];
        });
        autoCompleten2.setItemProvider({
            value:(item)=>{
                return item.value;
            },
            label:(item, defval)=>{
                let queryable = item.queryable;
                if (!queryable){
                    return `<span style="">${defval}</span> `;
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
                    if(reg.test(item.value) || reg.test(item.label)){
                        matchItems.push(item);
                    }
                }
                return matchItems;
            }
        })
        autoCompleten2.createApi2();

        

        let autoComplete3 = new AutoComplete1('uuid2',()=>{
            let selectField = $('#uuid1').val();
            if (!selectField){
                return [];
            }
            let sobjectDescribe = this.sobjectDescribe;
            let fieldObj = sobjectDescribe?.fields?.find(e=>e.name == selectField);
            return fieldObj?.picklistValues || [];
        });
        autoComplete3.setItemProvider({
            value:(item)=>{
                return item.value;
            },
            label:(item, defval)=>{
                let queryable = item.queryable;
                if (!queryable){
                    return `<span style="">${defval}</span> `;
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
                    if(reg.test(item.value) || reg.test(item.label)){
                        matchItems.push(item);
                    }
                }
                return matchItems;
            }
        })
        autoComplete3.createApi();

        this.createTableLisenter();
      }

    createTableLisenter(){
        $('#showallsobjectdatatable').on('click', 'tbody>tr', (event)=>{
            $('#showallsobjectdatatable tbody>tr').removeClass('selected');
            $(event.currentTarget).addClass('selected');
        })
    }

    formatDate(inputDate, format){
        return Tools.formatDate(inputDate, format);
    }
}

