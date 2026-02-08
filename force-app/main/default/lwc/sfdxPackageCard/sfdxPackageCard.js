import { LightningElement, api, track } from 'lwc';
import DxVisInstalledPackageModal from 'c/dxVisInstalledPackageModal';

export default class SfdxPackageCard extends LightningElement {
    @api item;

    get packageCardClass() {
        let classnames = 'slds-box slds-box_x-small slds-m-around_x-small sfdx-package-card';
        if (this.item.IsOrgDependent) {
            classnames += ' sfdx-card-org-dep-yes';
        }
        else {
            classnames += ' sfdx-card-org-dep-no'
        }
        return classnames;
    }

    async handleInstalledPackageDetails() {
        const result = await DxVisInstalledPackageModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: this.item.packageName,
            content: {
                packageName: this.item.packageName,
                id: this.item.id
            }
        });
        // if modal closed with X button, promise returns result = 'undefined'
        // if modal closed with OK button, promise returns result = 'okay'
        console.log(result);
}
}