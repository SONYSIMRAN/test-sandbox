import { LightningElement, api, track } from 'lwc';

export default class DxVisEnvGateStatus extends LightningElement {

    @api status;
    enabledValueData;

    //Conneted callback
    connectedCallback() {
        if (this.status && this.status.enabledValue) {
            this.enabledValueData = this.status.enabledValue;
        }
        else {
            this.enabledValueData = [];
        }
    }

    get statusSummary() {
        if (this.status) {
            return Object.entries(this.status).filter(key => typeof key[1] !== 'object' || !Array.isArray(key[1])).map(([key, value]) => ({ key, value }));
        }
    }
}