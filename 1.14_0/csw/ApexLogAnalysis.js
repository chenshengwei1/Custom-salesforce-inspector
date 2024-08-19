
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
        <p>
            Order Id Search:
            
            <div class="btn-container">	
                <div class="btn" id="logAnalysis-refreshSObjectSearch">
                    <span>Method</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-Filter">
                    <span>Filter</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="logAnalysis-Clear">
                    <span>Clear</span>
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
                <div class="btn" id="logAnalysis-Merge">
                    <span>Merge</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="logAnalysis-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span></div>
            <div class="totalbar" id="logAnalysis-notificationmessage"></div>

            <div class="logAnalysis-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="logAnalysis-btn-reset">Stop</li>
                    <li id="logAnalysis-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="loader" id="logAnalysis-loading"></div>
                <div class="merge-input" id="merge-input"></div>
                <input id="logAnalysis-searchkey" class="feedback-text feedback-input"></input>
                <textarea contenteditable="true" name="" id="logAnalysis-sql" placeholder="input your soql here start to query" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea readonly name="" id="logAnalysis-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <div class="logAnalysis-view-result tabitem Result">
                <div id="logAnalysis-showallsobjectdatatable"></div>
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

}
