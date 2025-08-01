
export class Pentaho{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        
        this.lazy =true;
        this.processingQty = 0;
        this.sampleRecordCount = 1000;
        this.tabMgr = {tabs:[]};
        this.tabIndex = 0;
    }

    get starting(){
        return this._start || false;
    }

    set starting(s){
        this._start = s;
        this.totalReocrds(this.totalSize);
        if (s){
            $('#pentaho-refreshSObjectSearch').addClass('loading');
        }else{
            $('#pentaho-refreshSObjectSearch').removeClass('loading');
        }
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <p>
            Order Id Search:
            
            <div class="btn-container">	
                <div class="btn" id="pentaho-refreshSObjectSearch">
                    <span>Search</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="pentaho-tab-container">
            <span class="pentaho-tab-item" name="add">add</span>
            <input class="pentaho-tab-item" id="pentaho-fileSelect" type="file" name="file-input"></input>
        </div>
        <div class="pentaho-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span> <span> Display Records:</span><input id="exampleRecordsInput" class="search feedback-input" type="number" value="10"></input></div>
            <div class="totalbar" id="pentaho-notificationmessage"></div>

            <div class="pentaho-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="pentaho-btn-reset">Stop</li>
                    <li id="pentaho-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="merge-input" id="merge-input"></div>
                <textarea contenteditable="true" name="" id="pentaho-sql" placeholder="input your soql here start to query" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea readonly name="" id="pentaho-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <div class="pentaho-view-result tabitem Result">
                <div id="pentaho-showallsobjectdatatable"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    totalReocrds(qty){
        if (this.processingQty && this.processingQty != qty){
            qty = qty + '<span style="color:red;"> >>> ' + this.processingQty + '</span>';
        }
        $('.pentaho-searchresult .totalrecordnumber').html(qty);
    }



    initObjectAllDataHead(){
        $('#pentaho-refreshSObjectSearch').on('click', ()=>{
            let soql = $('#pentaho-sql').val().trim();

            this.search(soql);
        })

        $('#pentaho-fileSelect').on('change', (event)=>{
            
            if (event.target.files.length > 0) {
              console.log("File selected: ", event.target.files[0]);
            }else{
                return;
            }
            let fileReader = new FileReader();
            fileReader.readAsText(event.target.files[0]);
            fileReader.onload = ()=>{
                let m = new Main();
                m.parse(fileReader.result);
                this.records = m.records;
                this.exampleTable(m.records);
            }
        })

        $('#pentaho-showallsobjectdatatable').on('click','tr.row.header.blue>th', (e)=>{
            let field = $(e.target).attr('name');

            this.isAsc = this.lastSortField === field ? !this.isAsc : true;
            this.records = this.records.sort((a, b)=>{
                let numField = !Number.isNaN(Number(a[field])) && !Number.isNaN(Number(b[field]));
                if (numField) return this.isAsc? Number(a[field]) - Number(b[field]):Number(b[field]) - Number(a[field]);
                return this.isAsc?(a[field]||'').toString().localeCompare((b[field]||'').toString()):(b[field]||'').toString().localeCompare((a[field]||'').toString())
            });
            this.lastSortField = field;
            this.exampleTable(this.records);
        })
    }



    
    addMessage(message){
        this.messageList.push(message);
        $('#pentaho-message').val(this.messageList.join('\n'));
    }
    clear(){
        this.messageList = [];
        $('#pentaho-message').val('');
    }


    lazyUpdate(result){
        let newRecords = result.records || [];
        this.records.push(...newRecords);
        this.processingQty = this.records.length;
        this.addMessage('update records:' + newRecords.length + ' - ' +this.records.length + ' - ' + this.totalSize);
    }

    exampleTable(records){
        let h1 = this.tree.Tools.discoverColumns(records||[]);
        $('#pentaho-showallsobjectdatatable').html(this.render(records.slice(0, Math.min(this.sampleRecordCount, records.length)), h1));
    }

    toRecordString(r, f){
        if (r[f] || r[f]===0){
            return r[f].toString();
        }
        if (f.indexOf('.') != -1){
            let paths = f.split('.');
            const firstElement = paths.shift();
            return this.toRecordString(r[firstElement], paths.join('.'));
        }
        return '';
    }
    render(records, header){
        if (!records){
            return '';
        }
        if (!records.length)return'';
        return `
            <table id="pentaho-datatable" class="table">
                <thead>
                    <tr class="row header blue">
                        ${header.map(e=>{
                            return `<th class="field-${e} cell" name="${e}" tabindex="0">${e}
                            </th>`
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${records.map((r,$index)=>{
                        return `
                <tr class="row" >

                ${header.map(e=>{
                    return `<td class="cell field-${e}" tabindex="0" title="${e}">${e=='_'?($index+1):this.toRecordString(r,  e)||''}</td>`
                }).join('')}
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

}

class Main{
    parse(text){
        this.logMessage = this.logMessage || 'start.........';
        //text = (text+'').replaceAll('\\\n','\n');
        let lines = text.split('\n');
        let entry = false;
        let lineNo = -1;
        let obj = {};
        let name1 = '';
        let objs = [];
        let preLine = '';
        for (let line of lines){
            line = line.trim();
            if (line.charAt(line.length-1) == '\\'){
                preLine = preLine + line.substr(0,line.length-1);
                continue;
            }else{
                line = preLine + line;
                preLine='';
            }
            if (line.indexOf('CVP7 Process one report - Starting entry [Define report related variable]') != -1){
                entry = true;
                lineNo = 0;
                obj = {name1:name1, name:''};
                objs.push(obj);
            }
            if (line.indexOf('CVP7 Process one report - Finished job entry [Define report related variable]') != -1){
                entry = false;
                lineNo = -1;
            }
            if (entry){
                lineNo++;
                let match = /\(I=\d+, O=\d+, R=(\d+), W=\d+, U=\d+, E=\d+\)/.exec(line);
                if (lineNo == 2){
                    //console.log('row line=' + line);
                    let nameMatch = /\[(.*)\]/gi.exec(line);
                    if (nameMatch){
                        //obj.name = nameMatch[1];
                    }
                }

                if (line.indexOf('Write to log, report_path, index of.0 - REPORT_NAME =') != -1){
                    let reportNameMatch = /REPORT_NAME\s+=\s+([\w\d_-]+)/.exec(line);
                    if (reportNameMatch){
                        obj.name1 = reportNameMatch[1];
                        obj.name = reportNameMatch[1];
                    }
                    //console.log(JSON.stringify(reportNameMatch))
                }

                let m2 = /\d+\/\d+\/\d+ \d+:\d+:\d+ \- ([\d\w\s-_]+)\.0 \- Finished processing\s\(.*W=(\d+)/.exec(line);
                if (m2){
                    if (!obj.process){
                        obj.process = [];
                    }
                    obj.process.push({name:m2[1],row:Number(m2[2])});
                    
                }

                if (line.indexOf('sizeInBytes') != -1){
                    let sizematch = /"sizeInBytes":(\d+)/.exec(line);
                    if (sizematch){
                        obj.sizeInBytes = sizematch[1];
                    }
                    //console.log(JSON.stringify(reportNameMatch))
                }

                if (line.indexOf('{"entry":{"tag":"') != -1){
                    let sizematch = /"id":"([\d\w-]+)"/.exec(line);
                    if (sizematch){
                        obj.tags = sizematch[1];
                    }
                }

                if (line.indexOf('set report Variables.0 - Set variable ID to value [') != -1){
                    let sizematch = /Set variable ID to value \[(\d+)\]/.exec(line);
                    if (sizematch){
                        obj.dbId = sizematch[1];
                    }
                }

                if (line.indexOf('{"entry":{"isFile":true,"createdByUser":{"id":"p_edms_pentaho_rw","displayName":"p_edms_pentaho_rw"}') != -1){
                    let sizematch = /"id":"([\d\w-]+)","properties":/.exec(line);
                    if (sizematch){
                        obj.nodeid = sizematch[1];
                    }

                    let parentIdMatch = /"parentId":"([\d\w-]+)"/.exec(line);
                    if (parentIdMatch){
                        obj.parentNodeid = parentIdMatch[1];
                    }
                }
            }
        }
        let procMaxSize = {name:14};
        let objIndex = 0;
        for(let obj of objs){
            
            obj.row= Math.max(...obj.process.map(e =>e.row||0));
            obj.index = ++objIndex;
            for (let proc of obj.process){
                procMaxSize.name1 = Math.max(obj.name1.length, procMaxSize.name1||1);
                procMaxSize.name = Math.max(proc.name.length, procMaxSize.name||1);
                procMaxSize.row = Math.max(proc.row.toString().length, procMaxSize.row||1);
            }
            if('M_SALES_TRAN_BU_MOB' == obj.name1){
                console.log(JSON.stringify(obj))
            }
        }
        let compareField = (obj, obj2, field)=>{
            let v1 = obj[field];
            let v2 = obj2[field];
            if (v1 == v2){
                return 0;
            }
            if (v1 && v2){
                return 0;
            }
        }
        objs.sort((a, b)=>{
            if (a.tags && b.tags){return Number(b.sizeInBytes||0) - Number(a.sizeInBytes||0)}
            return a.tags == b.tags?(a.sizeInBytes||'').localeCompare(b.sizeInBytes||''):(a.tags||'').localeCompare(b.tags||'');
            //return Number(a.sizeInBytes||0) - Number(b.sizeInBytes||0);
            //return Number(a.dbId) - Number(b.dbId);
            //return Number(b.row) == Number(a.row) ? a.name1.localeCompare(b.name1): Number(b.row) - Number(a.row);
        })
        console.log('',procMaxSize)

        let keys = new Set();
        
        let maxSize = {};
        for(let obj of objs){
            let objKeys = Object.keys(obj)
            for(let key of objKeys){
                keys.add(key);
                let valu = obj[key] +'';
                maxSize[key] = Math.max(valu.toString().length, maxSize[key]||key.toString().length);
            }
        }

        keys.delete('process');
        
        let keysArray = [...keys];

        let header = keysArray.map(e=>{
            return `${e}${' '.repeat(Math.abs(maxSize[e] - e.toString().length))}`;
        }).join('|');
        this.log(header + `| (Process Name)${' '.repeat(procMaxSize.name - 12)} | Row${' '.repeat(procMaxSize.row-3)}|`);

        let newObjList = [];
        for(let obj of objs){
            //obj.row= obj.process[obj.process.length-1].row;

            let newObj = {index:0, excelRow:0, name:''};
            newObjList.push(newObj);
            let preStr = keysArray.map(e=>{
                let valu = obj[e] || '';
                newObj[e] = valu;
                
                return `${obj[e]||''}${' '.repeat(Math.abs(maxSize[e] - valu.toString().length))}`;
            }).join('|');
            //console.log(preStr)

            for (let proc of obj.process){
                if (proc.name=='Microsoft Excel writer'){
                    newObj.excelRow = proc.row;
                }
                this.log(preStr + `| (${proc.name})${' '.repeat(procMaxSize.name-proc.name.toString().length)} | ${proc.row}${' '.repeat(procMaxSize.row-proc.row.toString().length)}|`);
            }
        }
        //console.log(JSON.stringify(objs[0]))
        newObjList.sort((a, b)=>{return a.index-b.index})
        console.table(newObjList);
        this.records = newObjList;
    }

    log(content){
        this.logMessage = this.logMessage+'\n'+content;
    }
}
