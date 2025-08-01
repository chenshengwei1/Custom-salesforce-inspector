
import {Tools} from "./Tools.js";

export class RenderTable{
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

        this.childParentFieldMap = {
            'OrderItem':{child:'Id', 'parent':'vlocity_cmt__ParentItemId__c'},
            'Order':{child:'Id', 'parent':'vlocity_cmt__SupersededOrderId__c'}
        };
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

    sortRecordsById(records){

        let childParentFieldMap = this.childParentFieldMap;
        
        if (records.length == 0){
            return records;
        }
        if (Object.keys(childParentFieldMap).includes(records[0].attributes?.type||'NA')){
            let childField = childParentFieldMap[records[0].attributes?.type||'NA'].child;
            let parentField = childParentFieldMap[records[0].attributes?.type||'NA'].parent;

            records.sort((a,b)=>{
                if (a[childField] == b[childField]){
                    return a[parentField] < b[parentField]?-1:1;
                }
                return a[childField] < b[childField]?-1:1;
            })

            let newRecords = [];
            let copyOfRecords = records.slice();
            let getAllChildrent = (inputRecords, parent, level)=>{
                if (!parent){
                    return [];
                }
                let childrent = [];
                for (let i = 0; i < inputRecords.length; i++){
                    if (inputRecords[i][parentField] == parent){
                        inputRecords[i].__level = level;
                        childrent.push(inputRecords[i]);
                        childrent.push(...getAllChildrent(inputRecords, inputRecords[i][childField], level+1));
                    }   
                }
                return childrent;
            }

            for (let i = 0; i < records.length; i++){
                if (records[i][parentField] == null){
                    newRecords.push(records[i]);
                    let childrent = getAllChildrent(copyOfRecords, records[i][childField], 1);
                    for (let j = 0; j < childrent.length; j++){
                        newRecords.push(childrent[j]);
                    }
                }
            }

            for (let i = 0; i < records.length; i++){
                let existRecord = newRecords.find(e=>e[childField] == records[i][childField]);
                if (!existRecord){
                    newRecords.push(records[i]);
                }
            }
            return newRecords;
        }
        return records;
    }

    create(){
        if (!this.dataList.length){
            return `<div>${this.description}</div><div>No Data</div>`;
        }

        let theDataToShowList = this.displayShowMore()?this.dataList.slice(0, Math.min(100, this.dataList.length)):this.dataList;
        theDataToShowList = this.sortRecordsById(theDataToShowList);
        this.defaulShow = this.dataList.length < this.defaultShowRecords;
        let actionBtn = this.actions.map(e =>{
            return `<button class="${e.label}_btn btn" name="${e.label}">${e.label}</button>`;
        })
        return `<thead>
                    <tr  class="row header"><th class="cell" colspan="${this.fields.length+this.showRelatedFields.length}">${this.description}(${this.dataList.length})${this.displayShowMore()?'<button class="show_more_btn hide_table">Show More</button>':''} ${actionBtn} <button class="show_hide_btn hide_table">${this.defaulShow?'Hide':'Show'}</button></th></tr>
                    <tr  class="row blue ${this.defaulShow?'':'hide'}">
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
                <tr class="row ${r.Name}" title="${r.Id}">

                ${this.fields.concat(this.showRelatedFields).map(e=>{
                    let value = this.valuetostring(r, e.property, '');
                    return `<td class="cell field-${e.property} ${e.property =='Id'? this.recordLevel(r):''}" title="${e.property}" tabindex="0">${value} ${this.translationToLink(r, e)}</td>`
                }).join('')}
                </tr>`
                    }).join('')}
                </tbody>`
    }

    recordLevel(record){
        let level = 0;
        if (!this.childParentFieldMap[record.attributes?.type||'NA']){
            return '';
        }
        return `level-${record.__level||0}`
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