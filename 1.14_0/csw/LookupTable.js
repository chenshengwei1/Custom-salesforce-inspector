import {RenderTable} from "./RenderTable.js";
import {AutoComplete1} from "./AutoComplete1.js";
import {PopupRelationMenu} from "./PopupRelationMenu.js";
import {Tools} from "./Tools.js";
export class LookupTable{
    constructor(tree){
        this.tree = tree;
        this.relationshipObjectNames = [];
        this.sobjectName;
        this.sobjectDescribes = {};
        this.mainTable;
        this.relationshipTable = [];
        this.records = [];
    }

    async setSObjectName(sobjectname){
        if (!sobjectname){
            return;
        }
        sobjectname = this.tree.allSObjectApi.map(e=>e.global.name).find(e => e.toLocaleLowerCase() == sobjectname.toLocaleLowerCase());
        if (!sobjectname){
            return;
        }

        this.sobjectName = sobjectname;

        let sobjectDescribe = await this.tree.getDescribeSobject(sobjectname);
        this.sobjectDescribes[sobjectname] = sobjectDescribe;
       
    }

    addFieldFilter(container, sobjectname){
        let uuid = Tools.getUuid();
        let str = `<div class="field-filter">
            <div class="pop-menu-container">
                <div class="dropdown actions-button1" 
                style="display: inline-flex;">
                    <span class="">Field Show: </span>
                </div>
                <label for="cars" class="hide">Field Show: </label>
                <button class="actions-button hide">
                    <svg class="actions-icon">
                        <use xlink:href="symbols.svg#down"></use>
                    </svg>
                </button>
                <div class="pop-menu">
                    <span class="relationship"><input type="checkbox"></input>All field metadata</span>
                </div>
            </div>
        </div>`;
        $(container).append(`<div id="${uuid}" class="field-check">${str}</div>`);

        $('#'+uuid + ' .field-filter .pop-menu').hide();

        
        $('#'+uuid + ' .field-filter .actions-button1').on('click', (event)=>{
            if ($(event.currentTarget).siblings(".pop-menu").css("display")=='none'){
                let allChecked = Tools.getAllChecked();
                let checkFields = Object.keys(allChecked).filter(element => {
                    return element.indexOf(sobjectname+'.')==0&&allChecked[element];
                });
                let sobjectDescribe = this.sobjectDescribes[sobjectname];
                $(event.currentTarget).siblings(".pop-menu").html(sobjectDescribe.fields.sort((a, b)=>{
                    return (a.name||'').localeCompare(b.name||'');
                }).map(t=>{
                    let ischeck = checkFields.indexOf(sobjectDescribe.name+'.'+t.name)>-1 || t.name=='Id' || t.nameField;
                    let isDisabled = t.name=='Id'|| t.nameField;
                    return `<li class="pop-menu-item" name="${t.name}"><input type="checkbox"  ${ischeck?'checked':''} ${isDisabled?'disabled':''}></input>${t.name}</li>`;
                }).join(''))

                $(event.currentTarget).siblings(".pop-menu").show();
            }else{
                $(event.currentTarget).siblings(".pop-menu").hide();
                let rTable = this.relationshipTable.find(e=>{
                    return e.sobject == sobjectname;
                });
                if (!rTable){
                    return;
                }
                this.doUpdaateTable(rTable);
            }
        });

        $('#'+uuid + ' .field-filter').on('click','.pop-menu-item',(event)=>{
            let attr = $(event.currentTarget).attr('name');
            if ($(event.currentTarget).find('input').is(':checked')){
                Tools.storageFieldCheck(sobjectname, attr, true);
            }else{
                Tools.storageFieldCheck(sobjectname, attr, false);
            }

        })
    }

    addRelationFieldFilter(container, sobjectname){
       return new PopupRelationMenu({container,
            open:()=>{
                let sobjectDescribe = this.sobjectDescribes[sobjectname];
                let disabledItems = sobjectDescribe.fields.filter(e=>{
                    return e.name=='Id'|| e.nameField
                }).map(e=>{
                    return sobjectDescribe.name+'.'+e.name
                });
                
                let allChecked = Tools.getAllChecked();
                let selected = Object.keys(allChecked).filter(element => {
                    return element.indexOf(sobjectname+'.')==0&&allChecked[element];
                });
                return {
                    disabledItems,
                    selected
                }
            },
            close:(checked, unchecked)=>{

                for(let attr of checked){
                    Tools.storageFieldCheck(sobjectname, attr.replace(sobjectname+'.',''), true); 
                }
                for(let attr of unchecked){
                    Tools.storageFieldCheck(sobjectname, attr.replace(sobjectname+'.',''), false);
                }

                let rTable = this.relationshipTable.find(e=>{
                    return e.sobject == sobjectname;
                });
                if (!rTable){
                    return;
                }
                this.doUpdaateTable(rTable);
            },
            sobject:sobjectname,
            tree:this.tree});
    }

    createHead(rootId){
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <p>
            Object Search:
            <input class="search feedback-input no-border" readonly id="lookuptable_ordersearch" type="input" value="Account" autocomplete="off" style="width:80%"></input>
            <button class="tablinks comp-btn" name="updateSelectObject" id="lookuptable_showOrderSearch">Refersh</button>
        </p>
        <p>
            ID / Ordderr Number/Order Number: <input class="search feedback-input" id="lookuptable_orderIdInput" type="input" value=""></input>
        </p>
        <div class="showordersearchresult" id="lookuptable_result">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="lookuptable_showordernotificationmessage"></div>

            <div class="objsearchresult"></div>
            <div class="detailearchresult"></div>
            <div id="lookuptable_showordertable"></div>
            <div id="lookuptable_showorderrealtionshiptable" class="csw-display-flex"></div>
            <div id="lookuptable_showorder-additional" style="white-space: pre;"></div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.addEvents();
            this.mainTable = new LookupRenderTable($('#lookuptable_showordertable'));
            this.mainTable.update();
    }

    addEvents(){

        $('#lookuptable_showOrderSearch').on('click', async ()=> {
            let sobjectname = $('#lookuptable_ordersearch').val();
            let id = $('#lookuptable_orderIdInput').val().trim();

            let records = await this.tree.retrieve('select Id, Name from '+sobjectname+' limit 100');
            
            await this.setSObjectName(sobjectname);
            this.updateMainObj(records);
        })

        $('#lookuptable_result.showordersearchresult').on('click','.sobject-link',(event)=>{
            let target = $(event.target).attr('target');
            let targetId = $(event.target).attr('value');
            let originalField = $(event.target).attr('name');
            this.linkToTarget(target, targetId, originalField);
        })

        let autoComplete1 = new AutoComplete1('ordersearch',()=>{
            return this.tree.allSObjectApi.map(e=>{return e.global.name});
        });
        autoComplete1.createApi();
    }

    async updateObjectById(recordId){
        let {objectTypes} = await this.tree.getSObjectNameById(recordId);
        
        return objectTypes[0];
    }

    async targetObject(recordId){
        return await this.updateObjectById(recordId);
    }

    async updateMainObj(mainRecords){

        if (this.sobjectName && (mainRecords && mainRecords.length)){
            for(let t of this.relationshipTable){
                $('#'+t.id).remove();
            }
            $('.showordersearchresult [id].field-check').each((i, j)=>{
                $(j).remove();
            })

            let sobjectDescribe = this.sobjectDescribes[this.sobjectName];

            let allChecked = this.tree.getAllChecked();
            let checkFields = Object.keys(allChecked).filter(element => {
                return element.indexOf(sobjectDescribe.name+'.')==0&&allChecked[element];
            });

            let showFields = sobjectDescribe.fields.filter(t=>{
                return checkFields.indexOf(sobjectDescribe.name+'.'+t.name)>-1 || t.name=='Id' || t.nameField;
            })

            this.mainTable.fields = showFields.map(e=>{
                return {label:e.label, property:e.name, isLink:!!e.relationshipName, target:e.referenceTo.length == 1?e.referenceTo[0]+'.Id':'what.Id'};
            });

            let relationshipNames = sobjectDescribe.fields.filter(e=>e.relationshipName).map(e=>e.relationshipName);
            let selected = Object.keys(allChecked).filter(element => {
                return element.indexOf(sobjectDescribe.name+'.')==0&&allChecked[element] && element.indexOf('undefined')==-1;
            }).map(e=>{
                return e.replace(sobjectDescribe.name+'.','')
            }).filter(e=>{
                let s = e.split('.');
                return s.length>1 && relationshipNames.indexOf(s[0]) != -1;
            });

            this.mainTable.showRelatedFields = selected.map(e=>{
                return {name:e,label:e, property:e}
            });

            this.mainTable.dataList = mainRecords;
            this.mainTable.description = `<h1>${sobjectDescribe.name}</h1>`;
            this.mainTable.update();
            //  ***********************************

            //await this.createReferencedTables(sobjectDescribe, id, this.mainTable.dataList[0]);
        }
    }

    async createReferencedTables(sobjectDescribe, id, sobjectRecord){
        let pronityMap = {
            Order:['vlocity_cmt__SupersededOrder__r','OrderItems','Com_Order_Item_Details__r','vlocity_cmt__OrderPriceAdjustments__r','Com_Order_Payments__r']
        }

        let allChecked = this.tree.getAllChecked();
        let checkFields = Object.keys(allChecked).filter(element => {
            return element.indexOf(sobjectDescribe.name+'.')==0&&allChecked[element];
        });

        let relatinoshipRows = sobjectDescribe.childRelationships.filter(e=>{
            return checkFields.indexOf(sobjectDescribe.name+'.'+e.childSObject+'.'+e.field)>-1;
        }).map(t=>{
            let {childSObject,field, relationshipName}=t;
            return {childSObject,field, relationshipName};
        }).sort((a, b)=>{
            if (pronityMap[sobjectDescribe.name]){
                let arry = pronityMap[sobjectDescribe.name];
                let aIndex = arry.indexOf(a.relationshipName) == -1?1000:arry.indexOf(a.relationshipName);
                let bIndex = arry.indexOf(b.relationshipName) == -1?1000:arry.indexOf(b.relationshipName);
                return aIndex - bIndex;
            }
            return 0;
        })
        if (!sobjectRecord){
            let clickObject = '';
            let result = await this.tree.getSObjectById(id);
            for (let objectType of result.objectTypes){
                clickObject = objectType;
                break;
            }
            return
        }

        /**
         * other reference
         */
        let relatinoshipRows2 = [];
        if (sobjectDescribe.name == 'Com_Change_Request__c'){

            // field whatId
            let whatId = sobjectRecord.What_Id__c;
            if (whatId){
                let clickObject = '';
                let result = await this.tree.getSObjectById(whatId);
                for (let objectType of result.objectTypes){
                    clickObject = objectType;
                    break;
                }
                if (clickObject){
                    relatinoshipRows2.push({childSObject:clickObject, field:'Id', value:whatId});
                }
            }

            // field Detail__c => order.Legacy_Order_Number__c
            let detail = sobjectRecord.Detail__c;
            if (detail){
                let detailJson = {};
                try{
                    detailJson = JSON.parse(detail);
                }catch(e){}
                if (detailJson.referenceOrderNumber){
                    relatinoshipRows2.push({childSObject:'Order', field:'Legacy_Order_Number__c', value:detailJson.referenceOrderNumber});
                }
            }

                
        }

        for (let relatinoship of relatinoshipRows2){
            await this.createRenderTable(relatinoship.childSObject, relatinoship.field, relatinoship.value);
        }
        for (let relatinoship of relatinoshipRows){
            await this.createRenderTable(relatinoship.childSObject, relatinoship.field, id);
        }

        this.updateCRAdditinonal(id);
    }

    async createRelatedByValue(whatId){
        if (!whatId){
            return null;
        }
        let whatObject = await this.targetObject(whatId);
        return whatObject;
    }

    createSubBlock(parentDiv){
        let subId = Tools.getUuid();

        let subs = $(parentDiv).children(':not(.record-empty):last');
        if (subs.length == 0){
            let sub1s = $(parentDiv).children('.record-empty:first');
            if (sub1s.length == 0){
                $(parentDiv).append(`<div id="${subId}" class="sub-block"></div>`);
            }else{
                sub1s.before(`<div id="${subId}" class="sub-block"></div>`);
            }
        }else{
            subs.after(`<div id="${subId}" class="sub-block"></div>`);
        }


        return subId;
    }

    async createRenderTable(sobject, field, value, includeReference){

        for(let record of this.records){
            if (record[field] == value && value){
                //return;
            }
        }

        //this.addFieldFilter($('#showorderrealtionshiptable'), sobject);
        let childId = this.createSubBlock($('#showorderrealtionshiptable'));
        let fieldFilterUI = this.addRelationFieldFilter($('#'+childId), sobject);

        let rTable = new LookupRenderTable($('#'+childId));
        this.relationshipTable.push(rTable);
        rTable.description = `<h1>${sobject} - ${field}</h1>`;
        let q = {};
        q[field] = value;
        rTable.query = q;
        rTable.sobject = sobject;
        rTable.fieldFilterUI = fieldFilterUI.uuid;

        rTable.reload(()=>{
            this.doUpdaateTable(rTable);
        })

        let sobjectDescribe = await this.tree.getDescribeSobject(sobject);
        this.sobjectDescribes[sobject] = sobjectDescribe;

        await this.doUpdaateTable(rTable);

        if (includeReference){
            if (rTable.dataList && rTable.dataList.length==1){
                await this.createReferencedTables(sobjectDescribe, rTable.dataList[0].Id, rTable.dataList[0]);
            }
        }
    }

    async doUpdaateTable(rTable){
        let sobjectname = rTable.sobject;
        let allChecked = this.tree.getAllChecked();

        let subsobjectDescribe = await this.tree.getDescribeSobject(sobjectname);

        let checkFields = Object.keys(allChecked).filter(element => {
            return element.indexOf(subsobjectDescribe.name+'.')==0&&allChecked[element];
        });

        let showFields = subsobjectDescribe.fields.filter(t=>{
            return checkFields.indexOf(subsobjectDescribe.name+'.'+t.name)>-1 || t.name=='Id' || t.nameField;
        })

        rTable.fields = showFields.map(e=>{
            return {label:e.label, property:e.name, isLink:!!e.relationshipName, target:subsobjectDescribe.name+'.'+e.relationshipName, nameField:e.nameField};
        });

        let IdIndex = -1;
        for (let i = 0;i<rTable.fields.length;i++){
            if(rTable.fields[i].property == 'Id'){
                IdIndex = i;
                break
            }
        }
        if (IdIndex != -1 && IdIndex != 0){
            let temp = rTable.fields[0];
            rTable.fields[0] = rTable.fields[IdIndex];
            rTable.fields[IdIndex] = temp;
        }


        let relationshipNames = subsobjectDescribe.fields.filter(e=>e.relationshipName).map(e=>e.relationshipName);
        let selected = Object.keys(allChecked).filter(element => {
            return element.indexOf(subsobjectDescribe.name+'.')==0&&allChecked[element] && element.indexOf('undefined')==-1;
        }).map(e=>{
            return e.replace(subsobjectDescribe.name+'.','')
        }).filter(e=>{
            let s = e.split('.');
            return s.length>1 && relationshipNames.indexOf(s[0]) != -1;
        });

        rTable.showRelatedFields = selected.map(e=>{
            return {name:e,label:e,property:e}
        });

        let result = await this.tree.getRecordsByFields(subsobjectDescribe.name, showFields, 0, rTable.query, selected);
        rTable.dataList = result.results ||[];

        //this.records.push(...rTable.dataList);

        if (rTable.dataList?.length  && rTable.dataList[0].CreatedDate){
            rTable.dataList = rTable.dataList.sort((a, b)=>{
                return a.CreatedDate.localeCompare(b.CreatedDate);
            })
        }
        if (rTable.fieldFilterUI  && rTable.dataList?.length==0){
            
            $('#'+rTable.fieldFilterUI).hide();
        }
        rTable.update();
    }

    async linkToTarget(target, targetId, originalField){
        let clickId = targetId;
        
        let rt = this.relationshipTable.find(e=>{
            return e.sobjectId == clickId;
        })
        if (rt && targetId){
            await this.createRenderTable(target.split('.')[0], 'Id', clickId, true);
            return;
        }else if (targetId){
            let clickObject = '';
            let result = await this.tree.getSObjectById(targetId);
            for (let objectType of result.objectTypes){
                clickObject = objectType;
                break;
            }
    
            if (clickObject){
                await this.createRenderTable(clickObject, 'Id', clickId, true);
            }else{
                alert('unknow object id: '+targetId);
            }
        }

    }

    updateCRAdditinonal(cr){
        let crObj = this.records.find(e=>e.Id == cr);
        if (crObj && crObj.Detail__c){
            let payload = JSON.parse(crObj.Detail__c);
            if (crObj.Additional_Information__c){
                payload.customerDetails=JSON.parse(crObj.Additional_Information__c);
            }
            if(crObj.Target_Object__c=='Cart' && crObj.What_Id__c){
                let cart = this.records.find(e=>e.Id == crObj.What_Id__c);
                if (cart && cart.Cart_Items__c){
                    payload.items=JSON.parse(cart.Cart_Items__c);
                }
            }
            
            $('#showorder-additional').html(JSON.stringify(payload, '', '\t'));
        }
    }
}


class LookupRenderTable{
    constructor(container){
        this.headers = [];
        this.fields = [];
        this.dataList = [];
        this.showRelatedFields = [];
        this.id = Tools.getUuid();
        this.sortField={};
        this.description = '';
        this.container = container;
        $(container).append(`<table id="${this.id}" class="table"><thead><tr  class="row"><th>Loading table datas</th></thead></tr></table>`);
        this.sortable = false;
        this.showingMore = false;
        this.bindingEvent = false;
        this.defaulShow = true;
        this.defaultShowRecords = 20;

        this.actions = [{label:'reload'}]
    }

    update(){
        $('#'+this.id).html(this.create());
        if (!this.dataList.length){
            $(this.container).addClass('record-empty');
        }

        if (!this.bindingEvent){
            $('#'+this.id).on('click','.show_hide_btn', (event)=>{
                let body = $('#'+this.id).find('tbody');
                let header = $('#'+this.id).find('thead tr:nth-child(2)');
                if (body.is('.hide')){
                    $(event.target).text('Hide');
                    body.removeClass('hide');
                    header.removeClass('hide');
                }else{
                    $(event.target).text('Show');
                    body.addClass('hide');
                    header.addClass('hide');
                }
            })

            $('#'+this.id).on('click','button.show_more_btn', (event)=>{
                this.showMore();
                this.update();
            })

            $('#'+this.id).on('click','button', (event)=>{
                let buttonName = $(event.target).attr('name');
                if (buttonName == 'reload'){
                    this.reload_fn && this.reload_fn(this);
                }
            })
            this.bindingEvent = true;
        }
    }

    reload(fn){
        this.reload_fn = fn;
    }

    displayShowMore(){
        return this.dataList.length > 100 && this.showingMore == false;
    }

    showMore(){
        this.showingMore = true;
    }

    create(){
        if (!this.dataList.length){
            return `<div>${this.description}</div><div>No Data</div>`;
        }

        let theDataToShowList = this.displayShowMore()?this.dataList.slice(0, Math.min(100, this.dataList.length)):this.dataList;
        this.defaulShow = true;
        let actionBtn = this.actions.map(e =>{
            return `<button class="${e.label}_btn btn" name="${e.label}">${e.label}</button>`;
        })
        return `<thead>
                    <tr  class="row header"><th class="cell" colspan="${this.fields.length+this.showRelatedFields.length}">${this.description}(${this.dataList.length})${this.displayShowMore()?'<button class="show_more_btn hide_table">Show More</button>':''} ${actionBtn} <button class="show_hide_btn hide_table">${this.defaulShow?'Hide':'Show'}</button></th></tr>
                    <tr  class="row blue ${this.defaulShow?'':'hide'}">
                        <th class="cell head-action" tabindex="0"></th>
                        ${this.fields.concat(this.showRelatedFields).map(e=>{
                            return `<th class="cell field-${e.label}" tabindex="0">${e.label}
                                <button class="actions-button" name="${e.label}" title="${e.property}" style="${this.sortable?'':'display:none'}">
                                    <svg class="actions-icon">
                                        <use xlink:href="symbols.svg#${this.sortField[e.label]?.asc?'arrowdown':'arrowup'}"></use>
                                    </svg>
                                </button>
                            </th>`
                        }).join('')}
                    </tr>
                </thead>
                <tbody class="${this.defaulShow?'':'hide'}">
                    ${theDataToShowList.map(r=>{
                        return `
                <tr class="row ${r.Name}" title="${r.Id}" >
                    <td class="cell field-Action" title="Action" tabindex="0" rowspan="2"><button class="show_more_btn">Show More</button></td>
                    <td class="cell field-Id" title="Id" tabindex="0" rowspan="2">${r.Id}</td>
                    
                ${this.fields.concat(this.showRelatedFields).filter(e=>e.property!='Id').map(e=>{
                    let value = this.valuetostring(r, e.property, '');
                    return `<td class="cell field-${e.property}" title="${e.property}" tabindex="0">${value} ${this.translationToLink(r, e)}</td>`
                }).join('')}
                    
                </tr>
                <tr class="row ${r.Name}" title="${r.Id}"><td class="cell field-Id" title="Id" tabindex="0" colspan="${this.fields.length+this.showRelatedFields.length}-1">
                    <div class="lookup-record-block ${r.Id}" id="">${this.recordBlock(r)}</div>
                </td></tr>
                `
                    }).join('')}
                </tbody>`
    }

    recordBlock(r){
        let html = '';
        let relateds = r.relatedRecords || [];
        for (let relatedObject of relateds){
            html+= this.createRecordUI(relatedObject);
        }
        return html;
    }

    createRecordUI(r){
        let keys = Object.keys(r);

        return `<thead>
            <tr  class="row blue">
                <th class="cell head-action" tabindex="0"></th>
                ${this.fields.concat(this.showRelatedFields).map(e=>{
                    return `<th class="cell field-${e.label}" tabindex="0">${e.label}
                        <button class="actions-button" name="${e.label}" title="${e.property}" style="${this.sortable?'':'display:none'}">
                            <svg class="actions-icon">
                                <use xlink:href="symbols.svg#${this.sortField[e.label]?.asc?'arrowdown':'arrowup'}"></use>
                            </svg>
                        </button>
                    </th>`
                }).join('')}
            </tr>
        </thead>
        <tbody class="${this.defaulShow?'':'hide'}">
            ${theDataToShowList.map(r=>{
                return `
        <tr class="row ${r.Name}" title="${r.Id}" >
            <td class="cell field-Action" title="Action" tabindex="0" rowspan="2"><button class="show_more_btn">Show More</button></td>
            <td class="cell field-Id" title="Id" tabindex="0" rowspan="2">${r.Id}</td>
            
        ${this.fields.concat(this.showRelatedFields).filter(e=>e.property!='Id').map(e=>{
            let value = this.valuetostring(r, e.property, '');
            return `<td class="cell field-${e.property}" title="${e.property}" tabindex="0">${value} ${this.translationToLink(r, e)}</td>`
        }).join('')}
            
        </tr>
        <tr class="row ${r.Name}" title="${r.Id}"><td class="cell field-Id" title="Id" tabindex="0" colspan="${this.fields.length+this.showRelatedFields.length}-1">
            <div class="lookup-record-block ${r.Id}" id="">${this.recordBlock(r)}</div>
        </td></tr>
        `
            }).join('')}
        </tbody>`
    }

    valuetostring(record, prop, attr){
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

    translationToLink(r, e){
        let val = this.valuetostring(r, e.property, '');
        if (!e.isLink ||!val){
            return '';
        }
        return `<a><span class="sobject-link" name="${e.property}" target="${e.target}" value="${val}">go</span></a>`
    }
}