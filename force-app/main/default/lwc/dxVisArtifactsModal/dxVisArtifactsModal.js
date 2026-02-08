import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class DxVisArtifactsModal extends LightningModal {
    // @api content;
    @api description;

    @track loader = true;

    // connectedCallback() {
    //     console.log('package=', this.description, 'obj=', JSON.stringify(this.content));
    //     this.installedPackageDetails(this.content.id);
    // }
    handleOkay() {
        this.close('okay');
    }
    // installedPackageDetails(packageId) {
    //     installedPackageDetails({ packageId: packageId }).then((response) => {
    //         console.log('package detail= ', JSON.parse(response));
    //         this.installedPackage = JSON.parse(response);
    //         this.loader = false;
    //     }).catch((error) => {
    //         console.error(error);
    //     });
    // }
}