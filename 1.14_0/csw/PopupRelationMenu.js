import {Tools} from "./Tools.js";

export class PopupRelationMenu{

    constructor(opt){
        this.container = opt.container;
        this.uuid = Tools.getUuid();
        this.allItems = [];
        this.selected = opt.selected||[];
        this.disabledItems = opt.disabledItems||[];;
        this.updatedSelect = {};
        this.optFn = opt.open;
        this.cloasetFn = opt.close;
        this.label = opt.label;
        this.sobject = opt.sobject;
        this.tree = opt.tree;
        this.currentSObject = this.sobject;
        this.currentPaths = [{level:0, obj:this.sobject, attr:this.sobject}];
        this.multipleChecked = true;
        this.create();
    }

    reset(sobject){
        this.sobject = sobject;
        this.currentSObject = sobject;
        this.currentPaths = [{level:0, obj:sobject, attr:sobject}];
        this.updatePaths();
    }

    on(eventName, eventFn){
        if (eventName=='close' && typeof eventFn=='function'){
            this.cloasetFn = eventFn;
        }else if (eventName=='open' && typeof eventFn=='function'){
            this.optFn = eventFn;
        }
    }

    open(){
        let opt = this.optFn()||{};
        this.selected = this.multipleChecked ? opt.selected||[] : [];
        this.disabledItems = opt.disabledItems||[];
    }

    close(newCheckeds, newUncheckeds){
        if (newCheckeds.length || newUncheckeds.length){
            if (this.cloasetFn && typeof this.cloasetFn=='function'){
                this.cloasetFn(newCheckeds, newUncheckeds);
            }
        }
    }

    async getAllItems(sobjectname){
        let sobjectDescibe = await this.getDescribeSobject(sobjectname);
        return sobjectDescibe.fields.toSorted((a, b)=>{
            return a.label.toLocaleLowerCase().localeCompare(b.label.toLocaleLowerCase());
        });
    }

    async getDescribeSobject(sobjectname){
        await this.tree.getDescribeSobject(sobjectname);
        let dataMap = this.tree.dataMap[sobjectname] ||{};
        return dataMap.sobjectDescribe;
   }

   async updateItemContainer(currentTarget){
        let allItems = [];
        allItems.push(... await this.getAllItems(this.currentSObject))
        allItems.sort((a, b) =>{
            return a.label.toLocaleLowerCase().localeCompare(b.label.toLocaleLowerCase());
        })
        let prefix = this.currentPaths.map(e=>e.attr).join('.');
        this.allItems = allItems;
        $('#'+this.uuid + ' .pop-menu .pop-item-container').html(allItems.map(t=>{
            let ischeck = this.selected.indexOf(prefix+'.'+t.name)>-1;
            let isDisabled = this.disabledItems.indexOf(t.name)>-1;
            let isReference = t.type=="reference"&&t.referenceTo&&t.referenceTo.length==1;
            let displayValue= this.showName ? t.name:t.label;
            let refererenceLink = isReference?`<a href="javascript:void;"><span r="${t.relationshipName}" link-to="${t.referenceTo}">view related fields...</span></a>`:'';
            return `<li class="pop-menu-item" name="${t.name}" data-label="${t.label}" data-name="${t.name}"><input type="checkbox"  ${ischeck?'checked':''} ${isDisabled?'disabled':''}></input><span class="pop-menu-item-label">${displayValue}</span> ${refererenceLink}</li>`;
        }).join(''))
   }

   updatePaths(){
        let newPath = this.currentPaths.map(e =>{
            return `<a href="javascript:void;">
            <span link-to="${e.obj}" level="${e.level}" name="${e.attr}">${e.obj}</span>
        </a>`
        }).join('>');
        $('#'+this.uuid + ' .pop-menu .pop-path').html(`<span class="pop-show-name">Show Name</span><span class="pop-show-label">Show Label</span><span class="pop-uncheck">Uncheck</span> <b>|</b> <span>Path:</span>${newPath}`)
   }

    create(){
        let str = `<div class="relation-field-filter">
            <div class="pop-menu-container">
                <div class="dropdown actions-button1" 
                style="display: inline-flex;">
                    <span class="">${this.label||'Relationship Fields'}: </span>
                </div>
                
                <div class="pop-menu">
                    <div class="pop-path"><span class="pop-show-name">Name</span><span class="pop-show-label">Label</span><span>Path:</span></div>
                    <div class="pop-search"><input style="width:100%" name="search" type="text" placeholder="input a key of field name" autocomplete="off"></input></div>
                    <div class="pop-item-container" style="max-height:450px;overflow:auto">
                        <span class="relationship"><input type="checkbox"></input>All field metadata</span>
                    </div>
                    
                </div>
            </div>
        </div>`;
        $(this.container).append(`<div id="${this.uuid}" class="field-check">${str}</div>`);
        this.updatePaths();

        $('#'+this.uuid + ' .relation-field-filter .pop-menu').hide();

        $('#'+this.uuid + ' .relation-field-filter .actions-button1').on('click', (event)=>{
            this.open();
            if ($(event.currentTarget).siblings(".pop-menu").css("display")=='none'){
                this.updateItemContainer(event.currentTarget);
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

        $('#'+this.uuid + ' .relation-field-filter').on('click','span[link-to]',(event)=>{
            let linkTo = $(event.currentTarget).attr('link-to');
            let level = $(event.currentTarget).attr('level');
            let attr = $(event.currentTarget).attr('r');
            this.currentSObject = linkTo;
            if (level && level !== 0){
                this.currentPaths = this.currentPaths.filter(e =>{
                    return e.level <= Number(level);   
                });
            }else{
                this.currentPaths.push({level:this.currentPaths.length, obj:this.currentSObject, attr:attr});
            }
            
            this.updatePaths();
            this.updateItemContainer();
        })

        $('#'+this.uuid + ' .relation-field-filter').on('click','li>input[type="checkbox"]',(event)=>{
            let attr = $(event.currentTarget).parent('li').attr('name');
            let prefix = this.currentPaths.map(e=>e.attr).concat([attr]).join('.');
            if ($(event.currentTarget).is(':checked')){
                this.selected.push(prefix);
                this.updatedSelect[prefix] = true;
            }else{
                let index = this.selected.indexOf(prefix);
                this.selected.splice(index, 1);
                this.updatedSelect[prefix]=false;
            }

            if(!this.multipleChecked){
                $(event.currentTarget).siblings(".pop-menu").hide();
                this.close(this.selected, []);
            }
        })

        $('#'+this.uuid + ' input[name="search"]').on('change', (event)=>{
            this.handlerChangeInput(event);
        })
        $('#'+this.uuid + ' input[name="search"]').on('keyup', (event)=>{
            this.handlerChangeInput(event);
        })


        $('#'+this.uuid + ' .relation-field-filter').on('click','.pop-show-name',(event)=>{
            this.showName= true;
            $('#'+this.uuid + ' .relation-field-filter' + ' li.pop-menu-item').each((i,element)=>{
                let name = $(element).attr('data-name');
                $(element).find('.pop-menu-item-label').text(name);
            })
        })
        

        $('#'+this.uuid + ' .relation-field-filter').on('click','.pop-show-label',(event)=>{
            let linkTo = $(event.currentTarget).attr('link-to');
            this.showName= false;
            $('#'+this.uuid + ' .relation-field-filter' + ' li.pop-menu-item').each((i,element)=>{
                let name = $(element).attr('data-label');
                $(element).find('.pop-menu-item-label').text(name);
            })
        })

        $('#'+this.uuid + ' .relation-field-filter').on('click','.pop-uncheck',(event)=>{
            $('#'+this.uuid + ' .relation-field-filter li>input[type="checkbox"]:checked').click();
        })
    }

    handlerChangeInput(event){
        let attr = $(event.currentTarget).val().trim();
        if (!attr){
            $('#'+this.uuid + ' .pop-item-container li').show();
            return;
        }

        let showwedName = [];
        for (let item of this.allItems){
            if (item.name.toLocaleLowerCase().indexOf(attr.toLocaleLowerCase()) != -1 || item.label.toLocaleLowerCase().indexOf(attr.toLocaleLowerCase()) != -1){
                showwedName.push(item.name);
            }
        }
        $('#'+this.uuid + ' .pop-item-container li').each((index, ele)=>{
            let name = $(ele).attr('name');
            if (showwedName.indexOf(name) != -1){
                $(ele).show();
            }else{
                $(ele).hide();
            }
        })
    }
}