
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
