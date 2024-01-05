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
},{
    name:  'table',
    label: 'Show SObject Information',
},{
    name:  'sobjectdata',
    label: 'Show All Records',
},{
    name:  'metadata',
    label: 'Show Metadata',
},{
    name:  'showorder',
    label: 'Show Order and Relation',
},{
    name:  'showreport',
    label: 'Report',
},{
    name:  'applicationLog',
    label: 'Application Log',
}];
for (let item of items){
    $('.top-btn').append(`<button class="tablinks" name="${item.name}">${item.label}</button>`)
    $('.top-tab').append(`<div id="${item.name}" class="tabcontent">
        <div id="${item.name}info"></div>
    </div>`)
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
})
let s = document.getElementById("dataexportbtn");
if (s){
    document.getElementById("dataexportbtn").click();
}





{

    let args = new URLSearchParams(location.search.slice(1));

    console.log('url args=' + args);
    let sfHost = args.get("host");
    let sobjectName = args.get("objectType");
    let recordId = args.get("recordId");
    initButton(sfHost, true);



    let tree = new QueryMananger({sfHost, args});
    tree.start().then(() => {

      let tab = new SObjectTable(tree);
      let dataTree = new DataExpendAsTree(tree);
      let dataTable = new SObjectAllDataTable(tree);
      let metaTree = new MetadateTree(tree);
      let showorder = new ShowOrderTable(tree);
      let reportTable = new ReportTable(tree);
      let applog = new ApplicationLog(tree);
      reportTable.metadateTree = metaTree;
      dataTable.createHead();
      metaTree.createHead();
      tab.createHead();
      tab.addListener('update', (e)=>{
         let {reocrdId, sobject} = e.data;
         tab.doUpdaate(reocrdId, sobject);
      })
      dataTree.createHead();
      showorder.createHead();
      reportTable.createHead();
      applog.createHead();

      new ResizeTable('datatable').start();
      $('#Retry').on('click',()=>{
        dataTree.doUpdate(sobjectName, recordId);
      })


    });

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