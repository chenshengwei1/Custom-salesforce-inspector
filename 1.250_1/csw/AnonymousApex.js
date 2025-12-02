import {Dialog} from './Dialog.js';

export class AnonymousApex{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        this.apexLogs = {};
        
        this.lazy =true;
    }

    get starting(){
        return this._start || false;
    }

    set starting(s){
        this._start = s;
        this.totalReocrds(this.totalSize);
        if (s){
            $('#AnonymousApex-refreshSObjectSearch').addClass('loading');
        }else{
            $('#AnonymousApex-refreshSObjectSearch').removeClass('loading');
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
        
        <div class="AnonymousApex-tab-container">
            <span class="AnonymousApex-tab-item" name="add">add</span>
            <div class="mm-module-controls">
                <div role="group" class="mm-slds-button-group">
                    <button class="mm-slds-button mm-slds-button_neutral" title="New" name="new">
                    <!----> 
                        <span>New</span>
                    </button> 
                    <button class="mm-slds-button mm-slds-button_neutral" title="Save" name="save"><!----> 
                        <span>Save</span>  
                        <!---->
                    </button>
                    <button class="mm-slds-button mm-slds-button_brand" title="Execute" style="" id="AnonymousApex-execute" name="execute"><!---->
                        <span>Execute</span>  
                    </button>
                </div> 
            </div>
        </div>
        <div class="AnonymousApex-searchresult">
            <div class="AnonymousApex-view-apex tabitem">
                <ul class="ui-module-tab menu-selector" id="menu-selector">
                    <li id="AnonymousApex-btn-tab_0">Manual appointment</li>
                </ul>
                <button title="Add new tab" class="button-add mm-slds-button mm-slds-button_icon-container"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mm-slds-button__icon"><path d="M13.8 13.4h7.7c.3 0 .7-.3.7-.7v-1.4c0-.4-.4-.7-.7-.7h-7.7c-.2 0-.4-.2-.4-.4V2.5c0-.3-.3-.7-.7-.7h-1.4c-.4 
                    0-.7.4-.7.7v7.7c0 .2-.2.4-.4.4H2.5c-.3 0-.7.3-.7.7v1.4c0 .4.4.7.7.7h7.7c.2 0 .4.2.4.4v7.7c0 
                    .3.3.7.7.7h1.4c.4 0 .7-.4.7-.7v-7.7c0-.2.2-.4.4-.4z"></path></svg>
                </button>
            </div>

            <div class="AnonymousApex-view-result tabitem Result">
                <textarea contenteditable="true" name="" id="AnonymousApex-content" placeholder="input your soql here start to query" style="height: 228px;font-size: large;" class="feedback-text feedback-input"></textarea>
                <textarea readonly name="" id="AnonymousApex-message" style="height: 228px;font-size: large;" class="feedback-text feedback-input no-border"></textarea>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }

    initObjectAllDataHead(){

        $('#AnonymousApex-execute').on('click', ()=>{
            let content = $('#AnonymousApex-content').val().trim();
            this.execute(content);
        })

        $('.mm-slds-button-group').on('click',  (e)=>{
            let name = e.target.name;
            if (name == 'new'){
                Dialog.open({type: 'info', 
                    title: 'New', 
                    message: 'new', 
                    confirmText: 'confirm', 
                    cancelText: 'cancel', 
                    onConfirm: function() {
                        
                    }, 
                    onCancel: function() {}});
            }
        });

        new SalesforceDebugManager(this.tree).ensureDebuggingEnabled();
        
    }

    execute(content){
        this.tree.execute(content)
        .then(res => res)
        .then(data => {
            if (data.success){
                this.tree.getRecordsBySoql(`SELECT Id FROM ApexLog WHERE LogUserId = '${this.tree.userInfo.userId}' and Operation like '%executeAnonymous%' ORDER BY StartTime DESC LIMIT 1`)
                .then(data => {
                    this.openTab('ApexLogAnalysis', {id: data.data.records[0].Id, type: 'ApexLog'});
                    return this.tree.getApexlogByid(data.data.records[0].Id);
                })
                .then(e=>{
                    $('#AnonymousApex-message').val(e.data);
                });
            }else{
                $('#AnonymousApex-message').val(JSON.stringify(data, '\t','\t'));
            }
        });
    }

    getUserId(){
        return this.tree.userInfo.userId;
    }

    async  ensureDebugLevel(userId) {
        userId = userId || this.getUserId();

        // 1. 检查现有TraceFlag
        const existingTraceFlag = await queryTraceFlag(userId);
        
        if (existingTraceFlag) {
            // 2. 检查DebugLevel配置是否合适
            const debugLevel = await queryDebugLevel(existingTraceFlag.DebugLevelId);
            if (isDebugLevelSufficient(debugLevel)) {
                return existingTraceFlag.Id;
            } else {
                // 删除不合适的配置
                await deleteTraceFlag(existingTraceFlag.Id);
            }
        }
        
        // 3. 创建或查找合适的DebugLevel
        let debugLevelId = await findOrCreateDebugLevel();
        
        // 4. 创建TraceFlag
        return await createTraceFlag(userId, debugLevelId);
    }

    async queryTraceFlag(){
        let traceFlagSoql = `SELECT Id, DebugLevelId, StartDate, ExpirationDate, LogType, TracedEntityId  FROM TraceFlag 
WHERE TracedEntityId = '[当前用户ID]' 
OR TracedEntityId IN (SELECT Id FROM User WHERE UserName = '[当前用户名]')`;

        return this.tree.getRecordsBySoql(traceFlagSoql);
    }

    async queryDebugLevel(debugLevelId){
        let debugLevelSoql = `SELECT Id, DeveloperName, MasterLabel, ApexCode, ApexProfiling, Callout,
       Database, System, Validation, Visualforce, Workflow, Nba
FROM DebugLevel 
WHERE Id= '${debugLevelId}'`;
        return this.tree.getRecordsBySoql(debugLevelSoql);
    }
}

class SalesforceDebugManager {

    constructor(tree) {
        this.tree = tree;
    }
    async ensureDebuggingEnabled() {
        try {
            const currentUser = await this.getCurrentUser();
            currentUser.Id = currentUser.userId;
            const traceFlag = await this.setupDebugLevel(currentUser.Id);
            return {
                success: true,
                traceFlagId: traceFlag.Id,
                debugLevelId: traceFlag.DebugLevelId,
                expiration: traceFlag.ExpirationDate
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    getCurrentUser() {
        return this.tree.userInfo;
    }

    query(soql){
        return this.tree.toolQuery(soql);
    }

    createRecord(objectApiName, recordData) {
        return this.tree.createRecord(objectApiName, recordData, true);
    }

    updateRecord(objectApiName, recordId, recordData) {
        recordData.Id = recordId;
        return this.tree.updateRecord(objectApiName, recordData, true);
    }

    deleteRecord(objectApiName, recordId) {
        return this.tree.deleteRecord(objectApiName, recordId, true);
    }

    async setupDebugLevel(userId) {
        // 检查现有配置
        const existingTraceFlag = await this.query(`
            SELECT Id, DebugLevelId, ExpirationDate 
            FROM TraceFlag 
            WHERE TracedEntityId = '${userId}' and ExpirationDate > ${new Date().toISOString()}
        `);

        if (existingTraceFlag.length > 0) {
            const debugLevel = await this.getDebugLevel(existingTraceFlag[0].DebugLevelId);
            if (this.isDebugLevelValid(debugLevel)) {

                // if (existingTraceFlag[0].ExpirationDate < new Date().toISOString()) {
                //     await this.updateRecord('TraceFlag', existingTraceFlag[0].Id, {
                //         ExpirationDate: new Date(Date.now() + 5 * 60 * 1000).toISOString()
                //     });
                // }
                return existingTraceFlag[0];
            }

            // 获取或创建DebugLevel
            //const debugLevelId = await this.getOrCreateDebugLevel();

            // 更新TraceFlag
            // await this.updateRecord('TraceFlag', existingTraceFlag[0].Id, {
            //     DebugLevelId: debugLevelId
            // })
            // 删除不合适的配置
            await this.deleteRecord('TraceFlag', existingTraceFlag[0].Id);
        }
        // 获取或创建DebugLevel
        const debugLevelId = await this.getOrCreateDebugLevel();
        
        // 创建新的TraceFlag（24小时有效期）
        return await this.createRecord('TraceFlag', {
            DebugLevelId: debugLevelId,
            TracedEntityId: userId,
            StartDate: new Date().toISOString(),
            ExpirationDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            LogType: 'DEVELOPER_LOG'
        });

    }

    isDebugLevelValid(debugLevel) {
        return debugLevel.ApexCode === 'FINEST' && 
               debugLevel.System === 'FINE';
    }

    async getOrCreateDebugLevel() {
        // 查找现有的合适DebugLevel
        const result = await this.query(`
            SELECT Id FROM DebugLevel 
            WHERE (ApexCode = 'FINEST' AND System = 'FINE') or MasterLabel = 'Plugin Debug Level'
            LIMIT 1
        `);

        if (result.length > 0) {
            return result[0].Id;
        }

        // 创建新的DebugLevel
        const newDebugLevel = await this.createRecord('DebugLevel', {
            DeveloperName: `Plugin_Debug Level`,
            MasterLabel: 'Plugin Debug Level',
            ApexCode: 'FINEST',
            ApexProfiling: 'ERROR',
            Callout: 'INFO',
            Database: 'INFO',
            System: 'FINE',
            Validation: 'INFO',
            Visualforce: 'INFO',
            Workflow: 'ERROR',
            Language: 'en_US',
            Nba: 'INFO',
            Wave: 'INFO'
        });

        return newDebugLevel.Id;
    }

    async getDebugLevel(debugLevelId) {
        try {
            const query = `
                SELECT Id, DeveloperName, MasterLabel, ApexCode, ApexProfiling, Callout,
                    Database, System, Validation, Visualforce, Workflow, Nba
                FROM DebugLevel 
                WHERE Id = '${debugLevelId}'
            `;
            
            const result = await this.query(query);
            
            if (result && result.length > 0) {
                return result[0];
            } else {
                throw new Error(`DebugLevel with ID ${debugLevelId} not found`);
            }
        } catch (error) {
            console.error('Error fetching DebugLevel:', error);
            throw error;
        }
    }
}