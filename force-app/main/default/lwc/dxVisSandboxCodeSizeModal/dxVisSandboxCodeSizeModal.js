import { track, api } from 'lwc';
import LightningModal from 'lightning/modal';


export default class DxVisSandboxCodeSizeModal extends LightningModal {
    @api content;

    get modalHeader() {
        return `Sandbox Code Size for ${this.content.sandbox} Environment`;
    }
    handleClose() {
        this.close('okay');
    }


}