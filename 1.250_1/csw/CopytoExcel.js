
export class CopytoExcel{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        
        this.lazy =true;
        this.processingQty = 0;
        this.sampleRecordCount = 10;
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
                <div class="btn" id="copy2excel-download">
                    <span>Download</span>
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
                <div class="btn" id="copy2excel-validation">
                    <span>Validation</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="copy2excel-tab-container">
            <span class="copy2excel-tab-item" name="add">add</span>
        </div>
        <div class="copy2excel-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span> <span> Display Records:</span><input id="exampleRecordsInput" class="search feedback-input" type="number" value="10"></input></div>
            <div class="totalbar" id="copy2excel-notificationmessage"></div>

            <div class="copy2excel-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="copy2excel-btn-reset">Stop</li>
                    <li id="copy2excel-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="merge-input" id="merge-input"></div>
                <textarea contenteditable="true" name="" id="copy2excel-sql" placeholder="input your soql here start to query" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <section>
                    <textarea readonly name="" id="copy2excel-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                </section>
                
            </div>
            <div class="copy2excel-view-result tabitem Result">
                <input name="" id="copy2excel-filter" style="font-size: large;" class="feedback-text feedback-input no-border"></input>
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

    dataAsTable(){
        var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
        var j = 0;
        var tab = document.getElementById('copy2excel-datatable'); // id of table
        tab_text = tab_text + tab.rows[0].innerHTML + "</tr>";
    
        for (j = 1; j < tab.rows.length; j++) {
            //tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
            //tab_text=tab_text+"</tr>";
        }
    
        let records = this.records;
        let header = this.tree.Tools.discoverColumns(records||[]);
        let tableBody = `${records.map(r=>{
            return `
    <tr class="row" >
    ${header.map(e=>{
        return `<td class="cell field-${e}" tabindex="0" title="${e}">${this.toRecordString(r,  e)||''}</td>`
    }).join('')}
    </tr>`
        }).join('')}`;
    
        tab_text = tab_text + tableBody;
        tab_text = tab_text + "</table>";
        return tab_text;
    }

    applyToExcel(){
        let tab_text = this.dataAsTable();
        tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
        tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
        tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
    
        var msie = window.navigator.userAgent.indexOf("MSIE ");
    
        // If Internet Explorer
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            txtArea1.document.open("txt/html", "replace");
            txtArea1.document.write(tab_text);
            txtArea1.document.close();
            txtArea1.focus();
    
            sa = txtArea1.document.execCommand("SaveAs", true, "Say Thanks to Sumit.xls");
        } else {
            // other browser not tested on IE 11
            sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        }
    
        return sa;
    }


     exportToExcel(tableHtml) {
        const uri = 'data:application/vnd.ms-excel;base64,';
        const template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    
        const base64 = (s) => window.btoa(unescape(encodeURIComponent(s)));
    
        const format = function (template, context) {
            return template.replace(/{(\w+)}/g, (m, p) => context[p])
        };
    
        const html = tableHtml;
        const ctx = {
            worksheet: 'Worksheet',
            table: html,
        };
    
        const link = document.createElement("a");
        link.download = this.objectName +".xls";
        link.href = uri + base64(format(template, ctx));
        link.click();
    }

     s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
      }

    exportAsXslx(tableHtml){
        const base64 = (s) => window.btoa(unescape(encodeURIComponent(s)));

        var bin = window.atob(base64(tableHtml));
        var ab = this.s2ab(bin); // from example above
        var blob = new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' });

        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.objectName +'.xls';
        link.click();
    }

    updateTabBaritem(){
        let html = this.tabMgr.tabs.map((e, index)=>{
            return `<span class="copy2excel-tab-item${e.activate?' activate':''}" name="${e.name}" title="${e.soql||''}">${e.label||e.name}</span>`
        }).join('');
        html = html + `<span class="copy2excel-tab-item" name="add">Add</span>`
        $('.copy2excel-tab-container').html(html);
        this.showTab(this.tabMgr.tabs.find(e=>e.activate));
    }

    saveBeforeTab(inactivateTab){
        if (!inactivateTab){
            return;
        }
        let soql = $('#copy2excel-sql').val().trim();
        inactivateTab.soql = soql;
        inactivateTab.records = this.records;
        inactivateTab.label = this.getLabelBySoql(soql);
    }

    getLabelBySoql(soql){
        if (soql){
            let match = /from\s+([\d\w_]+)\b/ig.exec(soql)
            if (match){
                let d = new Date();
                return match[1]+'@'+d.getHours()+':'+d.getMinutes()+''+d.getSeconds();
            }
        }
        return ''
    }

    showTab(activateTab){
        if (!activateTab){
            return;
        }
        $('#copy2excel-sql').val(activateTab.soql||'');
        this.records = activateTab.records || [];
        this.exampleTable(activateTab.records||[]);
    }

    initTabLinsener(){
        $('.copy2excel-tab-container').on('click', '.copy2excel-tab-item',(event)=>{
            let name = $(event.target).attr('name');
            if (name == 'add'){
                let inactivateTab = this.tabMgr.tabs.find(e=>e.activate);
                this.tabMgr.tabs.forEach(e=>{e.activate = false});
                let newTab = {name:'item-'+this.tabIndex, activate: true};
                this.tabMgr.tabs.push(newTab);
                this.tabIndex++;
                
                if (!inactivateTab){
                    this.saveBeforeTab(newTab);
                }else{
                    this.saveBeforeTab(inactivateTab);
                }
            }else{
                let tab = this.tabMgr.tabs.find(e=>e.name==name);
                if (tab){
                    if (tab.activate){
                        return;
                    }else{
                        let inactivateTab = this.tabMgr.tabs.find(e=>e.activate);
                        this.saveBeforeTab(inactivateTab);
                        this.tabMgr.tabs.forEach(e=>{e.activate = false});
                        tab.activate = true;
                    }
                }
            }
            this.updateTabBaritem();
        })

        let tabs = this.getTabsSoql();
        for (let tab of tabs){
            let newTab = {name:'item-'+this.tabIndex, soql:tab.sql, label: this.getLabelBySoql(tab.sql)};
            this.tabMgr.tabs.push(newTab);
            this.tabIndex++;
        }
        this.updateTabBaritem();
    }

    getTabsSoql(){
        let history = JSON.parse(localStorage['cp2ecl.sql']||'{}');
        return Object.keys(history).map(e=>{return {name:e, sql:history[e]}});
    }

    saveTabSoql(tabName, soql){
        let history = JSON.parse(localStorage['cp2ecl.sql']||'{}');
        history[tabName] = soql;
        localStorage['cp2ecl.sql'] = JSON.stringify(history);
    }


    initObjectAllDataHead(){
        this.initTabLinsener();
        $('#copy2excel-refreshSObjectSearch').on('click', ()=>{
            let soql = $('#copy2excel-sql').val().trim();

            let tabName = $('.copy2excel-tab-item.activate').attr('name');
            this.saveTabSoql(tabName||'add', soql);
            this.search(soql);
        })

        $('#copy2excel-download').on('click', ()=>{
            this.clear();
            try{
                //this.applyToExcel();
                let soql = $('#copy2excel-sql').val().trim();
                let ma = /from\s+([\w\d_]+)/ig.exec(soql);
                if (ma){
                    this.objectName = ma[1];
                }

                this.exportToExcel(this.dataAsTable());
                //this.exportAsXslx(this.dataAsTable());
            }catch(e){

            }
            this.addMessage('download success:');
        })

        $('#copy2excel-refreshSObjectCopy').on('click', ()=>{
            this.clear();
            try{
                //this.applyToExcel();
                //this.exportToExcel(this.dataAsTable());
                this.test();
            }catch(e){

            }
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

        $('#exampleRecordsInput').on('change', ()=>{
            this.sampleRecordCount = +$('#exampleRecordsInput').val();
            this.exampleTable(this.records);
        })

        $('#copy2excel-filter').on('change', ()=>{
            this.exampleTable(this.records);
        })

        $('#copy2excel-validation').on('click', ()=>{
             let complexSOQL = $('#copy2excel-sql').val().trim();
             this.parse(complexSOQL);
             this.validateSoql(complexSOQL);

             // 使用示例
            const builder = new SOQLBuilder();

            try {
                console.log('=== 原始 SOQL ===');
                console.log(complexSOQL);
                
                console.log('\n=== 解析结果 ===');
                const structure = builder.parser.parse(complexSOQL);
                console.log('structure = ', structure);
                console.log(JSON.stringify(structure, null, 2));
                
                console.log('\n=== 重新构建的 SOQL ===');
                const rebuilt = builder.build(structure, { format: true });
                console.log(rebuilt);
                
                console.log('\n=== 格式化现有 SOQL ===');
                const formatted = builder.format(complexSOQL, { 
                    format: true, 
                    indentSize: 2,
                    maxLineLength: 80 
                });
                console.log(formatted);
                
            } catch (error) {
                console.error('错误:', error.message);
            }
        })

        
    }

    test(){
        let map = {};
        for (let m of this.records){
            if (m.Detail__c.indexOf('NTVSSP') == -1){
                continue;
            }
            let key = m.CreatedDate.replaceAll('-','').replaceAll('T','').replaceAll('.','').replaceAll(':','').substr(0, 12);
            //let key = this.tree.Tools.formatDate(new Date(Date.parse(m.CreatedDate)), 'yyyyMMddhhmm');
            map[key] = (map[key]||0)+1;
        }
        let length = Object.keys(map).length;
        let sum = 0;
        let max = 0;
        let min = 0;
        Object.keys(map).forEach(e=>{
            sum+=map[e];
            max  = Math.max(max, map[e]);
            min  = Math.min(min, map[e]);
        });
        console.log(map)
        console.log("sum="+sum);
        console.log("avg="+(sum/length));
        console.log("max="+max);
        console.log("min="+min);
    }

    filteredResult(records){
        let filteredKeyword = $('#copy2excel-filter').val();
        if (!filteredKeyword || !records){
            return records;
        }
        return records.filter(e=>{
            let json = JSON.stringify(e);
            return json.toLowerCase().indexOf(filteredKeyword.toLowerCase()) != -1;
        })
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

    parse(soql){
        const soqlRegex = /^\s*SELECT\s+(\w+(?:\.\w+)*(?:\s*,\s*\w+(?:\.\w+)*)*\s*)(?:\([^)]+\))?\s*(?:TYPEOF\s+\w+\s+WHEN\s+\w+\s+THEN\s+[^ ]+(?:\s+WHEN\s+\w+\s+THEN\s+[^ ]+)*\s+ELSE\s+[^ ]+\s+END\s*)?(?:\([^)]+\)\s*)*FROM\s+(\w+(?:\s*,\s*\w+)*)(?:\s+USING\s+SCOPE\s+(\w+))?(?:\s+WHERE\s+(.+?))?(?:\s+WITH(?:\s+DATA\s+CATEGORY)?\s+(.+?))?(?:\s+GROUP\s+BY\s+(?:(?:\w+(?:\.\w+)*(?:\s*,\s*\w+(?:\.\w+)*)*)|(?:ROLLUP\s*\([^)]+\))|(?:CUBE\s*\([^)]+\)))(?:\s+HAVING\s+(.+?))?)?(?:\s+ORDER\s+BY\s+(\w+(?:\.\w+)*(?:\s+ASC|\s+DESC)?(?:\s+NULLS\s+(?:FIRST|LAST))?(?:\s*,\s*\w+(?:\.\w+)*(?:\s+ASC|\s+DESC)?(?:\s+NULLS\s+(?:FIRST|LAST))?)*))?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?(?:\s+(?:FOR\s+VIEW|FOR\s+REFERENCE))?(?:\s+UPDATE\s+(?:TRACKING|VIEWSTAT))?(?:\s+FOR\s+UPDATE)?\s*$/i;

        const testQueries = [
            "SELECT Id, Name FROM Account",
            "SELECT Id, Name FROM Account WHERE Name = 'Test' LIMIT 10",
            "SELECT Id, (SELECT Name FROM Contacts) FROM Account",
            "SELECT TYPEOF Owner WHEN User THEN Name WHEN Group THEN Name ELSE Name END FROM Account"
        ];

        const match = soql.match(soqlRegex);
        if (match) {
            console.log(`Valid SOQL: ${soql}`);
            console.log(`Fields: ${match[1]}, Object: ${match[2]}`);
        } else {
            console.log(`Invalid SOQL: ${query}`);
        }
    }

    validateSoql(complexSOQL){
        // 使用示例
        const validator = new SOQLValidator();

        // 测试复杂的 SOQL
        const complexSOQL1 = `
        SELECT 
            Id, Name, Type, Industry, AnnualRevenue, Owner.Name,
            (SELECT Id, Name, StageName, Amount FROM Opportunities WHERE IsClosed = false),
            (SELECT Id, FirstName, LastName, Email FROM Contacts WHERE Email != null),
            TYPEOF Owner WHEN User THEN Name, Email WHEN Group THEN Name, Type ELSE Name END
        FROM Account
        WHERE Industry IN ('Technology', 'Banking') 
            AND AnnualRevenue > 1000000
            AND Id IN (SELECT AccountId FROM Opportunity WHERE StageName = 'Closed Won')
        WITH DATA CATEGORY Geography__c BELOW country__c
        GROUP BY Type, Industry
        HAVING COUNT(Id) > 1
        ORDER BY AnnualRevenue DESC, Name ASC
        LIMIT 50
        OFFSET 0
        FOR VIEW
        `;

        const result = validator.validateSOQL(complexSOQL);
        console.log("验证结果:", result);

        // 输出格式化结果
        function formatValidationResult(result) {
            console.log(`\n=== SOQL 验证结果 ===`);
            console.log(`有效性: ${result.isValid ? '✅ 有效' : '❌ 无效'}`);
            
            if (result.errors.length > 0) {
                console.log(`\n错误列表:`);
                result.errors.forEach(error => console.log(`  ❌ ${error}`));
            }
            
            if (result.warnings.length > 0) {
                console.log(`\n警告列表:`);
                result.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
            }
            
            if (Object.keys(result.parsedParts).length > 0) {
                console.log(`\n解析的组成部分:`);
                Object.keys(result.parsedParts).forEach(part => {
                    console.log(`  📋 ${part}: ${JSON.stringify(result.parsedParts[part]).substring(0, 100)}...`);
                });
            }
        }

        formatValidationResult(result);
    }

    async search(soql){
        this.clear();
        this.exampleTable([]);
        
        //this.validateSoql(complexSOQL);
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
        //this.prepeareRecords(this.records);
        this.exampleTable(this.records);
    }

    prepeareRecords(records){
        for (let record of records){
            if (record.vlocity_cmt__AttributeSelectedValues__c){
                try{
                    
                    record.vlocity_cmt__AttributeSelectedValues__r=JSON.parse(record.vlocity_cmt__AttributeSelectedValues__c);
                }catch(e){}
            }
        }
        return records;
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
        this.prepeareRecords(newRecords);
        this.records.push(...newRecords);
        this.processingQty = this.records.length;
        this.addMessage('update records:' + newRecords.length + ' - ' +this.records.length + ' - ' + this.totalSize);
    }

    exampleTable(records){
        let filteredRecords = this.filteredResult(records);
        let h1 = this.tree.Tools.discoverColumns(filteredRecords||[]);
        $('#copy2excel-showallsobjectdatatable').html(this.render(filteredRecords.slice(0, Math.min(this.sampleRecordCount, filteredRecords.length)), h1));
    }

    toRecordString(r, f){
        if (!r){
            return '';
        }
        if (r[f]){
            return r[f];
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

        let genTableRows = (r,$index)=>{
            return `
                <tr class="row" >

                ${header.map(e=>{
                    return `<td class="cell field-${e}" tabindex="0" title="${e}">${e=='_'?($index+1):this.toRecordString(r,  e)||''}</td>`
                }).join('')}
                </tr>`
        }
        let genAllRows =(datas)=>{
            let lines = '';
            this.tree.Tools.performChrunk(datas, (r,$index)=>{
                let line = genTableRows(r,$index);
                $('#copy2excel-datatable tbody').append(line);
                
            });
            return lines
        }
        return `
            <table id="copy2excel-datatable" class="table">
                <thead>
                    <tr class="row"><th class="cell" colspan="${header.length || 1}"><b>${this.records.length}</b></th></tr>
                    <tr class="row header blue">
                        ${header.map(e=>{
                            return `<th class="field-${e} cell" tabindex="0">${e}
                            </th>`
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${genAllRows(records)}
                </tbody>
            </table>`
    }

}


class SOQLValidator {
    constructor() {
        // 定义各部分的验证规则
        this.rules = {
            // 1. 基础结构
            basicStructure: /^SELECT\s+.+?\s+FROM\s+\w+/i,
            
            // 2. 字段列表（支持子查询和TYPEOF）
            fieldList: /^SELECT\s+([\s\S]+?)\s+FROM/i,
            
            // 3. FROM 子句
            fromClause: /FROM\s+(\w+(?:\s*,\s*\w+)*)(?:\s|$)/i,
            
            // 4. WHERE 条件
            whereClause: /WHERE\s+([\s\S]+?)(?=\s+(?:GROUP BY|ORDER BY|LIMIT|WITH|$))/i,
            
            // 5. 子查询
            subquery: /\(\s*SELECT\s+[\s\S]+?\s+FROM\s+\w+[\s\S]*?\)/gi,
            
            // 6. TYPEOF 表达式
            typeOfExpr: /TYPEOF\s+\w+(?:\s+WHEN\s+\w+\s+THEN[^END]+)+END/gi,
            
            // 7. WITH DATA CATEGORY
            withDataCategory: /WITH(?:\s+DATA\s+CATEGORY)?\s+([\s\S]+?)(?=\s+(?:GROUP BY|ORDER BY|LIMIT|$))/i,
            
            // 8. GROUP BY
            groupBy: /GROUP\s+BY\s+([\s\S]+?)(?=\s+(?:HAVING|ORDER BY|LIMIT|$))/i,
            
            // 9. HAVING
            having: /HAVING\s+([\s\S]+?)(?=\s+(?:ORDER BY|LIMIT|$))/i,
            
            // 10. ORDER BY
            orderBy: /ORDER\s+BY\s+([\s\S]+?)(?=\s+(?:LIMIT|OFFSET|$))/i,
            
            // 11. LIMIT & OFFSET
            limitOffset: /LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i,
            
            // 12. 其他修饰符
            modifiers: /(?:FOR\s+(?:VIEW|REFERENCE))|(?:UPDATE\s+(?:TRACKING|VIEWSTAT))|(?:FOR\s+UPDATE)/gi
        };
    }

    /**
     * 主验证方法
     */
    validateSOQL(query) {
        const normalizedQuery = this.normalizeQuery(query);
        const results = {
            isValid: true,
            errors: [],
            warnings: [],
            parsedParts: {}
        };

        // 逐步验证各个部分
        const validationSteps = [
            () => this.validateBasicStructure(normalizedQuery, results),
            () => this.validateFieldList(normalizedQuery, results),
            () => this.validateFromClause(normalizedQuery, results),
            () => this.validateSubqueries(normalizedQuery, results),
            () => this.validateTypeOfExpressions(normalizedQuery, results),
            () => this.validateWhereClause(normalizedQuery, results),
            () => this.validateWithDataCategory(normalizedQuery, results),
            () => this.validateGroupByHaving(normalizedQuery, results),
            () => this.validateOrderBy(normalizedQuery, results),
            () => this.validateLimitOffset(normalizedQuery, results),
            () => this.validateModifiers(normalizedQuery, results),
            () => this.validateKeywordOrder(normalizedQuery, results)
        ];

        for (const step of validationSteps) {
            if (!results.isValid) break; // 如果已经失败，停止后续验证
            step();
        }

        return results;
    }

    /**
     * 1. 基础结构验证
     */
    validateBasicStructure(query, results) {
        if (!this.rules.basicStructure.test(query)) {
            results.isValid = false;
            results.errors.push("无效的SOQL基础结构：必须包含 SELECT ... FROM ...");
            return;
        }
        
        // 检查关键字顺序
        const selectIndex = query.toUpperCase().indexOf('SELECT');
        const fromIndex = query.toUpperCase().indexOf('FROM');
        
        if (fromIndex <= selectIndex) {
            results.isValid = false;
            results.errors.push("关键字顺序错误：FROM 必须在 SELECT 之后");
        }
        
        results.parsedParts.basicStructure = 'valid';
    }

    /**
     * 2. 字段列表验证
     */
    validateFieldList(query, results) {
        const match = query.match(this.rules.fieldList);
        if (!match || !match[1]) {
            results.isValid = false;
            results.errors.push("字段列表为空或格式错误");
            return;
        }

        const fieldList = match[1].trim();
        
        // 检查字段列表是否包含非法字符
        if (/[;{}]/.test(fieldList)) {
            results.warnings.push("字段列表中可能包含潜在的危险字符");
        }

        results.parsedParts.fieldList = fieldList;
    }

    /**
     * 3. FROM 子句验证
     */
    validateFromClause(query, results) {
        const match = query.match(this.rules.fromClause);
        if (!match) {
            results.isValid = false;
            results.errors.push("FROM 子句缺失或格式错误");
            return;
        }

        const objectName = match[1];
        
        // 简单的对象名验证（实际项目中可以扩展）
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(objectName)) {
            results.warnings.push(`对象名称 '${objectName}' 可能无效`);
        }

        results.parsedParts.objectName = objectName;
    }

    /**
     * 4. 子查询验证
     */
    validateSubqueries(query, results) {
        const subqueries = query.match(this.rules.subquery) || [];
        
        subqueries.forEach((subquery, index) => {
            // 递归验证子查询
            const subqueryContent = subquery.slice(1, -1); // 去掉括号
            const subValidation = this.validateSOQL(subqueryContent);
            
            if (!subValidation.isValid) {
                results.isValid = false;
                results.errors.push(`子查询 ${index + 1} 无效: ${subValidation.errors[0]}`);
            } else {
                results.parsedParts.subqueries = results.parsedParts.subqueries || [];
                results.parsedParts.subqueries.push({
                    content: subquery,
                    isValid: true
                });
            }
        });
    }

    /**
     * 5. TYPEOF 表达式验证
     */
    validateTypeOfExpressions(query, results) {
        const typeOfExprs = query.match(this.rules.typeOfExpr) || [];
        
        typeOfExprs.forEach((expr, index) => {
            // 验证 TYPEOF 结构
            const typeOfRegex = /TYPEOF\s+(\w+)(?:\s+WHEN\s+(\w+)\s+THEN\s+([^WHEN]+))+\s+ELSE\s+([^END]+)END/gi;
            
            if (!typeOfRegex.test(expr)) {
                results.warnings.push(`TYPEOF 表达式 ${index + 1} 结构可能不正确`);
            } else {
                results.parsedParts.typeOfExpressions = results.parsedParts.typeOfExpressions || [];
                results.parsedParts.typeOfExpressions.push(expr);
            }
        });
    }

    /**
     * 6. WHERE 子句验证
     */
    validateWhereClause(query, results) {
        const match = query.match(this.rules.whereClause);
        if (match) {
            const whereClause = match[1];
            
            // 检查 WHERE 条件中的潜在问题
            if (whereClause.includes(';')) {
                results.warnings.push("WHERE 子句中包含分号，可能存在注入风险");
            }
            
            results.parsedParts.whereClause = whereClause;
        }
    }

    /**
     * 7. WITH DATA CATEGORY 验证
     */
    validateWithDataCategory(query, results) {
        const match = query.match(this.rules.withDataCategory);
        if (match) {
            const dataCategory = match[1];
            
            // 基本的数据类别语法检查
            if (!/(ABOVE|BELOW|AT|ABOVE_OR_BELOW)\s*\([^)]+\)/.test(dataCategory)) {
                results.warnings.push("WITH DATA CATEGORY 语法可能不正确");
            }
            
            results.parsedParts.dataCategory = dataCategory;
        }
    }

    /**
     * 8. GROUP BY 和 HAVING 验证
     */
    validateGroupByHaving(query, results) {
        const groupByMatch = query.match(this.rules.groupBy);
        const havingMatch = query.match(this.rules.having);
        
        if (groupByMatch) {
            results.parsedParts.groupBy = groupByMatch[1];
            
            // GROUP BY 必须有聚合函数在 SELECT 中
            const hasAggregate = /COUNT|SUM|AVG|MIN|MAX/i.test(results.parsedParts.fieldList || '');
            if (!hasAggregate) {
                results.warnings.push("GROUP BY 子句存在但 SELECT 中没有聚合函数");
            }
        }
        
        if (havingMatch) {
            if (!groupByMatch) {
                results.isValid = false;
                results.errors.push("HAVING 子句必须与 GROUP BY 子句一起使用");
            } else {
                results.parsedParts.having = havingMatch[1];
            }
        }
    }

    /**
     * 9. ORDER BY 验证
     */
    validateOrderBy(query, results) {
        const match = query.match(this.rules.orderBy);
        if (match) {
            const orderBy = match[1];
            
            // 检查 ORDER BY 语法
            const orderByItems = orderBy.split(',').map(item => item.trim());
            for (const item of orderByItems) {
                if (!/^[\w\.]+\s*(?:ASC|DESC)?\s*(?:NULLS\s+(?:FIRST|LAST))?$/i.test(item)) {
                    results.warnings.push(`ORDER BY 项目 '${item}' 语法可能不正确`);
                }
            }
            
            results.parsedParts.orderBy = orderBy;
        }
    }

    /**
     * 10. LIMIT 和 OFFSET 验证
     */
    validateLimitOffset(query, results) {
        const match = query.match(this.rules.limitOffset);
        if (match) {
            const limit = parseInt(match[1]);
            const offset = match[2] ? parseInt(match[2]) : 0;
            
            if (isNaN(limit) || limit < 0) {
                results.isValid = false;
                results.errors.push("LIMIT 值必须是非负整数");
            }
            
            if (offset < 0) {
                results.isValid = false;
                results.errors.push("OFFSET 值必须是非负整数");
            }
            
            results.parsedParts.limit = limit;
            results.parsedParts.offset = offset;
        }
    }

    /**
     * 11. 修饰符验证
     */
    validateModifiers(query, results) {
        const modifiers = query.match(this.rules.modifiers) || [];
        results.parsedParts.modifiers = modifiers;
        
        // 检查修饰符冲突
        if (modifiers.includes('FOR UPDATE') && modifiers.includes('FOR VIEW')) {
            results.warnings.push("FOR UPDATE 和 FOR VIEW 不能同时使用");
        }
    }

    /**
     * 12. 关键字顺序验证
     */
    validateKeywordOrder(query, results) {
        const upperQuery = query.toUpperCase();
        const keywords = [
            'SELECT', 'FROM', 'WHERE', 'WITH', 'GROUP BY', 
            'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET'
        ];
        
        let lastIndex = -1;
        for (const keyword of keywords) {
            const currentIndex = upperQuery.indexOf(keyword);
            if (currentIndex !== -1) {
                if (currentIndex < lastIndex) {
                    results.warnings.push(`关键字顺序可能不正确: ${keyword}`);
                }
                lastIndex = currentIndex;
            }
        }
    }

    /**
     * 标准化查询字符串
     */
    normalizeQuery(query) {
        return query
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

class SOQLParser {
    constructor() {
        this.patterns = {
            // 基础结构
            base: /^SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)(?=\s|$)/i,
            
            // 字段相关
            fields: {
                simple: /(\w+(?:\.\w+)*)/g,
                subquery: /\(\s*SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)([\s\S]*?)\)/g,
                typeOf: /TYPEOF\s+(\w+)([\s\S]*?)END/gi
            },
            
            // 子句
            where: /(?:^|\s)WHERE\s+([\s\S]+?)(?=\s+(?:WITH|GROUP BY|ORDER BY|LIMIT|OFFSET|FOR|UPDATE|$)) (?!.*\bFROM\b)/i,
            // 更精确的 WHERE 匹配方案
            whereAlternative: this.createWherePattern(),
            withDataCategory: /WITH(?:\s+DATA\s+CATEGORY)?\s+([\s\S]+?)(?=\s+(?:GROUP BY|ORDER BY|LIMIT|$))/i,
            groupBy: /GROUP\s+BY\s+([\s\S]+?)(?=\s+(?:HAVING|ORDER BY|LIMIT|$))/i,
            having: /HAVING\s+([\s\S]+?)(?=\s+(?:ORDER BY|LIMIT|$))/i,
            orderBy: /ORDER\s+BY\s+([\s\S]+?)(?=\s+(?:LIMIT|OFFSET|$))/i,
            limit: /LIMIT\s+(\d+)/i,
            offset: /OFFSET\s+(\d+)/i,
            usingScope: /USING\s+SCOPE\s+(\w+)/i,
            
            // 修饰符
            modifiers: {
                forView: /FOR\s+VIEW/i,
                forReference: /FOR\s+REFERENCE/i,
                updateTracking: /UPDATE\s+TRACKING/i,
                updateViewstat: /UPDATE\s+VIEWSTAT/i,
                forUpdate: /FOR\s+UPDATE/i
            }
        };
    }

    /**
     * 创建更精确的 WHERE 模式匹配
     */
    createWherePattern() {
        // 匹配 WHERE 后面直到下一个主要关键字或结尾的内容
        // 但要排除包含 SELECT ... FROM 的子查询
        return /(?:^|\s)WHERE\s+((?:(?!\s(SELECT\s+[\s\S]+?\s+FROM|WITH|GROUP BY|ORDER BY|LIMIT|OFFSET|FOR|UPDATE)\b)[\s\S])+?)(?=\s+(?:WITH|GROUP BY|ORDER BY|LIMIT|OFFSET|FOR|UPDATE)|$)/i;
    }

    parse(soql) {
        try {
            const normalized = this.normalizeQuery(soql);
            const structure = {
                fields: [],
                from: '',
                where: null,
                withDataCategory: null,
                groupBy: null,
                having: null,
                orderBy: [],
                limit: null,
                offset: null,
                usingScope: null,
                modifiers: []
            };

            this.parseBaseStructure(normalized, structure);
            this.parseFields(normalized, structure);
            this.parseClauses(normalized, structure);
            this.parseModifiers(normalized, structure);

            return structure;
        } catch (error) {
            throw new Error(`SOQL解析失败: ${error.message}`);
        }
    }

    normalizeQuery(query) {
        return query
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    parseBaseStructure(query, structure) {
        const baseMatch = query.match(this.patterns.base);
        if (!baseMatch) {
            throw new Error('无效的SOQL结构：必须包含 SELECT ... FROM ...');
        }
        
        structure.from = baseMatch[2];
    }

    parseFields(query, structure) {
        const baseMatch = query.match(this.patterns.base);
        if (!baseMatch) return;

        const fieldSection = baseMatch[1];
        
        // 先提取 TYPEOF 表达式
        const typeOfMatches = [...fieldSection.matchAll(this.patterns.fields.typeOf)];
        let remainingFieldSection = fieldSection;
        
        typeOfMatches.forEach(match => {
            const fullMatch = match[0];
            const field = match[1];
            const conditions = match[2];
            
            remainingFieldSection = remainingFieldSection.replace(fullMatch, '');
            
            structure.fields.push({
                type: 'typeOf',
                field: field,
                conditions: this.parseTypeOfConditions(conditions),
                original: fullMatch
            });
        });

        // 提取子查询
        const subqueryMatches = [...remainingFieldSection.matchAll(this.patterns.fields.subquery)];
        subqueryMatches.forEach(match => {
            const fullMatch = match[0];
            const subqueryFields = match[1];
            const subqueryFrom = match[2];
            const subqueryRest = match[3];
            
            remainingFieldSection = remainingFieldSection.replace(fullMatch, '');
            
            // 递归解析子查询
            const subqueryStructure = this.parse(`SELECT ${subqueryFields} FROM ${subqueryFrom}${subqueryRest}`);
            
            structure.fields.push({
                type: 'subquery',
                relationship: subqueryFrom,
                query: subqueryStructure,
                original: fullMatch
            });
        });

        // 提取简单字段
        const simpleFields = [...remainingFieldSection.matchAll(this.patterns.fields.simple)];
        simpleFields.forEach(match => {
            const field = match[1].trim();
            if (field && !field.includes('TYPEOF') && !field.includes('SELECT')) {
                structure.fields.push({
                    type: 'simple',
                    name: field
                });
            }
        });
    }

    parseTypeOfConditions(conditions) {
        const whenPattern = /WHEN\s+(\w+)\s+THEN\s+([^WHEN]+?(?=WHEN|ELSE|$))/gi;
        const elsePattern = /ELSE\s+([^END]+)/i;
        
        const result = {
            when: [],
            else: null
        };

        let whenMatch;
        while ((whenMatch = whenPattern.exec(conditions)) !== null) {
            result.when.push({
                type: whenMatch[1],
                fields: whenMatch[2].split(',').map(f => f.trim()).filter(f => f)
            });
        }

        const elseMatch = conditions.match(elsePattern);
        if (elseMatch) {
            result.else = elseMatch[1].split(',').map(f => f.trim()).filter(f => f);
        }

        return result;
    }

    

    parseClauses(query, structure) {
        // WHERE 子句
        // WHERE 子句 - 使用细化的解析器
        const whereMatch = query.match(this.patterns.where);
        if (whereMatch) {
            const whereParser = new SOQLWhereParser();
            structure.where = whereParser.parse(whereMatch[1].trim());
        }

        // WITH DATA CATEGORY - 使用细化的解析器
        const withMatch = query.match(this.patterns.withDataCategory);
        if (withMatch) {
            const withParser = new SOQLWithDataCategoryParser();
            structure.withDataCategory = withParser.parse(withMatch[1].trim());
        }

         // 方法1：使用分步解析，先提取主查询框架
        this.parseWhereClauseStepByStep(normalizedQuery, structure);
        
        // 方法2：使用更安全的方式解析其他子句
        this.parseOtherClausesSafely(normalizedQuery, structure);

        // GROUP BY
        const groupByMatch = query.match(this.patterns.groupBy);
        if (groupByMatch) {
            structure.groupBy = groupByMatch[1].split(',').map(f => f.trim());
        }

        // HAVING
        const havingMatch = query.match(this.patterns.having);
        if (havingMatch) {
            structure.having = havingMatch[1].trim();
        }

        // ORDER BY
        const orderByMatch = query.match(this.patterns.orderBy);
        if (orderByMatch) {
            structure.orderBy = orderByMatch[1].split(',').map(item => {
                const orderItem = item.trim();
                const ascDescMatch = orderItem.match(/(.+?)(?:\s+(ASC|DESC))?(?:\s+NULLS\s+(FIRST|LAST))?$/i);
                
                return {
                    field: ascDescMatch[1].trim(),
                    direction: (ascDescMatch[2] || 'ASC').toUpperCase(),
                    nulls: (ascDescMatch[3] || 'FIRST').toUpperCase()
                };
            });
        }

        // LIMIT & OFFSET
        const limitMatch = query.match(this.patterns.limit);
        if (limitMatch) {
            structure.limit = parseInt(limitMatch[1]);
        }

        const offsetMatch = query.match(this.patterns.offset);
        if (offsetMatch) {
            structure.offset = parseInt(offsetMatch[1]);
        }

        // USING SCOPE
        const usingScopeMatch = query.match(this.patterns.usingScope);
        if (usingScopeMatch) {
            structure.usingScope = usingScopeMatch[1];
        }
    }

    /**
     * 分步解析 WHERE 子句，避免匹配子查询中的 WHERE
     */
    parseWhereClauseStepByStep(query, structure) {
        // 1. 先找到 FROM 之后的位置
        const fromMatch = query.match(/FROM\s+(\w+)\s*/i);
        if (!fromMatch) return;

        const afterFromIndex = fromMatch.index + fromMatch[0].length;
        const afterFrom = query.substring(afterFromIndex);
        
        // 2. 在 FROM 之后查找 WHERE
        const whereMatch = afterFrom.match(/^\s*WHERE\s+([\s\S]*?)(?=\s+(?:WITH|GROUP BY|ORDER BY|LIMIT|OFFSET|FOR|UPDATE)|$)/i);
        
        if (whereMatch) {
            let whereContent = whereMatch[1];
            
            // 3. 截断：如果遇到下一个主要子句，就停止
            const nextClauseMatch = whereContent.match(/\s+(WITH|GROUP BY|ORDER BY|LIMIT|OFFSET|FOR|UPDATE)\b/i);
            if (nextClauseMatch) {
                whereContent = whereContent.substring(0, nextClauseMatch.index);
            }
            
            // 4. 使用 WHERE 解析器解析
            structure.where = this.whereParser.parse(whereContent.trim());
        }
    }

    /**
     * 安全解析其他子句
     */
    parseOtherClausesSafely(query, structure) {
        // 先移除已经解析的 WHERE 部分
        let queryWithoutWhere = query;
        if (structure.where) {
            const whereBuilder = new SOQLWhereBuilder();
            const whereString = whereBuilder.build(structure.where);
            if (whereString) {
                // 创建正则表达式来匹配和移除 WHERE 部分
                const wherePattern = new RegExp(`WHERE\\s+${this.escapeRegExp(whereString)}`, 'i');
                queryWithoutWhere = query.replace(wherePattern, '');
            }
        }

        // 然后在清理后的查询中解析其他子句
        this.parseWithDataCategory(queryWithoutWhere, structure);
        this.parseGroupByHaving(queryWithoutWhere, structure);
        this.parseOrderBy(queryWithoutWhere, structure);
        this.parseLimitOffset(queryWithoutWhere, structure);
        this.parseModifiers(queryWithoutWhere, structure);
    }

    /**
     * 转义正则表达式特殊字符
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 替代方案：使用更精确的查询分割
     */
    parseQuerySections(query) {
        const sections = {
            select: '',
            from: '',
            where: '',
            rest: ''
        };

        // 1. 提取 SELECT 部分
        const selectMatch = query.match(/^SELECT\s+([\s\S]+?)\s+FROM/i);
        if (selectMatch) {
            sections.select = selectMatch[1];
        }

        // 2. 提取 FROM 部分
        const fromMatch = query.match(/FROM\s+(\w+)\s*/i);
        if (fromMatch) {
            sections.from = fromMatch[1];
            const afterFrom = query.substring(fromMatch.index + fromMatch[0].length);
            
            // 3. 提取 WHERE 部分（只在 FROM 之后）
            const whereMatch = afterFrom.match(/^\s*WHERE\s+([\s\S]*?)(?=\s+(?:WITH|GROUP BY|ORDER BY|LIMIT|OFFSET|FOR|UPDATE)|$)/i);
            if (whereMatch) {
                sections.where = whereMatch[1].trim();
                sections.rest = afterFrom.substring(whereMatch.index + whereMatch[0].length).trim();
            } else {
                sections.rest = afterFrom.trim();
            }
        }

        return sections;
    }

    parseModifiers(query, structure) {
        Object.entries(this.patterns.modifiers).forEach(([modifier, pattern]) => {
            if (pattern.test(query)) {
                structure.modifiers.push(modifier);
            }
        });
    }
}

class SOQLBuilder {
    constructor() {
        this.parser = new SOQLParser();
    }

    build(structure, options = {}) {
        const {
            format = true,
            indentSize = 2,
            maxLineLength = 80
        } = options;

        let soql = this.buildSOQL(structure);
        
        if (format) {
            soql = this.formatSOQL(soql, indentSize, maxLineLength);
        }

        return soql;
    }

    buildSOQL(structure) {
        const parts = [];

        // SELECT 部分
        parts.push('SELECT');
        parts.push(this.buildFields(structure.fields));

        // FROM 部分
        parts.push('FROM');
        parts.push(structure.from);

        // WHERE 子句 - 使用细化的构建器
        if (structure.where) {
            parts.push('WHERE');
            const whereBuilder = new SOQLWhereBuilder();
            parts.push(whereBuilder.build(structure.where));
        }

        // WITH DATA CATEGORY - 使用细化的构建器
        if (structure.withDataCategory) {
            parts.push('WITH DATA CATEGORY');
            const withBuilder = new SOQLWithDataCategoryBuilder();
            parts.push(withBuilder.build(structure.withDataCategory));
        }

        // GROUP BY
        if (structure.groupBy) {
            parts.push('GROUP BY');
            parts.push(structure.groupBy.join(', '));
        }

        // HAVING
        if (structure.having) {
            parts.push('HAVING');
            parts.push(structure.having);
        }

        // ORDER BY
        if (structure.orderBy && structure.orderBy.length > 0) {
            parts.push('ORDER BY');
            parts.push(this.buildOrderBy(structure.orderBy));
        }

        // LIMIT & OFFSET
        if (structure.limit !== null) {
            parts.push(`LIMIT ${structure.limit}`);
        }

        if (structure.offset !== null) {
            parts.push(`OFFSET ${structure.offset}`);
        }

        // USING SCOPE
        if (structure.usingScope) {
            parts.push(`USING SCOPE ${structure.usingScope}`);
        }

        // 修饰符
        if (structure.modifiers.length > 0) {
            parts.push(...this.buildModifiers(structure.modifiers));
        }

        return parts.join(' ');
    }

    buildFields(fields) {
        return fields.map(field => {
            switch (field.type) {
                case 'simple':
                    return field.name;
                
                case 'subquery':
                    return `(${this.buildSOQL(field.query)})`;
                
                case 'typeOf':
                    return this.buildTypeOf(field);
                
                default:
                    return field.original || field.name;
            }
        }).join(', ');
    }

    buildTypeOf(field) {
        const parts = [`TYPEOF ${field.field}`];
        
        field.conditions.when.forEach(condition => {
            parts.push(`WHEN ${condition.type} THEN ${condition.fields.join(', ')}`);
        });
        
        if (field.conditions.else) {
            parts.push(`ELSE ${field.conditions.else.join(', ')}`);
        }
        
        parts.push('END');
        return parts.join(' ');
    }

    buildOrderBy(orderByItems) {
        return orderByItems.map(item => {
            let result = item.field;
            if (item.direction && item.direction !== 'ASC') {
                result += ` ${item.direction}`;
            }
            if (item.nulls && item.nulls !== 'FIRST') {
                result += ` NULLS ${item.nulls}`;
            }
            return result;
        }).join(', ');
    }

    buildModifiers(modifiers) {
        return modifiers.map(modifier => {
            switch (modifier) {
                case 'forView': return 'FOR VIEW';
                case 'forReference': return 'FOR REFERENCE';
                case 'updateTracking': return 'UPDATE TRACKING';
                case 'updateViewstat': return 'UPDATE VIEWSTAT';
                case 'forUpdate': return 'FOR UPDATE';
                default: return modifier.toUpperCase();
            }
        });
    }

    formatSOQL(soql, indentSize = 2, maxLineLength = 80) {
        const indent = ' '.repeat(indentSize);
        const lines = [];
        let currentLine = '';
        let currentIndent = 0;
        
        const keywords = ['SELECT', 'FROM', 'WHERE', 'WITH', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'USING SCOPE'];
        const parts = soql.split(' ');
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // 检查是否是关键字，需要换行
            const upperPart = part.toUpperCase();
            if (keywords.includes(upperPart) && currentLine.trim()) {
                if (currentLine.trim()) {
                    lines.push(indent.repeat(currentIndent) + currentLine.trim());
                }
                
                currentLine = '';
                
                // 调整缩进
                if (upperPart === 'SELECT') {
                    currentIndent = 0;
                } else if (upperPart === 'FROM') {
                    currentIndent = 0;
                } else {
                    currentIndent = 1;
                }
            }
            
            // 处理子查询和 TYPEOF 的缩进
            if (part.includes('(') && !part.includes(')')) {
                if (currentLine.trim()) {
                    lines.push(indent.repeat(currentIndent) + currentLine.trim());
                }
                currentIndent++;
                currentLine = part + ' ';
            } else if (part.includes(')') && !part.includes('(')) {
                currentLine += part + ' ';
                lines.push(indent.repeat(currentIndent) + currentLine.trim());
                currentIndent = Math.max(0, currentIndent - 1);
                currentLine = '';
            } else {
                // 检查行长度
                if ((currentLine + part).length > maxLineLength && currentLine.trim()) {
                    lines.push(indent.repeat(currentIndent) + currentLine.trim());
                    currentLine = indent.repeat(currentIndent + 1) + part + ' ';
                } else {
                    currentLine += part + ' ';
                }
            }
        }
        
        // 添加最后一行
        if (currentLine.trim()) {
            lines.push(indent.repeat(currentIndent) + currentLine.trim());
        }
        
        return lines.join('\n');
    }

    // 便捷方法：解析后重新构建（用于格式化）
    format(soql, options = {}) {
        const structure = this.parser.parse(soql);
        return this.build(structure, options);
    }

    static test(){
        
        // 使用示例
        const complexSOQL = `
        SELECT 
            Id, Name, Type, Industry, AnnualRevenue, Owner.Name, Owner.Manager.Name,
            (SELECT Id, Name, StageName, Amount, CloseDate, Owner.Name FROM Opportunities WHERE IsClosed = false AND Amount > 100000 ORDER BY Amount DESC LIMIT 10),
            (SELECT Id, FirstName, LastName, Email, Phone, Title FROM Contacts WHERE Email != null ORDER BY LastName, FirstName),
            TYPEOF Owner 
                WHEN User THEN Name, Email, Title, Department, Manager.Name 
                WHEN Group THEN Name, Email, Type, Related.Name 
                ELSE Name, Type 
            END,
            BillingAddress, ShippingAddress, Website, Description, NumberOfEmployees
        FROM Account
        WHERE 
            (Industry IN ('Technology', 'Banking', 'Healthcare') 
            OR (Type = 'Customer - Direct' AND AnnualRevenue > 5000000))
            AND Name LIKE 'Acme%'
            AND Id IN (SELECT AccountId FROM Opportunity WHERE StageName = 'Closed Won' AND CloseDate = THIS_YEAR)
            AND CreatedDate = LAST_N_DAYS:365
            AND (NumberOfEmployees > 100 OR AnnualRevenue > 10000000)
        WITH DATA CATEGORY Geography__c BELOW country__c AND Product__c AT software__c
        GROUP BY Type, Industry, BillingCountry
        HAVING COUNT(Id) > 5 AND SUM(AnnualRevenue) > 10000000
        ORDER BY AnnualRevenue DESC NULLS LAST, Name ASC NULLS FIRST, CreatedDate DESC
        LIMIT 100
        OFFSET 0
        FOR VIEW
        UPDATE TRACKING
        `;

        // 使用示例
        const builder = new SOQLBuilder();

        try {
            console.log('=== 原始 SOQL ===');
            console.log(complexSOQL);
            
            console.log('\n=== 解析结果 ===');
            const structure = builder.parser.parse(complexSOQL);
            console.log(JSON.stringify(structure, null, 2));
            
            console.log('\n=== 重新构建的 SOQL ===');
            const rebuilt = builder.build(structure, { format: true });
            console.log(rebuilt);
            
            console.log('\n=== 格式化现有 SOQL ===');
            const formatted = builder.format(complexSOQL, { 
                format: true, 
                indentSize: 2,
                maxLineLength: 80 
            });
            console.log(formatted);
            
        } catch (error) {
            console.error('错误:', error.message);
        }


        // 使用工具类创建查询
        const template = SOQLUtils.createQueryTemplate();
        SOQLUtils.addField(template, 'Industry');
        SOQLUtils.addField(template, 'AnnualRevenue');
        SOQLUtils.addOrderBy(template, 'AnnualRevenue', 'DESC', 'LAST');

        template.where = "Industry = 'Technology'";
        template.limit = 50;

        const customQuery = builder.build(template, { format: true });
        console.log('\n=== 自定义构建的 SOQL ===');
        console.log(customQuery);
    }
}


// 额外的工具方法
class SOQLUtils {
    static createQueryTemplate() {
        return {
            fields: [
                { type: 'simple', name: 'Id' },
                { type: 'simple', name: 'Name' }
            ],
            from: 'Account',
            where: null,
            withDataCategory: null,
            groupBy: null,
            having: null,
            orderBy: [],
            limit: null,
            offset: null,
            usingScope: null,
            modifiers: []
        };
    }
    
    static addField(structure, field) {
        if (typeof field === 'string') {
            structure.fields.push({ type: 'simple', name: field });
        } else {
            structure.fields.push(field);
        }
    }
    
    static addOrderBy(structure, field, direction = 'ASC', nulls = 'FIRST') {
        structure.orderBy.push({ field, direction, nulls });
    }
}

class SOQLWhereParser {
    constructor() {
        this.patterns = {
            // 基础条件模式
            condition: /(\w+(?:\.\w+)*)\s*([=!<>]+|IN|NOT IN|LIKE|INCLUDES|EXCLUDES)\s*(.+?)(?=\s+(?:AND|OR|$))/gi,
            
            // 子查询条件
            subqueryCondition: /(\w+(?:\.\w+)*)\s+(IN|NOT IN)\s*\(\s*SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)([\s\S]*?)\)/gi,
            
            // 函数条件
            functionCondition: /(COUNT|SUM|AVG|MIN|MAX)\(([^)]+)\)\s*([=!<>]+)\s*(\d+)/gi,
            
            // 日期字面量
            dateLiteral: /(TODAY|YESTERDAY|TOMORROW|LAST_WEEK|THIS_WEEK|NEXT_WEEK|LAST_MONTH|THIS_MONTH|NEXT_MONTH|LAST_90_DAYS|NEXT_90_DAYS|LAST_N_DAYS:\d+|NEXT_N_DAYS:\d+)/gi,
            
            // 逻辑运算符
            logicalOperators: /(AND|OR)/gi
        };
    }

    parse(whereClause) {
        if (!whereClause) return null;
        
        const conditions = {
            type: 'conditionGroup',
            operator: 'AND', // 默认运算符
            conditions: []
        };

        let remainingClause = whereClause.trim();
        
        // 解析括号分组
        remainingClause = this.parseParentheses(remainingClause, conditions);
        
        // 解析子查询条件
        remainingClause = this.parseSubqueryConditions(remainingClause, conditions);
        
        // 解析函数条件
        remainingClause = this.parseFunctionConditions(remainingClause, conditions);
        
        // 解析基础条件
        this.parseBasicConditions(remainingClause, conditions);
        
        return conditions.conditions.length === 1 ? conditions.conditions[0] : conditions;
    }

    parseParentheses(clause, parentGroup) {
        const parenPattern = /\(([^()]+|\([^()]*\))*\)/g;
        let match;
        let lastIndex = 0;
        let result = '';

        while ((match = parenPattern.exec(clause)) !== null) {
            // 添加括号前的内容
            const beforeParen = clause.substring(lastIndex, match.index).trim();
            if (beforeParen) {
                result += beforeParen + ' ';
            }

            // 解析括号内容
            const innerContent = match[1].trim();
            const innerGroup = {
                type: 'conditionGroup',
                operator: this.detectOperator(beforeParen),
                conditions: []
            };

            this.parseBasicConditions(innerContent, innerGroup);
            parentGroup.conditions.push(innerGroup);

            lastIndex = match.index + match[0].length;
            result += ' __PAREN_PLACEHOLDER__ ';
        }

        // 添加剩余内容
        const remaining = clause.substring(lastIndex).trim();
        if (remaining) {
            result += remaining;
        }

        return result.trim();
    }

    parseSubqueryConditions(clause, parentGroup) {
        let remainingClause = clause;
        const matches = [...clause.matchAll(this.patterns.subqueryCondition)];

        matches.forEach(match => {
            const [fullMatch, field, operator, subqueryFields, subqueryFrom, subqueryRest] = match;
            
            parentGroup.conditions.push({
                type: 'subqueryCondition',
                field: field,
                operator: operator,
                subquery: {
                    fields: subqueryFields.split(',').map(f => f.trim()),
                    from: subqueryFrom,
                    where: subqueryRest.trim() ? this.parse(subqueryRest.trim()) : null
                }
            });

            remainingClause = remainingClause.replace(fullMatch, '');
        });

        return remainingClause;
    }

    parseFunctionConditions(clause, parentGroup) {
        let remainingClause = clause;
        const matches = [...clause.matchAll(this.patterns.functionCondition)];

        matches.forEach(match => {
            const [fullMatch, func, field, operator, value] = match;
            
            parentGroup.conditions.push({
                type: 'functionCondition',
                function: func,
                field: field,
                operator: operator,
                value: parseInt(value)
            });

            remainingClause = remainingClause.replace(fullMatch, '');
        });

        return remainingClause;
    }

    parseBasicConditions(clause, parentGroup) {
        const matches = [...clause.matchAll(this.patterns.condition)];
        let lastIndex = 0;

        matches.forEach((match, index) => {
            const [fullMatch, field, operator, value] = match;
            
            // 检查前面的逻辑运算符
            const beforeMatch = clause.substring(lastIndex, match.index).trim();
            const logicalOp = this.extractLogicalOperator(beforeMatch);

            const condition = {
                type: 'basicCondition',
                field: field,
                operator: operator,
                value: this.parseValue(value.trim())
            };

            if (logicalOp && index > 0) {
                parentGroup.conditions.push({ type: 'logicalOperator', operator: logicalOp });
            }

            parentGroup.conditions.push(condition);
            lastIndex = match.index + fullMatch.length;
        });
    }

    parseValue(value) {
        // 字符串值
        const stringMatch = value.match(/'([^']*)'/);
        if (stringMatch) {
            return { type: 'string', value: stringMatch[1] };
        }

        // 数字值
        const numberMatch = value.match(/^(\d+(?:\.\d+)?)$/);
        if (numberMatch) {
            return { type: 'number', value: parseFloat(numberMatch[1]) };
        }

        // 布尔值
        const booleanMatch = value.match(/^(true|false)$/i);
        if (booleanMatch) {
            return { type: 'boolean', value: booleanMatch[1].toLowerCase() === 'true' };
        }

        // NULL
        if (value.toUpperCase() === 'NULL') {
            return { type: 'null', value: null };
        }

        // 日期字面量
        const dateMatch = value.match(this.patterns.dateLiteral);
        if (dateMatch) {
            return { type: 'dateLiteral', value: dateMatch[0] };
        }

        // 列表值
        if (value.includes(',')) {
            const listItems = value.split(',').map(item => this.parseValue(item.trim()));
            return { type: 'list', values: listItems };
        }

        // 字段引用
        return { type: 'field', value: value };
    }

    detectOperator(text) {
        return text.toUpperCase().endsWith('OR') ? 'OR' : 'AND';
    }

    extractLogicalOperator(text) {
        const opMatch = text.match(/(AND|OR)$/i);
        return opMatch ? opMatch[1].toUpperCase() : null;
    }
}

class SOQLWithDataCategoryParser {
    constructor() {
        this.patterns = {
            // 数据类别条件
            dataCategory: /(\w+__c)\s+(ABOVE|BELOW|AT|ABOVE_OR_BELOW)\s*\(([^)]+)\)/gi,
            
            // 逻辑运算符
            logicalOperator: /\s+(AND|OR)\s+/gi
        };
    }

    parse(withClause) {
        if (!withClause) return null;

        const categories = {
            type: 'dataCategoryGroup',
            operator: 'AND',
            conditions: []
        };

        let remainingClause = withClause.trim();
        
        // 解析逻辑运算符
        const operatorMatch = remainingClause.match(this.patterns.logicalOperator);
        if (operatorMatch) {
            categories.operator = operatorMatch[1].toUpperCase();
            remainingClause = remainingClause.replace(this.patterns.logicalOperator, ' ');
        }

        // 解析数据类别条件
        const matches = [...remainingClause.matchAll(this.patterns.dataCategory)];
        
        matches.forEach(match => {
            const [fullMatch, category, operator, values] = match;
            
            categories.conditions.push({
                category: category,
                operator: operator,
                values: values.split(',').map(v => v.trim())
            });
        });

        return categories;
    }
}

class SOQLWhereBuilder {
    build(condition) {
        if (!condition) return '';
        
        switch (condition.type) {
            case 'conditionGroup':
                return this.buildConditionGroup(condition);
                
            case 'basicCondition':
                return this.buildBasicCondition(condition);
                
            case 'subqueryCondition':
                return this.buildSubqueryCondition(condition);
                
            case 'functionCondition':
                return this.buildFunctionCondition(condition);
                
            case 'logicalOperator':
                return condition.operator;
                
            default:
                return '';
        }
    }

    buildConditionGroup(group) {
        if (group.conditions.length === 0) return '';
        
        const parts = [];
        
        group.conditions.forEach((condition, index) => {
            const conditionStr = this.build(condition);
            if (conditionStr) {
                if (index > 0 && condition.type !== 'logicalOperator') {
                    parts.push(group.operator);
                }
                parts.push(conditionStr);
            }
        });

        const result = parts.join(' ');
        return group.conditions.length > 1 ? `(${result})` : result;
    }

    buildBasicCondition(condition) {
        const valueStr = this.buildValue(condition.value);
        return `${condition.field} ${condition.operator} ${valueStr}`;
    }

    buildSubqueryCondition(condition) {
        const subquery = condition.subquery;
        let subqueryStr = `SELECT ${subquery.fields.join(', ')} FROM ${subquery.from}`;
        
        if (subquery.where) {
            const whereStr = this.build(subquery.where);
            if (whereStr) {
                subqueryStr += ` WHERE ${whereStr}`;
            }
        }
        
        return `${condition.field} ${condition.operator} (${subqueryStr})`;
    }

    buildFunctionCondition(condition) {
        return `${condition.function}(${condition.field}) ${condition.operator} ${condition.value}`;
    }

    buildValue(value) {
        switch (value.type) {
            case 'string':
                return `'${value.value}'`;
            case 'number':
                return value.value.toString();
            case 'boolean':
                return value.value.toString().toUpperCase();
            case 'null':
                return 'NULL';
            case 'dateLiteral':
                return value.value;
            case 'list':
                return `(${value.values.map(v => this.buildValue(v)).join(', ')})`;
            case 'field':
                return value.value;
            default:
                return value.value;
        }
    }
}

class SOQLWithDataCategoryBuilder {
    build(dataCategory) {
        if (!dataCategory) return '';
        
        const conditions = dataCategory.conditions.map(condition => {
            const values = condition.values.join(', ');
            return `${condition.category} ${condition.operator} (${values})`;
        });

        return conditions.join(` ${dataCategory.operator} `);
    }
}