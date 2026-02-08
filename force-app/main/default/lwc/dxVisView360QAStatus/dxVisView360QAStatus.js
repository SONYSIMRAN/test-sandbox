import { LightningElement,api } from 'lwc';

export default class DxVisView360QAStatus extends LightningElement {

    @api manualQA;

    get isManualQA() {
        return this.manualQA === true || this.manualQA === 'yes';
    }
}