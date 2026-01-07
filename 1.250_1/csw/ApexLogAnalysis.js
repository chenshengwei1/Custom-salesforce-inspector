import {Tools} from "./Tools.js";
import {FloatingProgressBar} from "./FloatingProgressBar.js"

export class ApexLogAnalysis{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        
        this.lazy =true;
        this.processingQty = 0;
        this.sampleRecordCount = 1000000;
        this.types = new Set();
        this.apexLogs = {};
        this.name = 'ApexLogAnalysis';
        this.currentLogContent = '';
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

    active(){
        this.render();
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <style>
            .x-grid-table{
                max-height: 90vh;
                padding: 0 10px;
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
                background-color: azure;
            }

            #logAnalysis-debuglog {
                width: 100%;
                max-height: 500px;
                overflow-y: scroll;
            }
        </style>
        <p>
            Order Id Search:
            
            <div class="btn-container">	
                <div class="btn" id="logAnalysis-refreshSObjectSearch">
                    <span>Method</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-executeAnonymous">
                    <span>executeAnonymous</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-ClearneCache">
                    <span>Clear Cache</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-refresh">
                    <span>refresh</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-hideLogPanel">
                    <span>HideLogPanel</span>
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
                <div class="merge-input" id="merge-input"></div>
                <input id="logAnalysis-searchkey" class="feedback-text feedback-input" placeholder="input your log id here start to query"></input>
                <textarea contenteditable="true" name="" id="logAnalysis-content" placeholder="input your log text here start to parse" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea readonly name="" id="logAnalysis-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <div class="logAnalysis-view-result tabitem Result">
                <div id="logAnalysis-showallsobjectdatatable"></div>
                <div id="logAnalysis-showallsobjectdatatable2"></div>
            </div>
        </div>
        <div class="logAnalysis-log-searchresult">
            <div class="debuglog">
                <table id="logAnalysis-debuglog" style="width: 100%;" class="table">
                    <thead>
                        <tr class="">
                            <th class="field-user " tabindex="0">User</th>
                            <th class="field-app " tabindex="0">Application</th>
                            <th class="field-operation " tabindex="0">Operation</th>
                            <th class="field-time " tabindex="0">Time</th>
                            <th class="field-status " tabindex="0">Status</th>
                            <th class="field-read " tabindex="0">Read</th>
                            <th class="field-size " tabindex="0">Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="debug-row-0">
                            <td class=" field-value" tabindex="0"></td>
                            <td class="field-value " tabindex="0"></td>
                            <td class="field-actions "></td>
                            <td class="field-actions "></td>
                            <td class="field-actions "></td>
                            <td class="field-actions "></td>
                        </tr>
                    </tbody>
                </table>
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

        $('#logAnalysis-hideLogPanel').on('click', (e)=>{
            $('#logAnalysis-showallsobjectdatatable2').hide();
        })

        $('#logAnalysis-refreshSObjectSearch').on('click', ()=>{
            let apexLogId = $('#logAnalysis-searchkey').val().trim();
            this.openDebugLog(apexLogId);
        })

        $('#logAnalysis-Filter').on('click', ()=>{
            let content = this.currentLogContent;
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
                $('#logAnalysis-showallsobjectdatatable2').show();
                this.renderApexLogContent(records);
            }
        })

        $('#logAnalysis-refresh').on('click', ()=>{
            this.debugLogMonitor();
        })
        

        $('#logAnalysis-debuglog').on('dblclick','tr',  (e)=>{
            console.log(e.currentTarget.id);
            this.openDebugLog(e.currentTarget.id);
        })


        $('#logAnalysis-executeAnonymous').on('click', ()=>{
            this.debugLogMonitor('executeAnonymous');
        })

        $('#logAnalysis-ClearneCache').on('click',  (e)=>{ 
            $('tr[id].debug-row').remove();
        })

        $('#logAnalysis-debuglog').on('click','tr',  (e)=>{
            $('#logAnalysis-debuglog tr').removeClass('selected');
            $(e.currentTarget).addClass('selected');
        })

        $('#logAnalysis-showallsobjectdatatable2').on('change', '#textfield-1450-inputEl', this.applyFilter.bind(this));

        $('#logAnalysis-showallsobjectdatatable2').on('click', '.x-form-checkbox', this.applyFilter.bind(this));

        $('#logAnalysis-showallsobjectdatatable2').on('change', '#checkboxfield-type-input', this.applyFilter.bind(this));

        $('#logAnalysis-showallsobjectdatatable2').on('click', 'tr.x-grid-row-over', (event)=>{
            $('.x-grid-select').removeClass('x-grid-select');
            $(event.currentTarget).addClass('x-grid-select');
        })
        
        
    }

    applyFilter(){
        const targetElement = document.querySelector('.x-grid-select');
        let lineId = targetElement ? targetElement.id : null;

        this.filterReport2();

        if (lineId){
            let targetElement = document.getElementById(lineId);
            targetElement.scrollIntoView({ behavior: "smooth", block: 'center'       // 对齐方式: start, center, end, nearest 
            });
        }
    }

    render(){
        this.debugLogMonitor();
    }

    initialData(data){
        if (data.id && data.type == 'ApexLog'){
            this.openDebugLog(data.id);
        }
    }

    openDebugLog(id){
        $('#logAnalysis-showallsobjectdatatable2').show();
        if (!id){
            return;
        }
        if (this.apexLogs[id]){
            this.currentLogContent = this.apexLogs[id];
            this.activateDebugLogTab(this.apexLogs[id]);
            return;
        }
        this.tree.getApexlogByid(id).then(e=>{
            this.apexLogs[id]=e.data;
            this.currentLogContent = this.apexLogs[id];
            this.activateDebugLogTab(e.data);
        });
    }

    activateDebugLogTab(content){
        let records = this.parse_log_file2(content || 'failed to load debug log');
        this.renderApexLogContent(records);
    }

    debugLogMonitor(type){
        setTimeout(()=>{
            this.loadDebugLog(type);
        });
    }

    async loadDebugLog(type){
        const userId = this.tree.userInfo.userId;
        let soql  = `select Id,LogUser.Name,Status, Request,   LogLength,LogUserId, Operation,Application,StartTime from ApexLog where LogUserId = '${userId}' order by StartTime desc limit 50`;
        if (type == 'executeAnonymous'){
            soql  = `select Id,LogUser.Name,Status, Request,   LogLength,LogUserId, Operation,Application,StartTime from ApexLog where LogUserId = '${userId}' and Operation like '%executeAnonymous%' order by StartTime desc limit 50`;
        }
        if (!userId){
            return;
        }
        let result = await this.tree.getRecordsBySoql(soql);
        if (result.results.length){
            result.results.sort((a, b)=>{
                return new Date(a.StartTime) - new Date(b.StartTime);
            });
            for (let record of result.results){
                if ($('.'+record.Id).length){
                    continue;
                }
                $('.debug-row-0').after(`
                    <tr class="${record.Id} debug-row" id="${record.Id}">
                            <td class=" field-value" tabindex="0">${record.LogUser.Name}</td>
                            <td class="field-value " tabindex="0">${record.Operation}</td>
                            <td class="field-actions ">${record.Application}</td>
                            <td class="field-actions ">${Tools.formatDate(new Date(record.StartTime))}</td>
                            <td class="field-actions ">${record.Status}</td>
                            <td class="field-actions ">Read</td>
                            <td class="field-actions ">${record.LogLength}</td>
                        </tr>
                    `)
            }
        }
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

            record.gid = records.length;
            records.push(record);
        }
        return records;
    }

    filterReport2(){
        this.filterDetailsWord = $('#textfield-1450-inputEl').val().toLocaleLowerCase();
        this.isDebugOnlyChecked = $('#checkboxfield-debugonly-input').prop('checked');
        this.isFilterDetailChecked = $('#checkboxfield-filter-input').prop('checked');
        this.isExecuteableChecked = $('#checkboxfield-executable-input').prop('checked');
        this.typeFilterValue = $('#checkboxfield-type-input').val();

        let recordMap = this.originalRecords.reduce((map, record)=>{
            map[record.gid] = record;
            return map;
        }, {});


        const showElements = [];
        const hideElements = [];
        $('#gridview-1440 tr.x-grid-row-over').each((index, ele)=>{
            let eleID = $(ele).attr('Id');
            if (!eleID)return;
            let record = recordMap[eleID.replace('line-', '')];
            let show = true;
            if (this.isDebugOnlyChecked){
                show = show && this.isDebugonly(record);
            }
            if (this.isFilterDetailChecked){
                show = show && this.isFilterDetails(record);
            }
            show = show && this.isFilterType(record);
            if (show){
                showElements.push(ele);
                //$(ele).show();
            }else{
                hideElements.push(ele);
                //$(ele).hide();
            }
        })

        // 使用示例
        this.updateElementsWithTimeBudget(
            hideElements,
            (element, index) => {
                $(element).hide();
            },
            10 // 每帧10ms预算，为其他任务留出时间
        );

        this.updateElementsWithTimeBudget(
            showElements,
            (element, index) => {
                $(element).show();
            },
            10 // 每帧10ms预算，为其他任务留出时间
        );

    }

    updateElementsWithTimeBudget(elements, updateFn, timeBudget = 16) {
        // timeBudget: 每帧最多使用的毫秒数，默认16ms（维持60fps）
        let index = 0;
        const total = elements.length;
        
        const processChunk = (timestamp)=> {
            const startTime = performance.now();
            let processed = 0;
            
            // 在时间预算内尽可能多地处理
            while (index < total && performance.now() - startTime < timeBudget) {
                updateFn(elements[index], index);
                index++;
                processed++;
            }
            
            // 进度反馈
            const progress = Math.floor((index / total) * 100);
            this.updateProgress(progress);
            
            if (index < total) {
                // 还有更多元素要处理，继续下一帧
                requestAnimationFrame(processChunk);
            } else {
                console.log(`处理完成！总共处理了 ${total} 个元素`);
                this.onComplete();
            }
            
            // 自适应调整：如果处理得太少，说明每元素耗时太长
            if (processed < 10) {
                console.warn('每个元素处理时间过长，考虑优化updateFn');
            }
        }
        
        requestAnimationFrame(processChunk);
    }

    updateProgress(progress){
        //console.log('progress ' + progress);
        if (this.lastprogress !== progress){
            $('#gridview-1439').html('progress ' + progress);
        }
        this.lastprogress = progress;
    }
    onComplete(){
         //console.log('budget complete ');
         $('#gridview-1439').html('conplete');
    }

    isDebugonly(record){
        return (this.isDebugOnlyChecked && record.event == 'USER_DEBUG');
    }

    isFilterType(record){
        if (!this.typeFilterValue || this.typeFilterValue.toLocaleLowerCase() == 'all'){
            return true;
        }
        return record.event == this.typeFilterValue;
    }

    isFilterDetails(record){
        return (this.isFilterDetailChecked && record.details.toLocaleLowerCase().indexOf(this.filterDetailsWord) != -1);
    }

    filterByExecuteable(record){
        return false;
    }


    renderApexLogContent(records){
        this.originalRecords = records;
        let showRecords = [];
        let index = 0;
        for (let item of records){
            showRecords.push({
                details : item.details,
                logLine : index++,
                timestamp : item.Time,
                event : item.event,
                gid : item.gid
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
                show:true,
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
                    <div id="gridview-1439"></div>
                    <div id="gridview-1440" class="x-grid-view x-fit-item x-grid-view-default x-unselectable" style="overflow: auto;  margin: 0px; " tabindex="-1">
                        <div style="position:absolute;width:1px;height:0;top:0;left:0;" id="ext-gen2405"></div>
                        <table class="x-grid-table x-grid-table-resizer" border="0" cellspacing="0" cellpadding="0">
                            <thead>
                                <tr class="x-grid-header-row">
                                    ${parserObj.header.map(e=>{
                                        return `<th class="x-grid-col-resizer-gridcolumn-1431" style="${e.show?(e.width?'width:'+e.width+'px':''):'0px'}; height: 20px;">${e.name}</th>`;
                                    })}
                                </tr>
                            <thead>
                            <tbody>
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
                        <input type="checkbox" id="checkboxfield-filter-input" class="x-form-field x-form-checkbox" autocomplete="off" hidefocus="true" aria-invalid="false" data-errorqtip=""/>
                        <label id="checkboxfield-filter" class="x-form-cb-label x-form-cb-label-after" for="checkboxfield-1448-inputEl">Filter</label>

                        <select type="checkbox" id="checkboxfield-type-input">
                            <option value="ALL">ALL</option>
                            
                        </select>
                        <label id="checkboxfield-type">Type</label>

                        <input id="textfield-1450-inputEl" type="text" size="1" name="textfield-1450-inputEl" placeholder="Click here to filter the log" style="width:100%;" class="x-form-field x-form-empty-field x-form-text" autocomplete="off" aria-invalid="false" data-errorqtip="">

                
                    </div>
                    </div>
                </div>
            </div>`;
        $('#logAnalysis-showallsobjectdatatable2').html(body);

        // parserObj.records.map(recod=>{
        //     return `<tr class="x-grid-row x-grid-row-over" id="line-${recod.gid}">
        //         ${parserObj.header.map(e=>{
        //             return `<td class="${e.name} x-grid-cell x-grid-cell-gridcolumn-1431">
        //                     <div class="x-grid-cell-inner " style="text-align: left;">
        //                         ${recod[e.name]||''}
        //                     </div>
        //                 </td>`;
        //         })}
        //     </tr>`
        // });

        // this.renderTableOptimized(parserObj);

        // use RenderTableDirectFix
        new RenderTableDirectFix().renderTableDirectFix(parserObj);


        let typesHtml = Array.from(new Set(parserObj.records.map(e =>e.event))).map(t=>{
            return `<option value="${t}">${t}</option>`;
        }).join('')
        $('#checkboxfield-type-input').html(`<option value="ALL">ALL</option>` + typesHtml);
        
        return '';
    }

    updateWithTimeBudget(parserObj){
        let htmlMap = {};
        for (let record of parserObj.records){
            let trHtml = `<tr class="x-grid-row x-grid-row-over" id="line-${record.gid}">
                ${parserObj.header.map(e=>{
                    return `<td class="${e.name} x-grid-cell x-grid-cell-gridcolumn-1431">
                            <div class="x-grid-cell-inner " style="text-align: left;">
                                ${record[e.name]||''}
                            </div>
                        </td>`;
                }).join('')}
            </tr>`;
            htmlMap[record.gid] = trHtml;
        }

        let updateTbody = (record) => {
            $('#logpanel-1429-body tbody').append(htmlMap[record.gid]);
        }

        // 使用示例
        this.updateElementsWithTimeBudget(
            parserObj.records,
            (record, index) => {
                updateTbody(record, index);
            },
            16 // 每帧10ms预算，为其他任务留出时间
        );
    }

    updateOneTime(parserObj){
        let htmlMap = {};
        let startTime = performance.now();
        let currentTime = new Date().getTime();
        for (let record of parserObj.records){
            let trHtml = `<tr class="x-grid-row x-grid-row-over" id="line-${record.gid}">
                ${parserObj.header.map(e=>{
                    return `<td class="${e.name} x-grid-cell x-grid-cell-gridcolumn-1431">
                            <div class="x-grid-cell-inner " style="text-align: left;">
                                ${record[e.name]||''}
                            </div>
                        </td>`;
                }).join('')}
            </tr>`;
            htmlMap[record.gid] = trHtml;
            $('#logpanel-1429-body tbody').append(htmlMap[record.gid]);
        }
        console.log(' performance date=', performance.now() - startTime);
        console.log(' getTime date=', new Date().getTime() - currentTime);
        console.log(' getTime date=', (new Date().getTime() - currentTime)/1000, 's');
    }

    useParallelPipelineRenderer(parserObj){
        
        // 使用示例
        const renderer = new AdaptiveBatchRenderer();
        const data = parserObj.records;

        renderer.render(
            data,
            (record, index) => {
                const div = document.createElement('tr');
                div.className = 'x-grid-row x-grid-row-over';
                div.id = `${record.gid}`;
                div.innerHTML = `
                    ${parserObj.header.map(e=>{
                        return `<td class="${e.name} x-grid-cell x-grid-cell-gridcolumn-1431">
                                <div class="x-grid-cell-inner " style="text-align: left;">
                                    ${record[e.name]||''}
                                </div>
                            </td>`;
                    }).join('')}
                `;
                return div;
            },
            $('#logpanel-1429-body tbody')[0]
        );
        
    }

        
    // 你的使用方式优化
    async  renderTableOptimized(parserObj) {
        const data = parserObj.records;
        const tbody = $('#logpanel-1429-body tbody')[0];
        
        console.log(`开始渲染表格，共 ${data.length} 行数据`);
        
        // 创建优化渲染器
        const renderer = new OptimizedTableRenderer({
            batchSize: 1000 // 根据数据量调整
        });
        
        // 开始渲染
        await renderer.render(data, parserObj, tbody);
        
        console.log('表格渲染完成');
    }

}

class OptimizedTableRenderer {
  constructor(options = {}) {
    this.options = {
      batchSize: 800, // 表格行建议800-1200/批
      useFragment: true,
      ...options
    };
    
    // 预计算表头HTML（关键优化！）
    this.headerHTML = null;
    this.cellTemplate = null;
  }
  
  async render(data, parserObj, tbody) {
    console.time('表格渲染总时间');
    
    // 1. 清空表格（最快方式）
    tbody.innerHTML = '';
    
    // 2. 预计算表头HTML（只计算一次！）
    if (!this.headerHTML) {
      this.precomputeTemplates(parserObj.header);
    }
    
    // 3. 分阶段渲染
    await this.renderInStages(data, parserObj, tbody);
    
    console.timeEnd('表格渲染总时间');
  }
  
  precomputeTemplates(headers) {
    // 预计算表头单元格HTML
    this.headerHTML = headers.map(header => 
      `<td class="${header.name} x-grid-cell x-grid-cell-gridcolumn-1431">
        <div class="x-grid-cell-inner" style="text-align: left;">
          <!-- 值占位符 -->
        </div>
      </td>`
    ).join('');
    
    // 创建快速模板
    this.cellTemplates = headers.map(header => {
      const td = document.createElement('td');
      td.className = `${header.name} x-grid-cell x-grid-cell-gridcolumn-1431`;
      
      const div = document.createElement('div');
      div.className = 'x-grid-cell-inner';
      div.style.textAlign = 'left';
      
      td.appendChild(div);
      return td;
    });
  }
  
  async renderInStages(data, parserObj, tbody) {
    const total = data.length;
    let rendered = 0;
    
    // 阶段1：立即渲染首屏
    const firstScreenRows = this.calculateFirstScreenRows();
    await this.renderBatch(data.slice(0, firstScreenRows), tbody, 0);
    rendered = firstScreenRows;
    
    // 阶段2：快速渲染剩余
    if (rendered < total) {
      await this.renderFastBatch(data.slice(rendered), tbody, rendered);
    }
  }
  
  async renderBatch(batchData, tbody, startIndex) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        const rows = this.createRowsOptimized(batchData, startIndex);
        
        // 一次性添加所有行
        for (const row of rows) {
          fragment.appendChild(row);
        }
        
        tbody.appendChild(fragment);
        resolve();
      });
    });
  }
  
  createRowsOptimized(batchData, startIndex) {
    const rows = new Array(batchData.length);
    
    for (let i = 0; i < batchData.length; i++) {
      const record = batchData[i];
      const rowIndex = startIndex + i;
      
      // 方法A：使用克隆模板（最快）
      rows[i] = this.createRowByClone(record, rowIndex);
    }
    
    return rows;
  }
  
  createRowByClone(record, index) {
    // 创建行模板（只创建一次）
    if (!this.rowTemplate) {
      this.rowTemplate = document.createElement('tr');
      this.rowTemplate.className = 'x-grid-row x-grid-row-over';
      
      // 克隆预计算的单元格
      for (const cellTemplate of this.cellTemplates) {
        this.rowTemplate.appendChild(cellTemplate.cloneNode(true));
      }
    }
    
    // 克隆模板行
    const tr = this.rowTemplate.cloneNode(true);
    tr.id = record.gid || `row-${index}`;
    
    // 快速填充数据
    const cells = tr.cells;
    for (let j = 0; j < cells.length; j++) {
      const headerName = this.cellTemplates[j].className.split(' ')[0];
      const cellDiv = cells[j].firstChild;
      cellDiv.textContent = record[headerName] || '';
    }
    
    return tr;
  }
  
  async renderFastBatch(batchData, tbody, startIndex) {
    const total = batchData.length;
    let index = 0;
    const fastBatchSize = 1500; // 大批次
    
    while (index < total) {
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          const end = Math.min(index + fastBatchSize, total);
          const html = this.createBatchHTML(batchData, index, end, startIndex + index);
          
          // 使用insertAdjacentHTML（比innerHTML快）
          tbody.insertAdjacentHTML('beforeend', html);
          
          index = end;
          resolve();
        });
      });
      
      // 每批后短暂休息
      if (index % 5000 === 0) {
        console.log(`已渲染 ${startIndex + index} 行...`);
        await new Promise(r => setTimeout(r, 2));
      }
    }
  }
  
  createBatchHTML(batchData, start, end, globalStartIndex) {
    // 使用字符串拼接创建HTML（最高性能）
    let html = '';
    
    for (let i = start; i < end; i++) {
      const record = batchData[i];
      const rowIndex = globalStartIndex + (i - start);
      
      html += `<tr class="x-grid-row x-grid-row-over" id="${record.gid || `row-${rowIndex}`}">`;
      
      // 使用预计算的单元格结构
      for (let j = 0; j < this.cellTemplates.length; j++) {
        const headerName = this.cellTemplates[j].className.split(' ')[0];
        const value = record[headerName] || '';
        
        html += `
          <td class="${headerName} x-grid-cell x-grid-cell-gridcolumn-1431">
            <div class="x-grid-cell-inner" style="text-align: left;">
              ${this.escapeHTML(value)}
            </div>
          </td>
        `;
      }
      
      html += '</tr>';
    }
    
    return html;
  }
  
  calculateFirstScreenRows() {
    // 计算首屏可见行数
    const table = document.querySelector('.x-grid-table');
    if (!table) return 50;
    
    const rowHeight = 30; // 预估行高
    const viewportHeight = window.innerHeight;
    return Math.ceil(viewportHeight / rowHeight) * 2; // 2屏内容
  }
  
  escapeHTML(text) {
    // 简单的HTML转义
    if (typeof text !== 'string') text = String(text);
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}



class AdaptiveBatchRenderer {
    constructor() {
        this.metrics = {
        renderTimes: [],
        batchSizes: []
        };
        this.targetFPS = 60; // 目标帧率
        this.timeBudget = 16; // 每帧16ms预算（60fps）
    }

    async render(items, createElement, container) {
        const total = items.length;
        let rendered = 0;
        let adaptiveBatchSize = this.calculateInitialBatchSize(total);
        
        console.time('总渲染时间');
        
        // 第一阶段：快速渲染首屏
        const firstScreenResult = await this.renderFirstScreen(
        items, createElement, container, adaptiveBatchSize
        );
        rendered = firstScreenResult.rendered;
        
        // 第二阶段：自适应渲染剩余
        if (rendered < total) {
        await this.renderRemainingAdaptive(
            items, createElement, container, rendered, total
        );
        }
        
        console.timeEnd('总渲染时间');
    }

    // 智能计算初始批大小
    calculateInitialBatchSize(total) {
        if (total <= 1000) return 100;
        if (total <= 5000) return 200;
        if (total <= 10000) return 300;
        return 500; // 超过10000条
    }

    async renderFirstScreen(items, createElement, container, initialBatchSize) {
        return new Promise(resolve => {
        requestAnimationFrame(() => {
            const startTime = performance.now();
            
            // 计算首屏需要多少元素
            const viewportHeight = window.innerHeight;
            const estimatedItemHeight = 50; // 预估每个项目高度
            const firstScreenCount = Math.ceil(viewportHeight / estimatedItemHeight) * 3;
            console.log('firstScreenCount=',firstScreenCount);
            
            // 使用DocumentFragment批量渲染首屏
            const fragment = document.createDocumentFragment();
            const renderCount = Math.min(firstScreenCount, items.length, initialBatchSize * 5);
            
            for (let i = 0; i < renderCount; i++) {
                fragment.appendChild(createElement(items[i], i));
            }
            
            container.appendChild(fragment);
            
            const renderTime = performance.now() - startTime;
            this.updateMetrics(renderCount, renderTime);
            
            console.log(`首屏渲染: ${renderCount}个项目, 耗时: ${renderTime.toFixed(1)}ms`);
            
            resolve({ rendered: renderCount, time: renderTime });
        });
        });
    }

    async renderRemainingAdaptive(items, createElement, container, startIndex, total) {
        let index = startIndex;
        let consecutiveSlowFrames = 0;
        
        const renderNextBatch = async () => {
            if (index >= total) return;
            
            const batchSize = this.calculateAdaptiveBatchSize();
            const batchStart = performance.now();
            const endIndex = Math.min(index + batchSize, total);
            
            // 使用离屏Canvas预渲染？对于复杂元素可以加速
            const fragment = document.createDocumentFragment();
            
            for (let i = index; i < endIndex; i++) {
                fragment.appendChild(createElement(items[i], i));
            }
            
            // 添加到DOM
            container.appendChild(fragment);
            
            const renderTime = performance.now() - batchStart;
            this.updateMetrics(endIndex - index, renderTime);
            
            index = endIndex;
            
            // 进度反馈
            const progress = Math.floor((index / total) * 100);
            this.updateProgress(progress, index, total);
            
            // 性能自适应逻辑
            if (renderTime > this.timeBudget * 1.5) {
                // 渲染过慢，减少批大小
                consecutiveSlowFrames++;
                if (consecutiveSlowFrames > 2) {
                console.warn(`检测到性能下降，当前批大小: ${batchSize}, 耗时: ${renderTime.toFixed(1)}ms`);
                }
            } else {
                consecutiveSlowFrames = 0;
            }
            
            // 决定下一步策略
            if (index < total) {
                if (this.shouldUseIdleTime(renderTime)) {
                    // 使用空闲时间继续
                    await this.renderWithIdleCallback();
                } else {
                    // 立即继续下一帧
                    requestAnimationFrame(renderNextBatch);
                }
            }
        };
        
        // 开始自适应渲染循环
        requestAnimationFrame(renderNextBatch);
    }

    calculateAdaptiveBatchSize() {
        if (this.metrics.renderTimes.length < 3) {
        return 200; // 默认值
        }
        
        // 计算最近3批的平均时间
        const recentTimes = this.metrics.renderTimes.slice(-3);
        const recentSizes = this.metrics.batchSizes.slice(-3);
        const avgTime = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
        const avgSize = recentSizes.reduce((a, b) => a + b, 0) / recentSizes.length;
        
        // 自适应调整：如果平均时间远低于预算，增大批大小
        if (avgTime < this.timeBudget * 0.5) {
        return Math.min(1000, Math.floor(avgSize * 1.5));
        }
        
        // 如果接近预算，保持稳定
        if (avgTime < this.timeBudget * 0.8) {
            return Math.floor(avgSize);
        }
        
        // 如果超过预算，减小批大小
        return Math.max(50, Math.floor(avgSize * 0.7));
    }

    shouldUseIdleTime(renderTime) {
        // 如果渲染时间很短，可以等待空闲时间
        return renderTime < this.timeBudget * 0.3;
    }

    async renderWithIdleCallback() {
        return new Promise(resolve => {
        requestIdleCallback(async (deadline) => {
            // 在空闲时间处理更多项目
            if (deadline.timeRemaining() > 5) {
            // 空闲时间充足，可以处理更多
                resolve();
            } else {
            // 空闲时间不足，返回主循环
                setTimeout(resolve, 0);
            }
        }, { timeout: 100 }); // 最多等待100ms
        });
    }

    updateMetrics(batchSize, renderTime) {
        this.metrics.renderTimes.push(renderTime);
        this.metrics.batchSizes.push(batchSize);
        
        // 保持最近10条记录
        if (this.metrics.renderTimes.length > 10) {
            this.metrics.renderTimes.shift();
            this.metrics.batchSizes.shift();
        }
    }

    updateProgress(progress, current, total) {
        // 更新进度显示
        const progressBar = document.getElementById('render-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}% (${current}/${total})`;
        }
        
        // 每10%或每1000个项目输出日志
        if (current % 1000 === 0 || progress % 10 === 0) {
            console.log(`渲染进度: ${progress}% (${current}/${total})`);
        }
    }
}

class RenderTableDirectFix{
    // 直接替换你的renderer.render调用
    renderTableDirectFix(parserObj) {

        // 使用示例
        const progressBar = new FloatingProgressBar({
        position: 'top',
        color: '#3498db',
        showPercentage: true,
        showDetails: true,
        autoHide: true,
        hideDelay: 3000,
        onComplete: () => {
            console.log('任务完成！');
        },
        onCancel: () => {
            console.log('任务已取消');
            // 这里可以取消你的渲染任务
            // renderer.cancel();
        }
        });

        const data = parserObj.records;
        const tbody = $('#logpanel-1429-body tbody')[0];
        const headers = parserObj.header;
        
        console.log(`开始渲染 ${data.length} 行数据`);
        console.time('表格渲染');
        // 显示进度条
        progressBar.show('正在渲染表格数据...');
        
        // 清空表格
        tbody.innerHTML = '';
        
        // 预计算列配置
        const columnConfigs = headers.map(h => ({
            name: h.name,
            className: `${h.name} x-grid-cell x-grid-cell-gridcolumn-1431`
        }));
        
        // 分批渲染配置
        const totalRows = data.length;
        const batchSize = Math.min(2000, Math.max(500, Math.floor(totalRows / 20)));
        let currentIndex = 0;
        
        function renderBatch() {
            const startTime = performance.now();
            const endIndex = Math.min(currentIndex + batchSize, totalRows);
            
            // 使用字符串拼接（性能最高）
            let html = '';
            
            for (let i = currentIndex; i < endIndex; i++) {
                const record = data[i];
                
                html += `<tr class="x-grid-row x-grid-row-over" id="${record.gid || ''}">`;
                
                for (const col of columnConfigs) {
                    const value = record[col.name] || '';
                    html += `
                    <td class="${col.className}">
                        <div class="x-grid-cell-inner" style="text-align: left;">
                        ${escapeValue(value)}
                        </div>
                    </td>
                    `;
                }
                
                html += '</tr>';
            }
            
            // 一次性插入
            tbody.insertAdjacentHTML('beforeend', html);
            
            currentIndex = endIndex;
            const batchTime = performance.now() - startTime;
            
            console.log(`进度: ${Math.floor((currentIndex / totalRows) * 100)}%, 已渲染 ${currentIndex} 行, 批时间: ${batchTime.toFixed(1)}ms`);
            // 进度更新
            if (currentIndex % 5000 === 0 || currentIndex === totalRows) {
                const percent = Math.floor((currentIndex / totalRows) * 100);
                console.log(`进度: ${percent}%, 已渲染 ${currentIndex} 行, 批时间: ${batchTime.toFixed(1)}ms`);

                // 更新进度条
                progressBar.update(
                    percent,
                    `正在渲染表格...`,
                    `已渲染 ${currentIndex}/${totalRows} 行 (${batchTime.toFixed(1)}行/秒)`
                );
            }
            
            // 继续或完成
            if (currentIndex < totalRows) {
                if (batchTime > 50) {
                    // 批次较慢，休息一下
                    setTimeout(renderBatch, 2);
                } else {
                    // 批次很快，立即继续
                    requestAnimationFrame(renderBatch);
                }
            } else {
                console.timeEnd('表格渲染');
                console.log(`渲染完成: ${totalRows} 行数据`);
            }

            
        }
        
        function escapeValue(value) {
            if (value == null) return '';
            return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }
    
        // 开始渲染
        renderBatch();
    }
}

        // 数据提供者类 - 负责数据管理
        class DataProvider {
            constructor() {
                this.allData = []; // 原始数据
                this.filteredData = []; // 筛选后的数据
                this.currentSort = { column: null, direction: 'asc' }; // 当前排序
            }
            
            // 获取表头配置
            static getHeaders() {
                return [
                    { id: 'id', text: 'ID', width: '60px', sortable: true },
                    { id: 'name', text: '姓名', width: '120px', sortable: true },
                    { id: 'email', text: '邮箱', width: '180px', sortable: true },
                    { id: 'age', text: '年龄', width: '100px', sortable: true },
                    { id: 'city', text: '城市', width: '120px', sortable: true },
                    { id: 'occupation', text: '职业', width: '100px', sortable: true },
                    { id: 'status', text: '状态', width: '100px', sortable: true },
                    { id: 'balance', text: '余额', width: '100px', sortable: true }
                ];
            }
            
            // 获取数据（生成模拟数据）
            getDatas(count = 10000) {
                const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
                const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'];
                const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'];
                const occupations = ['工程师', '设计师', '医生', '教师', '销售', '经理', '分析师', '顾问', '司机', '厨师'];
                const statuses = ['活跃', '休眠', '停用', '待审核', '已认证'];
                
                this.allData = [];
                
                for (let i = 1; i <= count; i++) {
                    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                    const city = cities[Math.floor(Math.random() * cities.length)];
                    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    
                    this.allData.push({
                        id: i,
                        name: `${firstName}${lastName}`,
                        email: `user${i}@example.com`,
                        age: Math.floor(Math.random() * 50) + 18,
                        city: city,
                        occupation: occupation,
                        status: status,
                        balance: (Math.random() * 10000).toFixed(2)
                    });
                }
                
                this.filteredData = [...this.allData];
                return this.filteredData;
            }
            
            // 筛选数据
            filterData(searchTerm) {
                if (!searchTerm.trim()) {
                    this.filteredData = [...this.allData];
                } else {
                    const term = searchTerm.toLowerCase();
                    this.filteredData = this.allData.filter(item => 
                        item.name.toLowerCase().includes(term) ||
                        item.email.toLowerCase().includes(term) ||
                        item.city.toLowerCase().includes(term) ||
                        item.occupation.toLowerCase().includes(term) ||
                        item.status.toLowerCase().includes(term) ||
                        item.id.toString().includes(term)
                    );
                }
                
                // 如果当前有排序，保持排序
                if (this.currentSort.column) {
                    this.sortData(this.currentSort.column, this.currentSort.direction);
                }
                
                return this.filteredData;
            }
            
            // 排序数据
            sortData(columnId, direction = 'asc') {
                if (!columnId) return this.filteredData;
                
                this.filteredData.sort((a, b) => {
                    const aVal = a[columnId];
                    const bVal = b[columnId];
                    
                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return direction === 'asc' ? 
                            aVal.localeCompare(bVal) : 
                            bVal.localeCompare(aVal);
                    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return direction === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    
                    return 0;
                });
                
                this.currentSort = { column: columnId, direction };
                return this.filteredData;
            }
            
            // 获取当前数据
            getCurrentData() {
                return this.filteredData;
            }
            
            // 获取原始数据
            getOriginalData() {
                return this.allData;
            }
            
            // 获取数据总量
            getTotalCount() {
                return this.allData.length;
            }
            
            // 获取筛选后的数据量
            getFilteredCount() {
                return this.filteredData.length;
            }
            
            // 清除筛选
            clearFilter() {
                this.filteredData = [...this.allData];
                return this.filteredData;
            }
            
            // 刷新数据（重新生成）
            refreshData(count) {
                return this.getDatas(count);
            }
        }

        // 虚拟表格类 - 负责表格渲染和交互
        class VirtualTable {
            constructor(containerId, dataProvider) {
                this.container = document.getElementById(containerId);
                this.dataProvider = dataProvider;
                
                // 配置参数
                this.config = {
                    ROW_HEIGHT: 48, // 每行高度(px)
                    VISIBLE_ROWS: 30, // 可见行数
                    BUFFER_ROWS: 5, // 缓冲区行数
                    DEBOUNCE_DELAY: 150 // 防抖延迟(ms)
                };
                
                // DOM元素
                this.tableWrapper = null;
                this.tableBody = null;
                this.loadingIndicator = null;
                this.searchInput = null;
                this.statsElements = {};
                
                // 状态变量
                this.scrollTimeout = null;
                this.searchTimeout = null;
                this.isInitialized = false;
            }
            
            // 初始化表格
            init() {
                if (this.isInitialized) return;
                
                // 获取DOM元素
                this.tableWrapper = this.container.querySelector('.virtual-table-wrapper');
                this.tableBody = this.container.querySelector('#virtualTableBody');
                this.loadingIndicator = this.container.querySelector('.virtual-table-loading');
                this.searchInput = this.container.querySelector('.virtual-table-search-box input');
                
                // 设置表格容器高度
                this.tableWrapper.style.height = `${this.config.ROW_HEIGHT * this.config.VISIBLE_ROWS}px`;
                
                // 初始化统计元素
                this.initStatsElements();
                
                // 创建表头
                this.createHeader();
                
                // 创建占位行
                this.createPlaceholderRows();
                
                // 绑定事件
                this.bindEvents();
                
                this.isInitialized = true;
                
                return this;
            }
            
            // 初始化统计元素
            initStatsElements() {
                this.statsElements = {
                    totalCount: document.getElementById('virtualTableTotalCount'),
                    renderedCount: document.getElementById('virtualTableRenderedCount'),
                    visibleCount: document.getElementById('virtualTableVisibleCount'),
                    startRow: document.getElementById('virtualTableStartRow'),
                    endRow: document.getElementById('virtualTableEndRow'),
                    totalRows: document.getElementById('virtualTableTotalRows')
                };
            }

            createTable(){
                return `<h1 class="page-title">大数据表格虚拟滚动演示</h1>
    
    <div class="demo-controls">
        <button id="btnLoad10K">加载1万条数据</button>
        <button id="btnLoad50K">加载5万条数据</button>
        <button id="btnLoad100K">加载10万条数据</button>
        <button id="btnClearFilter">清除筛选</button>
        <button id="btnScrollToMiddle">滚动到中间</button>
        <button id="btnRefreshData">刷新数据</button>
    </div>
    
    <!-- 虚拟表格容器 -->
    <div class="virtual-table-container" id="virtualTableContainer">
        <div class="virtual-table-header">
            <h1>大数据表格 - 虚拟滚动解决方案</h1>
            <p>支持海量数据流畅展示，仅渲染可见区域行</p>
        </div>
        
        <div class="virtual-table-controls">
            <div class="virtual-table-search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="virtualTableSearchInput" placeholder="搜索姓名、邮箱、城市或职业...">
            </div>
            
            <div class="virtual-table-stats">
                <div class="virtual-table-stat-item">
                    <span class="virtual-table-stat-label">总数据量</span>
                    <span class="virtual-table-stat-value" id="virtualTableTotalCount">0</span>
                </div>
                <div class="virtual-table-stat-item">
                    <span class="virtual-table-stat-label">渲染行数</span>
                    <span class="virtual-table-stat-value" id="virtualTableRenderedCount">0</span>
                </div>
                <div class="virtual-table-stat-item">
                    <span class="virtual-table-stat-label">可见行数</span>
                    <span class="virtual-table-stat-value" id="virtualTableVisibleCount">0</span>
                </div>
            </div>
        </div>
        
        <div class="virtual-table-wrapper" id="virtualTableWrapper">
            <div class="virtual-table-loading" id="virtualTableLoadingIndicator">
                <span>正在生成模拟数据，请稍候...</span>
            </div>
            
            <table id="virtualTable">
                <thead id="virtualTableHeader">
                    <!-- 表头将通过JavaScript动态生成 -->
                </thead>
                <tbody id="virtualTableBody">
                    <!-- 表格内容将通过JavaScript动态生成 -->
                </tbody>
            </table>
        </div>
        
        <div class="virtual-table-footer">
            <div>
                显示第 <span id="virtualTableStartRow">0</span> - <span id="virtualTableEndRow">0</span> 行，共 <span id="virtualTableTotalRows">0</span> 行
            </div>
            <div>
                滚动浏览全部数据
            </div>
        </div>
    </div>
    
    <div class="instructions">
        <h3>模块化虚拟滚动技术说明</h3>
        <ul>
            <li><strong>VirtualTable类</strong>：负责表格渲染、虚拟滚动和用户交互</li>
            <li><strong>DataProvider类</strong>：负责数据管理，包括数据生成、筛选、排序等操作</li>
            <li>表格高度固定为600px，仅渲染可见区域的行（约30行）</li>
            <li>滚动时动态计算需要显示的行，替换不可见行的内容</li>
            <li>使用requestAnimationFrame优化滚动性能，避免卡顿</li>
            <li>支持搜索过滤，所有数据都在同一页中处理</li>
            <li>所有样式封装在.virtual-table-container类中，不会影响页面其他元素</li>
        </ul>
    </div>`;
            }
            
            // 创建表头
            createHeader() {
                const headers = this.dataProvider.constructor.getHeaders();
                const thead = this.container.querySelector('#virtualTableHeader');
                
                let headerHtml = '<tr>';
                headers.forEach(header => {
                    const sortableClass = header.sortable ? 'sortable' : '';
                    headerHtml += `
                        <th style="width: ${header.width};" 
                            data-column="${header.id}" 
                            class="${sortableClass}">
                            ${header.text}
                            ${header.sortable ? '<i class="fas fa-sort"></i>' : ''}
                        </th>
                    `;
                });
                headerHtml += '</tr>';
                
                thead.innerHTML = headerHtml;
            }
            
            // 创建占位行
            createPlaceholderRows() {
                this.tableBody.innerHTML = '';
                const totalPlaceholderRows = this.config.VISIBLE_ROWS + this.config.BUFFER_ROWS * 2;
                
                for (let i = 0; i < totalPlaceholderRows; i++) {
                    const row = document.createElement('tr');
                    row.className = 'virtual-table-empty-row';
                    row.innerHTML = `<td colspan="8"></td>`;
                    this.tableBody.appendChild(row);
                }
            }
            
            // 加载数据
            loadData(count = 10000) {
                this.showLoading();
                
                // 模拟异步加载
                setTimeout(() => {
                    this.dataProvider.getDatas(count);
                    this.renderVisibleRows();
                    this.updateStats();
                    this.hideLoading();
                }, 300);
            }
            
            // 渲染可见行
            renderVisibleRows() {
                const scrollTop = this.tableWrapper.scrollTop;
                const data = this.dataProvider.getCurrentData();
                
                const startIndex = Math.max(0, Math.floor(scrollTop / this.config.ROW_HEIGHT) - this.config.BUFFER_ROWS);
                const endIndex = Math.min(
                    data.length,
                    startIndex + this.config.VISIBLE_ROWS + this.config.BUFFER_ROWS * 2
                );
                
                // 获取所有行
                const rows = this.tableBody.querySelectorAll('tr');
                
                // 更新行的内容
                for (let i = 0; i < rows.length; i++) {
                    const dataIndex = startIndex + i;
                    
                    if (dataIndex < endIndex && dataIndex < data.length) {
                        // 显示实际数据
                        const item = data[dataIndex];
                        rows[i].className = '';
                        rows[i].innerHTML = this.formatRow(item);
                    } else {
                        // 显示空行（占位）
                        rows[i].className = 'virtual-table-empty-row';
                        rows[i].innerHTML = '<td colspan="8"></td>';
                    }
                }
                
                // 更新当前可见行信息
                this.updateVisibleRowsInfo(scrollTop, data.length);
            }
            
            // 格式化行数据
            formatRow(item) {
                // 格式化状态徽章
                const statusBadgeClass = this.getStatusBadgeClass(item.status);
                
                return `
                    <td class="virtual-table-row-index">${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.email}</td>
                    <td>${item.age}</td>
                    <td>${item.city}</td>
                    <td>${item.occupation}</td>
                    <td><span class="virtual-table-status-badge ${statusBadgeClass}" data-status="${item.status}">${item.status}</span></td>
                    <td>¥${item.balance}</td>
                `;
            }
            
            // 获取状态徽章样式类
            getStatusBadgeClass(status) {
                switch(status) {
                    case '活跃':
                    case '已认证':
                        return 'status-active';
                    case '休眠':
                    case '待审核':
                        return 'status-pending';
                    case '停用':
                        return 'status-inactive';
                    default:
                        return '';
                }
            }
            
            // 更新可见行信息
            updateVisibleRowsInfo(scrollTop, totalRows) {
                const visibleStart = Math.floor(scrollTop / this.config.ROW_HEIGHT);
                const visibleEnd = Math.min(totalRows, visibleStart + this.config.VISIBLE_ROWS);
                
                this.statsElements.startRow.textContent = (visibleStart + 1).toLocaleString();
                this.statsElements.endRow.textContent = visibleEnd.toLocaleString();
                this.statsElements.totalRows.textContent = totalRows.toLocaleString();
            }
            
            // 更新统计信息
            updateStats() {
                const data = this.dataProvider.getCurrentData();
                const scrollTop = this.tableWrapper.scrollTop;
                
                const startIndex = Math.max(0, Math.floor(scrollTop / this.config.ROW_HEIGHT) - this.config.BUFFER_ROWS);
                const endIndex = Math.min(
                    data.length,
                    startIndex + this.config.VISIBLE_ROWS + this.config.BUFFER_ROWS * 2
                );
                
                const visibleStart = Math.floor(scrollTop / this.config.ROW_HEIGHT);
                const visibleEnd = Math.min(data.length, visibleStart + this.config.VISIBLE_ROWS);
                
                this.statsElements.totalCount.textContent = this.dataProvider.getTotalCount().toLocaleString();
                this.statsElements.renderedCount.textContent = (endIndex - startIndex).toLocaleString();
                this.statsElements.visibleCount.textContent = (visibleEnd - visibleStart).toLocaleString();
                this.statsElements.totalRows.textContent = data.length.toLocaleString();
            }
            
            // 筛选数据
            filterData(searchTerm) {
                this.dataProvider.filterData(searchTerm);
                this.tableWrapper.scrollTop = 0;
                this.renderVisibleRows();
                this.updateStats();
            }
            
            // 排序数据
            sortData(columnId) {
                const currentSort = this.dataProvider.currentSort;
                let direction = 'asc';
                
                // 如果当前已经按此列排序，则切换方向
                if (currentSort.column === columnId) {
                    direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                }
                
                this.dataProvider.sortData(columnId, direction);
                this.renderVisibleRows();
                this.updateSortIndicator(columnId, direction);
            }
            
            // 更新排序指示器
            updateSortIndicator(columnId, direction) {
                // 清除所有排序指示器
                const headers = this.container.querySelectorAll('th');
                headers.forEach(header => {
                    const icon = header.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-sort';
                    }
                });
                
                // 设置当前列的排序指示器
                const currentHeader = this.container.querySelector(`th[data-column="${columnId}"]`);
                if (currentHeader) {
                    const icon = currentHeader.querySelector('i');
                    if (icon) {
                        icon.className = direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
                    }
                }
            }
            
            // 滚动到指定行
            scrollToRow(rowIndex) {
                const data = this.dataProvider.getCurrentData();
                if (rowIndex < 0) rowIndex = 0;
                if (rowIndex >= data.length) rowIndex = data.length - 1;
                
                const scrollTop = rowIndex * this.config.ROW_HEIGHT;
                this.tableWrapper.scrollTop = scrollTop;
                this.renderVisibleRows();
            }
            
            // 滚动到中间
            scrollToMiddle() {
                const data = this.dataProvider.getCurrentData();
                const middleIndex = Math.floor(data.length / 2);
                this.scrollToRow(middleIndex);
            }
            
            // 显示加载状态
            showLoading() {
                if (this.loadingIndicator) {
                    this.loadingIndicator.classList.remove('hidden');
                }
            }
            
            // 隐藏加载状态
            hideLoading() {
                if (this.loadingIndicator) {
                    this.loadingIndicator.classList.add('hidden');
                }
            }
            
            // 绑定事件
            bindEvents() {
                // 表格滚动事件（使用防抖优化性能）
                this.tableWrapper.addEventListener('scroll', () => {
                    if (this.scrollTimeout) {
                        cancelAnimationFrame(this.scrollTimeout);
                    }
                    
                    this.scrollTimeout = requestAnimationFrame(() => {
                        this.renderVisibleRows();
                        this.updateStats();
                    });
                });
                
                // 搜索输入事件（使用防抖）
                this.searchInput.addEventListener('input', (e) => {
                    if (this.searchTimeout) {
                        clearTimeout(this.searchTimeout);
                    }
                    
                    this.searchTimeout = setTimeout(() => {
                        this.filterData(e.target.value);
                    }, this.config.DEBOUNCE_DELAY);
                });
                
                // 表头点击事件（排序）
                this.container.addEventListener('click', (e) => {
                    const th = e.target.closest('th.sortable');
                    if (th) {
                        const columnId = th.getAttribute('data-column');
                        this.sortData(columnId);
                    }
                });
                
                // 窗口大小变化时重新渲染
                window.addEventListener('resize', () => {
                    this.renderVisibleRows();
                });
            }
            
            // 刷新表格
            refresh() {
                this.tableWrapper.scrollTop = 0;
                this.searchInput.value = '';
                this.dataProvider.clearFilter();
                this.renderVisibleRows();
                this.updateStats();
            }

            getStyles(){
                return `<style>
        /* 虚拟表格样式 - 完全封装在.virtual-table-container类中 */
        .virtual-table-container * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .virtual-table-container {
            width: 100%;
            max-width: 1200px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .virtual-table-container .virtual-table-header {
            padding: 20px 30px;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
        }
        
        .virtual-table-container .virtual-table-header h1 {
            font-size: 1.8rem;
            margin-bottom: 5px;
        }
        
        .virtual-table-container .virtual-table-header p {
            opacity: 0.9;
            font-size: 0.95rem;
        }
        
        .virtual-table-container .virtual-table-controls {
            padding: 20px 30px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
        }
        
        .virtual-table-container .virtual-table-search-box {
            flex: 1;
            min-width: 300px;
            position: relative;
        }
        
        .virtual-table-container .virtual-table-search-box input {
            width: 100%;
            padding: 12px 20px 12px 45px;
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .virtual-table-container .virtual-table-search-box input:focus {
            outline: none;
            border-color: #4299e1;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }
        
        .virtual-table-container .virtual-table-search-box i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #718096;
        }
        
        .virtual-table-container .virtual-table-stats {
            display: flex;
            gap: 25px;
            font-size: 0.9rem;
            color: #4a5568;
        }
        
        .virtual-table-container .virtual-table-stat-item {
            display: flex;
            flex-direction: column;
        }
        
        .virtual-table-container .virtual-table-stat-value {
            font-weight: bold;
            font-size: 1.1rem;
            color: #2d3748;
        }
        
        .virtual-table-container .virtual-table-wrapper {
            position: relative;
            height: 600px;
            overflow: auto;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .virtual-table-container table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .virtual-table-container thead {
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .virtual-table-container th {
            background-color: #edf2f7;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            color: #2d3748;
            border-bottom: 2px solid #cbd5e0;
            user-select: none;
        }
        
        .virtual-table-container th:hover {
            background-color: #e2e8f0;
        }
        
        .virtual-table-container th i {
            margin-left: 5px;
            color: #718096;
        }
        
        .virtual-table-container tbody tr {
            border-bottom: 1px solid #e2e8f0;
            transition: background-color 0.2s;
        }
        
        .virtual-table-container tbody tr:hover {
            background-color: #f7fafc;
        }
        
        .virtual-table-container td {
            padding: 14px 12px;
            color: #4a5568;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .virtual-table-container .virtual-table-footer {
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #f8fafc;
            color: #4a5568;
            font-size: 0.9rem;
        }
        
        .virtual-table-container .virtual-table-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.9);
            z-index: 20;
            font-size: 1.2rem;
            color: #4a5568;
        }
        
        .virtual-table-container .virtual-table-loading.hidden {
            display: none;
        }
        
        .virtual-table-container .virtual-table-row-index {
            font-weight: 600;
            color: #2d3748;
        }
        
        .virtual-table-container .virtual-table-empty-row {
            height: 48px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .virtual-table-container .virtual-table-status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .virtual-table-container .virtual-table-status-badge[data-status="活跃"],
        .virtual-table-container .virtual-table-status-badge[data-status="已认证"] {
            background-color: #c6f6d5;
            color: #22543d;
        }
        
        .virtual-table-container .virtual-table-status-badge[data-status="休眠"],
        .virtual-table-container .virtual-table-status-badge[data-status="待审核"] {
            background-color: #fed7d7;
            color: #742a2a;
        }
        
        .virtual-table-container .virtual-table-status-badge[data-status="停用"] {
            background-color: #e2e8f0;
            color: #4a5568;
        }
        
        @media (max-width: 768px) {
            .virtual-table-container .virtual-table-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .virtual-table-container .virtual-table-search-box {
                min-width: 100%;
            }
            
            .virtual-table-container .virtual-table-stats {
                justify-content: space-between;
            }
            
            .virtual-table-container .virtual-table-wrapper {
                height: 500px;
            }
            
            .virtual-table-container .virtual-table-footer {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
        }
        
        /* 页面其他样式 */
        body {
            padding: 20px;
            background-color: #f5f7fa;
            color: #333;
        }
        
        .page-title {
            text-align: center;
            margin-bottom: 30px;
            color: #2d3748;
        }
        
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background-color: #e6fffa;
            border-radius: 8px;
            border-left: 4px solid #38b2ac;
            max-width: 1200px;
            margin: 30px auto;
        }
        
        .instructions h3 {
            color: #234e52;
            margin-bottom: 10px;
        }
        
        .instructions ul {
            padding-left: 20px;
            color: #285e61;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .demo-controls {
            max-width: 1200px;
            margin: 20px auto;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .demo-controls button {
            padding: 10px 20px;
            background: #4299e1;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s;
        }
        
        .demo-controls button:hover {
            background: #3182ce;
        }
    </style>`;
            }
        }

// 初始化应用
// document.addEventListener('DOMContentLoaded', () => {
//     // 创建数据提供者
//     const dataProvider = new DataProvider();
    
//     // 创建虚拟表格
//     const virtualTable = new VirtualTable('virtualTableContainer', dataProvider);
//     virtualTable.init();
    
//     // 初始加载数据
//     virtualTable.loadData(10000);
    
//     // 绑定演示按钮事件
//     document.getElementById('btnLoad10K').addEventListener('click', () => {
//         virtualTable.loadData(10000);
//     });
    
//     document.getElementById('btnLoad50K').addEventListener('click', () => {
//         virtualTable.loadData(50000);
//     });
    
//     document.getElementById('btnLoad100K').addEventListener('click', () => {
//         virtualTable.loadData(100000);
//     });
    
//     document.getElementById('btnClearFilter').addEventListener('click', () => {
//         virtualTable.refresh();
//     });
    
//     document.getElementById('btnScrollToMiddle').addEventListener('click', () => {
//         virtualTable.scrollToMiddle();
//     });
    
//     document.getElementById('btnRefreshData').addEventListener('click', () => {
//         const currentCount = dataProvider.getTotalCount();
//         virtualTable.loadData(currentCount);
//     });
// });