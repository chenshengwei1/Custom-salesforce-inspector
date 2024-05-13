/* global React ReactDOM */
import {Notifiable} from "./csw/Notifiable.js";
import {AutoComplete1} from "./csw/AutoComplete1.js";
import {ResizeTable} from "./csw/ResizeTable.js";
import {MetadateTree} from "./csw/MetadateTree.js";

import {ShowOrderTable} from "./csw/ShowOrderTable.js";
import {QueryMananger} from "./csw/QueryManager.js";
import {SObjectAllDataTable} from "./csw/SObjectAllDataTable.js";
import {SObjectTable} from "./csw/SObjectTable.js";
import {DataExpendAsTree} from "./csw/DataExpendAsTree.js";
import {ReportTable} from "./csw/ReportTable.js";
import {ApplicationLog} from "./csw/ApplicationLog1.js";
import {RecordInfo} from "./csw/RecordInfo.js";
import {CopytoExcel} from "./csw/CopytoExcel.js";
import {StockBalance} from "./csw/StockBalance.js";
import {OrderSVGFlow} from "./csw/OrderSVGFlow.js";




//const  {sfConn, apiVersion,Enumerable, DescribeInfo, copyToClipboard, initScrollTable}=window.globalData;

$(document).ready(function(){
    // autocomplete
    window.autocompleteResults=function(datalist){
        //autoComplete1.render(datalist.map(e=>e.value));
    }
    let autoComplete1 = new AutoComplete1('query',()=>{
        //return window.autocompleteResults.map(e=>e.value);
        return [];
    });
   // autoComplete1.createApi();
    //autoComplete1.start(AutoComplete1);

});




let items = [{
    name:  'tree',
    label: 'Tree',
    class: DataExpendAsTree
},{
    name:  'table',
    label: 'Show SObject Information',
    class: SObjectTable
},{
    name:  'sobjectdata',
    label: 'Show All Records',
    class: SObjectAllDataTable
},{
    name:  'metadata',
    label: 'Show Metadata',
    class: MetadateTree
},{
    name:  'showorder',
    label: 'Show Order and Relation',
    class: ShowOrderTable
},{
    name:  'showreport',
    label: 'Report',
    class: ReportTable
},{
    name:  'applicationLog',
    label: 'Application Log',
    class: ApplicationLog
},{
    name:  'recordallinfo',
    label: 'Record Info',
    class: RecordInfo
},{
    name:  'copytoexcel',
    label: 'Copy to Excel',
    class: CopytoExcel
},{
    name:  'mapperStockbalance',
    label: 'Stock Balance',
    class: StockBalance
},{
    name:  'OrderSVGFlow',
    label: 'Order Flow',
    class: OrderSVGFlow
}];


for (let item of items){
    $('.top-btn').append(`<button class="tablinks" name="${item.name}">${item.label}</button>`)
    $('.top-tab').append(`<div id="${item.name}" class="tabcontent">
        <div id="${item.name}info"></div>
    </div>`);
    item.rootId = item.name + 'info';
}

function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

$('.tab .tablinks').on('click', (event)=>{
    openCity(event, event.target.name);
    let item = items.find(e => e.name == event.target.name);
    if (item?.tab?.active){
        item.tab.active();
    }
})
let s = document.getElementById("dataexportbtn");
if (s){
    document.getElementById("dataexportbtn").click();
}





{
    window.updateMessageBar = ()=>{};
    let args = new URLSearchParams(location.search.slice(1));

    console.log('url args=' + args);
    let sfHost = args.get("host");
    let sobjectName = args.get("objectType");
    let recordId = args.get("recordId");
    initButton(sfHost, true);



    let tree = new QueryMananger({sfHost, args});
    tree.start().then(() => {

        // let tabs = [new SObjectTable(tree),
        //     new DataExpendAsTree(tree),
        //     new SObjectAllDataTable(tree),
        //     new MetadateTree(tree),
        //     new ShowOrderTable(tree),
        //     new ReportTable(tree),
        //     new ApplicationLog(tree),
        //     new RecordInfo(tree)];
        let tabs =[];
      for (let item of items){
        try{
            let tab = new item.class(tree);
            tab.createHead(item.rootId);
            tabs.push(tab);
            item.tab = tab;
        }catch(e){
            console.log(e);
        }
      }
      tabs[5].metadateTree = tabs[3];
      tabs[1].addListener('update', (e)=>{
         let {reocrdId, sobject} = e.data;
         tab.doUpdaate(reocrdId, sobject);
      })

      new ResizeTable('datatable').start();
      $('#Retry').on('click',()=>{
        tabs[1].doUpdate(sobjectName, recordId);
      })


    });

    let lastupdateProcessing = {message:'', isProcessing:false, url:'', title:'',status:'draft'};
    let sameProcessing = (p1, p2)=>{
        let keys = ['message','isProcessing', 'url', 'title'];
        for (let key of keys){
            if (key == 'message'){
                if (p1[key].message != p2[key].message){
                    return false;
                }
                continue;
            }
            if (p1[key] != p2[key]){
                return false;
            }
        }
        return true;
    }

    let getUpdateProcess =()=>{
        let updateProcessing = {message:'', isProcessing:false, url:'', title:'',status:'draft'};
        updateProcessing.title = (tree?.autocompleteResults||{}).title;
        updateProcessing.message = tree?.sfConn?.message.message != 'status 200'? tree?.sfConn?.message:{type:'info',message:''};
        let nextwork = tree?.getNetwork();
        let processingURL = Object.keys(nextwork).find(k => nextwork[k]);
        if (!processingURL){
          updateProcessing.isProcessing = false;
        }else{
          updateProcessing.isProcessing = true;
          updateProcessing.url = nextwork[processingURL];
        }
        return updateProcessing;
    }

    let updateMessageBarUI = (updateProcessing)=>{
        $('.root-message').text(updateProcessing.message.message + (updateProcessing.url?' >>>>> loading ' + updateProcessing.url:''));
        $('.root-message').removeClass('msg-info');
        $('.root-message').removeClass('msg-error');
        if (updateProcessing.message.type == 'info'){
            $('.root-message').addClass('msg-info');
        }
        if (updateProcessing.message.type == 'error'){
            $('.root-message').addClass('msg-error');
        }
        let notificationmessage = document.getElementById('notificationmessage');
        if (notificationmessage){
            notificationmessage.innerHTML = updateProcessing.title;
        }
        if (updateProcessing.isProcessing){
            $('.tab.top-btn').addClass('url-processing');
        }else{
            $('.tab.top-btn').removeClass('url-processing');
        }
    }

    let updateMessageBar = ()=>{
        let newProc = getUpdateProcess();
        if (!sameProcessing(newProc, lastupdateProcessing)){
            updateMessageBarUI(newProc);
            lastupdateProcessing = newProc;
        }
    }

    window.updateMessageBar = updateMessageBar;

    setInterval(()=>{
        updateMessageBar();
    }, 500);
}

window.filterRecords = function(records){
    return records
}


// var vm = new Vue({
//     el: '#showallmetadata',
//     data: {
//         site: "菜鸟教程",
//         url: "www.runoob.com",
//         alexa: "10000"
//     }
//   })