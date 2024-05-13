
export class CopytoExcel{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        
        this.lazy =true;
        this.processingQty = 0;
        
    }

    get starting(){
        return this._start || false;
    }

    set starting(s){
        this._start = s;
        this.totalReocrds(this.totalSize);
        if (s){
            $('#copy2excel-refreshSObjectSearch').addClass('loading');
        }else{
            $('#copy2excel-refreshSObjectSearch').removeClass('loading');
        }
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <p>
            Order Id Search:
            
            <div class="btn-container">	
                <div class="btn" id="copy2excel-refreshSObjectSearch">
                    <span>Search</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="copy2excel-refreshSObjectCopy">
                    <span>Copy</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="copy2excel-Clear">
                    <span>Clear</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="copy2excel-Report1">
                    <span>Report1</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="copy2excel-Report2">
                    <span>Report2</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="copy2excel-Merge">
                    <span>Merge</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="copy2excel-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span></div>
            <div class="totalbar" id="copy2excel-notificationmessage"></div>

            <div class="copy2excel-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="copy2excel-btn-reset">Stop</li>
                    <li id="copy2excel-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="loader" id="copy2excel-loading"></div>
                <div class="merge-input" id="merge-input"></div>
                <textarea contenteditable="true" name="" id="copy2excel-sql" placeholder="input your soql here start to query" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea readonly name="" id="copy2excel-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <div class="copy2excel-view-result tabitem Result">
                <div id="copy2excel-showallsobjectdatatable"></div>
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
        $('.copy2excel-searchresult .totalrecordnumber').html(qty);
    }


    initObjectAllDataHead(){

        $('#copy2excel-refreshSObjectSearch').on('click', ()=>{
            let soql = $('#copy2excel-sql').val().trim();

            this.search(soql);
        })

        $('#copy2excel-refreshSObjectCopy').on('click', ()=>{
            this.clear();
            this.tree.Tools.exportExcel(this.records||[], this.headers);
            this.addMessage('copy success:');
        })
        $('#copy2excel-btn-format').on('click', ()=>{
            let soql = $('#copy2excel-sql').val().trim();
            $('#copy2excel-sql').val(this.tree.Tools.formatSQL(soql));
        })
        $('#copy2excel-Clear').on('click', ()=>{
            this.clear();
            this.records = [];
            this.addMessage('Clear success:');
        });
        $('#copy2excel-btn-reset').on('click', ()=>{
            this.starting = false;
        })

        $('#copy2excel-Report1').on('click', ()=>{
            this.clear();
            let soql = $('#copy2excel-sql').val().trim();
            let soql1 = `select id,FolderName, name,DeveloperName,Description from report where FolderName='Public Reports'`;
          
            

            this.search(soql);


            this.addMessage('Clear success:');
        });
        $('#copy2excel-Report2').on('click', ()=>{
            this.result1 = {records:[...(this.records||[])], headers:{...this.headers}};
            this.clear();

            let soql2 = `select Dashboard.FolderName, Dashboard.title,Dashboard.DeveloperName,dashboard.Description,CustomReportId  from DashboardComponent where   Dashboard.title in ('CAP Dashboard','COM BYOD Dashboard','Commodity Sales Dashboard','Commodity Sales Dashboard 2','Commodity Sales Management Dashboard','Commodity Sales Management Dashboard 2','Consumer Mobile CSO QA Dashboard','Consumer Mobile CSO QA Dashboard 2','Consumer Mobile CSO Service Support Dashboard','Consumer Mobile QA Dashboard','Consumer Mobile QA Dashboard 2','Consumer Mobile SIM Mangament Dashboard','Consumer Mobile Sales Analysis Team Dashboard','Consumer Mobile Sales Analysis Team Dashboard 2','Consumer Mobile Sales Head Dashboard','Consumer Mobile Service Provionsing Dashboard','Consumer Mobile Service Provionsing Dashboard 2','Consumer Mobile Stock Managnment Dashboard','Device Management Dashboard','Device Management Support Dashboard','HKT Home Business Performance Management Dashboard','HKT Home Marketing & Products Dashboard','HKT Home Sales Head Dashboard','HKT Home Stock Management & Fulfillment Dashboard','Mobile Direct Sales Dashboard','Mobile Direct Sales Dashboard 2','Mobile Operation Dashboard','Mobile Operation Management Dashboard','Mobile Sales Operation Dashboard','Mobile Sales Operation Dashboard 2')
            order by Dashboard.title `;

            let soql = $('#copy2excel-sql').val().trim();
            this.search(soql);

            this.addMessage('Clear success:');
        });
        $('#copy2excel-Merge').on('click', ()=>{
            if (!this.mergeStart){
                this.result2 = {records:[...(this.records||[])], headers:{...this.headers}};
    
                let h1 = this.tree.Tools.discoverColumns(this.result1.records||[]);
                let h2 = this.tree.Tools.discoverColumns(this.result2.records||[]);
                this.mergeStart = true;
                this.startMergeInput(h1, h2);
                return;
            }

            
            let leftField = $('#merge-option1').val();
            let rightField = $('#merge-option2').val();
            this.addMessage('leftField success:'+leftField);
            this.addMessage('rightField success:'+rightField);
            if(leftField && rightField){
                for (let item of this.result2.records){
                    let referItem = this.result1.records.find(e=>{
                        return e[leftField] == item[rightField];
                    })
                    item[rightField+'__r'] = referItem;
                }
                
                this.tree.Tools.exportExcel(this.records||[], this.headers);
            }

            this.addMessage('copy success:');
            this.exampleTable(this.result2.records);
            this.mergeStart = false;
            $('#merge-input').html('');
        });

        
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
        $('#copy2excel-message').val(this.messageList.join('\n'));
    }
    clear(){
        this.messageList = [];
        $('#copy2excel-message').val('');
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
        $('#copy2excel-showallsobjectdatatable').html(this.render(records.slice(0, Math.min(10, records.length)), h1));
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
            <table id="copy2excel-datatable" class="table">
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
