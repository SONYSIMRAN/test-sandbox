import { LightningElement, api } from 'lwc';

export default class DxVisEnvGateStatusChild extends LightningElement {

    @api status;

    connectedCallback() {
        console.log('Status', this.status);
    }
    get statusPass() {
        return this.status === 'PASS' ? true : false;
    }
    get statusFail() {
        return this.status === 'FAIL' ? true : false;
    }
}