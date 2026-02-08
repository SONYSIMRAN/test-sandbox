import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class DxVisPackageDependencyModal extends LightningModal {
    @api content;

    connectedCallback() {
        console.log('Modal loaded');

    }
    handleOkay() {
        this.close('okay');
    }
}