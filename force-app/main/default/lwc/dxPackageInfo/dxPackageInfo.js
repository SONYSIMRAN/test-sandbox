import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class DxPackageInfo extends LightningElement {
    //Header Config
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = false;
    //Header Config
    //Tab vars
    activeValueMessage = '';
    @api activeTab = 'Info';
     //card Colors list
     colorMap = {
        'yes': 'background: #f1736b',
        'no': 'background: #65bf78',
        'na': 'background: #6c757d'
    };
    //Get params
    packageName = null;
    sandboxName = null;
    cardColor = null;
    //Get state event
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            console.log('Page ref', currentPageReference);
            this.packageName = currentPageReference.attributes.attributes?.package;
            this.sandboxName = currentPageReference.attributes.attributes?.sandbox;
            this.activeTab = currentPageReference.attributes.attributes?.activeTab;
            this.cardColor = currentPageReference.attributes.attributes?.color;
        }
    }

    connectedCallback() {
        console.log(this.packageName, this.sandboxName, this.cardColor);
    }

    //Set Info Header color
    setCardHeaderColor(event) {
        // this.cardColor = this.colorMap[event.detail.toLowerCase()];
    }


    handleActive(event) {
        this.activeValueMessage = `Tab with value ${event.target.value} is now active`;
    }
}