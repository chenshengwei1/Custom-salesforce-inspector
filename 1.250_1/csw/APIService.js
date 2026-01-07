export class APIService{
    constructor(tree){
        this.tree = tree;
    }


    async query(soql, options={}){
        if (options.isToolQuery){
            return await this.toolQuery(soql);
        }else{
            let result = await this.tree.getRecordsBySoql(soql);
            return result.data;
        }
    }

    getSObjectNames(isTool = false){
        let objDesc = this.tree.describeInfo.sobjectAllDescribes;
        let objectDesc = {global : {globalDescribe : { sobjects: []}}};
        if (isTool){
            objectDesc = objDesc.tool;
        }else{
            objectDesc = objDesc.data;
        }
        return objectDesc.global.globalDescribe.sobjects.map(obj=>obj.name);
    }

    getAllSObjectNames(){
        return this.getSObjectNames(false).concat(this.getSObjectNames(true));
    }

    isToolObject(name){
        let toolObjects = this.getSObjectNames(true);
        return toolObjects.includes(name);
    }

    getObject(name, isTool = false){
        let objDesc = this.tree.describeInfo.sobjectAllDescribes;
        let objectDesc = {global : {globalDescribe : { sobjects: []}}};
        if (isTool){
            objectDesc = objDesc.tool;
        }else{
            objectDesc = objDesc.data;
        }
        return objectDesc.global.globalDescribe.sobjects.find(obj=>obj.name === name);
    }

    getObjectDescribe(name){
        let isTool = this.isToolObject(name);
        return this.getObject(name, isTool);
    }

    isSandbox(){
        return this.tree.userInfo.isSandbox;
    }

    getUserInfo(){
        return this.tree.userInfo;
    }

    getUserId(){
        return this.tree.userInfo.Id;
    }

    getUserName(){
        return this.tree.userInfo.userName;
    }
}