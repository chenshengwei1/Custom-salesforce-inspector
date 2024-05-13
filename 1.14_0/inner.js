/* global React ReactDOM */
import {AutoComplete1} from "./csw/AutoComplete1.js";
import {MetadateTree} from "./csw/MetadateTree.js";

import {QueryMananger} from "./csw/QueryManager.js";


//const  {sfConn, apiVersion,Enumerable, DescribeInfo, copyToClipboard, initScrollTable}=window.globalData;

$(document).ready(function(){
    // autocomplete
    window.autocompleteResults=function(datalist){
        autoComplete1.render(datalist.map(e=>e.value));
    }
    let autoComplete1 = new AutoComplete1('query',()=>{
        //return window.autocompleteResults.map(e=>e.value);
        return [];
    });
    autoComplete1.createApi();
});


{

    let args = new URLSearchParams(location.search.slice(1));

    console.log('url args=' + args);
    let sfHost = args.get("host");
    //initButton(sfHost, true);



    let tree = new QueryMananger({sfHost, args});
    tree.start().then(() => {

      let metaTree = new MetadateTree(tree);
      metaTree.createHead();
    });

}


var vm = new Vue({
    el: '#showallmetadata',
    data: {
        site: "菜鸟教程",
        url: "www.runoob.com",
        alexa: "10000"
    }
  })