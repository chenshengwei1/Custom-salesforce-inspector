import {Tools} from "./Tools.js";

export class Pilles{
    constructor(container){
        this.container= container;
        this.uuid = Tools.getUuid();
        this.dropId = Tools.getUuid();
        this._items = [];
        this.create();
    }

    set items(item){
        this._items = item||[];
        this.refresh();
    }

    get items(){
        return this._items;
    }

    update(){
        this.valueChange && this.valueChange(this._items);
    }

    refresh(){
        $('#'+this.uuid+' .criteria-list').html(this.items.map(e=>{
            return `<li data-id="${e.name}" class="extended-searcher" original-title="">
                        <div data-id="${e.name}" class="criteria-selector aui-button aui-button-subtle jira-aui-dropdown2-trigger" tabindex="0" resolved="">
                            <div class="criteria-wrap">
                                <span class="fieldLabel">${e.label}:</span>
                                <div class="searcherValue">
                                    <span class="fieldValue">
                                        ${e.value}
                                    </span>
                                </div>
                            </div>
                            <a href="#" class="remove-filter" title="清除条件" tabindex="-1">
                                <span class="aui-icon aui-icon-small aui-iconfont-remove"></span>
                            </a>
                        </div>
                    </li>`
                    }).join(''))
    }

    create(){
        let str = `<div class="search-criteria-extended">
            <ul class="criteria-list">
            </ul>
        </div>`;
        $(this.container).append(`<div id="${this.uuid}" class="field-check">${str}</div>`);

        var div = document.createElement("div");
        div.className="auto_hidden";
        div.id=this.dropId;
        document.body.appendChild(div);

        $('#'+this.dropId).append(`<div class="field-check"><input class="search"  type="input" value="" style="width:100%;line-height:1.5rem"></div>`);
    
        $('#'+this.uuid).on('click', '.remove-filter', (event)=>{
            event.stopPropagation();
            let searcher =$(event.currentTarget).parent('.extended-searcher');
            let filterName = searcher.attr('data-id');
            searcher.remove();
            this._items = this._items.filter(e=>{
                return e.name !=filterName;
            })
            this.update();
        }) 

        $('#'+this.uuid).on('click', '.aui-button', (event)=>{
            event.stopPropagation();
            if ($(event.currentTarget).is('.active')){
                $('.aui-button').removeClass('active');
                $('#'+this.dropId).addClass('auto_hidden');
            }else{
                $('.aui-button').removeClass('active');
                $(event.currentTarget).addClass('active');
                $('#'+this.dropId).removeClass('auto_hidden');
                let value = $(event.currentTarget).find('.fieldValue').text();
                $('#'+this.dropId+' input').val(value.trim());
                this.showSearchInput();
            }
        })

        $('#'+this.dropId).on('change', 'input', (event)=>{
            let value = $(event.target).val();
            let itemname = $('#'+this.uuid+' .aui-button.active').attr('data-id');
            for (let item of this._items){
                if (item.name == itemname){
                    item.value = value;
                    break;
                }
            }
            $(`[data-id="${itemname}"] .fieldValue`).text(value);
            this.update();
        })  

        
        $('#'+this.dropId).on('resize', (event)=>{
            this.showSearchInput();
        })

        $('body').on('scroll', (event)=>{
            this.showSearchInput();
        })

    }

    showSearchInput(){
        let target = $('.aui-button.active')[0];
        var cursorCoords = target.getBoundingClientRect();
        var cursorX = cursorCoords.left;
        var cursorY = cursorCoords.top;
        let autoObj = $('#'+this.dropId)[0];

        autoObj.style.left = cursorX + "px";
        autoObj.style.top  = cursorY + target.offsetHeight + "px";
        autoObj.style.width= target.offsetWidth - 2 + "px";//减去边框的长度2px
        autoObj.style.height= "auto";//减去边框的长度2px
        autoObj.style.maxHeight= "400px";//减去边框的长度2px
        autoObj.style.fontSize= '14';
        autoObj.style.position= 'fixed';
    }
}