import { LightningElement, api } from 'lwc';

export default class DxVisEnvGateStatusButton extends LightningElement {
    @api status = null;
    connectedCallback() {
        console.log('Staus value= ', this.status);
    }
    get gateEnabled() {
        let gateClass = 'gate-default';
        if (this.status === 1) {
            gateClass += ' gate-enabled';
        }
        return gateClass;
    }
    get gateDisabled() {
        let gateClass = 'gate-default';
        if (this.status === 0) {
            gateClass += ' gate-disabled';
        }
        return gateClass;
    }
}