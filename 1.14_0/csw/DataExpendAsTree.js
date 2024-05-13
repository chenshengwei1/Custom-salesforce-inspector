import {AutoComplete1} from "./AutoComplete1.js";
import {Notifiable} from "./Notifiable.js";

function updateSelectUI(htmlId, items){
    let v = $('#'+htmlId).val();
    $('#'+htmlId).html(`<option value="-1">Please select...</option>`+items.map((e,index)=>{
        return `<option value="${index}">${e.label}</option>`;
    }).join(''));
     $('#'+htmlId).val(v);
}

export class DataExpendAsTree extends Notifiable{
    constructor(dateTree){
        super();
        this.tree = dateTree;
        this.isActived = false;
    }
    active(){
        if (this.isActived){
            return;
        }
        this.isActived =  true;
        this.createHead(this.rootId);
    }

    init(sobjectDescribe, data){
        this.sobjectDescribe=sobjectDescribe;
        this.data=data;
        return this;
    }

    getUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }

    toHtml(sobjectDescribe, data){
        sobjectDescribe = sobjectDescribe||this.sobjectDescribe;
        data = data||this.data;
        if (!sobjectDescribe){
            return '';
        }

        let listData = sobjectDescribe.fields.map(e=>{
            return {name:e.name,label:e.label, value:data[e.name],type:e.type, referenceTo:e.referenceTo||[]}
        }).sort((a, b)=>{
            return a.name.localeCompare(b.name)
        })
        return `<div><div class="block-head">${sobjectDescribe.name}</div>
            ${listData.map(field=>{
                if (field.type=="reference"){
                    let uuid = this.getUuid();
                    field.uuid = uuid;
                    return `<div class="field-item ${field.value?'':'null-value'} ${field.name=='Id'?'requirment-item':''}" field-name="${field.name}" field-label="${field.label}" name="${sobjectDescribe.name+'.'+field.name}">
                        <span class="field-item-name"> ${field.name}</span>
                        <span class="field-item-label">${field.label}</span>:
                        <span class="reference field-item-value" name="${sobjectDescribe.name+'.'+field.name}" value="${field.value}">${field.value || '&lt;empty&gt;'}</span>
                        <div class="childblock sobject" id="${uuid}" data-sobjectname="${field.referenceTo.join(',')}" data-value="${field.value}"></div>
                    </div>`
                }
                return `<div class="field-item ${field.value?'':'null-value'}" name="${sobjectDescribe.name+'.'+field.name}" field-name="${field.name}" field-label="${field.label}">
                    <span class="field-item-name">${field.name}</span>
                    <span class="field-item-label">${field.label}</span>:
                    <span class="field-item-value">${field.value}</span>
                    </div>`
            }).join('')}
            <div class="field-item field-hor requirment-item"></div>
            ${sobjectDescribe.childRelationships.map(field=>{
                let uuid = this.getUuid();
                field.uuid = uuid;
                return `<div class="field-item" name="${sobjectDescribe.name+'.'+field.childSObject+'.'+field.field}">
                    <span class="field-item-name ${this.isQueryable(field.childSObject)?'queryable':''}">${field.childSObject}</span>
                    <span class="field-item-label ${this.isQueryable(field.childSObject)?'queryable':''}">${field.relationshipName}</span>:
                    <span class="relationship field-item-attr" name="${field.childSObject+'.'+field.field}" value="${field.field}">
                ${field.field}</span>
                    <span class="relationshipname field-item-value">(${field.relationshipName||'Blank'})</span>
                    <div class="childblock" id="${uuid}" data-reference="${data.Id}" data-sobjectname="${field.childSObject}"></div>
                </div>`
            }).join('')}
        </div>`
    }

    

    isQueryable(sobject){

        return this.tree.describeInfo.sobjectAllDescribes.data.sobjects.get(sobject.toLocaleLowerCase()).global.queryable

    }

    toRelationshipHtml(refs){

        return `${refs.map(field=>{
                let uuid = this.getUuid();
                field.uuid = uuid;
                let sobjectDescribe =field.sobjectDescribe;
                let nameFieldDesc = sobjectDescribe.fields.find(e=>e.nameField==true);
                let idField = sobjectDescribe.fields.find(f => f.name=='Id');
                return `<div class="field-item requirment-item" name="${sobjectDescribe.name+'.'+field.name}">
                    ${idField.label}
                    <span class="reference" name="${sobjectDescribe.name+'.'+field.name}" value="${field.value.Id}">
                        ${field.value[nameFieldDesc.name]}-${field.value.Id}
                    </span>
                    <div class="childblock" id="${uuid}" data-value="${field.value.Id}" data-sobjectname="${sobjectDescribe.name}"></div>
                </div>`

        }).join('')}`
    }

    getChildHtml(parentSobjectDescribe, field){
            return '';
    }

    applyFieldsCheck( htmlId){
        let allChecked = this.tree.getAllChecked();
        $(`#${htmlId} .field-item[name]`).hide();
        $(`#${htmlId} .requirment-item`).show();
        //let sobjDesc = this.tree.getSyncDescribeSobject(this.sobjectDescribe.name);

        let nameFieldName = this.tree.getNameField(this.sobjectDescribe.name).name;
        $(`#${htmlId} [name="${this.sobjectDescribe.name+'.'}Id"]`).show();

        $(`#${htmlId} [name="${this.sobjectDescribe.name+'.'+nameFieldName}"]`).show();
        Object.keys(allChecked).forEach(element => {
            if (element.indexOf(this.sobjectDescribe.name+'.')==0&&allChecked[element]){
                $(`#${htmlId} [name="${element}"]`).show();
            }
        });
    }

    showAll(htmlId){
        $(`#${htmlId} .field-item`).show();
    }
    

    hideAll(htmlId){
        $(`#${htmlId} .field-item`).hide();
        let allChecked = this.tree.getAllChecked();
        $(`#${htmlId} .requirment-item`).show();
        Object.keys(allChecked).forEach(element => {
            if (allChecked[element]){
                $(`#${htmlId} [name="${element}"]`).show();
            }
        });;
    }

    showNameOnly(panelId){
        $('#'+panelId+' .field-item-name').show();
        $('#'+panelId+' .field-item-label').hide();
    }

    showLabelOnly(panelId){
        $('#'+panelId+' .field-item-name').hide();
        $('#'+panelId+' .field-item-label').show();
    }

    checkShowAll(){
        let showAll = $('#showAllFields').is(':checked');
        if (showAll){
            this.showAll('objsearchresult');
        }else{
            this.hideAll('objsearchresult');
        }
    }

    checkNameLabelShow(htmlId){
        let showAll = $('#showNameOnly').is(':checked');
        if (showAll){
            this.showNameOnly(htmlId || 'objsearchresult');
        }else{
            this.showLabelOnly(htmlId || 'objsearchresult');
        }
    }
    

    createHead(rootId){
        this.rootId = rootId;
        if (!this.isActived ){
            return;
        }
        let treeroot = document.getElementById(rootId);
        let searchAear = `
            <p class="hide">
                <label>SF Host</label>
                <select name="select-sfhost" id="select-sfhost">
                    <option value="">Please select SFHost</option>
                </select>
                <br/>
                <label>Sessions</label>
                <select name="select-session" id="select-session">
                    <option value="">Please select SFHost</option>
                </select>
            </p>
        <p class="searchp">
            Object Search: <input id="objectsearch" class="search" type="input" value="Order" name="apiName" type="text" autocomplete="off" style="width:395px;height:30px;font-size:15pt;"></input>
            Exclude Object Search: <input class="search" id="exobjectsearch" type="input" value="" ></input>
            Metadata: <input class="" id="inmdtsearch" type="checkbox" value="N" ></input><br/>
            Event: <input class="" id="ineventsearch" type="checkbox" value="N" ></input>
            History: <input class="" id="inhissearch" type="checkbox" value="N" ></input>
            Share: <input class="" id="insharesearch" type="checkbox" value="N" ></input>
            Chang Event: <input class="" id="inchangeeventsearch" type="checkbox" value="N" ></input>
            Custom: <input class="" checked id="incustomsearch" type="checkbox" value="Y" ></input>
            No Null Field: <input class="" checked id="noNullField" type="checkbox" value="Y" ></input><br/>
            Show All: <input class="" id="showAllFields" type="checkbox" value="Y" ></input>
            Show Name Only: <input class="" id="showNameOnly" type="checkbox" value="Y" ></input>
        </p>
        <p>
            Fields Search: <input class="search hide" id="fieldssearch" type="input" value="" autocomplete="off"></input>
        </p>
        <p>
            Fields Value: <input class="search" id="fieldvalyuesearch" type="input" value=""></input><br/>
            Order Name: <input class="search" id="ordernamesearch" type="input" value=""></input><br/>
            Order Number: <input class="search" id="ordernumbersearch" type="input" value=""></input>
        </p>
        <p>
            <label>History Records:</label>
            <select name="select-data" id="historysearch">
                <option value="">Please select object</option>
            </select>
        </p>
        <p>
            <button class="tablinks" name="SearchSObject" id="SearchSObject">Search</button>
            <button class="tablinks" name="filterBlankValue" id="filterBlankValue">Filter Blank Value</button></br>
            Use Tooling API: <input class="" id="useToolingAPICheck" type="checkbox" value="N"></input>
        </p>
        <div class="searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="notificationmessage"></div>

            <div id="objsearchresult" class="objsearchresult"></div>
            <div class="detailearchresult"></div>
        </div>`
        var div = document.createElement("div");
        div.innerHTML=searchAear;
        treeroot.appendChild(div);
        this.addTreeListening();
    }

    async parser(id, ordernumber, ordername){
        let sobjectname = 'Order';
        if (id){
            if (/^\d{8}$/.test(id)){
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
            $('#objectsearch').val('Order');
            sobjectname = 'Order';
        }
        else{
            ordernumber='';
            ordername='';
            sobjectname = await this.tree.getSObjectNameById(id);
            $('#ordersearch').val(sobjectname);
        }
        return {sobjectname, id}
    }

    addTreeListening(){

        let sfHosts = this.tree.sfConn.getSfHosts();
        let sessions = this.tree.sfConn.getAllSessions(sfHosts[this.tree.sfConn.instanceHostname]);
        updateSelectUI('select-sfhost', sfHosts.map(e=>{return {name:e,label:e}}));
        $('#select-sfhost').val(sfHosts.indexOf(this.tree.sfConn.instanceHostname));
        $('#select-sfhost').change();
        let s = sessions.find(e=>{return e.sectionId == this.tree.sfConn.sectionId});
        $('#select-session').val(sessions.indexOf(s));

      // autocomplete
      let autoComplete1 = new AutoComplete1('objectsearch',()=>{
          return this.tree.allSObjectApi.map(e=>e.global.name);
      });
      autoComplete1.createApi();

      $('#treeroot').addClass('ctrl-null');

      $('#SearchSObject').on('click',async ()=>{
          let id = $('#fieldvalyuesearch').val().trim();
          let ordername = $('#ordernamesearch').val().trim();
          let ordernumber = $('#ordernumbersearch').val().trim();
          let {sobjectname} = await this.parser(id, ordernumber, ordername);
          
          if (id){
              this.doUpdate(sobjectname, id);
          }else if ((ordername||ordernumber) && 'order' == sobjectname.toLocaleLowerCase()){
            this.tree.getRecordsByFields(sobjectname, [{name:'id'},{name:'name'},{name:'ordernumber'}], 0, {name:ordername,ordernumber:ordernumber}).then((result)=>{
                if (result?.results?.records?.length){
                    this.doUpdate(sobjectname, result?.results?.records[0].Id);
                }
            })
          }
      })

      

      $('#filterBlankValue').on('click',()=>{
          $('.null-value').hide();
      })

      $('#noNullField').on('click',()=>{
          let filterNull = $('#noNullField').is(':checked');
          if (filterNull){
              $('#treeroot').addClass('ctrl-null');
          }else{
              $('#treeroot').removeClass('ctrl-null');
          }
      })

      $('#showAllFields').on('click', ()=>{
          let showAll = $('#showAllFields').is(':checked');
          if (showAll){
            this.showAll('objsearchresult');
          }else{
            this.hideAll('objsearchresult');
          }
      })

      $('#showNameOnly').on('click', ()=>{
        let showName = $('#showNameOnly').is(':checked');
        if (showName){
          this.showNameOnly('objsearchresult');
        }else{
          this.showLabelOnly('objsearchresult');
        }
    })


      

      $('#useToolingAPICheck').on('click', ()=>{
          let tool = $('#useToolingAPICheck').is(':checked');
          if (tool){
              this.tree.tool('1');
          }else{
            this.tree.tool(false);
          }
      })

      $('#historysearch').on('change', (event)=>{
          let field = $('#historysearch').val();
          let allRecords = this.tree.getRecords();
          let sobject = allRecords.find(e=>e.Id==field).attributes.type;
          this.doUpdate(sobject, field);
      })


        $('#objsearchresult').on('click','.reference', (event)=>{
            let fieldPath = $(event.target).attr('name');
            let fieldPaths = fieldPath.split('.');
            let field = this.tree.dataMap[fieldPaths[0]].sobjectDescribe.fields.find(e=>{
                return e.name==fieldPaths[1];
            })

            let refBlockId = $(event.target).parent().children('.childblock').attr('id');
            if (!field){
                let reference = $(event.target).parent().children('.childblock').attr('data-sobjectname')
                field = {referenceTo:[reference]};
            }
            if ($('#'+refBlockId).css("display")=='none' || !$('#'+refBlockId).is('.loaded')){
                $('#'+refBlockId).show();
                if ($('#'+refBlockId).is('.loaded')){
                    return;
                }
                this.doUpdate(field.referenceTo[0], $(event.target).attr('value'), refBlockId);
            }else{
                $('#'+refBlockId).hide();
            }
        })



        $('#objsearchresult').on('click','.relationship',(event)=>{
            let fieldPath = $(event.target).attr('name');
            let fieldPaths = fieldPath.split('.');

            let refBlockId = $(event.target).parent().children('.childblock').attr('id');
            let id = $(event.target).parent().children('.childblock').attr('data-reference');
            if ($('#'+refBlockId).css("display")=='none' || !$('#'+refBlockId).is('.loaded')){
                $('#'+refBlockId).show();
                if ($('#'+refBlockId).is('.loaded')){
                    return;
                }
                this.doUpdateRelationship(fieldPaths[0],fieldPaths[1], id, refBlockId);
            }else{
                $('#'+refBlockId).hide();
            }
        })


      
    }

    doUpdate(sobject, id, htmlId){
        if (!id){
            return;
        }
        $('#SearchSObject').attr('disabled','');
        htmlId = htmlId || 'objsearchresult';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            rootdata.innerHTML=`loading sobject=${sobject} id=${id}`;
        }
        this.tree.getData(sobject,id.trim()).then(e=>{
            let treeroot = document.getElementById('objsearchresult');



            if (!e || !e.sobjectDescribe){
                if (rootdata == null){
                    rootdata = document.createElement("div");
                    rootdata.id=htmlId;
                    treeroot.appendChild(rootdata);
                }
                rootdata.innerHTML = this.tree.autocompleteResults.title;
                $('#SearchSObject').removeAttr('disabled');
                return
            }

            if (rootdata == null){
                rootdata = document.createElement("div");
                rootdata.id=htmlId;
                treeroot.appendChild(rootdata);
            }
            rootdata.innerHTML=this.init(e.sobjectDescribe,e.results).toHtml();

            this.applyFieldsCheck(htmlId);
            this.checkShowAll();
            this.checkNameLabelShow(htmlId);
            

            $(rootdata).addClass('loaded');
            let e1 = new Event('loaded');
            e1.data = {recordId:id, sobject: e.sobjectDescribe.name}
            this.notify('update', e1);
            //this.updateSObjectSelect();
            //this.doUpdateHead();
            $('#SearchSObject').removeAttr('disabled');
      })
  }

    doUpdateHead(){
        let selectsjdata = document.getElementById('historysearch');
        let allRecords = this.tree.getRecords();
        let fieldvalue = $('#historysearch').val();

        if (selectsjdata) selectsjdata.innerHTML=`${allRecords.map(e=>{
            let nameFieldName = this.tree.getNameField(e.attributes.type).name;
            return `<option value="${e.Id}">${e.attributes.type}##${e[nameFieldName]}&lt;${e.Id}&gt;</option>`
        }).join('')}`;
        $('#historysearch').val(fieldvalue);
    }

    doUpdateRelationship(sobjectName, fieldApi, id, htmlId){
        htmlId = htmlId || 'objsearchresult';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            rootdata.innerHTML=`loading relationship sobject=${sobjectName} id=${id}`;
        }

        this.tree.getRelationshipData(sobjectName, fieldApi, id.trim()).then((e)=>{
            if (!e || !e.sobjectDescribe){
                if (rootdata == null){
                    rootdata = document.createElement("div");
                    rootdata.id=htmlId;
                    treeroot.appendChild(rootdata);
                }
                rootdata.innerHTML = this.tree.autocompleteResults.title;
                return
            }
            console.log('loaded relationship ', e);

            if (rootdata == null){
                rootdata = document.createElement("div");
                rootdata.id=htmlId;
                treeroot.appendChild(rootdata);
            }
            if (!e.results.records.length){
                rootdata.innerHTML = 'No referenced data.';
                $(rootdata).addClass('loaded');
                return
            }
            rootdata.innerHTML = this.init(e.sobjectDescribe,e.results).toRelationshipHtml(e.results.records.map(value=>{
                return {sobjectDescribe:e.sobjectDescribe, value, name:e.sobjectDescribe.name};
            }));
            $(rootdata).addClass('loaded');
            this.applyFieldsCheck( htmlId);
            this.checkShowAll();
        })
    }

    addTreeHeadEvent(){
        let sfHosts = this.tree.sfConn.getSfHosts();
        this.updateSelectUI('select-sfhost', this.tree.sfHosts.map((e,index)=>{return {index,value:e,label:e}}));

        $('#treeroot').on('change', '#select-sfhost', (event)=>{
            let sfHost = $('#select-sfhost').val();
            if (!sfHost || sfHost==-1){
                return;
            }
            let sessions = this.tree.sfConn.getAllSessions(sfHosts[sfHost]);
            this.updateSelectUI('select-session', sessions.map(e=>{return {value:e.sectionId,label:new Date(e.createdDate)}}));
        })

        $('#treeroot').on('change', '#select-session', (event)=>{
            let sfHost = $('#select-sfhost').val();
            let sessionId = $('#select-session').val();
            if (sessionId==-1){
                return;
            }
            this.tree.sfConn.instanceHostname = sfHost;
            this.tree.sfConn.sessionId = sessionId;
        })
    }

    updatePanelByObjectName(sobject){

    }

    updatePanelByObjectName(sobject, id){

    }
}

