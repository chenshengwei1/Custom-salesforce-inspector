
import {Tools} from "./Tools.js";

export class RecordInfo{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.allRecords = [];
        this.sobjectname='Report';
        this.message='';
        this.keywords = [];
        this.starting = false;
        this.lazy =true;
        this.processingQty = 0;
        this.fieldFilter = Boolean;
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <p>
            Order Id Search:
            <input class="search feedback-input" id="record-orderid-input" type="input"  autocomplete="off" placeholder="input your record id"></input>
            
            <div class="btn-container">	
                <div class="btn" id="record-refreshSObjectSearch">
                    <span>Query</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="record-searchresult">
            <div class="totalbar" id="record-notificationmessage"></div>

            <div class="record-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="record-btn-reset">Reset</li>
                    <li id="record-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="loader" id="record-loading"></div>
                <textarea readonly name="" id="record-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <input class="search feedback-input " id="record-field-search" type="input" placeholder="input your search key" autocomplete="off"></input>
            <div class="record-view-result tabitem Result">
                <div id="record-showallsobjectdatatable"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    totalReocrds(qty){
        $('.applog-searchresult .totalrecordnumber').text(qty);

    }


    initObjectAllDataHead(){
        $('#record-orderid-input').on('change', (event)=>{
            let recordId = $('#record-orderid-input').val().trim();
            this.searchId(recordId);
        })

        $('#record-refreshSObjectSearch').on('click', ()=>{
            let recordId = $('#record-orderid-input').val().trim();
            this.searchId(recordId);
        })

        $('#record-field-search').on('keyup', (event)=>{
            this.applyFieldSearch();
        })

        $('#record-field-search').on('change', ()=>{
            this.applyFieldSearch();
        })

        $('#record-showallsobjectdatatable').on('click', '.ruby-link',(event)=>{
            $('#record-orderid-input').val($(event.target).text());
            $('#record-orderid-input').change();
        })
    }

    applyFieldSearch(){
        let key = $('#record-field-search').val().trim();
        if (!key){
            this.fieldFilter = Boolean;
        }
        else{
            this.fieldFilter = (field)=>{
                if (field.name.toString().toLocaleLowerCase().indexOf(key.toLocaleLowerCase()) != -1){
                    return true
                }else{
                    return false;
                }
            }
        }
        this.updateNotLoad(this.sobjectDescribe, this.record);
    }

    async searchId(recordId){
        this.clear();
        this.addMessage('search id:'+recordId);
        try{
            let {objectTypes} = await this.tree.getSObjectById(recordId);
            
            this.objectTypes = objectTypes;
            if (this.objectTypes.length > 0){
                let sobjectname = this.objectTypes[0];
                this.addMessage('type:'+sobjectname);
                let data = await this.tree.getData(sobjectname, recordId);
                this.addMessage('done:'+sobjectname);
                this.sobjectDescribe = data.sobjectDescribe;
                let results = data.results;
                console.log('data', data);
                this.showFields = ['name', 'label', 'type'];
                this.record = data.results;
                this.updateNotLoad(data.sobjectDescribe, this.record);
                this.addMessage('load id end');
            }else{
                this.sobjectDescribe = {};
                this.addMessage('Unknow record type');
            }
        }catch(e){
            this.addMessage(e.message);
        }
    }
    
    addMessage(message){
        this.messageList.push(message);
        $('#record-message').val(this.messageList.join('\n'));
    }
    clear(){
        this.messageList = [];
        $('#record-message').val('');
    }

    updateNotLoad(sobjectDescribe, record){
        let htmlId = 'record-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render(record);
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
            this.messageList.push(JSON.stringify(e.stack));
        }

    }

    render(record){
        return `
            <div>${this.message}</div>
            <table id="record-datatable" class="table">
                <thead>
                    <tr class="row header blue">
                        ${this.showFields.map(e=>{
                            return `<th class="field-${e} cell" tabindex="0">${e}
                                <button class="actions-button .comp-btn" name="${e}">
                                    <svg class="actions-icon">
                                        <use xlink:href="symbols.svg#arrowdown"></use>
                                    </svg>
                                </button>
                            </th>`
                        }).join('')}
                        <th class="field-action cell" tabindex="0">Value<input name="${this.sobjectDescribe.name}.field.value" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                        <th class="field-action cell" tabindex="0">Show<input name="${this.sobjectDescribe.name}.field.all" class="show-in-tree selectAll  object-fields" type="checkbox"></input></th>
                    </tr>
                </thead>
                <tbody>
                    ${(this.sobjectDescribe?.fields||[]).filter(this.fieldFilter).map(r=>{
                        return `
                <tr class="${r.name} row" title="${r.name}" name="${r.name}">

                ${this.showFields.map(e=>{
                    return `<td class="cell field-${r[e]}" tabindex="0" title="${e}">${r[e]}</td>`
                }).join('')}
                    <td class="cell field-value" tabindex="0">
                     ${this.valuetostring(record[r.name], r)}
                    </td>
                    <td class="cell field-value" tabindex="0">
                    </td>
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    valuetostring(value, field){
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
            if (field.type==="reference"){
                return '<span class="relationship ruby-link">'+value+'<span/>';
            }
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



    adapter(record){
        let str = this.toHtmlString(record);
        str = this.adapterKey(str);
        str = this.adapterTime(str);
        return str;
    }

}
