import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class DxVisKanbanModal extends LightningModal {
    @api content;
    @track hidePackageCompare = true;
    @track hideProdDiff = false;


    // Connected Call events
    connectedCallback() {
        // console.log(JSON.parse(JSON.stringify(this.content)));
        if (this.content.sandbox == 'PROD') {
            this.hidePackageCompare = false;
        }
        if (this.content.sandbox == 'LOAD') {
            this.hideProdDiff = true;
        }
    }

    handleOkay() {
        this.close('okay');
    }
    activeValueMessage = '';
    handleActive(event) {
        this.activeValueMessage = `Tab with value ${event.target.value} is now active`;
    }
}