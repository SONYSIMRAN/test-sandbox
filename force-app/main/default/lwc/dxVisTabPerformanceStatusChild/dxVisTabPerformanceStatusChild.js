import { LightningElement, api } from 'lwc';

export default class DxVisTabPerformanceStatusChild extends LightningElement {
    @api result;

    get resultPass() {
        if (this.result) {
            return this.result === 'Pass' ? true : false;
        }
    }
    get resultFail() {
        if (this.result) {
            return this.result === 'Fail' ? true : false;
        }
    }
}