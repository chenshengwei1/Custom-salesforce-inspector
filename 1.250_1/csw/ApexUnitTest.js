import {Dialog} from './Dialog.js';
import {Tools} from "./Tools.js";



class ApexTools extends Tools {
    async getApexClasses(){
        let soql = `select id, Name,  NamespacePrefix,Status,ApiVersion,LengthWithoutComments from ApexClass where NamespacePrefix =null order by Name`;
        let records = await this.tree.toolQuery(soql);
        return records.map(rec=>rec);
    }
    async getApexClassMember(className){
        let soql = `select id,SymbolTable,  FullName,ContentEntity.FullName from ApexClassMember where FullName='${className}' limit 1`;
        let records = await this.tree.toolQuery(soql);
        return records[0]?.SymbolTable?.methods.map(mtd=>mtd.name + '(' + mtd.parameters.map(param=>param.type + ' ' + param.name).join(', ') +')') || [];
    }

    async getApexClassMemberById(classId){
        let soql = `select id, symboltable from apexclass where id = '${classId}'`;
        let records = await this.tree.toolQuery(soql);
        return records[0]?.SymbolTable?.methods.map(mtd=>mtd.name + '(' + mtd.parameters.map(param=>param.type + ' ' + param.name).join(', ') +')') || [];
    }

    async getApexClassMemberById2(classId){
        let soql = `select id,SymbolTable,  FullName,ContentEntity.FullName from ApexClassMember where FullName='${className}' limit 1`;
        let records = await this.tree.toolQuery(soql);
        return records[0]?.SymbolTable?.methods.map(mtd=>mtd.name + '(' + mtd.parameters.map(param=>param.type + ' ' + param.name).join(', ') +')') || [];
    }

    async fetchTestClasses(){
        let soql = `FIND {@isTest} IN ALL FIELDS RETURNING ApexClass(Id, Name, NamespacePrefix,Status,ApiVersion)`;
        let records = await this.tree.querySosl(soql);
        return records.map(rec=>rec);
    }

    async fetchApexTestResult(apexJogId=''){
        // WHERE AsyncApexJobId = '${apexJogId}'
        let soql = `SELECT Id, ApexClassId, ApexClass.Name, ApexLogId, Message, MethodName, Outcome, RunTime, StackTrace, TestTimestamp
            FROM ApexTestResult ${apexJogId ? `WHERE AsyncApexJobId = '${apexJogId}'` : ''}
            ORDER BY TestTimestamp DESC limit 200`;
        let records = await this.tree.query(soql);
        return records;
    }

    async fetchApexCodeCoverageAggregate(){
        let soql = `SELECT ApexClassorTriggerId, ApexClassorTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage 
            FROM ApexCodeCoverageAggregate
            ORDER BY ApexClassOrTrigger.Name`;
        let records = await this.tree.toolQuery(soql);
        return records;
    }

    async fetchApexTestRunResults(){
        let soql = `SELECT Id, AsyncApexJobId, AsyncApexJob.Status, MethodsEnqueued, MethodsCompleted, MethodsFailed, StartTime, TestTime, User.Name 
            FROM ApexTestRunResult
            ORDER BY StartTime DESC`;
        let records = await this.tree.query(soql);
        return records;
    }

    async fetchApexBody(ids){
        let soql = `SELECT id, Name, Body FROM ApexClass WHERE Id IN ('${ids.join("','")}')`;
        let resut = await this.tree.query(soql);
        return resut.results;
    }

    async fetchApexBodyById(id){
        let records = await this.fetchApexBody([id]);
        return records[0]?.Body;
    }
}

const tools = new ApexTools();

export class ApexUnitTest{

    constructor(dateTree){
        this.tree = dateTree;
        this.records = [];
        this.message='';
        this.apexLogs = {};
        tools.tree = dateTree;
        
        this.lazy =true;
        this.apexClassManager = new ApexClassManager();
        this.apexMemberMap = new Map();
    }

    active(){
        if (this.init){
            return;
        }
        this.init =  true;
        this.createHead(this.rootId);
    }
    
    createHead(rootId){
        this.rootId = rootId;
        if (!this.init){
            return;
        }
        let treeroot = document.getElementById(rootId);
        var div = document.createElement("div");
        div.innerHTML = this.apexClassManager.getHtml() + `
        ${new ApexhandlerSyles().getStyles()}
        <div id="apexhandlerContainer"></div>
        `;
        treeroot.appendChild(div);
        this.initObjectAllDataHead();
        
        // 创建处理器实例
        const apexHandler = new TestApexHandler('apexhandlerContainer');
        
        this.apexClassManager.init();
        // 渲染到容器
        apexHandler.render();
    }

    getApexClassMethods(className){
        let classMember = this.apexMemberMap.get(className);
        if (!classMember || !classMember.SymbolTable){
            return [];
        }
        let methods = classMember.SymbolTable.methods.map(mtd=>mtd.name + '(' + mtd.parameters.map(param=>param.type + ' ' + param.name).join(', ') +')');
        return methods;
    }

    initObjectAllDataHead(){
    }

}

// ApexUnitTestMgr.js
// ApexUnitTestMgr.js

class ApexClassManager {
    constructor() {
        this.selectedClasses = new Map(); // Map<className, Set<methodName>>
        this.apexClasses = [];
        this.apexClassEntries = [];
        this.classMembers = new Map();
        this.filteredApexClasses = [];
        this.currentClassFilter = '';
        this.currentMethodFilter = '';
        this.showTestClassesOnly = false;
        this.sortSelectedFirst = false;
        this.codeCoverageData = new Map(); // Map<className, coverageData>
        this.init();
    }

    async init() {
        try {
            this.addStyles();
            this.apexClassEntries = await tools.fetchTestClasses();
            this.apexClasses = this.apexClassEntries.map(entry => entry.Name);
            this.filteredApexClasses = [...this.apexClasses];
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing Apex classes:', error);
        }
    }

     // 加载代码覆盖率数据
    async loadCodeCoverageData() {
        try {
            // 假设有一个API可以获取代码覆盖率数据
            // 这里使用模拟数据来演示
            this.codeCoverageData = new Map();
            
            // 模拟数据 - 在实际应用中应该从API获取
            for (const className of this.apexClasses.slice(0, 10)) { // 只加载前10个作为示例
                if (className.toLowerCase().includes('test')) {
                    // 测试类通常没有覆盖率数据
                    continue;
                }
                
                // 模拟覆盖率数据
                this.codeCoverageData.set(className, {
                    coveredLines: Math.floor(Math.random() * 100),
                    uncoveredLines: Math.floor(Math.random() * 50),
                    coveragePercentage: Math.floor(Math.random() * 100),
                    lastRunDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
                    testMethods: Math.floor(Math.random() * 5) + 1
                });
            }
        } catch (error) {
            console.error('Error loading code coverage data:', error);
        }
    }

    // 渲染整个页面
    getHtml() {
        return `
            <div class="apex-unit-test-mgr">
                <div class="header">
                    <h2>Apex Unit Test Manager</h2>
                    <p>Select Apex classes and methods for testing</p>
                </div>
                
                <div class="main-container">
                    <div class="panels-container">
                        ${this.classPanelHtml()}
                        ${this.methodPanelHtml()}
                    </div>
                    
                    ${this.selectionSummaryHtml()}
                </div>
            </div>
        `;
    }

    classPanelHtml(){
        const selectedCount = this.selectedClasses.size;
        const totalCount = this.apexClasses.length;
        const filteredCount = this.filteredApexClasses.length;
        const showOnlySelected = this.currentClassFilter === '_selected_';

        return `
            <div class="panel class-panel">
                <div class="panel-header">
                    <h3 class="panel-title">Apex Classes</h3>
                    <span class="selection-count">${selectedCount} selected</span>
                </div>
                
                <div class="filter-section">
                    <div class="filter-controls">
                        <div class="filter-input-group">
                            <input 
                                type="text" 
                                class="search-box class-search" 
                                placeholder="Search by class name..."
                                value="${this.currentClassFilter && !showOnlySelected ? this.currentClassFilter : ''}"
                            >
                            <div class="filter-buttons">
                                <button class="filter-btn show-selected-btn ${showOnlySelected ? 'active' : ''}">
                                    Show Selected Only
                                </button>
                                <button class="filter-btn clear clear-class-filter-btn">
                                    Clear Filter
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-stats">
                        <span class="filter-stats-showing">Showing: ${filteredCount} of ${totalCount} classes</span>
                        <span class="filter-stats-select">Selected: ${selectedCount}</span>
                    </div>
                    
                    <div class="filter-options">
                        <div class="filter-option">
                            <input type="checkbox" class="test-classes-filter" 
                                   ${this.showTestClassesOnly ? 'checked' : ''}>
                            <label>Show test classes only</label>
                        </div>
                        <div class="filter-option">
                            <input type="checkbox" class="selected-first-filter" 
                                   ${this.sortSelectedFirst ? 'checked' : ''}>
                            <label>Show selected classes first</label>
                        </div>
                    </div>
                </div>
                
                <div class="list-container class-list" id="class-list">
                    ${this.renderClassList()}
                </div>
            </div>
        `;
    }

    // 渲染类选择面板
    renderClassPanel() {
        const selectedCount = this.selectedClasses.size;
        const totalCount = this.apexClasses.length;
        const filteredCount = this.filteredApexClasses.length;
        const showOnlySelected = this.currentClassFilter === '_selected_';

        const container = document.querySelector('.apex-unit-test-mgr');
        container.querySelector('.class-panel input').value = this.currentClassFilter && !showOnlySelected ? this.currentClassFilter : '';
        container.querySelector('.filter-btn.show-selected-btn').classList.toggle('active', showOnlySelected);
        container.querySelector('.filter-stats-showing').textContent = `Showing: ${filteredCount} of ${totalCount} classes`;
        container.querySelector('.filter-stats-select').textContent = `Selected: ${selectedCount}`;
        container.querySelector('.test-classes-filter').checked = this.showTestClassesOnly;
        container.querySelector('.selected-first-filter').checked = this.sortSelectedFirst;
        container.querySelector('.class-list').innerHTML = this.renderClassList();
    }

    // 渲染类列表
    renderClassList() {
        if (!this.apexClasses || this.apexClasses.length === 0) {
            return '<div class="empty-state">Loading Apex classes...</div>';
        }

        if (this.filteredApexClasses.length === 0) {
            if (this.currentClassFilter === '_selected_') {
                return '<div class="empty-state">No classes selected yet. Select classes from the list above.</div>';
            } else {
                return '<div class="empty-state">No classes match your filter. Try a different search term.</div>';
            }
        }

        // 根据排序选项处理列表
        let classesToDisplay = [...this.filteredApexClasses];
        
        if (this.sortSelectedFirst) {
            classesToDisplay.sort((a, b) => {
                const aSelected = this.selectedClasses.has(a);
                const bSelected = this.selectedClasses.has(b);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return a.localeCompare(b);
            });
        }

        return classesToDisplay.map(className => {
            const isSelected = this.selectedClasses.has(className);
            const safeClassName = this.escapeHtml(className);
            return `
                <div class="list-item ${isSelected ? 'selected' : ''}" 
                     data-class-name="${safeClassName}">
                    <input type="checkbox" class="class-checkbox"
                           id="class-${safeClassName}"
                           ${isSelected ? 'checked' : ''}>
                    <label for="class-${safeClassName}">
                        ${className}
                        ${className.toLowerCase().includes('test') ? ' <span style="color:#2e844a;font-size:12px;">(Test)</span>' : ''}
                    </label>
                </div>
            `;
        }).join('');
    }

    methodPanelHtml(){
        const selectedClass = Array.from(this.selectedClasses.keys())[0];
        const methodCount = selectedClass ? (this.selectedClasses.get(selectedClass)?.size || 0) : 0;

        return `
            <div class="panel method-panel">
                <div class="panel-header">
                    <h3 class="panel-title">
                        ${selectedClass ? `Methods: ${selectedClass}` : 'Methods'}
                    </h3>
                    <span class="selection-count">${methodCount} selected</span>
                </div>
                
                
                <div class="filter-section">
                    <div class="filter-controls">
                        <div class="filter-input-group">
                            <input 
                                type="text" 
                                class="search-box method-search" 
                                placeholder="Search method names..."
                                value="${this.currentMethodFilter}"
                            >
                            <div class="filter-buttons">
                                <button class="filter-btn clear clear-method-filter-btn">
                                    Clear Filter
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="list-container method-list" id="method-list">
                        ${selectedClass ? this.renderMethodList(selectedClass) : `
                            <div class="empty-state">
                            Select an Apex class from the left panel to view its methods
                        </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染方法选择面板
    renderMethodsPanel() {
        const selectedClass = Array.from(this.selectedClasses.keys())[0];
        const methodCount = selectedClass ? (this.selectedClasses.get(selectedClass)?.size || 0) : 0;

        const container = document.querySelector('.apex-unit-test-mgr');
        if (container) {
            container.querySelector('.method-panel .panel-title').innerHTML = selectedClass ? `Methods: ${selectedClass}` : 'Methods';
            container.querySelector('.method-panel .selection-count').textContent = `${methodCount} selected`;
            container.querySelector('.method-list').innerHTML = this.renderMethodList(selectedClass);
        };
    }

    // 渲染方法列表
    renderMethodList(className) {
        if (!className) return '<div class="empty-state">No class selected</div>';

        const members = this.classMembers.get(className);
        if (!members || members.length === 0) {
            return '<div class="empty-state">Loading methods...</div>';
        }

        // 过滤方法
        let methods = members.filter(member => 
            member.toLowerCase().includes('method') || 
            member.includes('(')
        );

        // 应用方法过滤器
        if (this.currentMethodFilter) {
            const filterLower = this.currentMethodFilter.toLowerCase();
            methods = methods.filter(method =>
                method.toLowerCase().includes(filterLower)
            );
        }

        if (methods.length === 0) {
            return '<div class="empty-state">No methods match your filter</div>';
        }

        const selectedMethods = this.selectedClasses.get(className) || new Set();

        return methods.map(method => {
            const isSelected = selectedMethods.has(method);
            const safeMethodName = this.escapeHtml(method);
            const safeClassName = this.escapeHtml(className);
            const checkboxId = `method-${safeClassName}-${method.replace(/[^a-zA-Z0-9]/g, '-')}`;
            
            return `
                <div class="list-item ${isSelected ? 'selected' : ''}" 
                     data-class-name="${safeClassName}"
                     data-method-name="${safeMethodName}">
                    <input type="checkbox" class="method-checkbox"
                           id="${checkboxId}"
                           ${isSelected ? 'checked' : ''}>
                    <label for="${checkboxId}">
                        ${method}
                        ${method.toLowerCase().startsWith('test') ? ' <span style="color:#2e844a;font-size:12px;">(Test)</span>' : ''}
                    </label>
                </div>
            `;
        }).join('');
    }

    selectionSummaryHtml(){
        const totalClasses = this.selectedClasses.size;
        const totalMethods = Array.from(this.selectedClasses.values())
            .reduce((sum, methods) => sum + methods.size, 0);
        return `
            <div class="summary-panel">
                <h3 class="summary-title">
                    Selection Summary
                    <span class="count">${totalClasses} classes, ${totalMethods} methods</span>
                </h3>
            </div>
        `;
    }

    // 渲染选择摘要面板
    renderSelectionSummary() {
        const totalClasses = this.selectedClasses.size;
        const totalMethods = Array.from(this.selectedClasses.values())
            .reduce((sum, methods) => sum + methods.size, 0);
        const container = document.querySelector('.apex-unit-test-mgr');
        if (container) {
            if (totalClasses === 0) {
                container.querySelector('.summary-panel').innerHTML = `
                    <h3 class="summary-title">
                        Selection Summary
                        <span class="count">0 classes, 0 methods</span>
                    </h3>
                    <div class="no-selection">
                        No classes or methods selected yet. Select items from the panels above.
                    </div>
                `;
            }else{
                container.querySelector('.summary-panel').innerHTML = `
                        <h3 class="summary-title">
                            Selection Summary
                            <span class="count">${totalClasses} classes, ${totalMethods} methods</span>
                        </h3>
                        
                        ${Array.from(this.selectedClasses.entries()).map(([className, methods]) => {
                            const methodList = Array.from(methods);
                            const safeClassName = this.escapeHtml(className);
                            const coverage = this.codeCoverageData.get(className);
                            
                            return `
                                <div class="class-section" data-class-name="${safeClassName}">
                                    <div class="class-header">
                                        <div class="class-info">
                                            <span class="class-name">${className}</span>
                                            ${coverage ? `
                                                <span class="class-coverage ${this.getCoverageClass(coverage.coveragePercentage)}">
                                                    ${coverage.coveragePercentage}% covered
                                                </span>
                                            ` : ''}
                                        </div>
                                        <button class="remove-btn remove-class-btn" 
                                                data-class-name="${safeClassName}">
                                            Remove Class
                                        </button>
                                    </div>
                                    <div class="method-list">
                                        ${methodList.map(method => {
                                            const safeMethodName = this.escapeHtml(method);
                                            return `
                                                <div class="method-item">
                                                    <span class="method-name">${method}</span>
                                                    <button class="remove-btn remove-method-btn" 
                                                            data-class-name="${safeClassName}"
                                                            data-method-name="${safeMethodName}">
                                                        Remove
                                                    </button>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                `;
            }
        }
    }

    // 绑定所有事件
    bindEvents() {
        // 类搜索框事件
        const classSearchInput = document.querySelector('.class-search');
        if (classSearchInput) {
            classSearchInput.addEventListener('input', (e) => {
                this.currentClassFilter = e.target.value;
                this.applyClassFilter();
            });
        }

        // 方法搜索框事件
        const methodSearchInput = document.querySelector('.method-search');
        if (methodSearchInput) {
            methodSearchInput.addEventListener('input', (e) => {
                this.currentMethodFilter = e.target.value;
                this.updateMethodList();
            });
        }

        // 显示已选择类按钮
        const showSelectedBtn = document.querySelector('.show-selected-btn');
        if (showSelectedBtn) {
            showSelectedBtn.addEventListener('click', () => {
                if (this.currentClassFilter === '_selected_') {
                    this.currentClassFilter = '';
                } else {
                    this.currentClassFilter = '_selected_';
                }
                this.applyClassFilter();
            });
        }

        // 清除类过滤器按钮
        const clearClassFilterBtn = document.querySelector('.clear-class-filter-btn');
        if (clearClassFilterBtn) {
            clearClassFilterBtn.addEventListener('click', () => {
                this.clearClassFilter();
            });
        }

        // 清除方法过滤器按钮
        const clearMethodFilterBtn = document.querySelector('.clear-method-filter-btn');
        if (clearMethodFilterBtn) {
            clearMethodFilterBtn.addEventListener('click', () => {
                this.currentMethodFilter = '';
                this.updateMethodList();
            });
        }

        // 测试类过滤器复选框
        const testClassesFilter = document.querySelector('.test-classes-filter');
        if (testClassesFilter) {
            testClassesFilter.addEventListener('change', (e) => {
                this.showTestClassesOnly = e.target.checked;
                this.applyClassFilter();
            });
        }

        // 选中类优先排序复选框
        const selectedFirstFilter = document.querySelector('.selected-first-filter');
        if (selectedFirstFilter) {
            selectedFirstFilter.addEventListener('change', (e) => {
                this.sortSelectedFirst = e.target.checked;
                this.updateClassList();
            });
        }

        // 类选择事件委托
        const classListContainer = document.querySelector('.class-list');
        if (classListContainer) {
            classListContainer.addEventListener('click', async (e) => {
                const listItem = e.target.closest('.list-item');
                if (listItem && listItem.dataset.className) {
                    const className = listItem.dataset.className;
                    await this.toggleClassSelection(className);
                }
                
                const checkbox = e.target.closest('.class-checkbox');
                if (checkbox && checkbox.closest('.list-item')) {
                    e.stopPropagation();
                }
            });
        }

        // 方法选择事件委托
        const methodListContainer = document.querySelector('.method-list');
        if (methodListContainer) {
            methodListContainer.addEventListener('click', (e) => {
                const listItem = e.target.closest('.list-item');
                if (listItem && listItem.dataset.className && listItem.dataset.methodName) {
                    const className = listItem.dataset.className;
                    const methodName = listItem.dataset.methodName;
                    this.toggleMethodSelection(className, methodName);
                }
                
                const checkbox = e.target.closest('.method-checkbox');
                if (checkbox && checkbox.closest('.list-item')) {
                    e.stopPropagation();
                }
            });
        }

        // 移除类按钮事件委托
        document.addEventListener('click', (e) => {
            const removeClassBtn = e.target.closest('.remove-class-btn');
            if (removeClassBtn && removeClassBtn.dataset.className) {
                const className = removeClassBtn.dataset.className;
                this.removeClass(className);
            }
        });

        // 移除方法按钮事件委托
        document.addEventListener('click', (e) => {
            const removeMethodBtn = e.target.closest('.remove-method-btn');
            if (removeMethodBtn && removeMethodBtn.dataset.className && removeMethodBtn.dataset.methodName) {
                const className = removeMethodBtn.dataset.className;
                const methodName = removeMethodBtn.dataset.methodName;
                this.removeMethod(className, methodName);
            }
        });

        // 原有的事件绑定...
        // （保持原有的类搜索、方法搜索等事件绑定）
        
    }


    // 运行选择的测试
    async runSelectedTests() {
        if (this.selectedClasses.size === 0) {
            alert('Please select at least one class or method to run tests.');
            return;
        }
        
        try {
            // 显示加载状态
            const runBtn = document.querySelector('.run-tests-btn');
            if (runBtn) {
                runBtn.innerHTML = '<i>⏳</i> Running Tests...';
                runBtn.disabled = true;
            }
            
            // 构建测试运行请求
            const testRequest = {
                classes: Array.from(this.selectedClasses.entries()).map(([className, methods]) => ({
                    className,
                    methods: methods.size > 0 ? Array.from(methods) : null // null表示运行所有测试方法
                }))
            };
            
            console.log('Running tests:', testRequest);
            
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 模拟测试结果
            alert('Tests completed successfully! Coverage data will be updated.');
            
            // 刷新覆盖率数据
            await this.refreshCoverageData();
            
        } catch (error) {
            console.error('Error running tests:', error);
            alert('Failed to run tests. Please try again.');
        }
    }


    // 应用类过滤器
    applyClassFilter() {
        if (this.currentClassFilter === '_selected_') {
            // 显示已选择的类
            this.filteredApexClasses = this.apexClasses.filter(cls => 
                this.selectedClasses.has(cls)
            );
        } else if (this.currentClassFilter) {
            // 根据搜索词过滤
            const filterLower = this.currentClassFilter.toLowerCase();
            this.filteredApexClasses = this.apexClasses.filter(cls => 
                cls.toLowerCase().includes(filterLower)
            );
        } else {
            // 显示所有类
            this.filteredApexClasses = [...this.apexClasses];
        }

        // 应用测试类过滤器
        if (this.showTestClassesOnly) {
            this.filteredApexClasses = this.filteredApexClasses.filter(cls => 
                cls.toLowerCase().includes('test')
            );
        }

        this.updateClassList();
    }

    // 清除类过滤器
    clearClassFilter() {
        this.currentClassFilter = '';
        this.showTestClassesOnly = false;
        this.sortSelectedFirst = false;
        this.applyClassFilter();
    }

    // 更新类列表显示
    updateClassList() {
        const classList = document.getElementById('class-list');
        if (classList) {
            classList.innerHTML = this.renderClassList();
        }
    }

    // 更新方法列表显示
    updateMethodList() {
        const methodList = document.getElementById('method-list');
        if (methodList) {
            const selectedClass = Array.from(this.selectedClasses.keys())[0];
            if (selectedClass) {
                methodList.innerHTML = this.renderMethodList(selectedClass);
            }
        }
    }

    // 切换类选择
    async toggleClassSelection(className) {
        if (this.selectedClasses.has(className)) {
            this.selectedClasses.delete(className);
        } else {
            this.selectedClasses.set(className, new Set());
            try {
                //const members = await tools.getApexClassMember(className);
                const members = await tools.getApexClassMemberById(this.apexClassEntries.find(entry => entry.Name === className).Id);
                this.classMembers.set(className, members);
            } catch (error) {
                console.error(`Error loading members for ${className}:`, error);
            }
        }
        
        // 如果当前正在显示"已选择的类"，需要更新过滤列表
        if (this.currentClassFilter === '_selected_') {
            this.applyClassFilter();
        }
        
        this.render();
        this.bindEvents();
    }

    // 切换方法选择
    toggleMethodSelection(className, methodName) {
        if (!this.selectedClasses.has(className)) {
            this.selectedClasses.set(className, new Set());
        }
        
        const methods = this.selectedClasses.get(className);
        if (methods.has(methodName)) {
            methods.delete(methodName);
            if (methods.size === 0) {
                this.selectedClasses.delete(className);
            }
        } else {
            methods.add(methodName);
        }
        this.render();
        this.bindEvents();
    }

    // 移除整个类
    removeClass(className) {
        this.selectedClasses.delete(className);
        
        // 如果当前正在显示"已选择的类"，需要更新过滤列表
        if (this.currentClassFilter === '_selected_') {
            this.applyClassFilter();
        }
        
        this.render();
        this.bindEvents();
    }

    // 移除单个方法
    removeMethod(className, methodName) {
        const methods = this.selectedClasses.get(className);
        if (methods) {
            methods.delete(methodName);
            if (methods.size === 0) {
                this.selectedClasses.delete(className);
            }
        }
        this.render();
        this.bindEvents();
    }

    // 重新渲染整个页面
    render() {
        const container = document.querySelector('.apex-unit-test-mgr');
        if (container) {
            this.renderClassPanel();
            this.renderMethodsPanel();
            this.renderSelectionSummary();
        }
    }

    // 添加CSS样式
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .apex-unit-test-mgr {
                font-family: Arial, sans-serif;
                padding: 20px;
                margin: 0 auto;
            }
            
            .header {
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 2px solid #0176d3;
            }
            
            .header h2 {
                color: #0176d3;
                margin: 0;
            }
            
            .header p {
                color: #666;
                margin: 5px 0 0 0;
            }
            
            .main-container {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }
            
            .panels-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                min-height: 500px;
            }
            
            .panel {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                max-height: 500px;
                overflow: hidden;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
                flex-shrink: 0;
            }
            
            .panel-title {
                font-size: 18px;
                font-weight: bold;
                color: #2e2e2e;
                margin: 0;
            }
            
            .selection-count {
                background: #0176d3;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
            }
            
            .filter-section {
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 15px;
                flex-shrink: 0;
            }
            
            .filter-title {
                font-size: 14px;
                font-weight: bold;
                color: #2e2e2e;
                margin: 0 0 10px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .filter-title i {
                color: #0176d3;
            }
            
            .filter-controls {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .filter-input-group {
                display: flex;
                gap: 10px;
            }
            
            .search-box {
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                flex: 1;
                min-width: 0;
            }
            
            .search-box:focus {
                outline: none;
                border-color: #0176d3;
                box-shadow: 0 0 0 1px #0176d3;
            }
            
            .filter-buttons {
                display: flex;
                gap: 8px;
            }
            
            .filter-btn {
                padding: 10px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .filter-btn:hover {
                background: #f8f9fa;
                border-color: #0176d3;
                color: #0176d3;
            }
            
            .filter-btn.active {
                background: #0176d3;
                color: white;
                border-color: #0176d3;
            }
            
            .filter-btn.clear {
                background: #ffebe6;
                color: #ba0517;
                border-color: #ba0517;
            }
            
            .filter-btn.clear:hover {
                background: #ffded9;
            }
            
            .filter-stats {
                margin-top: 10px;
                font-size: 12px;
                color: #666;
                display: flex;
                justify-content: space-between;
            }
            
            .list-container {
                flex: 1;
                overflow-y: auto;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                min-height: 200px;
                max-height: calc(500px - 250px);
            }
            
            .list-item {
                padding: 12px 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: background 0.2s;
            }
            
            .list-item:hover {
                background: #f0f7ff;
            }
            
            .list-item.selected {
                background: #e1f0ff;
                border-left: 3px solid #0176d3;
            }
            
            .list-item input[type="checkbox"] {
                margin: 0;
                cursor: pointer;
                width: 16px;
                height: 16px;
            }
            
            .list-item label {
                cursor: pointer;
                flex: 1;
                margin: 0;
                user-select: none;
                font-size: 14px;
            }
            
            .empty-state {
                padding: 40px 20px;
                text-align: center;
                color: #888;
                font-style: italic;
                font-size: 14px;
            }
            
            .summary-panel {
                background: #f0f8ff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                max-height: 500px;
                overflow-y: auto;
            }
            
            .summary-title {
                font-size: 18px;
                font-weight: bold;
                color: #2e2e2e;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .summary-title .count {
                background: #0176d3;
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 14px;
            }
            
            .class-section {
                margin-bottom: 20px;
                padding: 15px;
                background: white;
                border-radius: 6px;
                border: 1px solid #ddd;
            }
            
            .class-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .class-name {
                font-weight: bold;
                color: #0176d3;
                font-size: 16px;
            }
            
            .remove-btn {
                background: #ffebe6;
                color: #ba0517;
                border: 1px solid #ba0517;
                padding: 4px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                border: none;
            }
            
            .remove-btn:hover {
                background: #ffded9;
            }
            
            .method-list {
                padding-left: 20px;
            }
            
            .method-item {
                padding: 8px 0;
                border-bottom: 1px solid #f5f5f5;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .method-name {
                font-family: 'Courier New', monospace;
                color: #2e2e2e;
                font-size: 14px;
            }
            
            .no-selection {
                padding: 40px 20px;
                text-align: center;
                color: #888;
                font-style: italic;
                background: white;
                border-radius: 6px;
                border: 1px solid #ddd;
            }
            
            .filter-options {
                display: flex;
                gap: 15px;
                margin-top: 10px;
                flex-wrap: wrap;
            }
            
            .filter-option {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .filter-option input[type="checkbox"] {
                margin: 0;
            }
            
            .filter-option label {
                font-size: 13px;
                color: #666;
                cursor: pointer;
            }
            
            @media (max-width: 1200px) {
                .panels-container {
                    grid-template-columns: 1fr;
                }
                
                .filter-input-group {
                    flex-direction: column;
                }
                
                .filter-buttons {
                    width: 100%;
                }
                
                .filter-btn {
                    flex: 1;
                }
            }
            
            @media (max-width: 768px) {
                .filter-buttons {
                    flex-wrap: wrap;
                }
                
                .filter-btn {
                    flex: 1;
                    min-width: 120px;
                }
                
                .filter-options {
                    flex-direction: column;
                    gap: 8px;
                }
            }
                /* 保持原有样式不变，新增以下样式 */
            
            
            @media (max-width: 1400px) {
                .panels-container {
                    grid-template-columns: 1fr 1fr;
                }
                
                .coverage-panel {
                    grid-column: 1 / -1;
                }
            }
            
            @media (max-width: 900px) {
                .panels-container {
                    grid-template-columns: 1fr;
                }
            }
            
            /* 覆盖率面板特定样式 */
            .coverage-panel {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            
            .coverage-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
            }
            
            .coverage-good {
                background: #2e844a;
                color: white;
            }
            
            .coverage-warning {
                background: #fe9339;
                color: white;
            }
            
            .coverage-poor {
                background: #ea001e;
                color: white;
            }
            
            .coverage-summary {
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .coverage-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-label {
                display: block;
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            
            .stat-value {
                display: block;
                font-size: 24px;
                font-weight: bold;
                color: #0176d3;
            }
            
            .coverage-progress {
                margin-bottom: 20px;
            }
            
            .progress-bar {
                height: 10px;
                background: #e0e0e0;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .progress-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            
            .progress-fill.high { background: #2e844a; }
            .progress-fill.medium { background: #fe9339; }
            .progress-fill.low { background: #ea001e; }
            
            .progress-labels {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #666;
            }
            
            .coverage-legend {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 15px;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
                color: #666;
            }
            
            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 2px;
            }
            
            .legend-color.high { background: #2e844a; }
            .legend-color.medium { background: #fe9339; }
            .legend-color.low { background: #ea001e; }
            
            .coverage-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .coverage-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .refresh-coverage-btn {
                background: #0176d3;
                color: white;
            }
            
            .refresh-coverage-btn:hover {
                background: #014486;
            }
            
            .refresh-coverage-btn:disabled {
                background: #c9c7c5;
                cursor: not-allowed;
            }
            
            .run-tests-btn {
                background: #2e844a;
                color: white;
            }
            
            .run-tests-btn:hover {
                background: #1c5c32;
            }
            
            .run-tests-btn:disabled {
                background: #aab5aa;
                cursor: not-allowed;
            }
            
            .coverage-list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .coverage-list-header h4 {
                margin: 0;
                color: #2e2e2e;
                font-size: 16px;
            }
            
            .coverage-filter-select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: white;
            }
            
            .coverage-item {
                background: white;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 10px;
                border: 2px solid transparent;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .coverage-item:hover {
                border-color: #0176d3;
                box-shadow: 0 2px 8px rgba(1, 118, 211, 0.1);
            }
            
            .coverage-item.selected {
                border-color: #0176d3;
                background: #f0f7ff;
            }
            
            .coverage-item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .coverage-class-name {
                font-weight: bold;
                color: #2e2e2e;
                font-size: 14px;
            }
            
            .coverage-percentage {
                padding: 4px 10px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 12px;
                min-width: 50px;
                text-align: center;
            }
            
            .coverage-percentage.high {
                background: #2e844a;
                color: white;
            }
            
            .coverage-percentage.medium {
                background: #fe9339;
                color: white;
            }
            
            .coverage-percentage.low {
                background: #ea001e;
                color: white;
            }
            
            .coverage-item-details {
                font-size: 12px;
            }
            
            .coverage-stats-small {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                color: #666;
            }
            
            .coverage-stats-small .stat {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .coverage-progress-small .progress-bar {
                height: 6px;
                margin-bottom: 10px;
            }
            
            .coverage-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .last-run {
                color: #888;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .view-details-btn {
                padding: 4px 12px;
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .view-details-btn:hover {
                background: #0176d3;
                color: white;
                border-color: #0176d3;
            }
            
            /* 更新选择摘要中的覆盖率显示 */
            .class-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .class-coverage {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 10px;
                display: inline-block;
                width: fit-content;
            }
            
            .class-coverage.high {
                background: #d4edda;
                color: #2e844a;
            }
            
            .class-coverage.medium {
                background: #fff3cd;
                color: #856404;
            }
            
            .class-coverage.low {
                background: #f8d7da;
                color: #721c24;
            }
        `;
        
        // 移除旧的样式
        const oldStyle = document.querySelector('style[data-apex-unit-test]');
        if (oldStyle) {
            return;
        }
        
        style.setAttribute('data-apex-unit-test', 'true');
        document.head.appendChild(style);
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


class ApexPaservice {
    constructor(queryMgr){
        this.queryMgr = queryMgr;
    }

    /**
 * 从Apex Class的body中提取所有@isTest方法
 * @param {string} apexBody - Apex Class的完整代码内容
 * @returns {Array<string>} - 返回找到的@isTest方法名数组
 */
 extractIsTestMethods(apexBody) {
    const methods = [];
    
    if (!apexBody || typeof apexBody !== 'string') {
        console.warn('Invalid Apex body provided');
        return methods;
    }

    // 清理代码：移除注释，简化解析
    const cleanedCode = apexBody
        // 移除多行注释
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 移除单行注释
        .replace(/\/\/.*$/gm, '')
        // 移除字符串字面量，防止字符串中的@isTest干扰解析
        .replace(/['"](?:\\['"]|.)*?['"]/g, '""')
        // 规范化换行符
        .replace(/\r\n/g, '\n');

    // 方法1：正则表达式匹配 - 简单直接的方式
    const regexPatterns = [
        // 匹配 @isTest 修饰符，支持多种写法
        /@isTest\s*(?:\([^)]*\))?\s*(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(/g,
        // 匹配 testMethod 关键字（较老的写法）
        /(?:@isTest|testMethod)\s*(?:\([^)]*\))?\s*(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(/g,
        // 匹配 @isTest 在单独一行的写法
        /@isTest\s*\n\s*(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(/g
    ];

    for (const pattern of regexPatterns) {
        let match;
        while ((match = pattern.exec(cleanedCode)) !== null) {
            const methodName = match[1];
            if (methodName && !methods.includes(methodName)) {
                methods.push(methodName);
            }
        }
    }

    // 如果正则方法没找到，使用方法2：基于语法分析的方法
    if (methods.length === 0) {
        methods.push(...parseApexMethodsBySyntax(cleanedCode));
    }

    return methods;
}

/**
 * 使用方法2：基于语法分析解析Apex方法
 * @param {string} code - 清理后的Apex代码
 * @returns {Array<string>} - 找到的@isTest方法名
 */
 parseApexMethodsBySyntax(code) {
    const isTestMethods = [];
    const lines = code.split('\n');
    
    // 状态机追踪
    let inIsTestBlock = false;
    let braceCount = 0;
    let currentMethod = null;
    let methodStartLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 跳过空行
        if (!line) continue;
        
        // 检查是否是类定义的开始
        if (line.startsWith('class ') || line.startsWith('public class ') || 
            line.startsWith('global class ') || line.startsWith('private class ')) {
            // 重置状态
            inIsTestBlock = false;
            currentMethod = null;
        }
        
        // 检查是否是@isTest注解
        if (line.includes('@isTest') || /@istest/i.test(line)) {
            inIsTestBlock = true;
        }
        
        // 检查是否是testMethod关键字（旧语法）
        if (line.includes('testMethod')|| /testMethod/i.test(line)) {
            inIsTestBlock = true;
        }
        
        // 寻找方法定义
        if (inIsTestBlock && !currentMethod) {
            // 匹配方法定义的模式：可见性修饰符 + 返回类型 + 方法名 + 参数
            const methodMatch = line.match(/(?:public|private|global|protected)?\s*(?:static)?\s*(?:[\w<>\.]+)?\s+(\w+)\s*\(/);
            if (methodMatch) {
                const methodName = methodMatch[1];
                // 排除常见的关键字和类名
                if (methodName && !['class', 'interface', 'enum', 'if', 'for', 'while', 'try', 'catch'].includes(methodName)) {
                    currentMethod = methodName;
                    methodStartLine = i;
                    braceCount = 0;
                    
                    // 检查这行是否有开括号
                    if (line.includes('{')) {
                        braceCount++;
                    }
                }
            }
        }
        
        // 如果当前正在解析方法，追踪大括号
        if (currentMethod) {
            // 统计大括号
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            // 如果大括号归零，方法定义结束
            if (braceCount === 0 && currentMethod) {
                isTestMethods.push(currentMethod);
                currentMethod = null;
                inIsTestBlock = false;
                methodStartLine = -1;
            }
        }
    }
    
    return isTestMethods;
}

/**
 * 方法3：更精确的解析器（处理复杂情况）
 * @param {string} apexBody - Apex代码
 * @returns {Array<string>} - @isTest方法名
 */
 parseIsTestMethodsAdvanced(apexBody) {
    const methods = [];
    
    // 首先分割出类的主要内容
    const classStart = apexBody.indexOf('{');
    const classEnd = apexBody.lastIndexOf('}');
    
    if (classStart === -1 || classEnd === -1 || classEnd <= classStart) {
        return methods;
    }
    
    const classContent = apexBody.substring(classStart + 1, classEnd);
    
    // 分割出每个成员（方法、属性等）
    const tokens = [];
    let depth = 0;
    let currentToken = '';
    
    for (let i = 0; i < classContent.length; i++) {
        const char = classContent[i];
        const nextChar = classContent[i + 1];
        
        if (char === '{') {
            depth++;
            currentToken += char;
        } else if (char === '}') {
            depth--;
            currentToken += char;
            
            if (depth === 0) {
                tokens.push(currentToken.trim());
                currentToken = '';
            }
        } else if (depth === 0 && char === ';') {
            // 属性定义等
            tokens.push(currentToken + char);
            currentToken = '';
        } else {
            currentToken += char;
        }
    }
    
    // 解析每个token
    for (const token of tokens) {
        // 检查是否是@isTest方法
        if (token.includes('@isTest') && token.includes('(') && token.includes('{')) {
            // 提取方法名
            const lines = token.split('\n');
            for (const line of lines) {
                // 找到包含方法名的行
                const methodMatch = line.match(/(\w+)\s*\(/);
                if (methodMatch) {
                    const methodName = methodMatch[1];
                    // 进一步验证这是一个方法名（不是类名或其他关键字）
                    if (methodName && 
                        !['class', 'interface', 'enum', 'if', 'for', 'while', 'do', 'switch', 'try', 'catch', 'finally'].includes(methodName) &&
                        !methodName.startsWith('test') && // 避免误判
                        !methods.includes(methodName)) {
                        methods.push(methodName);
                    }
                }
            }
        }
    }
    
    return methods;
}

/**
 * 整合所有解析方法，返回最佳结果
 * @param {string} apexBody - Apex代码
 * @returns {Array<string>} - 所有@isTest方法名
 */
getAllIsTestMethods(apexBody) {
    if (!apexBody || typeof apexBody !== 'string') {
        return [];
    }
    
    // 方法1：正则表达式（快速）
    const methods1 = extractIsTestMethods(apexBody);
    
    // 如果找到方法，直接返回
    if (methods1.length > 0) {
        return methods1;
    }
    
    // 方法2：语法分析（更准确）
    const cleanedCode = apexBody
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
    
    const methods2 = parseApexMethodsBySyntax(cleanedCode);
    
    if (methods2.length > 0) {
        return methods2;
    }
    
    // 方法3：高级解析（处理复杂情况）
    return parseIsTestMethodsAdvanced(apexBody);
}
    mockData() {
        
    // ============================ 使用示例 ============================

    // 示例Apex测试类
    const exampleApexClass = `
        /**
         * 示例测试类
         * @description 用于演示@isTest方法解析
         */
        @isTest
        public class ExampleTestClass {
            
            // 测试数据工厂
            @TestSetup
            static void makeData() {
                // 创建测试数据
            }
            
            /**
             * 测试方法1
             */
            @isTest
            static void testAccountCreation() {
                // 测试逻辑
                System.assertEquals(1, 1);
            }
            
            // 旧式testMethod写法
            testMethod static void testOldStyle() {
                // 旧式测试方法
            }
            
            @isTest(SeeAllData=true)
            static void testWithSeeAllData() {
                // 使用SeeAllData的测试
            }
            
            @isTest
            static void testBulkOperations() {
                // 批量操作测试
            }
            
            // 这不是测试方法（没有@isTest注解）
            public static void helperMethod() {
                // 辅助方法
            }
            
            // 内联注释的测试方法
            @isTest static void testInlineAnnotation() {
                // 内联注解的测试
            }
            
            // 带参数的@isTest注解
            @isTest(isParallel=true)
            static void testParallelExecution() {
                // 并行测试
            }
            
            // 多行注解的测试方法
            @isTest
            (description = "这是一个复杂的测试方法")
            static void 
            testMultilineAnnotation
            () {
                // 多行定义的测试方法
            }
            
            // 全局访问修饰符的测试
            @isTest
            global static void testGlobalAccess() {
                // 全局测试方法
            }
            
            // 私有测试方法
            @isTest
            private static void testPrivateMethod() {
                // 私有测试
            }
            
            // 实例测试方法
            @isTest
            void testInstanceMethod() {
                // 实例测试方法
            }
        }
        `;

        // 使用示例
        console.log('=== 解析示例Apex测试类 ===');

        // 方法1：基本解析
        const basicMethods = extractIsTestMethods(exampleApexClass);
        console.log('方法1找到的@isTest方法:', basicMethods);

        // 方法2：语法分析
        const cleanedCode = exampleApexClass
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');
        const syntaxMethods = parseApexMethodsBySyntax(cleanedCode);
        console.log('方法2找到的@isTest方法:', syntaxMethods);

        // 方法3：整合方法
        const allMethods = getAllIsTestMethods(exampleApexClass);
        console.log('所有@isTest方法:', allMethods);

        // 统计信息
        console.log('\n=== 统计信息 ===');
        console.log('找到的测试方法数量:', allMethods.length);
        console.log('测试方法列表:', allMethods.join(', '));
    }

// ============================ 单元测试 ============================

    runTests() {
        const testCases = [
            {
                name: '简单@isTest方法',
                code: `@isTest static void testMethod1() {}`,
                expected: ['testMethod1']
            },
            {
                name: '旧式testMethod',
                code: `testMethod static void testMethod2() {}`,
                expected: ['testMethod2']
            },
            {
                name: '带参数的@isTest',
                code: `@isTest(SeeAllData=true) static void testMethod3() {}`,
                expected: ['testMethod3']
            },
            {
                name: '多行定义',
                code: `@isTest\nstatic void\ntestMethod4\n() {}`,
                expected: ['testMethod4']
            },
            {
                name: '全局访问修饰符',
                code: `@isTest global static void testMethod5() {}`,
                expected: ['testMethod5']
            },
            {
                name: '内联注解',
                code: `@isTest static void testMethod6() {}`,
                expected: ['testMethod6']
            },
            {
                name: '包含注释的代码',
                code: `// 这是注释\n@isTest static void testMethod7() { // 行内注释\n }`,
                expected: ['testMethod7']
            },
            {
                name: '多个测试方法',
                code: `@isTest static void test1() {}\n@isTest static void test2() {}`,
                expected: ['test1', 'test2']
            },
            {
                name: '字符串中的@isTest（不应匹配）',
                code: `String s = "@isTest";\npublic void notATest() {}`,
                expected: []
            }
        ];
        
        console.log('\n=== 单元测试 ===');
        let passed = 0;
        let failed = 0;
        
        for (const testCase of testCases) {
            const result = getAllIsTestMethods(testCase.code);
            const success = JSON.stringify(result.sort()) === JSON.stringify(testCase.expected.sort());
            
            if (success) {
                console.log(`✓ ${testCase.name}: 通过`);
                passed++;
            } else {
                console.log(`✗ ${testCase.name}: 失败`);
                console.log(`  期望: ${testCase.expected.join(', ')}`);
                console.log(`  实际: ${result.join(', ')}`);
                failed++;
            }
        }
        
        console.log(`\n测试结果: ${passed} 通过, ${failed} 失败`);
        
        return failed === 0;
    }

}



    
// 模拟数据提供器
class DataProvider {
    static async getTestMethods(jobId = '') {
        let data = await tools.fetchApexTestResult(jobId);
        console.log('Fetched Apex Test Results:', data);
        let results = [];
        for (const result of data.results || []) {
            console.log(`${result.class}.${result.method} - ${result.result}`);
            // Id, ApexClassId, ApexClass.Name, ApexLogId, Message, MethodName, Outcome, RunTime, StackTrace, TestTimestamp
            results.push({ 
                class: result.ApexClass.Name || "", 
                method: result.MethodName || "", 
                duration: DataProvider.durationToString(result.RunTime || 0), 
                timestamp: Tools.formatDate(new Date(result.TestTimestamp)),
                result: result.Outcome,
                logId: result.apexLogId || "",
                errors: result.Message || "",
                stackTrack: result.StackTrace || "",
                Id: result.Id,
                ApexClassId: result.ApexClassId,
                ApexClassName: result.ApexClass.Name,
            });
        }
        if (results.length > 0) {
            return results;
        }
        return [];
    }

    static async getJobs() {

        let result  = await tools.fetchApexTestRunResults();
        console.log('Fetched Apex Test Run Results:', result);
        let jobs = [];
        if (result && result.results){
            for (const job of result.results || []) {
                jobs.push({ 
                    id: job.Id, 
                    status: job.AsyncApexJob.Status, 
                    failed: job.MethodsFailed, 
                    total: job.MethodsCompleted, 
                    asyncJobId: job.AsyncApexJobId, 
                    queuedTime: job.StartTime ? Tools.formatDate(new Date(job.StartTime)) : '-', 
                    duration: DataProvider.durationToString(job.TestTime),
                    user: job.User.Name
                });
            }                    
            return jobs;
        }
        return [];
    }

    static async getCoverages() {
        let records = await tools.fetchApexCodeCoverageAggregate();
        console.log('Fetched Apex Code Coverage Aggregate:', records);
        if (records && records.length > 0) {
            let coverages = []; 
            for (const record of records) {
                if (!record.ApexClassOrTrigger){
                    continue;
                }
                const className = record.ApexClassOrTrigger ? record.ApexClassOrTrigger.Name : "Unknown";
                const coveredLines = record.Coverage?.coveredLines || [];
                const uncoveredLines = record.Coverage?.uncoveredLines || [];
                const totalLines = coveredLines.length + uncoveredLines.length;
                const percent = totalLines > 0 ? `${Math.round((coveredLines.length / totalLines) * 100)}%` : "0%";
                coverages.push({ class: className, percent, lines: `${coveredLines.length}/${totalLines}` });
            }
            return coverages;
        }

        return [];
    }

    static durationToString(durationMs) {
        if (!durationMs)
            return "-";
        else if (durationMs < 1000) {
            return `${durationMs} ms`;
        } else if (durationMs < 60000) {
            return `${(durationMs / 1000).toFixed(2)} s`;
        } else {
            const minutes = Math.floor(durationMs / 60000);
            const seconds = ((durationMs % 60000) / 1000).toFixed(0);
            return `${minutes} m ${seconds} s`;
        }
    }
}

        // 事件处理器类 - 作用域限定在容器内
        class EventHandlers {
            static tooltip = null;
            static horizontalDragging = false;
            static verticalDragging = false;
            static columnResizing = false;
            static container = null;

            // 设置容器引用
            static setContainer(container) {
                EventHandlers.container = container;
            }

            // 初始化工具提示
            static initializeTooltips() {
                EventHandlers.tooltip = EventHandlers.container.querySelector('.tooltip');
                
                // 为容器内所有表格单元格添加鼠标事件
                EventHandlers.container.querySelectorAll('.data-table td').forEach(cell => {
                    cell.addEventListener('mouseenter', EventHandlers.handleCellMouseEnter);
                    cell.addEventListener('mouseleave', EventHandlers.handleCellMouseLeave);
                });
            }

            // 单元格鼠标进入事件
            static handleCellMouseEnter(e) {
                const cell = e.target;
                const text = cell.getAttribute('title') || cell.textContent;
                if (text && text.trim() !== '' && cell.offsetWidth < cell.scrollWidth) {
                    EventHandlers.tooltip.textContent = text;
                    EventHandlers.tooltip.style.display = 'block';
                    
                    const rect = cell.getBoundingClientRect();
                    EventHandlers.tooltip.style.left = `${rect.left}px`;
                    EventHandlers.tooltip.style.top = `${rect.bottom + 5}px`;
                }
            }

            // 单元格鼠标离开事件
            static handleCellMouseLeave() {
                if (EventHandlers.tooltip) {
                    EventHandlers.tooltip.style.display = 'none';
                }
            }

            // 初始化水平分割栏拖动
            static initializeHorizontalSplitBefore() {
                const horizontalSplitHandle = EventHandlers.container.querySelector('.split-handle');
                const mainSplit = EventHandlers.container.querySelector('.main-split');
                
                if (!horizontalSplitHandle || !mainSplit) return;
                
                horizontalSplitHandle.addEventListener('mousedown', EventHandlers.handleHorizontalSplitMouseDown);
                
                // 使用容器内的 document 事件监听
                const docHandler = (e) => {
                    if (!EventHandlers.horizontalDragging) return;
                    
                    const delta = e.clientY - EventHandlers.startY;
                    const containerHeight = mainSplit.clientHeight;
                    const newTopHeight = Math.min(Math.max(EventHandlers.startHeight + delta, 100), containerHeight - 100);
                    
                    mainSplit.style.gridTemplateRows = `${newTopHeight}px 1fr`;
                };
                
                document.addEventListener('mousemove', docHandler);
                
                // 存储事件处理函数以便后续清理
                EventHandlers.horizontalMouseMoveHandler = docHandler;
            }

            static initializeHorizontalSplit() {
                const horizontalSplitHandle = EventHandlers.container.querySelector('.split-handle');
                const mainSplit = EventHandlers.container.querySelector('.main-split');
                const topSection = EventHandlers.container.querySelector('.top-section');
                
                if (!horizontalSplitHandle || !mainSplit) return;
                
                horizontalSplitHandle.addEventListener('mousedown', EventHandlers.handleHorizontalSplitMouseDown);
                
                // 使用容器内的 document 事件监听
                const docHandler = (e) => {
                    if (!EventHandlers.horizontalDragging) return;
                    
                    const delta = e.clientY - EventHandlers.startY;
                    const containerHeight = mainSplit.clientHeight;
                    
                    // 计算新的top-section高度（减去split-handle的高度和边距）
                    const splitHandleHeight = horizontalSplitHandle.offsetHeight;
                    const splitHandleMargin = 10; // 上下margin总和
                    const availableHeight = containerHeight - splitHandleHeight - splitHandleMargin;
                    
                    // 限制最小和最大高度
                    const newTopHeight = Math.min(
                        Math.max(EventHandlers.startHeight + delta, 100), 
                        availableHeight - 100
                    );
                    
                    // 设置grid-template-rows，split-handle保持auto
                    mainSplit.style.gridTemplateRows = `${newTopHeight}px auto 1fr`;
                };
                
                document.addEventListener('mousemove', docHandler);
                
                // 存储事件处理函数以便后续清理
                EventHandlers.horizontalMouseMoveHandler = docHandler;
            }

            // 水平分割栏鼠标按下事件
            static handleHorizontalSplitMouseDownBefore(e) {
                EventHandlers.horizontalDragging = true;
                EventHandlers.startY = e.clientY;
                const mainSplit = EventHandlers.container.querySelector('.main-split');
                EventHandlers.startHeight = parseInt(getComputedStyle(mainSplit).gridTemplateRows.split(' ')[0]);
                document.body.style.cursor = 'row-resize';
                e.preventDefault();
            }

            // 水平分割栏鼠标按下事件 - 修改后的版本
            static handleHorizontalSplitMouseDown(e) {
                EventHandlers.horizontalDragging = true;
                EventHandlers.startY = e.clientY;
                
                const mainSplit = EventHandlers.container.querySelector('.main-split');
                const topSection = EventHandlers.container.querySelector('.top-section');
                
                // 获取当前top-section的实际高度
                EventHandlers.startHeight = topSection.offsetHeight;
                
                document.body.style.cursor = 'row-resize';
                e.preventDefault();
            }

            // 初始化垂直分割栏拖动
            static initializeVerticalSplit() {
                const verticalSplitHandle = EventHandlers.container.querySelector('.vertical-split-handle');
                const bottomSection = EventHandlers.container.querySelector('.bottom-section');
                
                if (!verticalSplitHandle || !bottomSection) return;
                
                verticalSplitHandle.addEventListener('mousedown', EventHandlers.handleVerticalSplitMouseDown);
                
                // 使用容器内的 document 事件监听
                const docHandler = (e) => {
                    if (!EventHandlers.verticalDragging) return;
                    
                    const delta = e.clientX - EventHandlers.startX;
                    const containerWidth = bottomSection.clientWidth;
                    const newLeftWidth = Math.min(Math.max(EventHandlers.startWidth + delta, 100), containerWidth - 100);
                    
                    bottomSection.style.gridTemplateColumns = `${newLeftWidth}px 1fr`;
                    verticalSplitHandle.style.left = `calc(${(newLeftWidth / containerWidth) * 100}% - 5px)`;
                };
                
                document.addEventListener('mousemove', docHandler);
                
                // 存储事件处理函数以便后续清理
                EventHandlers.verticalMouseMoveHandler = docHandler;
            }

            // 初始化刷新按钮
            static initializeRefreshButtons(testApexHandler) {
                const refreshButtons = EventHandlers.container.querySelectorAll('.refresh-btn');
                
                refreshButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        EventHandlers.handleRefreshClick(e, testApexHandler);
                    });
                });
            }

            // 处理刷新按钮点击事件
            static handleRefreshClick(e, testApexHandler) {
                const button = e.target;
                const tableType = button.getAttribute('data-table');
                
                // 防止重复点击
                if (button.disabled) return;
                
                // 禁用按钮并显示加载状态
                button.disabled = true;
                const originalText = button.textContent;
                button.textContent = '刷新中...';
                
                // 模拟异步刷新过程
                setTimeout(() => {
                    // 根据表格类型刷新对应的表格
                    switch(tableType) {
                        case 'methods':
                            testApexHandler.populateMethodsTable();
                            console.log('测试方法表格已刷新');
                            break;
                        case 'jobs':
                            testApexHandler.populateJobsTable();
                            console.log('作业表格已刷新');
                            break;
                        case 'coverage':
                            testApexHandler.populateCoverageTable();
                            console.log('覆盖率表格已刷新');
                            break;
                    }
                    
                    // 恢复按钮状态
                    button.disabled = false;
                    button.textContent = originalText;
                    
                    // 重新初始化工具提示（因为表格内容已更新）
                    EventHandlers.initializeTooltips();
                }, 500); // 模拟500ms的加载时间
            }

            // 垂直分割栏鼠标按下事件
            static handleVerticalSplitMouseDown(e) {
                EventHandlers.verticalDragging = true;
                EventHandlers.startX = e.clientX;
                const bottomSection = EventHandlers.container.querySelector('.bottom-section');
                EventHandlers.startWidth = parseInt(getComputedStyle(bottomSection).gridTemplateColumns.split(' ')[0]);
                document.body.style.cursor = 'col-resize';
                e.preventDefault();
            }

            // 鼠标释放事件
            static handleMouseUp() {
                EventHandlers.horizontalDragging = false;
                EventHandlers.verticalDragging = false;
                EventHandlers.columnResizing = false;
                document.body.style.cursor = '';
                
                // 移除列拖动的激活状态
                if (EventHandlers.container) {
                    EventHandlers.container.querySelectorAll('.resize-handle').forEach(handle => {
                        handle.classList.remove('active');
                    });
                }
            }

            

            // 初始化表格列拖动
            static initializeColumnResize() {
                const tables = EventHandlers.container.querySelectorAll('.data-table');
                
                tables.forEach(table => {
                    const headers = table.querySelectorAll('th');
                    
                    headers.forEach((header, index) => {
                        const resizeHandle = header.querySelector('.resize-handle');
                        
                        resizeHandle.addEventListener('mousedown', (e) => {
                            EventHandlers.handleColumnResizeMouseDown(e, header);
                        });
                    });
                });
                
                // 列拖动鼠标移动事件
                document.addEventListener('mousemove', EventHandlers.handleColumnResizeMouseMove);
            }

            // 列拖动鼠标按下事件
            static handleColumnResizeMouseDown(e, header) {
                EventHandlers.columnResizing = true;
                EventHandlers.startX = e.clientX;
                EventHandlers.startWidth = header.offsetWidth;
                EventHandlers.currentHeader = header;
                EventHandlers.currentTable = header.closest('.data-table');
                e.target.classList.add('active');
                e.preventDefault();
            }

            // 列拖动鼠标移动事件
            static handleColumnResizeMouseMove(e) {
                if (!EventHandlers.columnResizing || !EventHandlers.currentHeader) return;
                
                const delta = e.clientX - EventHandlers.startX;
                const newWidth = Math.max(EventHandlers.startWidth + delta, 50);
                
                EventHandlers.currentHeader.style.width = `${newWidth}px`;
                
                // 调整表格布局
                const headers = EventHandlers.currentTable.querySelectorAll('th');
                const tableWidth = EventHandlers.currentTable.offsetWidth;
                const totalWidth = Array.from(headers).reduce((sum, h) => sum + h.offsetWidth, 0);
                
                if (totalWidth > tableWidth) {
                    EventHandlers.currentTable.style.width = `${totalWidth}px`;
                }
            }

            // 初始化作业ID链接点击事件
            static initializeJobIdLinks(testApexHandler) {
                // 使用事件委托，因为表格内容可能动态更新
                EventHandlers.container.addEventListener('click', (e) => {
                    // 检查是否点击了作业ID链接
                    if (e.target.classList.contains('job-id-link')) {
                        e.preventDefault();
                        const jobId = e.target.getAttribute('data-job-id');
                        EventHandlers.handleJobIdClick(jobId, testApexHandler);
                    }
                    
                    // 检查是否点击了清除筛选按钮
                    if (e.target.classList.contains('clear-filter-btn')) {
                        e.preventDefault();
                        testApexHandler.clearMethodsFilter();
                    }
                });
            }

            // 初始化覆盖率搜索
            static initializeCoverageSearch(testApexHandler) {
                const searchBox = EventHandlers.container.querySelector('#coverage-search');
                
                if (!searchBox) return;
                
                // 添加防抖处理
                let debounceTimer;
                searchBox.addEventListener('input', (e) => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        testApexHandler.populateCoverageTable(e.target.value);
                    }, 300);
                });
            }

            // 处理作业ID点击事件
            static handleJobIdClick(jobId, testApexHandler) {
                console.log(`点击了作业ID: ${jobId}`);
                
                // 更新测试方法表格
                testApexHandler.populateMethodsByJobId(jobId);
                
                // 高亮显示对应的作业行
                EventHandlers.highlightJobRow(jobId);
            }

            // 高亮显示对应的作业行
            static highlightJobRow(jobId) {
                // 移除之前的高亮
                EventHandlers.container.querySelectorAll('.job-row-highlight').forEach(row => {
                    row.classList.remove('job-row-highlight');
                });
                
                // 添加新的高亮
                const jobLink = EventHandlers.container.querySelector(`.job-id-link[data-job-id="${jobId}"]`);
                if (jobLink) {
                    const jobRow = jobLink.closest('tr');
                    if (jobRow) {
                        jobRow.classList.add('job-row-highlight');
                        
                        // 自动滚动到高亮的行
                        jobRow.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                }
            }

            // 添加所有事件监听器
            static addAllEventListeners(testApexHandler) {
                EventHandlers.initializeHorizontalSplit();
                EventHandlers.initializeVerticalSplit();
                EventHandlers.initializeColumnResize();
                EventHandlers.initializeTooltips();
                EventHandlers.initializeCoverageSearch(testApexHandler);
                EventHandlers.initializeRefreshButtons(testApexHandler); // 新增
                EventHandlers.initializeJobIdLinks(testApexHandler); // 新增

                // 添加全局鼠标释放事件
                document.addEventListener('mouseup', EventHandlers.handleMouseUp);

                // click class="id-cell"
                document.addEventListener('click', function(e) {
                    if (e.target && e.target.classList.contains('id-cell')) {
                        const logId = e.target.getAttribute('data-log-id');
                        if (logId) {
                            tools.openApexLog(logId);
                        }
                    }
                });
            }

            // 清理所有事件监听器
            static cleanup() {
                // 移除全局事件监听器
                document.removeEventListener('mousemove', EventHandlers.horizontalMouseMoveHandler);
                document.removeEventListener('mousemove', EventHandlers.verticalMouseMoveHandler);
                document.removeEventListener('mousemove', EventHandlers.handleColumnResizeMouseMove);
                document.removeEventListener('mouseup', EventHandlers.handleMouseUp);
                
                // 重置状态
                EventHandlers.horizontalDragging = false;
                EventHandlers.verticalDragging = false;
                EventHandlers.columnResizing = false;
                EventHandlers.currentHeader = null;
                EventHandlers.currentTable = null;
            }
        }

        // 主处理器类
        class TestApexHandler {
            constructor(containerId = 'apexhandlerContainer') {
                this.containerId = containerId;
                this.isInitialized = false;
                this.htmlContent = '';
            }

            // 初始化方法
            init() {
                if (this.isInitialized) return;
                
                // 生成HTML内容
                this.htmlContent = this.generateHtml();
                this.isInitialized = true;
                
                return this;
            }

            // 获取HTML内容
            getHtml() {
                if (!this.isInitialized) {
                    this.init();
                }
                return this.htmlContent;
            }

            // 渲染页面到指定容器
            render() {
                const container = document.getElementById(this.containerId);
                if (!container) {
                    console.error(`容器 ${this.containerId} 不存在`);
                    return;
                }
                
                // 清理现有的事件监听器
                EventHandlers.cleanup();
                
                // 设置容器并渲染内容
                container.innerHTML = this.getHtml();
                EventHandlers.setContainer(container);
                this.initializePage();
            }

            // 销毁组件
            destroy() {
                EventHandlers.cleanup();
                const container = document.getElementById(this.containerId);
                if (container) {
                    container.innerHTML = '';
                }
                this.isInitialized = false;
            }

            // 生成HTML结构
            generateHtml() {
                return `
                <div class="container">
                    <!-- 上下分割布局 -->
                    <div class="main-split">
                        
                        
                        <!-- 上部分：测试方法表格 -->
                        <div class="top-section">
                            <div class="section-header">
                                <div class="section-title">测试方法执行详情</div>
                                <button class="refresh-btn" data-table="methods">刷新</button>
                            </div>
                            <div class="table-container">
                                <table class="data-table" id="methods-table">
                                    <thead>
                                        <tr>
                                            <th width="15%">Class <div class="resize-handle"></div></th>
                                            <th width="15%">Method <div class="resize-handle"></div></th>
                                            <th width="10%">Duration <div class="resize-handle"></div></th>
                                            <th width="15%">Timestamp <div class="resize-handle"></div></th>
                                            <th width="10%">Result <div class="resize-handle"></div></th>
                                            <th width="10%">Log ID <div class="resize-handle"></div></th>
                                            <th width="15%">Errors <div class="resize-handle"></div></th>
                                            <th width="10%">Stack Track <div class="resize-handle"></div></th>
                                        </tr>
                                    </thead>
                                    <tbody id="methods-table-body">
                                        <!-- 数据将通过JavaScript填充 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="split-handle"></div>
                        
                        <!-- 下部分：左右分割布局 -->
                        <div class="bottom-section">
                            <div class="vertical-split-handle"></div>
                            
                            <!-- 左面板：作业表格 -->
                            <div class="left-panel">
                                <div class="section-header">
                                    <div class="section-title">测试作业状态</div>
                                    <button class="refresh-btn" data-table="jobs">刷新</button>
                                </div>
                                <div class="table-container">
                                    <table class="data-table" id="jobs-table">
                                        <thead>
                                            <tr>
                                                <th width="10%">ID <div class="resize-handle"></div></th>
                                                <th width="12%">Status <div class="resize-handle"></div></th>
                                                <th width="10%">Failed <div class="resize-handle"></div></th>
                                                <th width="10%">Total <div class="resize-handle"></div></th>
                                                <th width="18%">Async Job ID/Test Class <div class="resize-handle"></div></th>
                                                <th width="15%">Queued Time <div class="resize-handle"></div></th>
                                                <th width="12%">Duration <div class="resize-handle"></div></th>
                                                <th width="13%">User <div class="resize-handle"></div></th>
                                            </tr>
                                        </thead>
                                        <tbody id="jobs-table-body">
                                            <!-- 数据将通过JavaScript填充 -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- 右面板：覆盖率表格 -->
                            <div class="right-panel">
                                <div class="section-header">
                                    <div class="section-title">代码覆盖率</div>
                                    <input type="text" class="search-box" id="coverage-search" placeholder="搜索类名...">
                                    <button class="refresh-btn" data-table="coverage">刷新</button>
                                </div>
                                <div class="table-container">
                                    <table class="data-table" id="coverage-table">
                                        <thead>
                                            <tr>
                                                <th width="40%">Class <div class="resize-handle"></div></th>
                                                <th width="30%">Percent <div class="resize-handle"></div></th>
                                                <th width="30%">Lines <div class="resize-handle"></div></th>
                                            </tr>
                                        </thead>
                                        <tbody id="coverage-table-body">
                                            <!-- 数据将通过JavaScript填充 -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tooltip" id="global-tooltip"></div>`;
            }

            // 初始化页面功能
            initializePage() {
                // 填充表格数据
                this.populateTables();
                
                // 添加所有事件监听器
                EventHandlers.addAllEventListeners(this);
                
                console.log("TestApexHandler 页面初始化完成");
            }

            // 填充表格数据
            populateTables() {
                this.populateMethodsTable();
                this.populateJobsTable();
                this.populateCoverageTable();
            }

            // 根据作业ID刷新测试方法表格
            async populateMethodsByJobId(jobId) {
                const methods = await DataProvider.getTestMethods(jobId);
                const methodsTableBody = document.querySelector(`#${this.containerId} #methods-table-body`);
                if (!methodsTableBody) return;
                
                // 清空现有数据
                methodsTableBody.innerHTML = '';
                
                // 添加作业ID筛选提示
                if (methods.length === 0) {
                    methodsTableBody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 20px;">
                                作业 ${jobId} 没有找到相关的测试方法
                            </td>
                        </tr>`;
                    return;
                }
                
                // 添加筛选提示行
                methodsTableBody.innerHTML = `
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="8" style="font-weight: bold; color: #3498db;">
                            📋 显示作业 ${jobId} 的测试方法 (共 ${methods.length} 条)
                            <button class="clear-filter-btn" style="float: right; margin-left: 10px;">清除筛选</button>
                        </td>
                    </tr>
                `;
                
                // 添加数据行
                methodsTableBody.innerHTML += methods.map(method => `
                    <tr>
                        <td title="${method.class}">${method.class}</td>
                        <td title="${method.method}">${method.method}</td>
                        <td title="${method.duration}">${method.duration}</td>
                        <td title="${method.timestamp}">${method.timestamp}</td>
                        <td>
                            <span class="status-badge ${this.getStatusClass(method.result)}">
                                ${method.result}
                            </span>
                        </td>
                        <td title="${method.logId}">${method.logId}</td>
                        <td title="${method.errors}">${method.errors || '-'}</td>
                        <td title="${method.stackTrack}">${method.stackTrack || '-'}</td>
                    </tr>
                `).join('');
                
                // 重新初始化工具提示
                setTimeout(() => {
                    EventHandlers.initializeTooltips();
                }, 100);
            }

            // 清除筛选，显示所有测试方法
            clearMethodsFilter() {
                this.populateMethodsTable();
            }

            // 填充测试方法表格
            async populateMethodsTable(jobId='1') {
                const methods = await DataProvider.getTestMethods(jobId);
                const methodsTableBody = document.querySelector(`#${this.containerId} #methods-table-body`);
                if (!methodsTableBody) return;

                 // 清空现有数据
                methodsTableBody.innerHTML = '';

                // 添加作业ID筛选提示
                if (methods.length === 0) {
                    methodsTableBody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 20px;">
                                作业 ${jobId} 没有找到相关的测试方法
                            </td>
                        </tr>`;
                    return;
                }

                // 添加筛选提示行
                methodsTableBody.innerHTML = `
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="8" style="font-weight: bold; color: #3498db;">
                            📋 显示作业 ${jobId} 的测试方法 (共 ${methods.length} 条)
                            <button class="clear-filter-btn" style="float: right; margin-left: 10px;">清除筛选</button>
                        </td>
                    </tr>
                `;

                methodsTableBody.innerHTML += methods.map(method => `
                    <tr>
                        <td title="${method.class}">${method.class}</td>
                        <td title="${method.method}">${method.method}</td>
                        <td title="${method.duration}">${method.duration}</td>
                        <td title="${method.timestamp}">${method.timestamp}</td>
                        <td>
                            <span class="status-badge ${this.getStatusClass(method.result)}">
                                ${method.result}
                            </span>
                        </td>
                        <td title="${method.logId}" data-log-id="${method.logId}" class="id-cell">${method.logId}</td>
                        <td title="${method.errors}">${method.errors || '-'}</td>
                        <td title="${method.stackTrack}">${method.stackTrack || '-'}</td>
                    </tr>
                `).join('');

                 // 重新初始化工具提示
                setTimeout(() => {
                    EventHandlers.initializeTooltips();
                }, 100);
            }

            // 填充作业表格
            async populateJobsTable() {
                const jobs = await DataProvider.getJobs();
                const jobsTableBody = document.querySelector(`#${this.containerId} #jobs-table-body`);
                if (!jobsTableBody) return;
                
                jobsTableBody.innerHTML = jobs.map(job => `
                    <tr>
                        <td title="${job.id}" data-log-id="${job.id}" class="id-cell">${job.id}</td>
                        <td>
                            <span class="status-badge ${this.getStatusClass(job.status)}">
                                ${job.status}
                            </span>
                        </td>
                        <td title="${job.failed}">${job.failed}</td>
                        <td title="${job.total}">${job.total}</td>
                        <td title="${job.asyncJobId}" data-log-id="${job.asyncJobId}" class="id-cell">
                            <a href="javascript:void(0)" 
                                class="job-id-link" 
                                data-job-id="${job.asyncJobId}"
                                title="点击查看此作业的测试方法">${job.asyncJobId}</a>
                        </td>
                        <td title="${job.queuedTime}">${job.queuedTime}</td>
                        <td title="${job.duration}">${job.duration}</td>
                        <td title="${job.user}">${job.user}</td>
                    </tr>
                `).join('');
            }

            // 填充覆盖率表格（支持搜索）
            async populateCoverageTable(searchTerm = '') {
                const coverages = await DataProvider.getCoverages();
                const coverageTableBody = document.querySelector(`#${this.containerId} #coverage-table-body`);
                if (!coverageTableBody) return;
                
                // 过滤数据
                const filteredCoverages = searchTerm 
                    ? coverages.filter(coverage => 
                        coverage.class.toLowerCase().includes(searchTerm.toLowerCase()))
                    : coverages;
                
                coverageTableBody.innerHTML = filteredCoverages.map(coverage => `
                    <tr>
                        <td title="${coverage.class}">${coverage.class}</td>
                        <td title="${coverage.percent}">
                            <div style="display: flex; align-items: center;">
                                <div style="width: 100%; background-color: #e0e0e0; height: 8px; border-radius: 4px; margin-right: 8px;">
                                    <div style="width: ${coverage.percent}; background-color: ${this.getCoverageColor(coverage.percent)}; height: 100%; border-radius: 4px;"></div>
                                </div>
                                ${coverage.percent}
                            </div>
                        </td>
                        <td title="${coverage.lines}">${coverage.lines}</td>
                    </tr>
                `).join('');
            }

            // 刷新指定表格
            refreshTable(tableType) {
                switch(tableType) {
                    case 'methods':
                        this.populateMethodsTable();
                        break;
                    case 'jobs':
                        this.populateJobsTable();
                        break;
                    case 'coverage':
                        this.populateCoverageTable();
                        break;
                    default:
                        console.warn(`未知的表格类型: ${tableType}`);
                }
                
                // 重新初始化工具提示
                if (EventHandlers.container) {
                    setTimeout(() => {
                        EventHandlers.initializeTooltips();
                    }, 100);
                }
            }

            // 获取状态对应的CSS类
            getStatusClass(status) {
                if (status.includes('Passed') || status.includes('Completed')) {
                    return 'status-passed';
                } else if (status.includes('Failed')) {
                    return 'status-failed';
                } else if (status.includes('Running')) {
                    return 'status-running';
                } else if (status.includes('Queued')) {
                    return 'status-queued';
                }
                return '';
            }

            // 获取覆盖率颜色
            getCoverageColor(percent) {
                const numericPercent = parseInt(percent);
                if (numericPercent >= 90) return '#2ecc71';
                if (numericPercent >= 80) return '#3498db';
                if (numericPercent >= 70) return '#f39c12';
                return '#e74c3c';
            }
        }


    class ApexhandlerSyles {
        getStyles() {
            return `<style>
        /* 所有样式都限定在 #apexhandlerContainer 内 */
        #apexhandlerContainer {
            height: 100vh;
            overflow: hidden;
            background-color: #f5f7fa;
        }
        
        #apexhandlerContainer * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        #apexhandlerContainer .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 10px;
            gap: 10px;
        }

        /* 上下分割布局 */

        /* 修改后的CSS */
        #apexhandlerContainer .main-split {
            display: grid;
            grid-template-rows: 2fr auto 1fr; /* 添加auto用于split-handle */
            height: 100%;
            position: relative;
        }

        #apexhandlerContainer .split-handle {
            height: 10px;
            background-color: #ddd;
            cursor: row-resize;
            z-index: 10;
            transition: background-color 0.2s;
            border-radius: 3px;
            margin: 5px 0; /* 添加上下间距 */
            position: relative; /* 改为相对定位 */
        }

        #apexhandlerContainer .split-handle:hover {
            background-color: #3498db;
        }

        /* 确保top-section和bottom-section在grid中的位置正确 */
        #apexhandlerContainer .top-section {
            grid-row: 1;
        }

        #apexhandlerContainer .bottom-section {
            grid-row: 3;
        }

        #apexhandlerContainer .top-section, 
        #apexhandlerContainer .bottom-section {
            overflow: hidden;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
        }

        /* 底部左右分割布局 */
        #apexhandlerContainer .bottom-section {
            display: grid;
            grid-template-columns: 9fr 3fr;
            gap: 10px;
            position: relative;
        }

        #apexhandlerContainer .vertical-split-handle {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 10px;
            background-color: #ddd;
            cursor: col-resize;
            z-index: 10;
            transition: background-color 0.2s;
            border-radius: 3px;
            left: calc(75% - 5px); /* 9:3比例 */
        }

        #apexhandlerContainer .vertical-split-handle:hover {
            background-color: #3498db;
        }

        #apexhandlerContainer .left-panel, 
        #apexhandlerContainer .right-panel {
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* 表格容器样式 */
        #apexhandlerContainer .table-container {
            flex: 1;
            overflow: auto;
            padding: 15px;
        }

        #apexhandlerContainer .section-header {
            padding: 15px 15px 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #apexhandlerContainer .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
        }

        #apexhandlerContainer .search-box {
            padding: 6px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            width: 200px;
        }

        /* 表格样式 */
        #apexhandlerContainer .data-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        #apexhandlerContainer .data-table th {
            background-color: #f8f9fa;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
            position: relative;
            user-select: none;
            cursor: col-resize;
        }

        #apexhandlerContainer .data-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eaeaea;
            color: #555;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        #apexhandlerContainer .data-table tr:hover {
            background-color: #f8f9fa;
        }

        /* 列拖动指示器 */
        #apexhandlerContainer .resize-handle {
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            cursor: col-resize;
            background-color: transparent;
        }

        #apexhandlerContainer .resize-handle:hover, 
        #apexhandlerContainer .resize-handle.active {
            background-color: #3498db;
        }

        /* 状态指示器 */
        #apexhandlerContainer .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        #apexhandlerContainer .status-passed {
            background-color: #d4edda;
            color: #155724;
        }

        #apexhandlerContainer .status-failed {
            background-color: #f8d7da;
            color: #721c24;
        }

        #apexhandlerContainer .status-running {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        #apexhandlerContainer .status-queued {
            background-color: #fff3cd;
            color: #856404;
        }

        /* 链接 */
        #apexhandlerContainer .id-cell {
            cursor: pointer;
            color: #3498db !important;
        }

        #apexhandlerContainer .id-cell:hover {
            text-decoration: underline;
        }

        /* 工具提示 */
        #apexhandlerContainer .tooltip {
            position: absolute;
            background-color: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 13px;
            z-index: 1000;
            max-width: 400px;
            word-wrap: break-word;
            white-space: normal;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: none;
        }

        /* 刷新按钮样式 */
        #apexhandlerContainer .refresh-btn {
            padding: 6px 12px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-left: 10px;
        }

        #apexhandlerContainer .refresh-btn:hover {
            background-color: #2980b9;
        }

        #apexhandlerContainer .refresh-btn:active {
            background-color: #1c6ea4;
        }

        #apexhandlerContainer .refresh-btn:disabled {
            background-color: #95a5a6;
            cursor: not-allowed;
        }

        /* 覆盖率表格的搜索框和按钮布局 */
        #apexhandlerContainer .right-panel .section-header > div {
            display: flex;
            gap: 8px;
        }

        /* 作业ID链接样式 */
        #apexhandlerContainer .job-id-link {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: 3px;
            transition: all 0.2s;
        }

        #apexhandlerContainer .job-id-link:hover {
            color: #2980b9;
            background-color: #f0f7ff;
            text-decoration: underline;
        }

        /* 作业行高亮样式 */
        #apexhandlerContainer .job-row-highlight {
            background-color: #e8f4ff !important;
            border-left: 3px solid #3498db;
        }

        #apexhandlerContainer .job-row-highlight td {
            font-weight: 500;
        }

        /* 清除筛选按钮样式 */
        #apexhandlerContainer .clear-filter-btn {
            padding: 4px 8px;
            background-color: #95a5a6;
            color: white;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        #apexhandlerContainer .clear-filter-btn:hover {
            background-color: #7f8c8d;
        }
    </style>`
        }
    }