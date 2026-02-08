import { LightningElement, api } from 'lwc';

export default class DxVisEnvStatusEVChild extends LightningElement {
    @api value;
    // enabledValue = false;

    get enabledValue() {
        return this.value === 1 ? true : false;
    }
    get getNoData() {
        return this.value === undefined || this.value === null || this.value === '' ? true : false
    }
}