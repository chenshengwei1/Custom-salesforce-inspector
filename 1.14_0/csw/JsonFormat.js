
import {Tools} from "./Tools.js";

export class JSONFormat{

    constructor(dateTree){
        this.tree = dateTree;
        this.init = false;
    }

    createHead(rootId){
        this.rootId = rootId;
        let treeroot = document.getElementById(this.rootId);
        let searchAear = `
        <style>
            .jsonformat-result{
                display:flex;
            }
            .jsonformat-result .source{
                width:50%;
                height : 90vh;
            }
            .jsonformat-result .middle{
                width: 50px;
                height : 90vh;
            }

            .jsonformat-result .source textarea{
                height: 90%;
                width: 100%;
            }

            .jsonformat-result .target{
                width:auto;
                height : 90vh;
                flex-grow: 1;
            }

            .jsonformat-result .target textarea{
                height: 90%;
                width: 100%;
            }

            .jsonformat-result button{
                    text-decoration: underline;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    margin: 0;
                    padding: 10px 0;        
            }

            #jsonformat-target{
                white-space: pre;
            }
                
        </style>
        <div class="jsonformat-result">
            <div class="source" id="jsonformat-notificationmessage">
                <textarea contenteditable="true" name="" id="jsonformat-source" style="font-size: large;" class="feedback-text feedback-input"></textarea>
            </div>
            <div class="middle">
                <button class="feedback-text feedback-input btn-format">format</button>
            </div>
            <div class="target">
                <div id="jsonformat-target" style="font-size: large;" class="feedback-text feedback-input"></div>
            </div>
        </div>`
            var div = document.createElement("div");
            div.innerHTML=searchAear;
            treeroot.appendChild(div);
            this.initObjectAllDataHead();
    }


    initObjectAllDataHead(){

       $('.jsonformat-result .btn-format').on('click', ()=>{
            let source = $('#jsonformat-source').val();
            let formatText = 'source';
            try{
                formatText = JSON.stringify(JSON.parse(source), null, '\t');
            }catch(e){
                console.log(e);
            }
            $('#jsonformat-target').text(source);

       })

    }
}
