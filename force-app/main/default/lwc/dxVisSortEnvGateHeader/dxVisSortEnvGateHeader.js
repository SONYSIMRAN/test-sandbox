import { LightningElement, api } from 'lwc';

export default class DxVisSortEnvGateHeader extends LightningElement {
    @api name = null;
    @api iconName = 'action:sort';
    @api hideIcon = false;

    get dataIcon() {
        return this.hideIcon === this.name
    }


    sortIconClick(event) {
        // Fire the custom event
        this.dispatchEvent(new CustomEvent('selection', { detail: event.currentTarget.dataset.name }));
    }
}