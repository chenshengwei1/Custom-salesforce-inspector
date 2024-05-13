

export class StockBalance{

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
        this.fieldFilter = Boolean;
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(rootId);
        let searchAear = `
        <p>
            Order Id Search:
            
            <div class="btn-container">	
                <div class="btn" id="stockbalance-refreshSObjectSearch">
                    <span>Check</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="stockbalance-refreshSObjectSF">
                    <span>SF</span>
                    <div class="dot"></div>
                </div>
                <div class="btn" id="stockbalance-refreshSObjectCSTK">
                    <span>CSTK</span>
                    <div class="dot"></div>
                </div>
            </div>
            
        </p>
        <div class="stockbalance-searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="totalrecordnumber">0</span></div>
            <div class="totalbar" id="stockbalance-notificationmessage"></div>

            <div class="stockbalance-view-soql tabitem SOQL">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="stockbalance-btn-reset">Reset</li>
                    <li id="stockbalance-btn-format" class="js-is-active">Format</li>
                </ul>
                <br/>
                <div class="loader" id="stockbalance-loading"></div>
                <textarea contenteditable="true" name="" id="stockbalance-sf-data" placeholder="input your sf data" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea name="" id="stockbalance-cstk-data" placeholder="input your cstk data" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>

                <textarea name="" id="stockbalance-message" readonly style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
                
            </div>
            <div class="stockbalance-view-result tabitem Result">
                <div id="stockbalance-showallsobjectdatatable"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    totalReocrds(qty){
        $('.stockbalance-searchresult .totalrecordnumber').text(qty);

    }


    initObjectAllDataHead(){

        $('#stockbalance-refreshSObjectSearch').on('click', ()=>{
            //let sf = $('#stockbalance-sf-data').val().trim();
            //let cstk = $('#stockbalance-cstk-data').val().trim();

            this.checking();
        })

        $('#stockbalance-refreshSObjectCopy').on('click', ()=>{
            this.clear();
            this.tree.Tools.exportExcel(this.records||[], this.headers);
            this.addMessage('copy success:');
        })

        $('#stockbalance-refreshSObjectSF').on('click', ()=>{
            let sf = $('#stockbalance-sf-data').val().trim();
            let sfList= this.toSFJOSN(sf);
            this.addMessage('load salesforce success:');
            this.addMessage(' sf records:' + sfList.length);
            this.sfList = sfList;
        })

        $('#stockbalance-refreshSObjectCSTK').on('click', ()=>{
            let cstk = $('#stockbalance-cstk-data').val().trim();
            let cstkList= this.toCSTKJSON(cstk);
            this.addMessage('load cstk success:');
            this.addMessage(' cstk records:' + cstkList.length);
            this.cstkList = cstkList;
        })

        $('#stockbalance-btn-reset').on('click', ()=>{
            this.clear();
        })

        
    }

    async checking(sf, cstk){
        //this.clear();
        // let cstkList= this.toCSTKJSON(cstk);
        // this.addMessage('load cstk success:');
        // this.addMessage(' cstk records:' + cstkList.length);

        // let sfList= this.toSFJOSN(sf);
        // this.addMessage('load salesforce success:');
        // this.addMessage(' sf records:' + sfList.length);

        this.toMapping(this.cstkList, this.sfList);
        this.addMessage('end');


    }

    toMapping(cstkList, sfList){
        let cstkMap = {};
        for (let data of cstkList){
            cstkMap[data.reservationId] = data;
            data.referenceSF = [];
        }
        for (let sf of sfList){
            if (!cstkMap[sf.Stock_Res_Id__c]){
                this.addMessage('can not found ' + sf.Stock_Res_Id__c);
                continue;
            }
            cstkMap[sf.Stock_Res_Id__c].referenceSF.push(sf);
        }

        for (let data of cstkList){
            if (!data.referenceSF.length){
                console.log(`error in  ${data.reservationId}, ${datta.sourceHeahder}`);
            }
        }
    }
    
    toSFJOSN(sf){
        if (!sf){
            return;
        }
        let results = [];
        let lines = sf.split('\n');
        sf='';
        let header = lines[0].replaceAll('"','').split(/\s+/igm);
        //V10	4021211	21809	1	0	0	0	1	COM	801RC000001Gj5RYAS	V10C00000114	684627a6-1746-59be-99e7-16336b0cf305	1	21809	0	0	0
        let maxSize = lines.length;
        for (let index=1;index<maxSize;index++){
            let line  = lines[index];
            let dataList = line.split('\t');
            if (dataList.length != header.length){
                console.log(`miss fields ${header.length} - ${dataList.length} in line ${index} :${line}`);
            }else{
                let newObj = {};
                for (let i=0;i<dataList.length;i++){
                    newObj[header[i]] = dataList[i];
                }
                if (!newObj.Stock_Res_Id__c){
                    continue;
                }
                let {CreatedDate, Id, Ordered_Qty__c, Stock_Res_Id__c, Stock_Status__c, SKU__c} = newObj;
                results.push({CreatedDate, Id, Ordered_Qty__c, Stock_Res_Id__c, Stock_Status__c, SKU__c, OrderName:newObj['Order.Name']});
            }
            lines[index] = null;
        }
        return results.toSorted((a, b)=>{
            return +a.Stock_Res_Id__c -  +b.Stock_Res_Id__c;
        });
    }

    toCSTKJSON(cstk){
        let header = ['channel',  'itemCode', 'reservationId', 'required','pending', 'allocated', 'release', 'cancelled','system', 'sourceId', 'sourceHeahder', 'assetId', 'reservationId', 'resId', 'pending2', 'allocated2','release2'];
        //V10	4021211	21809	1	0	0	0	1	COM	801RC000001Gj5RYAS	V10C00000114	684627a6-1746-59be-99e7-16336b0cf305	1	21809	0	0	0
        let results = [];
        let lines = cstk.split('\n');
        let maxSize = lines.length;
        cstk = '';
        for (let index=0;index<maxSize;index++){
            let line  = lines[index];
            let dataList = line.split(/\s+/igm);
            if (dataList.length != header.length){
                console.log(`miss fields ${header.length} - ${dataList.length} in line ${index} :${line}`);
            }else{
                let newObj = {};
                for (let i=0;i<dataList.length;i++){
                    newObj[header[i]] = dataList[i];
                }
                results.push(newObj);
            }
            lines[index] = null;
        }
        return results;
    }

    
    addMessage(message){
        this.messageList.push(message);
        $('#stockbalance-message').val(this.messageList.join('\n'));
    }
    clear(){
        this.messageList = [];
        $('#stockbalance-message').val('');
    }

    lazyNext(lastResuslt){
        lastResuslt.allRecords = [];
        this.lazyUpdate(lastResuslt);
        this.addMessage('start:' + lastResuslt.nextRecordsUrl);
        this.tree.loadNextRecords(lastResuslt, false).then(result=>{
            if (this.starting && result.nextRecordsUrl){
                
                this.lazyNext(result);
            }
            else{
                this.starting = false;
                if (lastResuslt != result){
                    this.lazyUpdate(result);
                }
                this.addMessage('end total records:' + this.records.length);
            }
        });
    }

    lazyUpdate(result){
        let newRecords = result.records || [];
        this.records.push(...newRecords);
        this.addMessage('update records:' + this.records.length + ' - ' + this.totalSize );
    }

}
