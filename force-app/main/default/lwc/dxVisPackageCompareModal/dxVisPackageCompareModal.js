import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class DxVisPackageCompareModal extends LightningModal {
    @api content;

    get headerBg() {
        if (this.content) {
            return this.content.color;
        }
    }
    connectedCallback() {
        console.log(this.headerBg);

    }
    handleOkay() {
        this.close('okay');
    }
}