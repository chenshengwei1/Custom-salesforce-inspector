
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
            this.bindingEvent = true;
        }
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
        this.defaulShow = this.dataList.length < this.defaultShowRecords;
        return `<thead>
                    <tr  class="row header"><th class="cell" colspan="${this.fields.length+this.showRelatedFields.length}">${this.description}(${this.dataList.length})${this.displayShowMore()?'<button class="show_more_btn hide_table">Show More</button>':''} <button class="show_hide_btn hide_table">${this.defaulShow?'Hide':'Show'}</button></th></tr>
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
                    return `<td class="cell field-${e.property}" title="${e.property}" tabindex="0">${value} ${this.translationToLink(r, e)}</td>`
                }).join('')}
                </tr>`
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