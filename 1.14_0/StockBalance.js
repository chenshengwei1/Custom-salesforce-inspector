
import  url  from 'url';
import  path  from 'path';

import  * as fs  from 'fs';

class StockBalance{
    
    async checking(sf, cstk){
        //this.clear();
        let cstkList= this.toCSTKJSON(cstk);
        this.addMessage('load cstk success:');
        this.addMessage(' cstk records:' + cstkList.length);

        let sfList= this.toSFJOSN(sf);
        this.addMessage('load salesforce success:');
        this.addMessage(' sf records:' + sfList.length);

        this.toMapping(cstkList, sfList);
        this.addMessage('end');
    }

    getCSTK(){
        let root='cstk.txt';
        let content = fs.readFileSync(root);
        return content.toString();
    }

    getsf(){
        let root='sf.txt';
         let content = fs.readFileSync(root);
         return content.toString();
    }

    writeResult(str){
        fs.writeFileSync('result.txt',str);
    }


    toMapping(cstkList, sfList){
        let cstkMap = {};
        let cstkMapKeyAssetId = {};
        this.addMessage('cstkList length='+cstkList.length);
        this.addMessage('sfList length='+sfList.length);
        let multipleAssetCstks = [];
        let index = 0;
        for (let data of cstkList){
            
            if (data.reservationId){
                cstkMap[data.reservationId] = data;
                
            }else{
                if (data.assetId){
                    if (cstkMapKeyAssetId[data.assetId]){
                        cstkMapKeyAssetId[data.assetId] = data;
                    }else{
                        multipleAssetCstks.push(data);
                    }
                }
            }
            //this.addMessage('key=' + data.reservationId);
            data.referenceSF = [];
            
        }

        this.addMessage('cstkMap length='+Object.keys(cstkMap).length);
        this.addMessage('cstkMapKeyAssetId length='+Object.keys(cstkMapKeyAssetId).length);
        this.addMessage('multipleAssetCstks length='+multipleAssetCstks.length);

        let noReservationIs = [];
        for (let sf of sfList){
            index++;

            if (!cstkMap[sf.Stock_Res_Id__c]){
                if (cstkMapKeyAssetId[sf.vlocity_cmt__AssetReferenceId__c]){
                    cstkMapKeyAssetId[sf.vlocity_cmt__AssetReferenceId__c].referenceSF.push(sf);
                }else{
                    if (index == 100){
                        this.addMessage('can not found res ' + sf.Stock_Res_Id__c);
                        this.addMessage('can not found asset ' + sf.vlocity_cmt__AssetReferenceId__c);
                    }
                }
                noReservationIs.push(sf);
            }else{
                cstkMap[sf.Stock_Res_Id__c].referenceSF.push(sf);
                //this.addMessage('add ' + sf.Stock_Res_Id__c);
            }
        }

        this.addMessage('miss salesforce item count=' + cstkList.filter(e=>!e.referenceSF.length).length);
        this.addMessage('too many salesforce item count=' + cstkList.filter(e=>e.referenceSF.length>1).length);
        this.addMessage('too many salesforce item1 count=' + cstkList.filter(e=>e.referenceSF.length>2).length);
        this.addMessage('too many salesforce item2 count=' + cstkList.filter(e=>e.referenceSF.length>3).length);
        this.addMessage('too many salesforce item3 count=' + cstkList.filter(e=>e.referenceSF.length>4).length);

        let str = ''
        let parseResult = [];
        for (let data of cstkList){
            if (data.referenceSF.length > 1){
                for(let sf of data.referenceSF){
                    if (!sf.vlocity_cmt__SupersededOrderItemId__c){
                        let orderitem = sf;
                        let result = this.validate(data, orderitem);
        
                        parseResult.push(result);
                        continue;
                    }
                    parseResult.push({success: 'unknow', message:`${data.reservationId}${'\t'}${data.sourceHeahder} ${data.cancelled}  ${sf.OrderCustom_OrderStatus__c} - ${sf.Stock_Status__c} - ${sf.Stock_Res_Id__c}`, data: data, type:1});
                }
            }else if (data.referenceSF.length == 1){
                let orderitem = data.referenceSF[0];
                let result = this.validate(data, orderitem);

                parseResult.push(result);
                //str += `${data.reservationId}${'\t'}${data.sourceHeahder}   "miss salesforce order items"${'\n'}`
            }else if (data.referenceSF.length == 0){
                parseResult.push({success: 'false',type:3, message:`${data.reservationId}${'\t'}${data.sourceHeahder}   "miss salesforce order items"`, data: data});
            }
        }
        this.writeResult(parseResult.filter(e =>e.success == 'false'&&e.type==2).map(e=>e.message).join('\n'));
    }

    validate(data, orderitem){
        let result = {data: data, type:2};
        let total = 0 + +data.pending +  +data.allocated + +data.release + +data.cancelled;
        if (data.pending > 0){
            if (data.pending != total){
                result.success = 'false';
                result.message =  `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Reserved',but ${orderitem.Stock_Status__c}, quantity exception. ${data.pending} - ${total}`
            }
            else if (orderitem.Stock_Status__c == 'Reserved'  || orderitem.Stock_Status__c == 'Reserved Released'){
                result.success = 'true';
                result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}   "Success"`;
            }else{
                result.success = 'false';
                result.message =  `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Reserved',but ${orderitem.Stock_Status__c}`
            }
        }
        else if (data.allocated > 0){
            if (data.allocated != total){
                result.success = 'false';
                result.message =  `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Reserved+Allocated',but ${orderitem.Stock_Status__c}, quantity exception.${data.allocated} - ${total}`
            }
            else if (orderitem.Stock_Status__c == 'Reserved+Allocated'){
                result.success = 'true';
                result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}   "Success"`
            }else{
                result.success = 'false';
                result.message =  `${data.reservationId}${'\t'}${data.sourceHeahder}   "Fail"   excpet='Reserved+Allocated',but ${orderitem.Stock_Status__c}`
            }
        }
        else if (data.release > 0){
            if (data.release != total){
                result.success = 'false';
                result.message =  `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Stocked Out',but ${orderitem.Stock_Status__c}, quantity exception.${data.release} - ${total}`
            }
            else if (orderitem.Stock_Status__c == 'Stocked Out'){
                result.success = 'true';
                result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}   "Success"`
            }else{
                result.success = 'false';
                result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Stocked Out',but ${orderitem.Stock_Status__c}`
            }
        }
        else if (data.cancelled > 0){
            if (data.cancelled != total){
                result.success = 'false';
                result.message =  `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Reserve Released',but ${orderitem.Stock_Status__c}, quantity exception.${data.cancelled} - ${total}`
            }
            else if (orderitem.Stock_Status__c == 'Reserve Released'){
                result.success = 'true';
                result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}   "Success"`
            }else{
                result.success = 'false';
                result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   excpet='Reserve Released',but ${orderitem.Stock_Status__c}`
            }
        }else{
            result.success = 'false';
            result.message = `${data.reservationId}${'\t'}${data.sourceHeahder}${'\t'}${orderitem.OrderCustom_OrderStatus__c}   "Fail"   unknow CSTK status,but ${orderitem.Stock_Status__c}`
        }
        return result;
    }

    
    toSFJOSN(sf){
        if (!sf){
            return;
        }
       
        let results = [];
        let lines = sf.split('\n');
        
        this.addMessage('line0=' + lines.length);
        let header = lines[0].toString().split('\t');
        //V10	4021211	21809	1	0	0	0	1	COM	801RC000001Gj5RYAS	V10C00000114	684627a6-1746-59be-99e7-16336b0cf305	1	21809	0	0	0
        let maxSize = lines.length;
        for (let index=1;index<maxSize;index++){
            let line  = lines[index];
            let dataList = line.split('\t');
            if (dataList.length != header.length){
                //console.log(`miss fields ${header.length} - ${dataList.length} in line ${index} :${line}`);
                //console.log(`miss sf fields ${header.length} - ${dataList.length} in line ${index} :${dataList}`);
            }else{
                let newObj = {};
                for (let i=0;i<dataList.length;i++){
                    let key = this.removeDama(header[i]);
                    key = key.replace(/\./, '');
                    newObj[key] = this.removeDama(dataList[i]);
                }
                newObj.line = line;
                let {CreatedDate, Id, Ordered_Qty__c, Stock_Res_Id__c, Stock_Status__c, SKU__c,vlocity_cmt__AssetReferenceId__c} = newObj;
                let a ={CreatedDate, Id, Ordered_Qty__c, vlocity_cmt__AssetReferenceId__c,Stock_Res_Id__c, Stock_Status__c, SKU__c,line:newObj.line, OrderName:newObj['Order.Name']};
                results.push(newObj);
                
                //console.log(`miss fields in line:${a}`);
            }
            lines[index] = null;
        }
        return results.sort((a, b)=>{
            return +a.Stock_Res_Id__c -  +b.Stock_Res_Id__c;
        });
    }

    removeDama(str){
        if (str.length > 2 && str.charAt(0) == '"'  && str.charAt(str.length-1) == '"' ){
            return str.substring(1, str.length - 1);
        }   
        return str;
    }

    toCSTKJSON(cstk){
        cstk = cstk.trim();
        this.addMessage('cstk length='+cstk.length);
        let header = ['channel',  'itemCode', 'reservationId', 'required','pending', 'allocated', 'release', 'cancelled','system', 'sourceId', 'sourceHeahder', 'assetId', 'qty','reservationId2', 'resId', 'pending2', 'allocated2','release2'];
        //V10	4021211	21809	1	0	0	0	1	COM	801RC000001Gj5RYAS	V10C00000114	684627a6-1746-59be-99e7-16336b0cf305	1	21809	0	0	0
        let results = [];
        let lines = cstk.split('\n');
        
        let maxSize = lines.length;
        cstk = '';
        for (let index=1;index<maxSize;index++){
            let line  = lines[index].trim();
            let dataList = line.split(/\s+/igm);
            if (dataList.length != header.length){
            }else{
                let newObj = {};
                newObj.line = index;
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
        console.log(message);
    }
    clear(){
        this.messageList = [];
    }
}


let sb = new StockBalance();
sb.clear();
let sf = sb.getsf();
let cstk = sb.getCSTK();
sb.checking(sf, cstk);
console.log('test')