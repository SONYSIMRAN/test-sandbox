import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import DxVisInstalledPackageModal from 'c/dxVisInstalledPackageModal';

export default class SfdxSearchContent extends LightningElement {
    @api item;

    get orgDep() {
        // console.log('orgDep--->', this.item.IsOrgDependent);
        return this.item.IsOrgDependent
    }
    get cardColor() {
        return this.item.IsOrgDependent ? 'background: #f1736b': 'background: #65bf78'
    }

    //navigate to info
    async handleInstalledPackageDetails() {
        const result = await DxVisInstalledPackageModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: this.item.PackageName,
            content: {
                packageName: this.item.PackageName,
                id: this.item.Id
            }
        });
    }

}