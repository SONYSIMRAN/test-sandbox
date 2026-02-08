import { LightningElement, api } from 'lwc';

export default class DxVisView360CardHeader extends LightningElement {
    options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    @api getHeaderDate = null;
    get headerDate() {
        return new Date(this.getHeaderDate).toLocaleDateString("en-US", this.options);
    }
    connectedCallback() {
        // console.log('Header Date: ', this.headerDate);
    }
}