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
    }
    render(){
        return `
            <div>${this.message}</dov>
            <table id="datatable">
                <thead>
                    <tr>
                        ${this.showFields.concat(this.showRelatedFields).map(e=>{
                            return `<th class="field-${e.name}" tabindex="0">${e.label||e.name}
                                <button class="actions-button" name="${e.name}">
                                    <svg class="actions-icon">
                                        <use xlink:href="symbols.svg#${this.sortField[e.name]?.asc?'arrowdown':'arrowup'}"></use>
                                    </svg>
                                </button>
                            </th>`
                        }).join('')}
                        <th class="field-action" tabindex="0">Show In Tree<input name="${this.sobject}.field.all" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                    </tr>
                </thead>
                <tbody>
                    ${this.records.map(r=>{
                        return `
                <tr class="${this.sobjectname}" title="${this.sobjectDescribe.label}" name="${this.sobjectname}">

                ${this.showFields.concat(this.showRelatedFields).map(e=>{
                    return `<td class="field-${e.name}" tabindex="0" title="${e.name}">${this.valuetostring(r, e.name, e)}</td>`
                }).join('')}
                    <td class="field-value" tabindex="0">
                    </td>
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
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

    get sobjectDescribe(){
         let dataMap = this.tree.dataMap[this.sobjectname];
         return dataMap.sobjectDescribe;
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
                    return 0;
                }
                if (b.name == 'Id'){
                    return 1;
                }
                if (a.nameField){
                    return 0;
                }
                if (b.nameField){
                    return 0;
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

        $('#showallsobjectdata .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize!=0 &&this.totalSize == 100){
            $('#sobjectsearchoffset').show();
        }else{
            $('#sobjectsearchoffset').hide();
        }

        $('#datatable').on('click', '.actions-button', (event)=>{
            let fieldName = $(event.currentTarget).attr('name');
            this.sort(fieldName);
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

        if (this.totalSize == 100){
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
        }

        let htmlId = 'showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
        }

        $('#showallsobjectdata .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize == 100 || (this.lastResult && !this.lastResult.done)){
            $('#sobjectsearchoffset').show();
        }else{
            $('#sobjectsearchoffset').hide();
        }

        $('#datatable').on('click', '.actions-button', (event)=>{
            let fieldName = $(event.currentTarget).attr('name');
            this.sort(fieldName);
        })
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

        let result = await this.tree.getRecordsByFields(this.sobjectname, this.showFields, 100, this.fieldCondition, selected);
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

    createHead(){
        let treeroot = document.getElementById('showallsobjectdata');
        let searchAear = `
        <p>
            Object Search:
            <input class="search" id="sobjectsearch2" type="input" value="Order" autocomplete="off" style="width:80%"></input>
            <button class="tablinks" name="updateSelectObject" id="refreshSObjectSearch">Refersh</button>
        </p>
        <p>
            <div style="padding:10px">Include:<input class="search" id="objectsearchinput" type="input" value="" style="width:50%;line-height:1.5rem"></input></div>
            <div style="padding:10px">Exclude:<input class="search" id="excludeobjectsearchinput" type="input" value="" style="width:50%;line-height:1.5rem"></input></div>
            <div id="searchFilter"></div>
            Fields Value: <input class="search" id="fieldvalyuesearch1" type="input" value=""></input>
            <button class="search" id="sobjectsearchoffset" type="input" value="">More</button>
            <button class="search" id="sobjectmorecondition" type="input" value="">More Condition</button>
            <div class="field-value-filter">
                <div class="c-item">
                    <input type="input" value="Id" id="uuid1" class="fieldname"></input><input class="fieldvalue" type="input" value=""></input><button class="btn-delete">-</button>
                </div>
                <button class="search btn-add">Add</button>
            </div>
        </p>
        <div class="searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="notificationmessage3"></div>
            <div class="totalbar" id="fieldShowFilterContainer"></div>
            <div class="totalbar" id="relationShowFilterContainer"></div>

            <div class="objsearchresult"></div>
            <div class="detailearchresult"></div>
            <div id="showallsobjectdatatable"></div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            $('#sobjectsearchoffset').hide();
            this.initObjectAllDataHead();
            this.addFieldFilter('#fieldShowFilterContainer');
            this.addRelationFieldFilter('#relationShowFilterContainer');
            this.addSearchFiler('#searchFilter');
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

        $('#sobjectsearch2').on('change', (event)=>{
            let tableName = $(event.target).val();
            this.setSobjectname(tableName);
        })

        $('.field-value-filter .btn-add').on('click', (event)=>{
            let sobjectDescribe = this.sobjectDescribe;
            let uuid = this.tree.getUuid();

            let fieldNames = sobjectDescribe.fields.map(e =>e.name);
            fieldNames.sort();
            let allSelections = fieldNames.map(e=>`<option value="${e}">${e}</option>`)
            $(`<div class="c-item">
            <select id="${uuid}" class="fieldname">
                <option value="">Please select object</option>
                ${allSelections}
            </select>
            <span class="fieldvalue-container"><input class="fieldvalue" type="input" value=""></input></span>
            <button class="btn-delete">-</button></div>`).insertBefore( $( event.target));

            //new AutoComplete1(uuid,sobjectDescribe.fields.map(e=>e.name)).createApi();
        })

        $('.field-value-filter').on('change', '.c-item select.fieldname',(event)=>{
            let selectVal = $(event.currentTarget).val();
            let seelctField = this.sobjectDescribe.fields.find(e =>e.name==selectVal);
            if (seelctField){
                let valueHtml = '<input class="fieldvalue" type="input" value=""></input>';
                if (seelctField.type == 'reference'){

                }else if (seelctField.type == 'boolean'){
                    let allSelections = seelctField.picklistValues.filter(e=>e.active).map(e=>`<option value="${e.value}">${e.label}</option>`)
                    valueHtml = `<input class="fieldvalue" type="checkbox" value=""></input>`
                }
                else if (seelctField.type == 'date'){
                    valueHtml = `<input class="fieldvalue" type="date" value=""></input>`;
                }else if (seelctField.type == 'picklist'){
                    let allSelections = seelctField.picklistValues.filter(e=>e.active).map(e=>`<option value="${e.value}">${e.label}</option>`)
                    valueHtml = `<select class="fieldvalue">
                        <option value="">Please select object</option>
                        ${allSelections}
                    </select>`
                    
                }else if (seelctField.type == 'textarea'){
                    
                }else if (seelctField.type == 'double'){
                    valueHtml = `<input class="fieldvalue" type="number" value=""></input>`;
                }else if (seelctField.type == 'datetime'){
                    valueHtml = `<input class="fieldvalue" type="date" value=""></input>`;
                }else if (seelctField.type == 'percent'){
                    
                }else {
                    valueHtml = '<input class="fieldvalue" type="input" value=""></input>';
                }
                $(event.currentTarget).siblings('.fieldvalue-container').html(valueHtml);
            }
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
                let value = $(elem).find('input.fieldvalue').val()||$(elem).find('select.fieldvalue').val();
                if (!value){
                    value =  $(elem).find('input.fieldvalue').is(':checked');
                    value = value && (value+'');
                }
                if (value && field){
                    this.fieldCondition[field]=value.trim();
                }
            })
            this.doUpdaate();
        })

        $('#objectsearchinput').on('keypress', (event)=>{
            if (event.keyCode==13){
                let searchKey = $(event.target).val();
                this.recordCondition.include = searchKey;
                this.filterRecords();
            }
        })

        $('#excludeobjectsearchinput').on('keypress', (event)=>{
            if (event.keyCode==13){
                let searchKey = $(event.target).val();
                this.recordCondition.exclude = searchKey;
                this.filterRecords();
            }
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
}
