
export class ApexLogAnalysis{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        
        this.lazy =true;
        this.processingQty = 0;
        this.sampleRecordCount = 1000000;
        this.types = new Set();
    }

    get starting(){
        return this._start || false;
    }

    set starting(s){
        this._start = s;
        this.totalReocrds(this.totalSize);
        if (s){
            $('#logAnalysis-refreshSObjectSearch').addClass('loading');
        }else{
            $('#logAnalysis-refreshSObjectSearch').removeClass('loading');
        }
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <style>
            .x-grid-table{
                max-height: 90vh;
            }

            #toolbar-1441 {
                position: sticky;
                left: 0;
                bottom: 0px;
                background-color: white;
                color: black;
            }

            .x-grid-select{
                color:#d5c0d0;
            }
        </style>
        <p>
            Order Id Search:
            
            <div class="btn-container">	
                <div class="btn" id="logAnalysis-refreshSObjectSearch">
                    <span>Method</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-Report1">
                    <span>Report1</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-Report2">
                    <span>Report2</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="logAnalysis-tab-container">
            <span class="logAnalysis-tab-item" name="add">add</span>
            <input class="logAnalysis-tab-item" id="logAnalysis-fileSelect" type="file" name="file-input"></input>
        </div>
        <div class="logAnalysis-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span></div>
            <div class="totalbar" id="logAnalysis-notificationmessage"></div>

            <div class="logAnalysis-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="logAnalysis-btn-reset">Stop</li>
                    <li id="logAnalysis-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="merge-input" id="merge-input"></div>
                <input id="logAnalysis-searchkey" class="feedback-text feedback-input"></input>
                <textarea contenteditable="true" name="" id="logAnalysis-sql" placeholder="input your soql here start to query" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea readonly name="" id="logAnalysis-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <div class="logAnalysis-view-result tabitem Result">
                <div id="logAnalysis-showallsobjectdatatable"></div>
                <div id="logAnalysis-showallsobjectdatatable2"></div>
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
        $('.logAnalysis-searchresult .totalrecordnumber').html(qty);
    }


    initObjectAllDataHead(){

        $('#logAnalysis-refreshSObjectSearch').on('click', ()=>{
            let content = $('#logAnalysis-sql').val().trim();

            let records = this.parse_log_file(content);
            this.exampleTable(records);
        })

        $('#logAnalysis-Filter').on('click', ()=>{
            let content = $('#logAnalysis-sql').val().trim();
            let key = $('#logAnalysis-searchkey').val().trim();
            let records = this.filter_log_file(content, key);
            this.exampleTable(records);
        })

        $('#logAnalysis-fileSelect').on('change', (event)=>{
            
            if (event.target.files.length > 0) {
              console.log("File selected: ", event.target.files[0]);
            }else{
                return;
            }
            let fileReader = new FileReader();
            fileReader.readAsText(event.target.files[0]);
            fileReader.onload = ()=>{
                //m.parse(fileReader.result);
                let records = this.parse_log_file2(fileReader.result);
                $('#logAnalysis-showallsobjectdatatable2').html(this.renderReport2(records));
            }
        })

        $('#logAnalysis-Report1').on('click', ()=>{
            $('#logAnalysis-showallsobjectdatatable').show();
            $('#logAnalysis-showallsobjectdatatable2').hide();
        })

        $('#logAnalysis-Report2').on('click', ()=>{
            $('#logAnalysis-showallsobjectdatatable').hide();
            $('#logAnalysis-showallsobjectdatatable2').show();
        })

        $('#logAnalysis-showallsobjectdatatable2').on('change', '#textfield-1450-inputEl', ()=>{
            this.filterReport2();

            const targetElement = document.querySelector('.x-grid-select');
            targetElement.scrollIntoView({ behavior: "smooth" });
        })

        $('#logAnalysis-showallsobjectdatatable2').on('click', '.x-form-checkbox', ()=>{
            this.filterReport2();

            const targetElement = document.querySelector('.x-grid-select');
            targetElement.scrollIntoView({ behavior: "smooth" });
        })
        

        $('#logAnalysis-showallsobjectdatatable2').on('click', 'tr.x-grid-row-over', (event)=>{
            $('.x-grid-select').removeClass('x-grid-select');
            $(event.target).addClass('x-grid-select');
        })
        
    }

    

    isDebugonly(record){
        return !this.isDebugOnlyChecked || (this.isDebugOnlyChecked && record.event == 'USER_DEBUG');
    }

    isFilterDetails(record){
        return !this.isFilterDetailChecked || (this.isFilterDetailChecked && record.details.indexOf(this.filterDetailsWord) != -1);
    }

    filterByExecuteable(record){
        return !this.isExecuteableChecked;
    }

    filter_log_file(content, key){
        let lines = content.split(/\n/);
        let entryLineNo = 1;
        let datas = [];
        
        for (let line of lines){
            entryLineNo++;
            if (line.indexOf(key) == -1){
                continue;
            }
            // 11:06:46.0 (162425082)|HEAP_ALLOCATE|[EXTERNAL]|Bytes:4
            let conents = line.split('|');
            let type = /^(\d+:\d+:\d+\.\d+)\s*\((\d+)\)\|([\d\w_]+)\|/gi.exec(line);
            if (type){
                this.types.add(type[3]);
            }
            datas.push({
                'line No.':entryLineNo,
                'Time':type?type[1]:'',
                'Type':type?type[3]:'',
                'Content':line
            })
        }
        return datas;
    }

    parse_log_file(content){
        let methodData = [];
        let methodEntryPattern = /\|METHOD_ENTRY\|\[\d+\]\|\w*\|([^\|]+)/gi;
        let methodExitPattern = /\|METHOD_EXIT\|\[\d+\]\|\w*\|([^\|]+)/gi;
        let timestampPattern = /^(\d+:\d+:\d+\.\d+)\s*\((\d+)\)/gi;

        let methodEntrys = {};

        let lines = content.split(/\n/);
        let entryLineNo = 1;
        let entryMethods = [];
        for (let line of lines){
            let human_timestamp = '';
            let timestamp_ns = '';
            let timeRet = /^(\d+:\d+:\d+\.\d+)\s*\((\d+)\)/gi.exec(line);
            let methodEntryRet = /\|METHOD_ENTRY\|\[\d+\]\|\w*\|([^\|]+)/gi.exec(line);
            let methodExitRet = /\|METHOD_EXIT\|\[\d+\]\|\w*\|([^\|]+)/gi.exec(line);
            let timeTokenMs = 0;
            let methodEntry;
            if (methodEntryRet){
                methodEntry = this.splitClassAndMethodName(methodEntryRet[1]);
                if (timeRet){
                    human_timestamp = timeRet[1];
                    timeTokenMs = timeRet[2];
                }
                methodEntry.timeRet = timeRet || [0,0,0];
                methodEntry.lineNumber = entryLineNo;

                methodData.push({
                    'line No.':entryLineNo,
                    'Type':'ENTRY',
                    'Class Name':'-'.repeat(entryMethods.length)+methodEntry.className,
                    'Method Name':methodEntry.methodName,
                    'Start Time':human_timestamp,
                    'End Time':'NA',
                    'Time taken(ms)':'NA'
                })

                entryMethods.push(methodEntry);
            }

            let methodExit;
            if (methodExitRet){
                methodExit = this.splitClassAndMethodName(methodExitRet[1]);
                if (timeRet){
                    human_timestamp = timeRet[1];
                    timeTokenMs = timeRet[2];
                }

                let entrymethod = entryMethods.pop();

                methodData.push({
                    'line No.':entryLineNo,
                    'Type':'EXIT',
                    'Class Name':'-'.repeat(entryMethods.length)+methodExit.className,
                    'Method Name':methodExit.methodName,
                    'Start Time':entrymethod.timeRet[1]?entrymethod.timeRet[1]:'NA',
                    'End Time':human_timestamp,
                    'Time taken(ms)':entrymethod.timeRet[2]?timeTokenMs - entrymethod.timeRet[2]:'NA',
                    'Entry line':entrymethod.lineNumber
                })
            }else{
                if (line.indexOf('METHOD_EXIT') != -1){
                    console.log(line);
                }
            }

            entryLineNo++;
        }

        return methodData;
    }

    splitClassAndMethodName(fullMethodName){
        let className = '';
        let methodName = '';
        if (fullMethodName.indexOf('.') != -1 && fullMethodName.indexOf('(') != -1){
            let classNamePart = fullMethodName.split('(');
            let methodPart = classNamePart[0].split('.');
            return {className: methodPart[0], methodName:methodPart[1]};
        }
        return null;
    }

    convertToHumanReable(human_timestamp, timestamp_ns){

        base_time = datetime.strptime(human_timestamp, "%H:%M:%S.%f")
        // Extract milliseconds from nanoseconds
        milliseconds = (timestamp_ns % 1_000_000_000) / 1_000_000
        // Add milliseconds to base_time
        final_time = base_time + timedelta(milliseconds=milliseconds)
        //return final_time.strftime("%H:%M:%S.%f")[:-3]  # "HH:mm:ss.SSS"
    }

    startMergeInput(h1, h2){
        
        let h1Opts = h1.map(e=>`<option value="${e}">${e}</option>`);
        let h2Opts = h2.map(e=>`<option value="${e}">${e}</option>`);
        let mg = `<div class="merge-item">
        <select id="merge-option1" class="fieldname feedback-input main-style">
            <option value="">Please select object</option>
            ${h1Opts}
        </select>
        <select id="merge-option2" class="fieldname feedback-input main-style">
            <option value="">Please select object</option>
            ${h2Opts}
        </select></div>`;

        $('#merge-input').html(mg);
    }

    async search(soql){
        this.clear();
        this.exampleTable([]);
        let headerstr = soql.match(/select\s+(.*)\s+from/ig);
        this.headers = null;
        if (headerstr){
            let header = headerstr[0]
            let fields = header.substring('select'.length, header.length-'from'.length);
            let fieldList = fields.split(/[\s,]+/);
            this.headers = fieldList.filter(Boolean);
        }

        let result = await this.tree.getRecordsBySoql(soql);

        
        this.totalSize = result.totalSize;
        this.addMessage('totalSize:' + result.totalSize);
        this.addMessage('title:' + result.title);
        this.records = [];
        
        this.lastResult = result.data;
        this.starting = true;
        this.lazyNext(this.lastResult);
        this.exampleTable(this.records);
    }

    
    addMessage(message){
        this.messageList.push(message);
        $('#logAnalysis-message').val(this.messageList.join('\n'));
    }
    clear(){
        this.messageList = [];
        $('#logAnalysis-message').val('');
    }

    lazyNext(lastResuslt){
        lastResuslt.allRecords = [];
        this.lazyUpdate(lastResuslt);
        this.addMessage('start:' + lastResuslt.nextRecordsUrl);
        this.tree.loadNextRecords(lastResuslt, false).then(result=>{
            
            if (this.starting && result.nextRecordsUrl){
                //this.lazyUpdate(result);
                this.lazyNext(result);
            }
            else{
                this.starting = false;
                if (lastResuslt != result){
                    this.lazyUpdate(result);
                }
                this.addMessage('end total records:' + this.records.length);
                
            }
            this.totalReocrds(this.totalSize);
        });
    }

    lazyUpdate(result){
        let newRecords = result.records || [];
        this.records.push(...newRecords);
        this.processingQty = this.records.length;
        this.addMessage('update records:' + newRecords.length + ' - ' +this.records.length + ' - ' + this.totalSize);
    }

    exampleTable(records){
        let h1 = this.tree.Tools.discoverColumns(records||[]);
        $('#logAnalysis-showallsobjectdatatable').html(this.render(records.slice(0, Math.min(this.sampleRecordCount, records.length)), h1));
       
    }

    render(records, header){
        if (!records){
            return '';
        }
        if (!records.length)return'';
        var toRecordString = (r, f)=>{
            if (r[f]){
                return r[f];
            }
            if (f.indexOf('.') != -1){
                let paths = f.split('.');
                const firstElement = paths.shift();
                return toRecordString(r[firstElement], paths.join('.'));
            }
            return '';
        }
        return `
            <table id="logAnalysis-datatable" class="table">
                <thead>
                    <tr class="row header blue">
                        ${header.map(e=>{
                            return `<th class="field-${e} cell" tabindex="0">${e}
                            </th>`
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${records.map(r=>{
                        return `
                <tr class="row" >

                ${header.map(e=>{
                    return `<td class="cell field-${e}" tabindex="0" title="${e}">${toRecordString(r,  e)||''}</td>`
                }).join('')}
                </tr>`
                    }).join('')}
                </tbody>
            </table>`
    }

    parse_log_file2(content){
        let lines = content.split(/\n/);

        let records = [];
        for (let line of lines){
            let record = {Content : line};
            let infos = line.split('|');
            if (infos[0]){
                let timeRet = /^(\d+:\d+:\d+\.\d+)\s*\((\d+)\)/gi.exec(line);
                if (timeRet){
                    record.Time = timeRet[1];
                }
            }
            if (infos[1]){
                record.event = infos[1];
            }
            if (infos[2]){
                record.event1 = infos[2];
            }
            if (infos[3]){
                record.details = infos.slice(2).join('|');
            }else{
                record.details = line;
            }
            records.push(record);
        }
        return records;
    }

    filterReport2(){
        let text = $('#textfield-1450-inputEl').val().toLocaleLowerCase();
        this.isDebugOnlyChecked = $('#checkboxfield-debugonly-input').checked();
        this.isFilterDetailChecked = $('#checkboxfield-filter-input').checked();
        if (this.isFilterDetailChecked){
            this.filterDetailsWord = $('#textfield-1450-inputEl').val().toLocaleLowerCase();
        }else{
            $('#textfield-1450-inputEl').val('');
        }
        this.isExecuteableChecked = $('#checkboxfield-executable-input').checked();

        if (!text){
            $('#gridview-1440 tr.x-grid-row-over').show();
            return;
        }
        $('#gridview-1440 tr.x-grid-row-over').each((index, ele)=>{
            let val = $(ele).find('td.x-grid-cell').text().toLocaleLowerCase();
            let record = {details: val, event:''};
            if (this.isDebugonly(record) || this.isFilterDetails(record) || this.filterByExecuteable(record)){
                $(ele).show();
            }else{
                $(ele).hide();
            }
        })

    }

    filterRecords2(records){
        this.isDebugOnlyChecked = $('#checkboxfield-debugonly-input').checked();
        this.isFilterDetailChecked = $('#checkboxfield-filter-input').checked();
        this.filterDetailsWord = $('#textfield-1450-inputEl').val();
        this.isExecuteableChecked = $('#checkboxfield-executable-input').checked();
        return records.filter(e=>{
            return this.isDebugonly(e)&&this.isFilterDetails(e)&&this.filterByExecuteable(e)
        })
    }


    renderReport2(records){

        let showRecords = [];
        let index = 0;
        for (let item of records){
            showRecords.push({
                details : item.details,
                logLine : index++,
                timestamp : item.Time,
                event : item.event
            })
        }
        let parserObj = {
            header : [{
                name:'logLine',
                show:true,
                width:50
            },{
                name:'count',
                show:false
            }, {
                name:'timestamp',
                show:true,
                width:100
            }, {
                name:'file',
                show:false
            }, {
                name:'method',
                show:false
            }, {
                name:'event',
                show:false,
                width:100
            },  {
                name:'details',
                show:true,
                width:1000
            }, {
                name:'src',
                show:false
            }, {
                name:'category',
                show:false
            }],
            records:showRecords
        };

        
        let body = `
                <div id="logpanel-1429" class="x-panel x-grid-with-row-lines x-box-item x-panel-default x-grid" style="left: 0px; top: 0px; margin: 0px;">
                <div id="logpanel-1429_header" style="left: 0px; top: 0px;">
                    <div id="logpanel-1429_header-body" class="x-panel-header-body x-panel-header-body-default x-panel-header-body-horizontal x-panel-header-body-default-horizontal x-panel-header-body-top x-panel-header-body-default-top x-panel-header-body-docked-top x-panel-header-body-default-docked-top x-panel-header-body-default-horizontal x-panel-header-body-default-top x-panel-header-body-default-docked-top x-box-layout-ct"
                    style="width: 1526px;">
                    <div id="logpanel-1429_header-innerCt" class="x-box-inner " role="presentation" style="height: 17px;">
                        <div id="logpanel-1429_header-targetEl" style="position:absolute;width:20000px;left:0px;top:0px;height:1px">
                            <div id="logpanel-1429_header_hd" class="x-component x-panel-header-text-container x-box-item x-component-default" style="text-align: left; left: 0px; top: 0px; margin: 0px; width: 1526px;">
                                <span id="logpanel-1429_header_hd-textEl" class="x-panel-header-text x-panel-header-text-default">Execution Log</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="headercontainer-1430" class="x-grid-header-ct x-docked x-grid-header-ct-default x-docked-top x-grid-header-ct-docked-top x-grid-header-ct-default-docked-top x-box-layout-ct" style="border-width: 1px; left: 0px; top: 24px; width: 1536px;">
                    <div id="headercontainer-1430-innerCt" class="x-box-inner " role="presentation" style="width: 1145px; height: 22px;">
                    <div id="headercontainer-1430-targetEl" style="position:absolute;width:20000px;left:0px;top:0px;height:1px">
                        <div id="gridcolumn-1431" class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null" style="border-width: 1px; width: 30px; display: none;">
                            <div id="gridcolumn-1431-titleEl" class="x-column-header-inner">
                                <span id="gridcolumn-1431-textEl" class="x-column-header-text">Log Line #</span>
                                <div id="gridcolumn-1431-triggerEl" class="x-column-header-trigger"></div>
                            </div>
                            <div id="gridcolumn-1431-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1432" class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null"
                        style="border-width: 1px; width: 30px; display: none;">
                        <div id="gridcolumn-1432-titleEl" class="x-column-header-inner"><span id="gridcolumn-1432-textEl"
                            class="x-column-header-text">Count</span>
                            <div id="gridcolumn-1432-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1432-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1433"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null x-column-header-first"
                        style="border-width: 1px; width: 100px; height: auto; left: 0px; top: 0px; margin: 0px;">
                        <div id="gridcolumn-1433-titleEl" class="x-column-header-inner" style="height: auto; padding-top: 3px;"><span
                            id="gridcolumn-1433-textEl" class="x-column-header-text">Timestamp</span>
                            <div id="gridcolumn-1433-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1433-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1434"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null"
                        style="border-width: 1px; width: 170px; display: none;">
                        <div id="gridcolumn-1434-titleEl" class="x-column-header-inner"><span id="gridcolumn-1434-textEl"
                            class="x-column-header-text">File</span>
                            <div id="gridcolumn-1434-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1434-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1435"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null"
                        style="border-width: 1px; width: 170px; display: none;">
                        <div id="gridcolumn-1435-titleEl" class="x-column-header-inner"><span id="gridcolumn-1435-textEl"
                            class="x-column-header-text">Method</span>
                            <div id="gridcolumn-1435-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1435-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1436"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null"
                        style="border-width: 1px; width: 100px; height: auto; left: 100px; top: 0px; margin: 0px;">
                        <div id="gridcolumn-1436-titleEl" class="x-column-header-inner" style="height: auto; padding-top: 3px;"><span
                            id="gridcolumn-1436-textEl" class="x-column-header-text">Event</span>
                            <div id="gridcolumn-1436-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1436-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1437"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null x-column-header-last"
                        style="border-width: 1px; width: 928px; height: auto; left: 200px; top: 0px; margin: 0px;">
                        <div id="gridcolumn-1437-titleEl" class="x-column-header-inner" style="height: auto; padding-top: 3px;"><span
                            id="gridcolumn-1437-textEl" class="x-column-header-text">Details</span>
                            <div id="gridcolumn-1437-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1437-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1438"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined x-column-header-sort-null"
                        style="border-width: 1px; width: 40px; display: none;">
                        <div id="gridcolumn-1438-titleEl" class="x-column-header-inner"><span id="gridcolumn-1438-textEl"
                            class="x-column-header-text">Src#</span>
                            <div id="gridcolumn-1438-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1438-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                        <div id="gridcolumn-1439"
                        class="x-unselectable x-column-header-align-left x-box-item x-column-header x-unselectable-default x-column-header-sort-undefined"
                        style="border-width: 1px; width: 100px; display: none;">
                        <div id="gridcolumn-1439-titleEl" class="x-column-header-inner"><span id="gridcolumn-1439-textEl"
                            class="x-column-header-text">Category</span>
                            <div id="gridcolumn-1439-triggerEl" class="x-column-header-trigger"></div>
                        </div>
                        <div id="gridcolumn-1439-clearEl" class="x-clear" role="presentation"></div>
                        </div>
                    </div>
                    </div>
                </div>
                <div id="logpanel-1429-body" class="x-panel-body x-grid-body x-panel-body-default x-panel-body-default x-layout-fit" style="left: 0px; top: 46px; ">
                    <div id="gridview-1440" class="x-grid-view x-fit-item x-grid-view-default x-unselectable" style="overflow: auto;  margin: 0px; " tabindex="-1">
                        <div style="position:absolute;width:1px;height:0;top:0;left:0;" id="ext-gen2405"></div>
                        <table class="x-grid-table x-grid-table-resizer" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr class="x-grid-header-row">
                                ${parserObj.header.map(e=>{
                                    return `<th class="x-grid-col-resizer-gridcolumn-1431" style="${e.show?(e.width?'width:'+e.width+'px':''):'0px'}; height: 0px;"></th>`;
                                })}
                                </tr>
                                ${parserObj.records.map(recod=>{
                                    return `<tr class="x-grid-row x-grid-row-over">
                                        ${parserObj.header.map(e=>{
                                            return `<td class="${e.name} x-grid-cell x-grid-cell-gridcolumn-1431">
                                                    <div class="x-grid-cell-inner " style="text-align: left;">
                                                        ${recod[e.name]||''}
                                                    </div>
                                                </td>`;
                                        })}
                                    </tr>`
                                })}
                                <tr class="x-grid-row x-grid-row-selected x-grid-row-focused x-grid-row-over">
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1431   x-grid-cell-first">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">0</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1432   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">&nbsp;</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1433   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">09:30:57:000</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1434   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">/aura</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1435   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">/aura</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1436   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">USER_INFO</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1437   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">
                                        [EXTERNAL]|005N000000B0ZgE|virco.sw.chen@pccw.com.fta|(GMT+08:00) Hong Kong Standard Time
                                        (Asia/Hong_Kong)|GMT+08:00</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1438   ">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">1</div>
                                    </td>
                                    <td class=" x-grid-cell x-grid-cell-gridcolumn-1439   x-grid-cell-last">
                                    <div class="x-grid-cell-inner " style="text-align: left; ;">APEX_CODE</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="toolbar-1441" class="x-toolbar x-docked x-toolbar-default x-docked-bottom x-toolbar-docked-bottom x-toolbar-default-docked-bottom x-box-layout-ct">
                        <label id="checkboxfield-1442-labelEl" class="x-form-item-label x-form-item-label-left" style="width:100px;margin-right:5px;"></label>
                        <input type="checkbox" id="checkboxfield-1442-inputEl" class="x-form-field x-form-checkbox" autocomplete="off" hidefocus="true" aria-invalid="false" data-errorqtip=""/>
                        <label id="checkboxfield-1442-boxLabelEl" class="x-form-cb-label x-form-cb-label-after" for="checkboxfield-1442-inputEl">This Frame</label>

                        <label id="checkboxfield-1444-labelEl" for="checkboxfield-1444-inputEl" class="x-form-item-label x-form-item-label-left" style="width:100px;margin-right:5px;"></label>
                        <input type="checkbox" id="checkboxfield-executable-input" class="x-form-field x-form-checkbox" autocomplete="off" hidefocus="true" aria-invalid="false" data-errorqtip=""/>
                        <label id="checkboxfield-executable" class="x-form-cb-label x-form-cb-label-after" for="checkboxfield-1444-inputEl">Executable</label>

                        <label id="checkboxfield-1446-labelEl" for="checkboxfield-1446-inputEl" class="x-form-item-label x-form-item-label-left" style="width:100px;margin-right:5px;"></label>
                        <input type="checkbox" id="checkboxfield-debugonly-input" class="x-form-field x-form-checkbox" autocomplete="off" hidefocus="true" aria-invalid="false" data-errorqtip=""/>
                        <label id="checkboxfield-debugonly" class="x-form-cb-label x-form-cb-label-after" for="checkboxfield-1446-inputEl">Debug Only</label>

                        <label id="checkboxfield-1448-labelEl" for="checkboxfield-1448-inputEl" class="x-form-item-label x-form-item-label-left" style="width:100px;margin-right:5px;"></label>
                        <input type="checkbox" id="checkboxfield-filter-input" class="x-form-field x-form-checkbox" autocomplete="off" hidefocus="true" aria-invalid="false" data-errorqtip="">
                        <label id="checkboxfield-filter" class="x-form-cb-label x-form-cb-label-after" for="checkboxfield-1448-inputEl">Filter</label>

                        <input id="textfield-1450-inputEl" type="text" size="1" name="textfield-1450-inputEl" placeholder="Click here to filter the log" style="width:100%;" class="x-form-field x-form-empty-field x-form-text" autocomplete="off" aria-invalid="false" data-errorqtip="">

                
                    </div>
                    </div>
                </div>
            </div>`;
        return body;
    }

}
