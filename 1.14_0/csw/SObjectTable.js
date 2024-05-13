import {AutoComplete1} from "./AutoComplete1.js";
import {Notifiable} from "./Notifiable.js";

export class SObjectTable extends Notifiable{
    constructor(dateTree){
        super();
        this.tree = dateTree;
        this.recordId = '';
        this.fieldRows=[{
            name:'Field API Name'
        }];

        let fc = localStorage.getItem('sobject:fieldColumns');
        if (!fc){
            fc = `[{"name":"name", "label":"Field API Name"},{"name":"label"},{"name":"type"},{"name":"referenceTo"}, {"name":"relationshipName"}]`;
        }
        this.fieldColumns = JSON.parse(fc);

    }

    get sobjectDescribe(){
        let dataMap = this.tree.dataMap[this.sobject];
         return dataMap.sobjectDescribe;
    }

    set sobject(sobject){
        this.__sobject = sobject;
    }

    get sobject(){
        return this.__sobject;
    }

    addFieldColumns(name){

        this.fieldColumns.push({name});
        localStorage.setItem('sobject:fieldColumns', JSON.stringify(this.fieldColumns));
    }
    removeFieldColumns(name){
        this.fieldColumns = this.fieldColumns.filter(e=>e.name!=name);
        localStorage.setItem('sobject:fieldColumns', JSON.stringify(this.fieldColumns));
    }

    storage(key, value){
        let allchecked = this.getAllChecked();
        allchecked[key] = value;
        localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

    storageAllRelationship(value){
        let allchecked = this.getAllChecked();
        this.sobjectDescribe.childRelationships.forEach(e=>{
            allchecked[this.sobject+'.'+e.childSObject+'.'+e.field] = value;
        })
        allchecked = Object.keys(allchecked).filter(e=>allchecked[e]).map(e=>{e:true});

        localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

    storageAllFields(value){
        let allchecked = this.getAllChecked();
        this.sobjectDescribe.fields.forEach(e=>{
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
        if (value===true){
            return `<input type="checkbox" disabled checked></input>`;
        }
        if (value===false){
            return `<input type="checkbox" disabled></input>`;
        }

        if (value === undefined || value === null){
            return '<span style="color: #aaa; font-style: italic;">(Unknown)</span>';
        }
        if (value === ''){
            return '<span style="color: #aaa; font-style: italic;">(Blank)</span>';
        }
        if (typeof value ==='string'){
            return value;
        }
        if (typeof value ==='object'){
            if (value.length===0){
                return  '';
            }
            if (value.length>0 && value.join){
                return value.map(e=>`<span class="relationship">${this.rowtostring(e, attr)}</span>`).join(',');
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
        let sobjectDescribe = this.sobjectDescribe;
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
            <div class="field-filter">
                <div class="pop-menu-container">
                    <label for="cars">Field Show: </label>
                    <button class="actions-button">
                        <svg class="actions-icon">
                            <use xlink:href="symbols.svg#down"></use>
                        </svg>
                    </button>
                    <div class="pop-menu">
                        <span class="relationship"><input type="checkbox"></input>All field metadata</span>
                    </div>
                </div>
            </div>
            <div class="soql"><i>SOQL:</i><span class="soql"></span></div>
            <table id="sobjectfieldtable" class="table">
                <thead>
                    <tr class="row header">
                        <th class="field-action cell" tabindex="0">Show In Tree<input name="${this.sobject}.field.all" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                        ${this.fieldColumns.map(e=>{
                            return `<th class="field-${e.name}" tabindex="0">${e.label||e.name}</th>`
                        }).join('')}
                        <th class="field-value cell" tabindex="0">Value</th>
                        <th class="field-action cell" tabindex="0">Action</th>
                        
                    </tr>
                </thead>
                <tbody>
                    ${this.fieldRows.map(r=>{
                        return `
                <tr class=" row ${r.name}" title="${r.label}" name="${r.name}">
                    <td class="cell field-value" tabindex="0"><input name="${this.sobject}.${r.name}" class="show-in-tree check-in-${r.name}" ${r.name=='Id'?'checked disabled':''} type="checkbox"></input>
                    </td>
                ${this.fieldColumns.map(e=>{
                    return `<td class="cell field-${e.name}" tabindex="0">${this.rowtostring(r[e.name], e.name)}</td>`
                }).join('')}
                    <td class="field-value cell" tabindex="0">${this.rowtostring(this.record[r.name], r.name)}</td>
                    <td class="field-actions cell">
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
                    
                </tr>`
                    }).join('')}
                </tbody>
            </table>
            <h1>Relationship</h1>
            <table id="sobjectrelationshiptable" class="table">
                <thead>
                    <tr class="row">
                        <th class="field-action cell" tabindex="0">Show In Tree<input name="${this.sobject}.field.relationship" class="show-in-tree selectAll object-relationship" type="checkbox"></input></th>
                        ${this.relationshipColumns.map(e=>{
                            return `<th class="field-${e.name}" tabindex="0">${e.label||e.name}</th>`
                        }).join('')}
                        <th class="field-action cell" tabindex="0">Action</th>
                        
                    </tr>
                </thead>
                <tbody>
                    ${this.relatinoshipRows.map(r=>{
                        return `
                <tr class="row" title="${r.label}" name="${r.childSObject+'.'+r.field}">
                    <td class="cell field-value" tabindex="0"><input name="${this.sobject}.${r.childSObject}.${r.field}" class="show-in-tree check-in-${r.name}.${r.label}"  type="checkbox"></input>
                    </td>
                ${this.relationshipColumns.map(e=>{
                    return `<td class="cell field-${e.name}" tabindex="0">${this.rowtostring(r[e.name], e.name)}</td>`
                }).join('')}
                    <td class="cell field-actions">
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
                    
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    doUpdaate(recordId, sobject){
        if (recordId){
            this.recordId = recordId;
        }
        if (sobject){
            this.sobject = sobject;
        }
        let htmlId = 'showalldatatable';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            if (!this.sobject){
                rootdata.innerHTML = 'No data to show';
                console.log('No data to show 1');
                return;
            }
            let dataMap = this.tree.dataMap[this.sobject];
            if (!dataMap){
                rootdata.innerHTML = 'No data to show';
                console.log('No data to show 2');
                return;
            }
            this.record = dataMap.records.find(e=>{
                return e.Id == this.recordId;
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


            let defaultColumns = ['name','label','type','referenceTo'];
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

                $('.field-filter .pop-menu').hide();
                $('.field-filter .actions-button').on('click', (event)=>{
                    if ($(event.currentTarget).siblings(".pop-menu").css("display")=='none'){
                    $('.field-filter .pop-menu').html(Object.keys(sobjectDescribe.fields[0]).map(t=>{
                        let ischeck = this.fieldColumns.find(e=>{
                            return e.name==t;
                        });
                        let isDisabled = defaultColumns.find(e=>{
                            return e==t;
                        });
                        return `<li class="pop-menu-item" name="${t}"><input type="checkbox"  ${ischeck?'checked':''} ${isDisabled?'disabled':''}></input>${t}</li>`;
                    }).join(''))

                        $(event.currentTarget).siblings(".pop-menu").show();
                    }else{
                        $(event.currentTarget).siblings(".pop-menu").hide();
                        this.doUpdaate();
                    }
                });

                $('.field-filter').on('click','.pop-menu-item',(event)=>{
                    let attr = $(event.currentTarget).attr('name');
                    if ($(event.currentTarget).find('input').is(':checked')){
                        this.addFieldColumns(attr);
                    }else{
                        this.removeFieldColumns(attr);

                    }

                })

                $('.recordsnumber').html(this.fieldRows.length);
                this.applyFieldsCheck();

                let allCheckedFields = [];
                $('#sobjectfieldtable input[type="checkbox"].show-in-tree:checked').each((index, ele)=>{
                    let name = $(ele).attr('name');
                    allCheckedFields.push(name);
                })

                $('div.soql span.soql').text('select '+allCheckedFields.map(e=>e.replace(sobjectDescribe.name+'.','')).join(',') + ' from ' + sobjectDescribe.name);
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



    createHead(){
        let treeroot = document.getElementById('tableinfo');
        let searchAear = `
        <p>

            <div>
                <label for="cars">Object Or ID Search: </label>
                <input id="objectdetailsearch" class="search feedback-input" type="input" value="Order" name="apiName" type="text" autocomplete="off"
                style="width:395px;height:30px;font-size:15pt;"></input>
                <button class="tablinks comp-btn" name="updateSelectObject" id="refreshSelectObject">Refersh</button>
            </div>

            <div>
                <label for="cars">Object Search: </label>
                <input id="objectdetailsearch2 feedback-input" class="search" type="input" value=""  type="text" autocomplete="off"
                ></input>
            </div>
            <div>
                <label for="cars">Field Search: </label>
                <input id="fielddetailsearch feedback-input" class="search" type="input" value=""  type="text" autocomplete="off"
                ></input>
            </div>


        </p>
        <div class="searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar">
                <span class="sobjectAPIName"></span>
                <span class="sobjectName"></span>
            </div>

            <div id="showalldatatable"></div>
        </div>`
        var div = document.createElement("div");
        div.innerHTML=searchAear;
        treeroot.appendChild(div);
        this.addEvents(treeroot);
  }

    addEvents(treeroot){
        $('#showalldatatable').on('click','.show-in-tree',(event)=>{
            let isCheck = $(event.target).is(':checked');
            if ($(event.target).is('.selectAll')){
            if ($(event.target).is('.object-fields')){
                this.storageAllfields(isCheck);
            }else{
                this.storageAllRelationship(isCheck);
            }
            }else{
                this.storage($(event.target).attr('name'), isCheck);
            }
        })

        $('#showalldatatable').on('click','.show-in-tree',(event)=>{
            let isCheck = $(event.target).is(':checked');
            this.storage($(event.target).attr('name'), isCheck);
        })

        $('#select-sobject').on('change', ()=>{
            let opt = $('#select-sobject').val();
            this.sobject = opt;
            $('#select-sobject').attr('disabled','');

           
            this.tree.getDescribeSobject(opt).then(e=>{
                this.sobject = e.name;
                this.doUpdaate();
                $('.sobjectAPIName').text(this.sobject);
                $('.sobjectName').text(this.sobjectDescribe.name);
                $('#select-sobject').removeAttr('disabled');
            })
        })

        $('#refreshSelectObject').on('click', async()=>{
            let opt = $('#objectdetailsearch').val();
            let selectedObjectAPI = this.tree.allSObjectApi.find(e=>{
                return e.global.name.toLowerCase() == opt.toLowerCase();
            })
            if (!selectedObjectAPI){
                let objName = await this.searchId(opt);
                if (objName){
                    this.recordId = opt;
                    opt = objName;
                    selectedObjectAPI = this.tree.allSObjectApi.find(e=>{
                        return e.global.name.toLowerCase() == opt.toLowerCase();
                    })
                }else{
                return;
                }
            }
            this.sobject = selectedObjectAPI.global.name;
            $('#select-sobject').val(this.sobject);
            $('#select-sobject').attr('disabled','');

            this.tree.getDescribeSobject(opt).then(e=>{
                this.sobject = e.name;
                this.doUpdaate(this.recordId);
                $('.sobjectAPIName').text(this.sobject);
                $('.sobjectName').text(this.sobjectDescribe.name);
                $('#select-sobject').removeAttr('disabled');
            })
        })


        $('#updateSelectObject').on('click', ()=>{
            this.updateSObjectSelect();
            this.tree.waitReady().then(()=>{
                this.updateSObjectSelect();
            })
        })


        $('#showalldatatable').on('click','span.relationship', (event)=>{
            let sobject = $(event.target).html();
            $('#select-sobject').val(sobject);
            $('#select-sobject').change();
        })

        $('#objectdetailsearch').on('change', ()=>{
            $('#refreshSelectObject').click();
        })

        $('#fielddetailsearch').on('change', ()=>{
            let opt = $('#fielddetailsearch').val();
            this.fieldsFilter(opt);
        })



        let autoComplete1 = new AutoComplete1('objectdetailsearch',()=>{
            return this.tree.allSObjectApi.map(e=>{return e.global.name});
        });
        autoComplete1.createApi();

        let autoComplete2 = new AutoComplete1('objectdetailsearch2',()=>{
            return this.tree.allSObjectApi.map(e=>{return e.global});
        });
        autoComplete2.setItemProvider({
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
        autoComplete2.createApi();
    }

    async searchId(recordId){
        try{
            let {objectTypes} = await this.tree.getSObjectById(recordId);
            this.objectTypes = objectTypes;
            if (this.objectTypes.length > 0){
                let sobjectname = this.objectTypes[0];
                let data = await this.tree.getData(sobjectname, recordId);
                return sobjectname;
            }else{
                this.sobjectDescribe = {};
            }
        }catch(e){
        }
        return null;
    }
    updateSObjectSelect (){
        let selctonj = document.getElementById('select-sobject');
        console.log('updateSObjectSelect ', this.tree.allSObjectApi);
        if (!this.tree.allSObjectApi?.length){
            selctonj.innerHTML=`<option value="0">SObject is loading</option>`;
        }else{
            selctonj.innerHTML=`${this.tree.allSObjectApi?.map(e=>{
                return `<option value="${e.global.name}">${e.global.name}</option>`
            }).join('')}`;
        }

    }
}
