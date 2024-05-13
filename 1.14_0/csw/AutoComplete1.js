
// autocomplete
export class AutoComplete1{
    constructor(inputElementId,autoArray){
        this.inputElementId=inputElementId;
        this.selector = inputElementId;
        this.autoElementId="auto_997_"+this.inputElementId.replace(/\W*/mg,'');
        this.autoObj = this.createAutoObj();//DIV的根节点
        this.value_arr=autoArray;        //不要包含重复值
        this.index=-1;          //当前选中的DIV的索引
        this.search_value="";   //保存当前搜索的字符
        this.cursorPos=0;
        this.itemProvider={
            value:(e)=>e,
            label:(e,k)=>k
        }
    }
    get obj(){
        let  objFromId = document.getElementById(this.inputElementId);
        if (objFromId){
            return objFromId;
        }
        return this.currentFocus;
    }

    setItemProvider(provider){
        this.itemProvider = provider;
    }

    getAutoCompleteValues(){
        if (typeof this.value_arr == 'function'){
            return this.value_arr();
        }
        return this.value_arr;
    }

    createAutoObj(){
        let autoObj = document.getElementById(this.autoElementId);
        if (autoObj){
            return autoObj;
        }
        var div = document.createElement("div");
        div.className="auto_hidden";
        div.id=this.autoElementId;
        document.body.appendChild(div);
        return document.getElementById(this.autoElementId);
    }

    init(){
        if (!this.obj){
            return;
        }
        var cursorPos = this.obj.selectionStart;
        var cursorCoords = this.obj.getBoundingClientRect();
        var cursorX = cursorCoords.left + cursorPos;
        var cursorY = cursorCoords.top;

        this.autoObj.style.left = cursorX + "px";
        this.autoObj.style.top  = cursorY + this.obj.offsetHeight + "px";
        this.autoObj.style.width= this.obj.offsetWidth - 2 + "px";//减去边框的长度2px
        this.autoObj.style.height= "auto";//减去边框的长度2px
        this.autoObj.style.maxHeight= "400px";//减去边框的长度2px
        this.autoObj.style.fontSize= '14';
        this.autoObj.style.position= 'fixed';
        this.autoObj.style.backgroundColor='white';


    }

    deleteDIV(){
        while(this.autoObj.hasChildNodes()){
            this.autoObj.removeChild(this.autoObj.firstChild);
        }
        this.autoObj.className="auto_hidden";
    }

    setValue(target){
        this.updateObjectValue(target.seq || $(target).attr('seq')||'default');
        this.autoObj.className="auto_hidden";
        $(this.obj).change();
    }

    updateObjectValue(newText){
        var cursorPos = this.cursorPos;
        console.log('selectionStart='+this.obj.selectionStart)
        let leftChar = cursorPos - 1;
        let rightChar = cursorPos;
        while(leftChar>=0 && /[\d\w_]/.test(this.search_value.charAt(leftChar))){
            leftChar--;
        }
        while(rightChar<=this.search_value.length && /[\d\w_]/.test(this.search_value.charAt(rightChar))){
            rightChar++;
        }
        let word = this.search_value.substring(0, cursorPos).match(/[a-zA-Z0-9_]*$/)[0];
        //this.obj.value = this.search_value.substring(0, leftChar+1)+newText+this.search_value.substring(rightChar);
        this.obj.value = newText;
    }

    autoOnmouseover(target, _div_index){

        this.index=_div_index;
        var length = this.autoObj.children.length;
        for(var j=0;j<length;j++){
            if(j!=_div_index ){
                this.autoObj.childNodes[j].className='auto_onmouseout';
            }else{
                this.autoObj.childNodes[j].className='auto_onmouseover';
                this.updateObjectValue(target.seq);
            }
        }

    }

    changeClassname(length){
        for(var i=0;i<length;i++){
            if(i!=this.index ){
                this.autoObj.childNodes[i].className='auto_onmouseout';
            }else{
                this.autoObj.childNodes[i].className='auto_onmouseover';
                this.updateObjectValue(this.autoObj.childNodes[i].seq);
            }
        }
    }

    //响应键盘
    pressKey(event){
        var length = this.autoObj.children.length;
        //光标键"↓"
        if(event.keyCode==40){
            ++this.index;
            if(this.index>length){
                this.index=0;
            }else if(this.index==length){
                this.updateObjectValue(this.search_value);
            }else{
                this.changeClassname(length);
            }

        }
        //光标键"↑"
        else if(event.keyCode==38){
            this.index--;
            if(this.index<-1){
                this.index=length - 1;
            }else if(this.index==-1){
                this.updateObjectValue(this.search_value);
            }else{
                this.changeClassname(length);
            }
        }
        //回车键
        else if(event.keyCode==13){
            this.autoObj.className="auto_hidden";
            this.index=-1;
        }else{
            this.index=-1;
        }
    }
    //程序入口
    start(event){
        if(this.obj&&event.keyCode!=13&&event.keyCode!=38&&event.keyCode!=40){
            this.init();
            this.deleteDIV();
            this.search_value=this.obj.value;
            this.cursorPos = this.obj.selectionStart;
            let word = this.search_value.substring(0, this.cursorPos).match(/[a-zA-Z0-9_]*$/)[0];

            var valueArr=this.getAutoCompleteValues();
            valueArr = valueArr.sort((a,b)=>{
                return this.itemProvider.value(a).localeCompare(this.itemProvider.value(b))
            });
            if(word.replace(/(^\s*)|(\s*$)/g,'')==""){
                return;
            }//值为空，退出

            try{
                var reg = new RegExp("^(" + word + ")","i");
            }
            catch (e){
                return;
            }
            var div_index=0;//记录创建的DIV的索引
            let matchItems = [];
            if (this.itemProvider.filter){
                matchItems = this.itemProvider.filter(valueArr, word);
            }else{
                for(var i=0;i<valueArr.length;i++){
                    let v = this.itemProvider.value(valueArr[i]);
                    if(reg.test(v)){
                        matchItems.push(valueArr[i]);
                    }
                }
            }
            matchItems = matchItems.sort((a, b)=>{
                let v1=this.itemProvider.value(a);
                let v2=this.itemProvider.value(b);
                return reg.exec(v1)?.index - reg.exec(v2)?.index;
            });
            for(var i=0;i<matchItems.length;i++){
                let val = this.itemProvider.value(matchItems[i]);
                var div = document.createElement("div");
                div.className="auto_onmouseout autocompleteitem";
                div.title=val;
                div.seq = val;
                div.setAttribute('seq',val);
                div.innerHTML=this.itemProvider.label(matchItems[i], val.replace(reg,"<strong>$1</strong>"));//搜索到的字符粗体显示
                this.autoObj.appendChild(div);
                this.autoObj.className="auto_show";
                div_index++;
            }
        }
        this.pressKey(event);
        window.οnresize=this.bind(this,function(){this.init();});
    }

    render(autoArray){
        this.value_arr=autoArray;
        this.start(this);
    }

    bindAutoCompleteItemEvent(){
        $('#'+this.autoElementId).on('click','.autocompleteitem', (e)=>{
            console.log('click seq = ', e.target.seq);
            let autoitem = e.target;
            if (!$(e.target).is('.autocompleteitem')){
                autoitem = $(e.target).parents('.autocompleteitem');
            }
            this.setValue(autoitem);
            this.hideAutoComplete();
        })

        $('#'+this.autoElementId).on('mοuseοver', '.autocompleteitem',(e)=>{
            console.log('mouseover seq = ', e.target.seq);
            this.autoOnmouseover(e.target, div_index);
        })
    }

    createApi(){
        this.bindAutoCompleteItemEvent();
        $('body').on('blur', '#'+this.inputElementId, (event)=>{//点击下拉选项得到获取值
            //alert("auto_hidden");//点击获取选择的值。
            setTimeout(()=>{
                this.hideAutoComplete();
            }, 100);
        });


        $('body').on('keyup','#'+this.inputElementId, (e)=>{
            this.start(e);
        })

        this.start(this);
    }

    createApi2(){
        this.bindAutoCompleteItemEvent();
        $('body').on('blur', this.selector, (event)=>{//点击下拉选项得到获取值
            //alert("auto_hidden");//点击获取选择的值。
            setTimeout(()=>{
                this.hideAutoComplete();
            }, 100);
        });


        $('body').on('keyup',this.selector, (e)=>{
            this.start(e);
        })


        $('body').on('focus',this.selector, (e)=>{
            if ($(e.currentTarget).is(this.selector)){
                this.currentFocus = e.currentTarget;
            }
        })

        this.start(this);
    }

    bind(object, fun){
        return function() {
            return fun.apply(object, arguments);
        }
    }

    hideAutoComplete(){
        this.autoObj.className="auto_hidden";
        this.index=-1;
    }
}