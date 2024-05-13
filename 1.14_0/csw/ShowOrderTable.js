import {RenderTable} from "./RenderTable.js";
import {AutoComplete1} from "./AutoComplete1.js";
import {PopupRelationMenu} from "./PopupRelationMenu.js";
import {Tools} from "./Tools.js";
export class ShowOrderTable{
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

    createHead(){
        let treeroot = document.getElementById('showorderinfo');
        let searchAear = `
        <p>
            Object Search:
            <input class="search feedback-input no-border" readonly id="ordersearch" type="input" value="Order" autocomplete="off" style="width:80%"></input>
            <button class="tablinks comp-btn" name="updateSelectObject" id="showOrderSearch">Refersh</button>
        </p>
        <p>
            ID / Ordderr Number/Order Number: <input class="search feedback-input" id="orderIdInput" type="input" value=""></input>
            <input class="search feedback-input hide" id="ordernumberInput" type="input" value=""></input>
            <input class="search feedback-input hide" id="ordernameInput" type="input" value=""></input>
        </p>
        <div class="showordersearchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="showordernotificationmessage"></div>

            <div class="objsearchresult"></div>
            <div class="detailearchresult"></div>
            <div id="showordertable"></div>
            <div id="showorderrealtionshiptable" class="csw-display-flex"></div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            $('#sobjectsearchoffset').hide();
            this.addEvents();
            this.mainTable = new RenderTable($('#showordertable'));
            this.mainTable.update();
    }

    addEvents(){

        $('#showOrderSearch').on('click', async ()=> {
            let sobjectname = $('#ordersearch').val();
            let id = $('#orderIdInput').val().trim();
            let ordernumber = $('#ordernumberInput').val().trim();
            let ordername = $('#ordernameInput').val().trim();
            if (id){
                if (/^\d{8}|$\d{10}/.test(id)){
                    ordernumber = id;
                    id='';
                }else if (/^\w{4}\d{8}$/ig.test(id)){
                    ordername = id;
                    id='';
                }else if (!/^[\w\d]{15,18}$/.test(id)){
                    alert('invalid input');
                    return;
                }
            }else {
                if (!(ordernumber || ordername)){
                    alert('invalid input');
                    return;
                }
            }
            
            if (ordernumber || ordername){
                $('#ordersearch').val('Order');
                sobjectname = 'Order';
            }
            else{
                ordernumber='';
                ordername='';
                sobjectname = await  this.tree.getSObjectNameById(id);
                $('#ordersearch').val(sobjectname);
            }
            await this.setSObjectName(sobjectname);
            this.updateMainObj(id, ordernumber, ordername);
        })

        $('.showordersearchresult').on('click','.sobject-link',(event)=>{
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

    async updateMainObj(id, ordernumber, ordername){

        if (this.sobjectName && (id || (this.sobjectName=='Order' && (ordernumber|| ordername)))){
            for(let t of this.relationshipTable){
                $('#'+t.id).remove();
            }
            $('.showordersearchresult [id].field-check').each((i, j)=>{
                $(j).remove();
            })
            this.records = [];

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

            let input = {Id:id};
            if (this.sobjectName=='Order'){
                input.OrderNumber = ordernumber;
                input.Name = ordername;
            }

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

            let result = await this.tree.getRecordsByFields(this.sobjectName, showFields, 0, input, selected);
            this.mainTable.dataList = result.results ||[];
            this.records.push(...this.mainTable.dataList);
            this.mainTable.description = `<h1>${sobjectDescribe.name}</h1>`;
            this.mainTable.update();
            //  ***********************************
            if (this.mainTable.dataList.length>0){
                id = this.mainTable.dataList[0].Id;
            }
            if (!id){
                return;
            }

            await this.createReferencedTables(sobjectDescribe, id, this.mainTable.dataList[0]);
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
        }

        for (let relatinoship of relatinoshipRows2){
            await this.createRenderTable(relatinoship.childSObject, relatinoship.field, relatinoship.value);
        }
        for (let relatinoship of relatinoshipRows){
            await this.createRenderTable(relatinoship.childSObject, relatinoship.field, id);
        }
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

        let rTable = new RenderTable($('#'+childId));
        this.relationshipTable.push(rTable);
        rTable.description = `<h1>${sobject} - ${field}</h1>`;
        let q = {};
        q[field] = value;
        rTable.query = q;
        rTable.sobject = sobject;
        rTable.fieldFilterUI = fieldFilterUI.uuid;

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
            return {label:e.label, property:e.name, isLink:!!e.relationshipName, target:subsobjectDescribe.name+'.'+e.relationshipName};
        });

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

        this.records.push(...rTable.dataList);

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

}