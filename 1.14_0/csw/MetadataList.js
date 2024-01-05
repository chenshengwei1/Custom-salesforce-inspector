
class RMetadateTree extends React.Component {
    constructor(props) {
      super(props);
      this.handleLoginClick = this.handleLoginClick.bind(this);
      this.handleLogoutClick = this.handleLogoutClick.bind(this);
      this.state = {isLoggedIn: false};
    }
   
    handleLoginClick() {
      this.setState({isLoggedIn: true});
    }
   
    handleLogoutClick() {
      this.setState({isLoggedIn: false});
    }
   
    render() {
   
      return (<div class="searchresult">
                <div class="totalbar"><span>Total Records : </span><span class="recordsnumber">0</span></div>
                    <div class="totalbar">
                        <span class="sobjectAPIName"></span>
                        <span class="sobjectName"></span>
                    </div>
                    <div id="showallMetadata">
                    <div>
                        <input type="text" id="metadata-search" onChange="metadateSearch"></input>
                    </div>
                    <div class="content">
                        <ul>
                            <li name="{m.directoryName}" index="{index}" v-for="(m, index) in allMetadata">
                                <input type="checkbox"></input>
                                <label>{m.xmlName}({m.directoryName})</label>
                                <button class="tablinks" name="{m.xmlName}" onClick="listMetadataDetails">List</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="showallMetadata">
                    <div><input type="text" id="metadata-search" onChange="metadateSearch"/></div>
                    <div class="content">
                        <ul>
                            <li name="{{m.directoryName}}" index="{index}" v-for="(m, index) in allMetadata">
                                <input type="checkbox"></input>
                                <label>{m.xmlName}({m.directoryName})</label>
                                <button class="tablinks" name="{m.xmlName}" onClick="listMetadataDetails">List</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="metadataDetails">
                    <div>
                        <input type="text" id="metadata-detail-search" change="metadateDetailSearch"/>
                    </div>
                    <div class="content">
                        <ul>
                            <li name="{m.fullName}" index="{{index}}" v-for="(m, index) in currentMetadtaDetails>">
                                <label>{m.fullName}({m.fileName})</label>
                                <button class="tablinks meta" name="{m.fullName}" data-x-name="{xmlName}" click="show">List</button>
                            </li>   
                        </ul>
                    </div>
                </div>
            </div>
      );
    }
  }


  
   
  ReactDOM.render(
    <RMetadateTree />,
    document.getElementById('showallmetadata')
  );
