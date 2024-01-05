

export class ResizeTable{

    constructor(tableId){
        this.tableId = tableId;
        this.resizeTd= null;
        document.onmouseup =  ()=> {//不需要写在上边的for循环里面
            this.resizeTd = null;
            this.resizeTr=null;
            console.log('end th/tr ' + this.tableId);
        };
        document.onmousemove = (evt)=> {
            if(this.resizeTd){
                if(this.resizeTd.initWidth+(evt.clientX-this.resizeTd.initClientX)>0){
                    console.log('set th/tr initWidth ' + this.tableId);
                    this.resizeTd.width=this.resizeTd.initWidth+(evt.clientX-this.resizeTd.initClientX);
                }
            }

            if(this.resizeTr){
                if(this.resizeTr.initHeight+(evt.clientY-this.resizeTr.initClientY)>0){
                    console.log('set th/tr initHeight ' + this.tableId);
                    $(this.resizeTr).outerHeight(this.resizeTr.initHeight+(evt.clientY-this.resizeTr.initClientY));
                }
            }
        };
    }

    start(){
        //js实现改变宽度
        $('body').on('mousedown', 'tr th', (event)=>{
            let td = event.currentTarget;
            if (!$(td).is('th')){
                console.log('target is not  tr th');
                return;
            }
            if (td.offsetWidth-event.offsetX< 5) {
                this.resizeTd = td;//保存下要操作的列
                td.initClientX = event.clientX;//保存下鼠标按下时鼠标相对该单元格x方向的偏移
                td.initWidth = td.offsetWidth;//保存下该单元格的宽度

            }
        })

        $('body').on('mousemove', 'tr th', (event)=>{
            let td = event.currentTarget;
            if (!$(td).is('th')){
                console.log('target is not  tr th');
                return;
            }
            if (td.offsetWidth - event.offsetX<5){
                td.style.cursor = 'col-resize';
            }else if ($(td).outerHeight()-event.offsetY<5){
                td.style.cursor = 'row-resize';
            }else{
                td.style.cursor = 'default';
            }
        })



        //jquery实现改变高度
        $('body').on('mousedown',"tr", (e)=>{//鼠标按下时初始化当前要操作的行
            let tr = e.currentTarget;
            if (!$(tr).is('tr')){
                console.log('target is not  tr th');
                return;
            }

            if($(e.target).outerHeight()-e.offsetY<5){
                this.resizeTr=e.target;
                e.target.initClientY=e.clientY;
                e.target.initHeight=$(e.target).outerHeight();
            }
        });

        $('body').on('mousemove',"tr", (e)=>{ //鼠标在接近行底部时改变形状
            let tr = e.currentTarget;
            if (!$(tr).is('tr')){
                console.log('target is not  tr');
                return;
            }
            if($(tr).outerHeight()-e.offsetY<5){
                $(tr).css("cursor","row-resize");
            }else if( tr.offsetWidth - e.offsetX<5){
                $(tr).css("cursor","col-resize");
            }else{
                $(tr).css("cursor","default");
            }
        });
    }
}
