
import {Tools} from "./Tools.js";
import {PopupMenu} from "./PopupMenu.js";
import {PopupRelationMenu} from "./PopupRelationMenu.js";

export class ReportTable{

    constructor(dateTree){
        this.tree = dateTree;
        this.showFields = [];
        this.showRelatedFields = [];
        this.records = [];
        this.allRecords = [];
        this.sobjectname='Report';
        this.sortField = {};
        this.message='';
        this.fieldCondition = {};
        this.recordCondition= {include:'',exclude:'',fields:{}}
        this.searcherPiler;
        this.metadateTree;
        this.currentShow;
    }
    render(){
        return `
            <div>${this.message || ''}</dov>
            <table id="reporttableid">
                <thead>
                    <tr>
                        ${this.showFields.map(e=>{
                            return `<th class="field-${e}" tabindex="0">${e}
                                <button class="actions-button" name="${e}">
                                    <svg class="actions-icon">
                                        <use xlink:href="symbols.svg#${this.sortField[e]?.asc?'arrowdown':'arrowup'}"></use>
                                    </svg>
                                </button>
                            </th>`
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.records.map(r=>{
                        return `
                <tr class="" title="">

                ${this.showFields.map(e=>{
                    return `<td class="field-${e}" tabindex="0" title="${e}">${r[e]||''}</td>`
                }).join('')}
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
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
        this.doUpdaate(soql);
    }

    setOffset(offset){
        this.offset = offset;
    }

    async doUpdaate(soql){
        $('#report-showallsobjectdata .recordsnumber').text(this.totalSize||0);
        let htmlId = 'report-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        if (rootdata){
            rootdata.innerHTML = 'loading data from '+this.sobjectname;
            if (!this.sobjectname){
                rootdata.innerHTML = 'Miss sobject name';
                console.log('No data to show 1');
                return;
            }

            await this.loadData(soql);

            this.updateNotLoad();
        }
    }

    updateNotLoad(){
        let htmlId = 'report-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
            this.showMessage(JSON.stringify(e.stack), 'error')
        }

        $('#report-showallsobjectdata .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize!=0 &&this.totalSize %2000 == 0){
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

        let result = await this.tree.getRecordsByFields(this.sobjectname, this.showFields, this.records.length,this.fieldCondition, selected);
        this.totalSize = result.totalSize + this.records.length;
        this.records.push(...result.results.records ||[]);
        this.allRecords.push(...(result.results.records||[]));

        let htmlId = 'report-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
        }

        $('#report-showallsobjectdata .recordsnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
        if (this.totalSize!=0 &&this.totalSize %2000 == 0){
            $('#sobjectsearchoffset').show();
        }else{
            $('#sobjectsearchoffset').hide();
        }
    }

    async loadData(soql){

        let result = await this.tree.getRecordsBySoql(soql);
        this.totalSize = result.totalSize;
        this.message = result.title;
        this.records = [];
        this.allRecords = [];

        for (let item of result.results){
            let arry = [];
            let haveSonRecord = false;
            for (let key in item){
                if (item[key] && typeof item[key] == 'object' && item[key].records){
                    for(let r of item[key].records){
                        this.records.push({...item, ...r});
                    }
                    haveSonRecord = true;
                }
            }
            if (!haveSonRecord){
                this.records.push({...item});
            }
            
        }
        //this.records = result.results ||[];
        this.allRecords.push(...this.records);

        let fieldSet = new Set();
        for (let item of this.allRecords){
            let entries = Object.entries(item);
            for (let entry of entries){
                let key  = entry[0];
                let value  = entry[1];
                if (value != null && value != undefined && typeof value !== 'object'){
                    fieldSet.add(key);
                }
            }
        }

        this.showFields = [...fieldSet];
        if (this.records.length == 0){
            this.message = 'No data'
        }
        this.totalReocrds((this.records||[]).length);
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
        let treeroot = document.getElementById('showreportinfo');
        let searchAear = `
        <p>
            Object Search:
            <input class="search" id="report-sobjectsearch2" disabled type="input" value="Report" autocomplete="off" style="width:70%"></input>
            <button class="tablinks tabitem-btn" name="Reports" id="report-refreshSObjectReports">Reports</button>
            <button class="tablinks tabitem-btn" name="SOQL" id="report-refreshSObjectSoql">SOQL</button>
            <button class="tablinks tabitem-btn" name="XML" id="report-refreshSObjectXML">XML</button>
            <button class="tablinks tabitem-btn" name="Result" id="report-refreshSObjectSearch">Query</button>
            
        </p>
        <div class="report-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar" id="report-notificationmessage"></div>

            <div class="objsearchresult tabitem Reports"></div>
            <div class="report-view-soql tabitem SOQL">
                <button class="tablinks" id="report-btn-reset">Reset</button>
                <button class="tablinks" id="report-btn-format">Format</button><br/>
                <textarea contenteditable="true" name="" id="report-soql" style="height: 428px;font-size: large;"></textarea>
            </div>
            <div class="report-view-xml tabitem XML">
                <h2 id="report-xml-filename"></h2>
                <div id="report-xml"></div>
            </div>
            <div class="report-view-result tabitem Result">
                <div id="report-showallsobjectdatatable"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    totalReocrds(qty){
        $('.report-searchresult .recordsnumber').text(qty);
    }

    turnOn(target){
        let tabName = $(target).attr('name');
        if (!$(target).is('.tabitem-btn') || !tabName){
            return;
        }
        $('.report-searchresult .tabitem').hide();
        $('.report-searchresult .tabitem').each((index, ele)=>{
            if ($(ele).is('.'+tabName)){
                $(ele).show();
            }
        })
    }

    showMessage(msg, type){
        $('#report-notificationmessage').html(msg);
        if (type == 'loading'){
            
            $('#report-notificationmessage').html(`<span style="color:blue">${msg}<span/><p/>
            ${this.metadateTree.createSpinner('LOADING DOTS')}`);
        }else if (type == 'error'){
            $('#report-notificationmessage').html(`<span style="color:red">${msg}<span/>`);
        }else if (type == 'info' || !type){
            $('#report-notificationmessage').html(`<span style="color:blue">${msg}<span/>`);
        }else if (type == 'warn'){
            $('#report-notificationmessage').html(`<span style="color:yellow">${msg}<span/>`);
        }
    }

    initObjectAllDataHead(){
        $('.report-searchresult .tabitem').hide();
        $('.report-searchresult .Reports').show();
        $('#report-sobjectsearch2').on('change', (event)=>{
            let tableName = $(event.target).val();
            this.setSobjectname(tableName);
        })

        $('#showreportinfo .tablinks').on('click', (event)=>{
            this.turnOn(event.target);
        })

        $('#report-btn-format').on('click', (event)=>{
            let soql = $('#report-soql').val();
            $('#report-soql').val(this.formatSQL(soql));
        })

        $('#report-btn-reset').on('click', (event)=>{
            this.fieldCondition = {};
            this.showMessage('generate SQL...', 'loading');
            this.reportObj = this.parseXML(this.getReportContent());
            this.generateSQL().catch(e=>{
                this.showMessage(e.message, 'error');
            }).then(e=>{
                if (!e){
                    return;
                }
                //$('#report-soql').html(this.metadateTree.wapper(e, 'a.sql'));
                $('#report-soql').val(this.formatSQL(e));
                this.showMessage('');
            });
        })

        $('#report-refreshSObjectReports').on('click', (event)=>{
            this.totalReocrds((this.metadataDetails||[]).length);
        })

        $('#report-refreshSObjectSearch').on('click', (event)=>{
            this.totalReocrds((this.records||[]).length);
        })


        $('#report-refreshSObjectXML').on('click', (event)=>{
            $('#report-xml').html('<div>'+this.metadateTree.wapper(this.getReportContent(),'report.xml')+'<div/>');
        })

        $('#report-refreshSObjectSearch').on('click', (event)=>{
            let soql = $('#report-soql').val();
            this.doUpdaate(soql);
        })

        $('#report-objectsearchinput').on('keypress', (event)=>{
            if (event.keyCode==13){
                let searchKey = $(event.target).val();
                this.recordCondition.include = searchKey;
                this.filterRecords();
            }
        })

        this.reportObj = this.parseXML(this.getReportContent());

        this.showMessage('list Reports...', 'loading');
        
        this.listReports().then(metadataDetails=>{
            this.metadataDetails = metadataDetails.filter(e => e.type == 'Report'&&e.fileName);
            this.rootFolder = this.createReportFolder(this.metadataDetails);
            this.totalReocrds(this.metadataDetails.length);
            console.log('listMetadata metadata', this.metadataDetails);
            $('.report-searchresult .objsearchresult').html('<ul>' + this.createFolderTree(this.rootFolder) + '</ul>')

            this.showMessage('');
        })

        $('.report-searchresult .objsearchresult').on('click', 'button[name]', async (event)=>{

            event.stopPropagation();
            this.showMessage('loading...', 'loading');

            let isFoderLi = $(event.target).parents('li').attr('folder');
            if (isFoderLi == 'true'){
                this.clickFolderHandler(event);
            }else{
                await this.clickFileHandler(event);
            }
            
        })
      }

      clickFolderHandler(event){
        let parent = $(event.target).parents('li');
        let currentDirName = parent.attr('name');
        
        let m = this.findDir(currentDirName);
        if (parent.is('.off')){
            parent.addClass('on');
            parent.removeClass('off');
            $(parent).html(`<label>${m.name}</label>
            <button class="tablinks meta off" name="${m.fullName || m.name}" data-x-name="Report">${m.isFile?'Open':'List'}</button>
            <ul>` + this.createFolderTree(m) + '</ul>');
        }else{
            parent.addClass('off');
            parent.removeClass('on');
            $(parent).html(`<label>${m.name}</label>
            <button class="tablinks meta off" name="${m.fullName || m.name}" data-x-name="Report">${m.isFile?'Open':'List'}</button>`);
        }
        this.showMessage( '');
      }

      async clickFileHandler(event){
        let fileName = $(event.target).attr('name');
        let xName = $(event.target).attr('data-x-name');
        $(event.target).parents('li').addClass('selected');
        $('#report-xml-filename').html(fileName);

        let metadataFile = this.metadataDetails.find(e => e.fullName == fileName);
        let selectedMetadataObjects =  await this.tree.getMetadata(xName);

        this.metadateTree.download(selectedMetadataObjects, metadataFile, (data)=>{
        }).then(data=>{
            if (data.success){
                let content = Object.keys(data||{}).filter(e=>{
                    let m = e.match(/\.report$/);
                    return m;
                }).map(e=>{
                    return data[e];
                }).join('');
                this.reportContent = content;
                this.turnOn('#report-refreshSObjectSoql');
                $('#report-btn-reset').click();
            }else{
            }
        });
      }

      createFolderList(){
         return this.metadataDetails.map((m, index)=>{
            return `<li name="${m.fullName}" class="off" index="${index}">
                <label>${m.fullName}(${m.fileName})</label>
                <button class="tablinks meta off" name="${m.fullName}" data-x-name="Report">Open</button>
            </li>`
        }).join('')
      }

      createFolderTree(folder){
        return folder.files.concat(folder.folders).map((m, index)=>{
            let reportFile = m.report;
           return reportFile?`<li name="${m.name}" class="off" index="${index}" folder="false">
           <label>${m.name}</label>
           <button class="tablinks meta off" name="${reportFile.fullName}" data-x-name="Report">Open</button>
       </li>`:
       `<li name="${m.name}" class="off" index="${index}" folder="true">
               <label>${m.name}</label>
               <button class="tablinks meta off" name="${m.name}" data-x-name="Report">List</button>
           </li>`
       }).join('')
     }

      createReportFolder(metadataDetails){
        let root = {isFile:false, name:'*', folders: [], files:[]}
        for (let reportFile of metadataDetails){
            let dirPaths = reportFile.fileName.split(/\/|\\/);
            let folder = this.getFolder(root, dirPaths);
            folder.files.push({report:reportFile, name:dirPaths[0], isFile:true});
        }
        return root;
      }

      findDir(name, parentDir){
        parentDir = parentDir || this.rootFolder;
        for (let fd of parentDir.folders){
            if (name == fd.name){
                return fd;
            }else{
                let findInChild = this.findDir(name, fd);
                if (findInChild){
                    return findInChild;
                }
            }
        }
      }

      getFolder(root, path){
         if (path.length == 1){
            return root;
         }
         else {
             let fname = path.shift();
             let sonFolder = root.folders.find(e => e.name == fname);
             if (!sonFolder){
                sonFolder = {isFile:false, name:fname, folders: [], files:[]};
                root.folders.push(sonFolder);
             }
             return this.getFolder(sonFolder, path);
         }
      }

      async listReports(){
        let xmlName = 'Report';
        let metadataDetails = await this.tree.listMetadata(xmlName);
        if (!metadataDetails){
            return [];
        }
        if (!Array.isArray(metadataDetails)){
            metadataDetails = [metadataDetails];
        }
        
        
        metadataDetails = metadataDetails.sort((a,b)=>{
            return a.fullName.localeCompare(b.fullName);
        })
        this.metadataDetails = metadataDetails;

        return metadataDetails;
    }

      async generateSQL(){
        let soqlTemplate = 'select {0} from {1} where {2} order by {3}';
        let report = this.reportObj;
        if (report.field.length == 0){
            return ''
        }

        let tabMatch = report.field[0].match(/\b(.*?)\$/);
        let table = tabMatch ? tabMatch[1] : '';
        let descObj = await this.tree.getDescribeSobject(table);
        this.rootDescriptionSObject = descObj;
        let fieldList = [];
        for (let f of report.field){
            let s = await this.wapperField(f);
            fieldList.push(s);
        }

        let parentQuery = {table:table, fields:[],conditions:[]};
        let allSubQuery = [parentQuery];
        this.mergeChildrenFields(fieldList,  parentQuery, allSubQuery);
        

        let condition = '';
        let conditionList = [];
        for (let f of report.filter){
            let s = await this.wapperCondition(f);
            if (!s.expr){
                continue;
            }
            conditionList.push(s);
        }

        this.mergeChildrenConditions(conditionList,  parentQuery, allSubQuery);

        let fields = parentQuery.fields.map(e=>
            {
                return e.isGroup? this.groupFieldPath(e.ref) : e.fieldPath;
            }).join(',');
        condition = parentQuery.conditions.filter(e=>e&&e.expr).map(e => e.expr).join(' and ');

        let orderBy = 'id';
        let soql = `select ${fields} from ${parentQuery.table} where ${condition? condition : ' id <> null'} order by ${orderBy || 'id'}`;
        this.parentQuery = parentQuery;
        return soql;
      }

      groupFieldPath(sonQuery){
        let fields = sonQuery.fields.map(e=>
            {
                return e.isGroup? this.groupFieldPath(e.ref) : e.fieldPath;
            }).join(',');

        let condition = sonQuery.conditions.filter(e=>e&&e.expr).map(e => e.expr).join(' and ');
        let tableNames = sonQuery.table.split('.');

        return `(select ${fields} from ${tableNames[tableNames.length-1]} where ${condition? condition : ' id <> null'})`
      }

      mergeChildrenFields(childrenConditionList,  parentQuery, allSubQuery){
        let sonQuerys = [];
        for (let item of childrenConditionList){
            if (item.table == parentQuery.table){
                parentQuery.fields.push(item);
            }else{
                let sonTables = item.table.replace(parentQuery.table +'.', '');
                let tablePaths = sonTables.split('.');
                let sonTable = tablePaths.shift();
                if (tablePaths.length == 0){
                    let sonQuery = parentQuery[sonTable] || {fields:[],conditions:[], table:parentQuery.table +'.'+sonTable};
                    sonQuery.fields.push(item);
                    if (allSubQuery.indexOf(sonQuery)==-1){
                        allSubQuery.push(sonQuery);
                        parentQuery[sonTable] = sonQuery;
                        parentQuery.fields.push({isGroup:true, ref: sonQuery});
                    }
                }else if (tablePaths.length == 1){
                    parentQuery.fields.push(item);
                }else{
                    this.mergeChildrenFields([item], parentQuery[tablePaths[0]], allSubQuery)
                }
            }
        }

        // (select id from xxx)
        for (let query of sonQuerys){
           let queryFields = query[key];
           let tablePaths = key.split('.');
           tablePaths.shift();
           if (tablePaths.length == 1){
               query.query = `(select ${queryFields.map(e=>{
                return e.fieldPath;
               }).join(',')} from ${tablePaths[0]})`;
           }else{

           }
        }

    }
    mergeChildrenConditions(childrenConditionList,  parentQuery, allSubQuery){
        let sonQuerys = [];
        for (let item of childrenConditionList){
            if (item.table == parentQuery.table){
                parentQuery.conditions.push(item);
            }else{
                let sonTables = item.table.replace(parentQuery.table +'.', '');
                let tablePaths = sonTables.split('.');
                let sonTable = tablePaths.shift();
                let tab = parentQuery.table +'.'+sonTable;
                let sonQuery = null;
                for (let son of allSubQuery){
                    if (son.table == tab){
                        sonQuery = son;
                        break;
                    }
                }
                if (sonQuery){
                    sonQuery.conditions.push(item);
                }
            }
        }

        // (select id from xxx)
        for (let query of sonQuerys){
           let queryFields = query[key];
           let tablePaths = key.split('.');
           tablePaths.shift();
           if (tablePaths.length == 1){
               query.query = `(select ${queryFields.map(e=>{
                return e.fieldPath;
               }).join(',')} from ${tablePaths[0]})`;
           }else{

           }
        }

    }


      async wapperField(field){

        let tabMatch = field.match(/\b(.*?)\$/);
        let orgTables = tabMatch[1];
        let tablePaths = orgTables.split('.');

        let m = field.match(/\$(.+)\b/);
        let propertyPath = m[1];
        let propertyPaths = propertyPath.split('.');
        let newPropertyPaths = [];

        let descObj = this.rootDescriptionSObject;
        if (tablePaths.length > 1){
            let relationships = await this.getRelationshipObj(tablePaths, descObj.name, []);
            descObj = await this.getDescribeSobject(relationships[relationships.length - 1].childSObject);
        }

        let fieldObj = await this.getFieldObj(propertyPaths, descObj.name, newPropertyPaths);
        return {fieldPath:newPropertyPaths.join('.'), ref:fieldObj, table:orgTables, isChildSQL:tablePaths.length > 1};
      }

      async getRelationshipObj(tablePaths, sobjectname, newPropertyPaths){
        let descObj = this.rootDescriptionSObject;
        if (sobjectname == this.rootDescriptionSObject.name){
            descObj = this.rootDescriptionSObject;
        }else{
            descObj = await this.getDescribeSobject(sobjectname);
        }
        let currentRelationName = tablePaths.shift();
        if (currentRelationName == sobjectname){
            currentRelationName = tablePaths.shift();
        }

        let relationship =  descObj.childRelationships.find(e=>{
            return e.relationshipName == currentRelationName;
        })
        if (tablePaths.length > 0){
            return [relationship].concat(await this.getRelationshipObj(tablePaths, relationship.childSObject, newPropertyPaths));
        }
        return [relationship];
      }

      async getFieldObj(propertyPaths, sobjectname, newPropertyPaths){
        let descObj = this.rootDescriptionSObject;
        if (sobjectname == this.rootDescriptionSObject.name){
            descObj = this.rootDescriptionSObject;
        }else{
            descObj = await this.getDescribeSobject(sobjectname);
        }
        let fieldObj = descObj.fields.find((a)=>{
            return a.name == propertyPaths[0];
        });
        let propName = propertyPaths[0];
        let nameField = null;
        if (!fieldObj){
            fieldObj = descObj.fields.find((a)=>{
                return a.relationshipName == propertyPaths[0];
            });
            if (fieldObj){
                propName = fieldObj.name;
                nameField = await this.getNameField(fieldObj.referenceTo[0]);
                if (nameField){
                    propName = fieldObj.relationshipName+'.'+ nameField.name;
                }
            }
        }
        
        let firstElement = propertyPaths.shift();
        if (propertyPaths.length == 0){
            newPropertyPaths.push(propName);
            return fieldObj; 
        }else{
            if (fieldObj && fieldObj.type=="reference"){
                newPropertyPaths.push(fieldObj.relationshipName || fieldObj.referenceTo[0]);
                return await this.getFieldObj(propertyPaths, fieldObj.referenceTo[0], newPropertyPaths); 
            }
        }
        return {type:'unknow'};
      }

      async getNameField(sobjectname){
        let descObj = this.rootDescriptionSObject;
        if (sobjectname == this.rootDescriptionSObject.name){
            descObj = this.rootDescriptionSObject;
        }else{
            descObj = await this.getDescribeSobject(sobjectname);
        }
        let fieldObj = descObj.fields.find((a)=>{
            return a.nameField;
        });
        return fieldObj;
      }

      async wapperCondition(filter){
        let f = await this.wapperField(filter.column);
        if (!f.ref.filterable){
            return {};
        }

        let expr = '';
        if (filter.operator == 'equals'){
            if (f.ref.type == 'boolean'){
                expr = `${f.fieldPath}=${filter.value==1?true:false}`;
            }else if (f.ref.type == 'double'){
                expr = `${f.fieldPath}=${filter.value}`;
            }
            else if (f.ref.type == 'date' || f.ref.type == 'datetime'){
                expr =  `${f.fieldPath}=${filter.value}`;
            }
            let values = filter.value.split(',');
            if (values.length > 1){
                expr =  `${f.fieldPath} in (${values.map(e=> {
                    return "'"+e+"'";
                }).join(',')})`;
            }else {
                expr =  `${f.fieldPath}='${filter.value}'`;
            }
        }else if (filter.operator == 'notEqual'){

            if (f.ref.type == 'boolean'){
                expr = `${f.fieldPath}<>${filter.value==1?true:false}`;
            }else if (f.ref.type == 'double'){
                expr = `${f.fieldPath}<>${filter.value}`;
            }
            else if (f.ref.type == 'date' || f.ref.type == 'datetime'){
                expr =  `${f.fieldPath}<>${filter.value}`;
            }
            let values = filter.value.split(',');
            if (values.length > 1){
                expr =  `${f.fieldPath} not in (${values.map(e=> {
                    return "'"+e+"'";
                }).join(',')})`;
            }else {
                expr =  `${f.fieldPath}<>'${filter.value}'`;
            }
        }else if (filter.operator == 'contains'){
            expr =  f.fieldPath  + ' like \'%' + filter.value + '%\'';
        }

        f.expr = expr;
        return f;
      }

      async getDescribeSobject(sobjectname){
        await this.tree.getDescribeSobject(sobjectname);
        let dataMap = this.tree.dataMap[sobjectname] ||{};
        return dataMap.sobjectDescribe;
   }

      parseXML(content){
        let result = {type:'Report', field:[],filter:[]};
        let root = $(content);
        root.find('columns>field').each((index, ele)=>{
            let field = $(ele).text().trim();
            if (field.indexOf('BucketField_') != -1){
                let newField = '';
                root.find('buckets').each((index, ele)=>{
                    if ($(ele).children('developerName').text() == field){
                        newField = $(ele).children('sourceColumnName').text()
                    }
                })
                result.field.push(newField);
            }else{
                result.field.push(field)
            }
        })

        root.find('filter>criteriaItems').each((index, ele)=>{
            result.filter.push({
                column: $(ele).children('column').text(),
                operator: $(ele).children('operator').text(),
                value: $(ele).children('value').text()
            })
        })
        result.description = root.children('description').text();
        result.name = root.children('name').text();
        result.reportType = root.children('reportType').text();
        result.sortColumn = root.children('sortColumn').text();
        result.sortOrder = root.children('sortOrder').text();
        result.timeFrameFilter = {
            dateColumn : root.children('timeFrameFilter').children('dateColumn').text()
        };
        let fields = [...new Set(result.field)];
        result.field = fields;
        return result;
      }

      formatSQL(input){
        // const config = {
        //     language: language.options[language.selectedIndex].value,
        //     tabWidth: tabWidth.value,
        //     useTabs: useTabs.checked,
        //     keywordCase: keywordCase.options[keywordCase.selectedIndex].value,
        //     indentStyle: indentStyle.options[indentStyle.selectedIndex].value,
        //     logicalOperatorNewline:
        //       logicalOperatorNewline.options[logicalOperatorNewline.selectedIndex].value,
        //     expressionWidth: expressionWidth.value,
        //     lineBetweenQueries: lineBetweenQueries.value,
        //     denseOperators: denseOperators.checked,
        //     newlineBeforeSemicolon: newlineBeforeSemicolon.checked,
        //   };
        // refer  to https://sql-formatter-org.github.io/sql-formatter/
          let config = {"language":"sql",
            "tabWidth":"4",
            "useTabs":false,
            "keywordCase":"preserve",
            "indentStyle":"standard",
            "logicalOperatorNewline":"before",
            "expressionWidth":"50",
            "lineBetweenQueries":"1",
            "denseOperators":false,
            "newlineBeforeSemicolon":false
        }
          return sqlFormatter.format(input, config);
      }


      getReportContent(){
            if (this.reportContent){
                return this.reportContent;
            }
            return `<?xml version="1.0" encoding="UTF-8"?>
            <Report xmlns="http://soap.sforce.com/2006/04/metadata">
                <columns>
                    <field>Order$Channel_Type_Name__c</field>
                </columns>
                <columns>
                    <field>Order$Business_Type__c</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$Product2.BU_Name__c</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$Product2.LOB__c</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$Rev_Account_Group_ID__c</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$Product2.ProductCode</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$SKU__c</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$Product2.Product_Name_External__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Ordered_Qty__c</field>
                </columns>
                <columns>
                    <field>Order.OrderItems$Pricing_Plan_Step_Reference__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Base_OneTime_Charge__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$HKT_Item_Discount_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Third_Party_Item_Discount_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$CP_Burn__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Dist_HKT_Aggr_Discount_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Dist_Third_Party_Aggr_Discount_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Dist_HKT_Order_Discount_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Dist_Third_Party_Order_Discount_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Item_Discount_Coupon_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Dist_Order_Discount_Coupon_Amt__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$Return_Cancel_Request_Qty__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$vlocity_cmt__EffectiveQuantity__c</field>
                </columns>
                <columns>
                    <aggregateTypes>Sum</aggregateTypes>
                    <field>Order.OrderItems$vlocity_cmt__EffectiveOneTimeTotal__c</field>
                </columns>
                <currency>HKD</currency>
                <description>Daily Sales Summary Report (Call Centre)</description>
                <filter>
                    <criteriaItems>
                        <column>Order$Channel_Owner__c</column>
                        <columnToColumn>false</columnToColumn>
                        <isUnlocked>true</isUnlocked>
                        <operator>equals</operator>
                        <value>BU_MOB</value>
                    </criteriaItems>
                    <criteriaItems>
                        <column>Order$Channel_Type__c</column>
                        <columnToColumn>false</columnToColumn>
                        <isUnlocked>true</isUnlocked>
                        <operator>equals</operator>
                        <value>CTY_MOB_CCS</value>
                    </criteriaItems>
                    <criteriaItems>
                        <column>Order$RecordType</column>
                        <columnToColumn>false</columnToColumn>
                        <isUnlocked>true</isUnlocked>
                        <operator>equals</operator>
                        <value>Order.vlocity_cmt__StandardOrder</value>
                    </criteriaItems>
                    <criteriaItems>
                        <column>Order.OrderItems$Item_Type__c</column>
                        <columnToColumn>false</columnToColumn>
                        <isUnlocked>true</isUnlocked>
                        <operator>equals</operator>
                        <value>Advance,Deposit,Normal</value>
                    </criteriaItems>
                    <criteriaItems>
                        <column>Order$Custom_OrderStatus__c</column>
                        <columnToColumn>false</columnToColumn>
                        <isUnlocked>true</isUnlocked>
                        <operator>notEqual</operator>
                        <value>Cancel Requested,Cancelled,Cancel In Progress,Superseded,Expired</value>
                    </criteriaItems>
                    <language>en_US</language>
                </filter>
                <format>Summary</format>
                <groupingsDown>
                    <dateGranularity>Day</dateGranularity>
                    <field>Order$Channel_Name__c</field>
                    <sortOrder>Asc</sortOrder>
                </groupingsDown>
                <groupingsDown>
                    <field>Order$EffectiveDate</field>
                    <sortOrder>Asc</sortOrder>
                </groupingsDown>
                <groupingsDown>
                    <dateGranularity>Day</dateGranularity>
                    <field>Order.OrderItems$Item_Type__c</field>
                    <sortOrder>Asc</sortOrder>
                </groupingsDown>
                <name>Daily Sales Summary Report 002</name>
                <params>
                    <name>co</name>
                    <value>1</value>
                </params>
                <reportType>Order_Details__c</reportType>
                <scope>organization</scope>
                <showDetails>true</showDetails>
                <showGrandTotal>true</showGrandTotal>
                <showSubTotals>true</showSubTotals>
                <timeFrameFilter>
                    <dateColumn>Order$EffectiveDate</dateColumn>
                    <interval>INTERVAL_TODAY</interval>
                </timeFrameFilter>
            </Report>
            `

      }
}
