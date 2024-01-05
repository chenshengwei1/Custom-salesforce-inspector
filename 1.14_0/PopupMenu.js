import {Tools} from "./Tools.js";

export class PopupMenu{

    constructor(opt){
        this.container = opt.container;
        this.uuid = Tools.getUuid();
        this.allItems = opt.allItems||[];
        this.selected = opt.selected||[];
        this.disabledItems = opt.disabledItems||[];;
        this.updatedSelect = {};
        this.optFn = opt.open;
        this.cloasetFn = opt.close;
        this.label = opt.label;
        this.create();
    }

    open(){
        let opt = this.optFn()||{};
        this.allItems = opt.allItems||[];
        this.selected = opt.selected||[];
        this.disabledItems = opt.disabledItems||[];;
    }

    close(newCheckeds, newUncheckeds){
        if (newCheckeds.length || newUncheckeds.length){
            if (this.cloasetFn && typeof this.cloasetFn=='function'){
                this.cloasetFn(newCheckeds, newUncheckeds);
            }
        }
    }

    create(){
        let str = `<div class="field-filter">
            <div class="pop-menu-container">
                <label for="cars">${this.label||'Filter'}: </label>
                <button class="actions-button">
                    <svg class="actions-icon">
                        <use xlink:href="symbols.svg#down"></use>
                    </svg>
                </button>
                <div class="pop-menu">
                    <span class="relationship"><input type="checkbox"></input>All field metadata</span>
                </div>
            </div>
        </div>`;
        $(this.container).append(`<div id="${this.uuid}" class="field-check">${str}</div>`);

        $('#'+this.uuid + ' .field-filter .pop-menu').hide();

        $('#'+this.uuid + ' .field-filter .actions-button').on('click', (event)=>{
            this.open();
            if ($(event.currentTarget).siblings(".pop-menu").css("display")=='none'){
                $(event.currentTarget).siblings(".pop-menu").html(this.allItems.map(t=>{
                    let ischeck = this.selected.indexOf(t.value)>-1;
                    let isDisabled = this.disabledItems.indexOf(t.value)>-1;
                    return `<li class="pop-menu-item" name="${t.value}"><input type="checkbox"  ${ischeck?'checked':''} ${isDisabled?'disabled':''}></input>${t.label}</li>`;
                }).join(''))

                $(event.currentTarget).siblings(".pop-menu").show();
            }else{
                $(event.currentTarget).siblings(".pop-menu").hide();

                let newCheckeds = [];
                let newUncheckeds = [];
                for (let k in this.updatedSelect){
                    if (this.updatedSelect[k] && this.selected.indexOf(k)==-1){
                        newCheckeds.push(k);
                    }
                    if (!this.updatedSelect[k] && this.selected.indexOf(k)!=-1){
                        newUncheckeds.push(k);
                    }
                }
                
                this.close(newCheckeds, newUncheckeds);

            }
        });

        $('#'+this.uuid + ' .field-filter').on('click','.pop-menu-item',(event)=>{
            let attr = $(event.currentTarget).attr('name');
            if ($(event.currentTarget).find('input').is(':checked')){
                this.updatedSelect[attr] = true;
            }else{
                this.updatedSelect[attr] = false;
            }

        })
    }
}