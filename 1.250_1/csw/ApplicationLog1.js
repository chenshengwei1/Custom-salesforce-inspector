
import {Tools} from "./Tools.js";

export class ApplicationLog{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.allRecords = [];
        this.sobjectname='Report';
        this.message='';
        this.keywords = [];
        this.starting = false;
        this.lazy =true;
        this.processingQty = 0;
    }
    render(){
        this.records = this.records.filter(e=>{
            return e.match;
        })
        this.keyRe = new RegExp('('+(this.keywords[0] || '[\w\d]+')+')', 'igm');
        this.timeRe =  /(\"CreatedDate\"\s*\:[\&nbsp;]*\"[\d]+\-\d+\-\d+T\d+:\d+:\d+\.\d+\+\d+\")/img;
        return `
            <div>${this.message || ''}</div>
            <div>${(this.records||[]).map((e, index)=>this.adapterContainer(e, index)).join('')}</div>`
    }
    adapter(record){
        let str = this.toHtmlString(record);
        str = this.adapterKey(str);
        str = this.adapterTime(str);
        return str;
    }

    adapterContainer(record, index){
        record.rownumber = index + 1;
        return `<div class="area" index="${index}">` + this.adapter(record) + '</div>'
    }

    adapterKey(str){
        return str.replaceAll(this.keyRe,'<span style="background-color: #0b0000;color: white;">$1</span>')
    }

    adapterTime(str){
        return str.replaceAll(this.timeRe,'<span style="background-color: #efa7a7;color: #0b202e;">$1</span>')
    }


    toHtmlString(record){
        return JSON.stringify(record, null,'\t').replaceAll('\\"','"').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll(' ','&nbsp;').replaceAll('\\r','&nbsp;').replaceAll('\n','<br/>').replaceAll('\\n','<br/>');
    }

    async doUpdaate(soql){
        $('#applog-showallsobjectdata .totalrecordnumber').text(this.totalSize||0);
        let htmlId = 'applog-showallsobjectdatatable';
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
        let htmlId = 'applog-showallsobjectdatatable';
        let rootdata = document.getElementById(htmlId);
        try{
            rootdata.innerHTML=this.render();
        }
        catch(e){
            rootdata.innerHTML=JSON.stringify(e.stack);
            this.showMessage(JSON.stringify(e.stack), 'error')
        }

        $('#applog-showallsobjectdatatable .totalrecordnumber').text(`${this.totalSize||0} - Current Records: ${this.records.length}`);
    }

    lazyNext(lastResuslt){
        this.processingQty  += lastResuslt.records.length;
        lastResuslt.allRecords = [];
        this.lazyUpdate(lastResuslt);
        this.tree.loadNextRecords(lastResuslt, false).then(result=>{
            if (this.starting && result.nextRecordsUrl){
                this.lazyNext(result);
            }
            else{
                this.starting = false;
                if (lastResuslt  == result){
                    this.processingQty  += result.records.length;
                    this.lazyUpdate(result);
                }
                $('#applog-btn-stop').attr('disabled', '');
                this.loading(false);
            }
        });
    }

    lazyUpdate(result){
        let newRecords = result.records || [];
        newRecords.forEach(e=>{
            if (this.keywords.length){
                for (let key of this.keywords){
                    if (e.Message__c && e.Message__c.toLocaleLowerCase().indexOf(key) != -1){
                        e.match = true;
                        this.records.push(e);
                        return;
                    }
                }
                e.match = false;
                return;
            }else{
                e.match = true;
                this.records.push(e);
                return;
            }
        })


        
        let matchRecords = newRecords.filter(e => e.match);
        if (this.records.length == 0){
            this.message = 'No data'
        }
        this.lazyUpdateNotLoad(matchRecords);
        //this.totalReocrds(this.totalSize);
    }

    lazyUpdateNotLoad(newRecords){
        let before = $('#applog-showallsobjectdatatable .area').length;
        if (before == 0){
            let htmlId = 'applog-showallsobjectdatatable';
            let rootdata = document.getElementById(htmlId);
            try{
                rootdata.innerHTML=this.render();
            }
            catch(e){
                rootdata.innerHTML=JSON.stringify(e.stack);
                this.showMessage(JSON.stringify(e.stack), 'error')
            }
        }else{
            $(`#applog-showallsobjectdatatable [index="${before-1}"].area`).after(this.lazyRender(newRecords, before));
        }


        $('.applog-searchresult .recordsnumber').text($('#applog-showallsobjectdatatable .area').length);
        $('.applog-searchresult .totalrecordnumber').text(`${this.totalSize||0} - Current Records: ${this.processingQty}`);
        
    }

    lazyRender(newRecords, nextIndex){

        newRecords = newRecords.filter(e=>{
            return e.match;
        })
        return `${(newRecords||[]).map((e, index)=>this.adapterContainer(e, index + nextIndex)).join('')}`
    
    }

    loading(isLoading){
        if (isLoading){
            $('#applog-loading').show();
        }else{
            $('#applog-loading').hide();
        }
    }


    async loadData(soql){

        let result = await this.tree.getRecordsBySoql(soql);

        
        this.totalSize = result.totalSize;
        this.message = result.title;
        this.records = [];
        
        this.lastResult = result.data;
        this.starting = true;
        $('#applog-btn-stop').removeAttr('disabled');
        this.loading(true);

        this.processingQty = 0;
        if(this.lazy){
            this.processingQty  = 0;
            return this.lazyNext(this.lastResult);
        }
        
        while(this.lastResult.nextRecordsUrl && this.starting){
            let result = await this.tree.loadNextRecords(this.lastResult, false);
            this.lastResult = result;
        }

        this.starting = false;
        $('#applog-btn-stop').attr('disabled', '')
        this.records.push(...this.lastResult.allRecords);
        this.records = this.records.filter(e=>{
            if (this.keywords.length){
                for (let key of this.keywords){
                    if (e.Message__c.toLocaleLowerCase().indexOf(key) != -1){
                        return true;
                    }
                }
                return false;
            }else{
                return true;
            }
        })


        if (this.records.length == 0){
            this.message = 'No data'
        }
        this.totalReocrds(this.totalSize);
    }

    createHead(){
        let treeroot = document.getElementById('applicationLoginfo');
        let searchAear = `
        <p>
            Order Id Search:
            <input class="search feedback-input" id="applog-orderid-input" type="input"  autocomplete="off"></input>
            
            <div class="btn-container">	
                <div class="btn" id="applog-refreshSObjectSoql">
                    <span>SOQL</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="applog-refreshSObjectSearch">
                    <span>Query</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="applog-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span>of<span class="totalrecordnumber">0</span></div>
            <div class="totalbar" id="applog-notificationmessage"></div>

            <div class="applog-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="applog-btn-reset">Reset</li>
                    <li id="applog-btn-format" class="js-is-active">Format</li>
                    <li id="applog-btn-stop">Stop</li>
                </ul>
                <br/>
                <div class="loader" id="applog-loading"></div>
                <textarea contenteditable="true" name="" id="applog-soql" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                
                <textarea id="applog-reporttableid" style="font-size: large;"  class="feedback-text feedback-input"></textarea>
            </div>
            <div class="applog-view-result tabitem Result">
                <div id="applog-showallsobjectdatatable"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    totalReocrds(qty){
        $('.applog-searchresult .totalrecordnumber').text(qty);
    }


    initObjectAllDataHead(){
        this.loading(false);

        // tab switch
        var listItem = $('#menu-selector > li');
        
        $(listItem).click(function() {
            $(listItem).removeClass('js-is-active');
            $(this).toggleClass('js-is-active');
        });

        // button click
        $('#applog-btn-format').on('click', (event)=>{
            let soql = $('#applog-soql').val();
            $('#applog-soql').val(this.formatSQL(soql));
        })

        $('#applog-btn-stop').on('click', (event)=>{
            this.starting = false;
        })

        $('#applog-btn-reset').on('click', (event)=>{
            this.fieldCondition = {};
            this.showMessage('generate SQL...', 'loading');
             $('#applog-soql').val(this.generateSQL());
             this.showMessage('');
        })


        $('#applog-soql').val(this.generateSQL());

        $('#applog-refreshSObjectSearch').on('click', (event)=>{
            this.totalReocrds(this.totalSize);
        })


        $('#applog-refreshSObjectSearch').on('click', (event)=>{
            let soql = $('#applog-soql').val();
            localStorage.setItem('applog-soql', soql);
            this.doUpdaate(soql);
        })


        $('#applog-orderid-input').on('change', (event)=>{
            let recordId = $('#applog-orderid-input').val();
            localStorage.setItem('applog-orderid-input', recordId);
            this.searchId(recordId)
            if (this.keywords?.length){
                this.keywords[0] = recordId.toLocaleLowerCase();
            }else{
                this.keywords = [recordId.toLocaleLowerCase()];
            }
        })

        $('#applog-reporttableid').on('change', (event)=>{
            let allrecordId = $('#applog-reporttableid').val();
            let ids = allrecordId.split('\n');
            this.keywords.length = 1;
            let j = 1;
            for (let i = 0 ;i<ids.length;i++){
                if (ids[i]){
                    this.keywords[j++] = ids[i].toLocaleLowerCase();
                }
            }
        })

        

        this.showMessage('list Reports...', 'loading');
        let orderid = localStorage.getItem('applog-orderid-input');
        $('#applog-orderid-input').val(orderid);
        if (this.keywords?.length){
            this.keywords[0] = orderid.toLocaleLowerCase();
        }else{
            this.keywords = [orderid.toLocaleLowerCase()];
        }

        let soql = localStorage.getItem('applog-soql');
        $('#applog-soql').val(soql);

      }

      showMessage(msg, type){
        $('#applog-notificationmessage').html(msg);
    }

    async searchId(recordId){
        let {objectTypes} = await this.tree.getSObjectById(recordId);
        this.objectTypes = objectTypes;
        if (this.objectTypes.length > 0){
            let result = await this.tree.getRecordsBySoql(`select Id,CreatedDate,LastModifiedDate,SystemModstamp
            from ${this.objectTypes[0]} WHERE id='${recordId}'`);
            if (result.results.length){
                let soql = $('#applog-soql').val();
                soql = soql.replace(/CreatedDate\s*>=\s*[\w\d-\:\.\+]+/,'CreatedDate >=' +result.results[0].CreatedDate);
                soql = soql.replace(/CreatedDate\s*<=\s*[\w\d-\:\.\+]+/,'CreatedDate <=' +result.results[0].LastModifiedDate);
                console.log(soql)

                $('#applog-soql').val(soql);
            }
        }

    }


       generateSQL(){
        let soqlTemplate = `select Id,CreatedDate,Message__c,Origin__c,Reference_Id__c,Reference_Information__c,Source_Function__c,Source__c,Stack_Trace__c,Timer__c,Type__c from Application_Log__c WHERE 
        CreatedDate     >=   2023-12-03T09:09:49.000+0000
        AND CreatedDate <=   2023-12-19T08:04:09.000+0000`;
       
        return soqlTemplate;
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


}
