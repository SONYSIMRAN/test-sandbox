import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';
import installedPackageDetails from '@salesforce/apex/DXInstalledPackageDetail.getInstalledSubscriberPackageById';

export default class DxVisInstalledPackageModal extends LightningModal {
    @api content;
    @api description;
    installedPackage;
    @track loader = true;

    connectedCallback() {
        console.log('package=', this.description, 'obj=', JSON.stringify(this.content));
        this.installedPackageDetails(this.content.id);
    }
    handleOkay() {
        this.close('okay');
    }
    installedPackageDetails(packageId) {
        installedPackageDetails({ packageId: packageId }).then((response) => {
            console.log('package detail= ', JSON.parse(response));
            this.installedPackage = JSON.parse(response);
            this.loader = false;
        }).catch((error) => {
            console.error(error);
        });
    }
}