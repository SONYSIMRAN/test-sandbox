import { LightningElement, api } from 'lwc';

export default class DxVisView360ManualStatus extends LightningElement {
    @api manualQa;

    get isManualQa() {
        return this.manualQa === true || this.manualQa === 'yes';
    }
}