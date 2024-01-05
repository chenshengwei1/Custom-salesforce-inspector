export class Tools {
    static getUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }

    static getAllChecked(){
        let allCheckeds = localStorage.getItem('sobject:field:check');
        if (!allCheckeds){
            allCheckeds = '{}'
        }
        let allchecked = JSON.parse(allCheckeds);
        return allchecked;
    }

    static storageFieldCheck(sobject, fieldName, value){
      let allchecked = Tools.getAllChecked();
      allchecked[sobject+'.'+fieldName] = value;
      localStorage.setItem('sobject:field:check', JSON.stringify(allchecked));
    }

}
