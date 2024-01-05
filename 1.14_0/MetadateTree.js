//import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

export class MetadateTree{
     constructor(tree){
        this.tree = tree;
        this.allMetadata = [];
        this.metadataDetails = {};
        this.fileContents = {};
        this.currentXmlName = '';
    }
    createHead(){
        $('#metadata').html('<div id="showallmetadata"></div>')
        let treeroot = document.getElementById('showallmetadata');
        let searchAear = `
        <div class="searchresult">
            <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
            <div class="totalbar">
                <span class="sobjectAPIName"></span>
                <span class="sobjectName"></span>
            </div>

            <div id="allMetadataList">
                <div><input type="text" id="metadata-search"></div>
                <div class="content"></div>
            </div>
            <div class="metadata-sibar"><span class="metadata-sibar-btn">&lt;&lt;&lt;</span></div>
            <div id="metadataDetails">
                <div><input type="text" id="metadata-detail-search"></div>
                <div class="content"></div>
            </div>
        </div>`
        var div = document.createElement("div");
        div.innerHTML=searchAear;
        treeroot.appendChild(div);

        //$('#showallMetadata .content').html('<img src="https://img.shida66.com/upload/head_img_tmp/2019/03/29/f07aedb2fc2879994362d07e6c88b1e8.gif"></img>');
        this.tree.getAllMetadata().then(e=>{
            console.log('all metadata', e);
            $('#showallmetadata .recordsnumber').text(e.length);
            this.allMetadata = e;
            this.allMetadata = e.sort((a,b)=>{
                return a.xmlName.localeCompare(b.xmlName);
            })
            $('#allMetadataList .content').html(this.allMetadata.map((m, index)=>{
                return `<li name="${m.directoryName}" index="${index}">
                    <input type="checkbox"></input>
                    <label>${m.xmlName}(${m.directoryName})</label>
                    <button class="tablinks" name="${m.xmlName}">List</button>
                </li>`
            }))
        })

        $('.metadata-sibar-btn').on('click', ()=>{
            if ($('#allMetadataList').is('.hide')){
                $('#allMetadataList').removeClass('hide')
                $('.metadata-sibar-btn').text('<<<');
            }else{
                $('#allMetadataList').addClass('hide');
                $('.metadata-sibar-btn').text('>>>');
            }
        })

        $('#metadata-search').on('change', (event)=>{
            let text = $(event.target).val().trim().toLocaleLowerCase();
            $('#allMetadataList .content li').each((index, el)=>{
                if (!text){
                    $(el).show();
                    return;
                }
                let ind = $(el).attr('index');
                let obj = this.allMetadata[ind];
                if(obj.xmlName.toLocaleLowerCase().indexOf(text) == -1 && obj.directoryName.toLocaleLowerCase().indexOf(text) == -1){
                    $(el).hide();
                }else{
                    $(el).show();
                }
            })
        })

        $('#metadata-detail-search').on('change', (event)=>{
            let text = $(event.target).val();

            $('#metadata-detail-search .content li').each((index, el)=>{
                if (!text){
                    $(el).show();
                    return;
                }
                let ind = $(el).attr('index');
                let metadataDetails = this.metadataDetails[this.currentXmlName];
                let obj = metadataDetails[ind];
                if(obj.xmlName.toLocaleLowerCase().indexOf(text) == -1 && obj.directoryName.toLocaleLowerCase().indexOf(text) == -1){
                    $(el).hide();
                }else{
                    $(el).show();
                }
            })
        })

        $('#allMetadataList .content').on('click', 'button[name]', async (event)=>{
            let xmlName = $(event.target).attr('name').trim();
            //$('#metadataDetails .content').html('<img src="https://img.shida66.com/upload/head_img_tmp/2019/03/29/f07aedb2fc2879994362d07e6c88b1e8.gif"></img>');
            this.createProgress($('#metadataDetails .content'));
            $('#allMetadataList li.selected').removeClass('selected');
            $(event.target).parents('li').addClass('selected');
            this.currentXmlName = xmlName;

            let metadataDetails = this.metadataDetails[xmlName];
            if (!metadataDetails){
                metadataDetails = await this.tree.listMetadata(xmlName);
                if (!metadataDetails){
                    $('#metadataDetails .content').html('No avairiable metadata type ' + xmlName);
                    return;
                }
                if (!Array.isArray(metadataDetails)){
                    metadataDetails = [metadataDetails];
                }
                
                console.log('listMetadata metadata', metadataDetails);
                metadataDetails = metadataDetails.sort((a,b)=>{
                    return a.fullName.localeCompare(b.fullName);
                })

                this.metadataDetails[xmlName] = metadataDetails;
            }

            $('#metadataDetails .content').html(metadataDetails.map((m, index)=>{
                return `<ul><li name="${m.fullName}" index="${index}">
                    <label>${m.fullName}(${m.fileName})</label>
                    <button class="tablinks meta off" name="${m.fullName}" data-x-name="${xmlName}">OFF</button>
                </li></ul>`
            }))
        })

        $('#metadataDetails .content').on('click', 'button[name].meta', (event)=>{
            event.stopPropagation();
            let fileName = $(event.target).attr('name');
            let xName = $(event.target).attr('data-x-name');


            $('#metadataDetails li.selected').removeClass('selected');
            $(event.target).parents('li').addClass('selected');
            let li = $(event.target).parents('li');
            let expl = li.find('.code-example');
            if (expl == null || expl.length == 0){
                $(event.target).after(`<div class="code-example"></div>`);
                expl = li.find('.code-example');
            }

            if ($(event.target).is('.on')){
                $(event.target).removeClass('on');
                $(event.target).addClass('off');
                $(event.target).text('ON');
                expl.hide();
                return;
            }else{
                $(event.target).removeClass('off');
                $(event.target).addClass('on');
                $(event.target).text('OFF');
                expl.show();
            }

            this.createProgress(expl);

            let update = (data, isNew)=>{
                if (isNew){
                    this.fileContents[xName] = data;
                    li.removeClass('loading');
                    li.addClass('loaded');
                }
                let content = Object.keys(data||{}).map(e=>{
                    return ` <h1>${e}</h1>
                    <p class="code-example2"><xmp1>${this.wapper(data[e], e)}</xmp1></p>`
                }).join('');
                $(expl).html('<div>'+content+'<div/>');
                
            }

            if (li.is('.loading')){
                return
            }
            if (li.is('.loaded')){
                update(this.fileContents[xName]);
                return
            }
            
            li.addClass('loading');

            let selectedMetadataObjects = this.allMetadata.find(e =>e.xmlName == xName);
            let metadataFile = this.metadataDetails[xName].find(e => e.fullName == fullName);
            this.download(selectedMetadataObjects, metadataFile, (data)=>{
                $(expl).html(`
                    <div>id:${data.result.id}</div>
                    <div>done:${data.result.done}</div>
                    <div>state:${data.result.state}</div>
                    <div class="processing"></div>
                `)
                this.createProgress($(expl).find('.processing'));
            }).then(data=>{
                if (data.success){
                    update(data, true);
                }else{
                    $(expl).html(`
                        <div>id:${data.result.id}</div>
                        <div>done:${data.result.done}</div>
                        <div>state:${data.result.state}</div>
                        <div class="processing"></div>
                    `)
                    this.createProgress($(expl).find('.processing'));
                }
            });
        })
    }

    listMetadatas(){
        
    }

    createProgress(div){
        div.html(this.createSpinner('LOADING DOTS'))
    }

    createSpinner(type){
        if (type == 'GRADIENT SPINNER'){
            return `<!-- GRADIENT SPINNER -->
            <div class="spinner-box">
              <div class="circle-border">
                <div class="circle-core"></div>
              </div>  
            </div>`;
        }else if (type == 'SPINNER ORBITS'){
            return `<!-- SPINNER ORBITS -->
            <div class="spinner-box">
              <div class="blue-orbit leo">
              </div>
            
              <div class="green-orbit leo">
              </div>
              
              <div class="red-orbit leo">
              </div>
              
              <div class="white-orbit w1 leo">
              </div><div class="white-orbit w2 leo">
              </div><div class="white-orbit w3 leo">
              </div>
            </div>`;
        }else if (type == 'GRADIENT CIRCLE PLANES'){
            return `<!-- GRADIENT CIRCLE PLANES -->
            <div class="spinner-box">
              <div class="leo-border-1">
                <div class="leo-core-1"></div>
              </div> 
              <div class="leo-border-2">
                <div class="leo-core-2"></div>
              </div> 
            </div>`;
        }else if (type == 'SPINNING SQUARES'){
            return `<!-- SPINNING SQUARES -->
            <div class="spinner-box">
              <div class="configure-border-1">  
                <div class="configure-core"></div>
              </div>  
              <div class="configure-border-2">
                <div class="configure-core"></div>
              </div> 
            </div>`;
        }else if (type == 'LOADING DOTS'){
            return `<!-- LOADING DOTS... -->
            <div class="spinner-box">
              <div class="pulse-container">  
                <div class="pulse-bubble pulse-bubble-1"></div>
                <div class="pulse-bubble pulse-bubble-2"></div>
                <div class="pulse-bubble pulse-bubble-3"></div>
              </div>
            </div>`;
        }else if (type == 'SOLAR SYSTEM'){
            return `<!-- SOLAR SYSTEM -->
            <div class="spinner-box">
              <div class="solar-system">
                <div class="earth-orbit orbit">
                  <div class="planet earth"></div>
                  <div class="venus-orbit orbit">
                    <div class="planet venus"></div>
                    <div class="mercury-orbit orbit">
                      <div class="planet mercury"></div>
                      <div class="sun"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        }else if (type == 'Three Quarter Spinner'){
            return `<!-- Three Quarter Spinner -->
        
            <div class="spinner-box">
              <div class="three-quarter-spinner"></div>
            </div>`;
        }
        return `<!-- GRADIENT SPINNER -->
        <div class="spinner-box">
          <div class="circle-border">
            <div class="circle-core"></div>
          </div>  
        </div>
        
        <!-- SPINNER ORBITS -->
        <div class="spinner-box">
          <div class="blue-orbit leo">
          </div>
        
          <div class="green-orbit leo">
          </div>
          
          <div class="red-orbit leo">
          </div>
          
          <div class="white-orbit w1 leo">
          </div><div class="white-orbit w2 leo">
          </div><div class="white-orbit w3 leo">
          </div>
        </div>
        
        <!-- GRADIENT CIRCLE PLANES -->
        <div class="spinner-box">
          <div class="leo-border-1">
            <div class="leo-core-1"></div>
          </div> 
          <div class="leo-border-2">
            <div class="leo-core-2"></div>
          </div> 
        </div>
        
        <!-- SPINNING SQUARES -->
        <div class="spinner-box">
          <div class="configure-border-1">  
            <div class="configure-core"></div>
          </div>  
          <div class="configure-border-2">
            <div class="configure-core"></div>
          </div> 
        </div>
        
        <!-- LOADING DOTS... -->
        <div class="spinner-box">
          <div class="pulse-container">  
            <div class="pulse-bubble pulse-bubble-1"></div>
            <div class="pulse-bubble pulse-bubble-2"></div>
            <div class="pulse-bubble pulse-bubble-3"></div>
          </div>
        </div>
        
        <!-- SOLAR SYSTEM -->
        <div class="spinner-box">
          <div class="solar-system">
            <div class="earth-orbit orbit">
              <div class="planet earth"></div>
              <div class="venus-orbit orbit">
                <div class="planet venus"></div>
                <div class="mercury-orbit orbit">
                  <div class="planet mercury"></div>
                  <div class="sun"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Three Quarter Spinner -->
        
        <div class="spinner-box">
          <div class="three-quarter-spinner"></div>
        </div>`
    }

    wapper(str, e){
        if (!(typeof str == 'string')){
            return str;
        }
        let ret = str.replaceAll(/<[\w\d-]+[>]?/igm, (e)=>{
            return `<span class="ele-start">${e}</span>`
        })

        

        let newTokens = [];
        if (e.match(/\.css$/i)){
            newTokens = new CSSToken().parse(str);
        } else if (e.match(/\.js$/i)){
            newTokens = new JSToken().parse(str);
        }else if (e.match(/\.sql$/i)){
            newTokens = new SQLToken().parse(str);
        }else{
            newTokens = new XMLToken().parse(str);
        }

        
        console.log(' newTokens =', newTokens);
        console.log(' newTokens =', newTokens.map(e=>e.value).join(''));
        return newTokens.map(e=>{
            return `<span class="token t-${e.type}">${e.value.replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll(' ','&nbsp;').replaceAll('\n','<br/>')}</span>`;
        }).join('').split('<br/>').map((e, index) => e + `<br/><span class="token rownumber">${index+1}</span>`).join('');
    }

    

    toStartElementToken(str){

        let matches = str.matchAll(/<[\?]?[\w\d-]+[>]?/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'elementStart', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.toEndElementToken(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.toAttributeToken(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }

    toCommentToken(str){

        let matches = str.matchAll(/<!--.*?-->/igs);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'comment', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.toStartElementToken(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.toStartElementToken(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }

    toAttributeToken(str){

        let matches = str.matchAll(/([\w\d-\:]+)(=["{])(.*?)(["}])/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[1].length, type:'attrbiute1', value:match[1]})
            tokens.push({start: match.index+match[1].length, length:match[2].length, type:'attrbiute2', value:match[2]})
            tokens.push({start: match.index+match[1].length+match[2].length, length:match[3].length, type:'attrbiute3', value:match[3]})
            tokens.push({start: match.index+match[1].length+match[2].length+match[3].length, length:match[4].length, type:'attrbiute4', value:match[4]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.toEndElementToken(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.toEndElementToken(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }

    toEndElementToken(str){
        /**
         *  >,/>, </a>
         */
        let matches = str.matchAll(/<\/[\w\d_-]+>/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'elementEnd', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.toEndElementToken2(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.toEndElementToken2(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }

    toEndElementToken2(str){
        /**
         *  >,/>, </a>
         */
        let matches = str.matchAll(/\s*[\\]?>\s+/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'elementEnd', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(this.toNoneToken(i, str.length - i, str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(this.toNoneToken(i, currToken.start - i, str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }

    toNoneToken(start, len, val){
        return {start: start, length:len, type:'none', value:val};
    }

    download(selectedMetadataObjects, metadataFile, loogwait){
        let fileMaps = {success:true};
        return new Promise((solved)=>{

            this.tree.retrieveMetadata([metadataFile], [selectedMetadataObjects], loogwait).then(result =>{
                if(!result.success){
                    fileMaps.result = result.result;
                    fileMaps.success = false;
                    solved(fileMaps);
                    return;
                }
                

                let cb = (blob)=>{
    
                    JSZip.loadAsync(blob).then(function(zip){
                        let prom = [];
                        Object.keys(zip.files).forEach(function(filename){
                            let e = zip.files[filename].async('string').then(function (fileData) {
                                console.log('fileData = ', fileData) // These are your file contents      
                                fileMaps[filename] = fileData;
                            })

                            prom.push(e);
    
                            var content = zip.files[filename];
                            var dest =  filename;
        
                            console.log('dest : ', dest);
                            console.log('content : ', content);
                        });
                        Promise.all(prom).then(e=>{
                            solved(fileMaps);
                        })
                    });
    
                    blob.arrayBuffer().then(data =>
                         console.log(data)
                         );
                    blob.text().then(s=>{
                        console.log(s);
                    });
                }
                let xhrReq = new XMLHttpRequest();
                xhrReq.open('GET', result.downloadLink, true);
                xhrReq.responseType = 'blob';
                xhrReq.onload = ()=>{
                    if (xhrReq.status == 200){
                        cb(xhrReq.response)
                    }
                }
                xhrReq.send();
            });
        })
        
    }
}

class Token{
    start;
    length;
    type;
    value;
}

class TokenHandler{
    nextToken = []
    nextParse(str){
        for (let tk of this.nextToken){
            let s = tk.parse(str);
            if (s.length > 0){
                return s;
            }
        }
        return new NoneToken().parse(str);
    }

    next(t){
        this.nextToken.push(t);
        return t;
    }
}

class CommentToken extends TokenHandler{
    nextToken = [];
    parse(str){
        let matches = str.matchAll(/<!--.*?-->/igs);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'comment', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}

class XMLEndElementToken extends TokenHandler{
    parse(str){
        /**
         *  >,/>, </a>
         */
        let matches = str.matchAll(/<\/[\w\d_-]+>/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'elementEnd', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}

class XMLEndElementToken2 extends TokenHandler{
    parse(str){
        /**
         *  >,/>, </a>
         */
        let matches = str.matchAll(/\s*[\\]?>\s+/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'elementEnd', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}


class XMLAttrbiuteToken extends TokenHandler{
    parse(str){
        let matches = str.matchAll(/([\w\d-\:]+)(=["{])(.*?)(["}])/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[1].length, type:'attrbiute1', value:match[1]})
            tokens.push({start: match.index+match[1].length, length:match[2].length, type:'attrbiute2', value:match[2]})
            tokens.push({start: match.index+match[1].length+match[2].length, length:match[3].length, type:'attrbiute3', value:match[3]})
            tokens.push({start: match.index+match[1].length+match[2].length+match[3].length, length:match[4].length, type:'attrbiute4', value:match[4]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}


class XMLStartElementeToken extends TokenHandler{
    parse(str){
        let matches = str.matchAll(/<[\?]?[\w\d-]+[>]?/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'elementStart', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}


class CSSBlockToken extends TokenHandler{
    childrenToken  = new CSSStyleToken();
    parse(str){
        let matches = str.matchAll(/(\S.*?)({)(.*?)(})/igms);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[1].length, type:'cssblock1', value:match[1]})
            tokens.push({start: match.index + match[1].length, length:match[2].length, type:'cssblock2', value:match[2]})
            tokens.push({start: match.index + match[1].length + match[2].length, length:match[3].length, type:'cssblock3', value:match[3], son : this.childrenToken.parse(match[3])})
            tokens.push({start: match.index + match[1].length + match[2].length + match[3].length, length:match[4].length, type:'cssblock4', value:match[4]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens.map(e =>{
            return e.type =='cssblock3'?e.son:e;
        }).flat();
    }
}

class CSSStyleToken extends TokenHandler{
    parse(str){
        let matches = str.matchAll(/(\S.*?)(:)(.*?)(;)/igms);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[1].length, type:'cssstyle1', value:match[1]})
            tokens.push({start: match.index + match[1].length, length:match[2].length, type:'cssstyle2', value:match[2]})
            tokens.push({start: match.index + match[1].length + match[2].length, length:match[3].length, type:'cssstyle3', value:match[3]})
            tokens.push({start: match.index + match[1].length + match[2].length + match[3].length, length:match[4].length, type:'cssstyle4', value:match[4]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}


class CSSCommentToken extends TokenHandler{
    nextToken = [];
    parse(str){
        let matches = str.matchAll(/\/\*.*?\*\//igs);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'comment', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}



class JSImportToken extends TokenHandler{
    nextToken = [];
    parse(str){
        let matches = str.matchAll(/import\s.*?from\s["|'][\w\d-_\/]+["|'][;]?\n/ig);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'import', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}


class SQLKeywordToken extends TokenHandler{
    nextToken = [];
    parse(str){
       
        let matches = str.matchAll(/\b(ACCESS|ELSE|MODIFY|START|ADD|EXCLUSIVE|NOAUDIT|SELECT|ALL|EXISTS|NOCOMPRESS|SESSION|ALTER|FILE|NOT|SET|AND|FLOAT|NOTFOUND|SHARE|ANY|FOR|NOWAIT|SIZE|ARRAYLEN|FROM|NULL|SMALLINT|AS|GRANT|NUMBER|SQLBUF|ASC|GROUP|OF|SUCCESSFUL|AUDIT|HAVING|OFFLINE|SYNONYM|BETWEEN|IDENTIFIED|ON|SYSDATE|BY|IMMEDIATE|ONLINE|TABLE|CHAR|IN|OPTION|THEN|CHECK|INCREMENT|OR|TO|CLUSTER|INDEX|ORDER|TRIGGER|COLUMN|INITIAL|PCTFREE|UID|COMMENT|INSERT|PRIOR|UNION|COMPRESS|INTEGER|PRIVILEGES|UNIQUE|CONNECT|INTERSECT|PUBLIC|UPDATE|CREATE|INTO|RAW|USER|CURRENT|IS|RENAME|VALIDATE|DATE|LEVEL|RESOURCE|VALUES|DECIMAL|LIKE|REVOKE|VARCHAR|DEFAULT|LOCK|ROW|VARCHAR2|DELETE|LONG|ROWID|VIEW|DESC|MAXEXTENTS|ROWLABEL|WHENEVER|DISTINCT|MINUS|ROWNUM|WHERE|DROP|MODE|ROWS|WITH|ADMIN|CURSOR|FOUND|MOUNT|AFTER|CYCLE|FUNCTION|NEXT|ALLOCATE|DATABASE|GO|NEW|ANALYZE|DATAFILE|GOTO|NOARCHIVELOG|ARCHIVE|DBA|GROUPS|NOCACHE|ARCHIVELOG|DEC|INCLUDING|NOCYCLE|AUTHORIZATION|DECLARE|INDICATOR|NOMAXVALUE|AVG|DISABLE|INITRANS|NOMINVALUE|BACKUP|DISMOUNT|INSTANCE|NONE|BEGIN|DOUBLE|INT|NOORDER|BECOME|DUMP|KEY|NORESETLOGS|BEFORE|EACH|LANGUAGE|NORMAL|BLOCK|ENABLE|LAYER|NOSORT|BODY|END|LINK|NUMERIC|CACHE|ESCAPE|LISTS|OFF|CANCEL|EVENTS|LOGFILE|OLD|CASCADE|EXCEPT|MANAGE|ONLY|CHANGE|EXCEPTIONS|MANUAL|OPEN|CHARACTER|EXEC|MAX|OPTIMAL|CHECKPOINT|EXPLAIN|MAXDATAFILES|OWN|CLOSE|EXECUTE|MAXINSTANCES|PACKAGE|COBOL|EXTENT|MAXLOGFILES|PARALLEL|COMMIT|EXTERNALLY|MAXLOGHISTORY|PCTINCREASE|COMPILE|FETCH|MAXLOGMEMBERS|PCTUSED|CONSTRAINT|FLUSH|MAXTRANS|PLAN|CONSTRAINTS|FREELIST|MAXVALUE|PLI|CONTENTS|FREELISTS|MIN|PRECISION|CONTINUE|FORCE|MINEXTENTS|PRIMARY|CONTROLFILE|FOREIGN|MINVALUE|PRIVATE|COUNT|FORTRAN|MODULE|PROCEDURE|PROFILE|SAVEPOINT|SQLSTATE|TRACING|QUOTA|SCHEMA|STATEMENT_ID|TRANSACTION|READ|SCN|STATISTICS|TRIGGERS|REAL|SECTION|STOP|TRUNCATE|RECOVER|SEGMENT|STORAGE|UNDER|REFERENCES|SEQUENCE|SUM|UNLIMITED|REFERENCING|SHARED|SWITCH|UNTIL|RESETLOGS|SNAPSHOT|SYSTEM|USE|RESTRICTED|SOME|TABLES|USING|REUSE|SORT|TABLESPACE|WHEN|ROLE|SQL|TEMPORARY|WRITE|ROLES|SQLCODE|THREAD|WORK|ROLLBACK|SQLERROR|TIME)\b/ig);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'sqlkeyword', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}

class SQLFieldsToken extends TokenHandler{
    nextToken = [];
    parse(str){
        let matches = str.matchAll(/(\b[\w\d\.]+),?/igm);
        let tokens = [];
        for(let match of matches){
            tokens.push({start: match.index, length:match[0].length, type:'sqlfield', value:match[0]})
        }
        let newTokens = [];
        let tokenIndex = 0;
        for (let i = 0; i<str.length; ){
            if (tokenIndex >= tokens.length){
                newTokens.push(...this.nextParse(str.substring(i)));
                break;
            }
            let currToken = tokens[tokenIndex];
            if (currToken.start > i){
                newTokens.push(...this.nextParse(str.substring(i, currToken.start)));
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }else if (currToken.start == i){
                newTokens.push(currToken);
                tokenIndex++;
                i = currToken.start+currToken.length;
            }
        }

        return newTokens;
    }
}


class XMLToken extends TokenHandler{
    parse(str){
        let commentToken = new CommentToken();
        let eleStartToken = new XMLStartElementeToken();
        let eleEnd1Token = new XMLEndElementToken();
        let eleEnd2Token = new XMLEndElementToken2();
        let attrToken = new XMLAttrbiuteToken();
        let noneToken = new NoneToken();
        commentToken.nextToken = [eleStartToken];
        eleStartToken.nextToken = [attrToken];
        attrToken.nextToken = [eleEnd1Token, eleEnd2Token];
        eleEnd1Token.nextToken = [eleEnd2Token];
        eleEnd2Token.nextToken = [noneToken];
        return commentToken.parse(str);
    }
}


class CSSToken extends TokenHandler{
    parse(str){
        let comm = new CommentToken();
        comm.next(new CSSBlockToken());
        return comm.parse(str);
    }
}

class JSToken extends TokenHandler{
    parse(str){
        let comm = new JSImportToken();
        //comm.next(new CSSBlockToken());
        return comm.parse(str);
    }
}

class SQLToken extends TokenHandler{

    parse(str){
        let comm = new SQLKeywordToken();
        //comm.next(new SQLFieldsToken());
        return comm.parse(str);
    }
}

class NoneToken{
    parse(val){
        return [{start: 0, length:val.length, type:'none', value:val}];
    }
}



// 注册
Vue.component('metadate-tree', {
    data : {
        tree : null,
        allMetadata : [],
        metadataDetails : {},
        currentXmlName : '',
        currentMetadtaDetails:[]
    },
    methods: {
        init: function() {
            this.tree.getAllMetadata().then(e=>{
                console.log('all metadata', e);
                $('#showallmetadata .recordsnumber').text(e.length);
                this.allMetadata = e;
                this.allMetadata = e.sort((a,b)=>{
                    return a.xmlName.localeCompare(b.xmlName);
                })
            })
        },
        metadateSearch: function(event){
            let text = $(event.target).val().trim().toLocaleLowerCase();
            $('#showallmetadata .content li').each((index, el)=>{
                if (!text){
                    $(el).show();
                    return;
                }
                let ind = $(el).attr('index');
                let obj = this.metadataDetails[ind];
                if(obj.xmlName.toLocaleLowerCase().indexOf(text) == -1 && obj.directoryName.toLocaleLowerCase().indexOf(text) == -1){
                    $(el).hide();
                }else{
                    $(el).show();
                }
            })
        },
        metadateDetailSearch: function(event){
            let text = $(event.target).val();

            $('#metadata-detail-search .content li').each((index, el)=>{
                if (!text){
                    $(el).show();
                    return;
                }
                let ind = $(el).attr('index');
                let metadataDetails = this.metadataDetails[this.currentXmlName];
                let obj = metadataDetails[ind];
                if(obj.xmlName.toLocaleLowerCase().indexOf(text) == -1 && obj.directoryName.toLocaleLowerCase().indexOf(text) == -1){
                    $(el).hide();
                }else{
                    $(el).show();
                }
            })
        },
        listMetadataDetails: async function(event){
            let xmlName = $(event.target).attr('name').trim();
            $('#metadataDetails').html('<img src="https://img.shida66.com/upload/head_img_tmp/2019/03/29/f07aedb2fc2879994362d07e6c88b1e8.gif"></img>');
            
            $('#showallmetadata li.selected').removeClass('selected');
            $(event.target).parents('li').addClass('selected');
            this.currentXmlName = xmlName;

            let metadataDetails = this.metadataDetails[xmlName];
            if (!metadataDetails){
                metadataDetails = await this.tree.listMetadata(xmlName);
                if (!metadataDetails){
                    $('#metadataDetails').html('No avairiable metadata type ' + xmlName);
                    return;
                }
                if (!Array.isArray(metadataDetails)){
                    metadataDetails = [metadataDetails];
                }
                
                console.log('listMetadata metadata', metadataDetails);
                metadataDetails = metadataDetails.sort((a,b)=>{
                    return a.fullName.localeCompare(b.fullName);
                })

                this.metadataDetails[xmlName] = metadataDetails;
            }
            this.currentMetadtaDetails = metadataDetails;
        },
        show:function(event){
            event.stopPropagation();
            let fileName = $(event.target).attr('name');
            let xName = $(event.target).attr('data-x-name');

            $('#metadataDetails li.selected').removeClass('selected');
            $(event.target).parents('li').addClass('selected');

            this.download(xName, fileName, (data)=>{
                $(event.target).after('<div><div/>'+`
                <div>id:${data.result.id}</div>
                <div>done:${data.result.done}</div>
                <div>state:${data.result.state}</div>
                `)
            }).then(data=>{
                if (data.success){
                    let content = Object.keys(data||{}).map(e=>{
                        return ` <h1>${e}</h1>
                        <p><xmp>${data[e]}</xmp></p>`
                    }).join('');
                    $(event.target).after('<div><div/>'+content);
                }else{
                    $(event.target).after('<div><div/>'+`
                    <div>id:${data.result.id}</div>
                    <div>done:${data.result.done}</div>
                    <div>state:${data.result.state}</div>
                    `);
                }
            });
        },
        download:function(xName, fullName, loogwait){
            let fileMaps = {success:true};
            let selectedMetadataObjects = this.allMetadata.find(e =>e.xmlName == xName);
            let metadataFile = this.metadataDetails[xName].find(e => e.fullName == fullName);
            return new Promise((solved)=>{
    
                this.tree.retrieveMetadata([metadataFile], [selectedMetadataObjects], loogwait).then(result =>{
                    if(!result.success){
                        fileMaps.result = result.result;
                        fileMaps.success = false;
                        solved(fileMaps);
                        return;
                    }
                    
    
                    let cb = (blob)=>{
        
                        JSZip.loadAsync(blob).then(function(zip){
                            let prom = [];
                            Object.keys(zip.files).forEach(function(filename){
                                let e = zip.files[filename].async('string').then(function (fileData) {
                                    console.log('fileData = ', fileData) // These are your file contents      
                                    fileMaps[filename] = fileData;
                                })
    
                                prom.push(e);
        
                                var content = zip.files[filename];
                                var dest =  filename;
            
                                console.log('dest : ', dest);
                                console.log('content : ', content);
                            });
                            Promise.all(prom).then(e=>{
                                solved(fileMaps);
                            })
                        });
        
                        blob.arrayBuffer().then(data =>
                             console.log(data)
                             );
                        blob.text().then(s=>{
                            console.log(s);
                        });
                    }
                    let xhrReq = new XMLHttpRequest();
                    xhrReq.open('GET', result.downloadLink, true);
                    xhrReq.responseType = 'blob';
                    xhrReq.onload = ()=>{
                        if (xhrReq.status == 200){
                            cb(xhrReq.response)
                        }
                    }
                    xhrReq.send();
                });
            })
            
        }
    },
    // 声明 props
    props: ['message'],
    // 同样也可以在 vm 实例中像 "this.message" 这样使用
    template: `
    <div class="searchresult">
        <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
        <div class="totalbar">
            <span class="sobjectAPIName"></span>
            <span class="sobjectName"></span>
        </div>

        <div id="showallMetadata">
            <div><input type="text" id="metadata-search" @change="metadateSearch"></div>
            <div class="content">
                <ul>
                    <li name="{{m.directoryName}}" index="{{index}}" v-for="(m, index) in allMetadata">
                        <input type="checkbox"></input>
                        <label>{{m.xmlName}}({{m.directoryName}})</label>
                        <button class="tablinks" name="{{m.xmlName}}" @click="listMetadataDetails">List</button>
                    </li>
                </ul>
            </div>
        </div>
        <div id="metadataDetails">
            <div><input type="text" id="metadata-detail-search" @change="metadateDetailSearch"></div>
            <div class="content">
                <ul>
                    <li name="{{m.fullName}}" index="{{index}}" v-for="(m, index) in currentMetadtaDetails">
                        <label>{{m.fullName}}({{m.fileName}})</label>
                        <button class="tablinks meta" name="{{m.fullName}}" data-x-name="{{xmlName}}" @click="show">List</button>
                    </li>   
                </ul>
            </div>
        </div>
    </div>`
})


