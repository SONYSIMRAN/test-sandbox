import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DxVisSearchContent extends NavigationMixin(LightningElement) {
    @api item;

    get orgDep() {
        return this.item.metadataname.hasExtDep
    }
    get cardColor() {
        return this.item.metadataname.hasExtDep ? 'background: #f1736b': 'background: #65bf78'
    }

    //navigate to info
    navigateToInfoPage(event) {
        console.log('Detail', 'sandbox= ', event.currentTarget.dataset.sandbox, 'packageName= ', event.currentTarget.dataset.package);
        let comInfo = {
            componentDef: "c:dxPackageInfo",
            attributes: {
                package: event.currentTarget.dataset.package,
                sandbox: event.currentTarget.dataset.sandbox,
                color: event.currentTarget.dataset.color
            }
        }
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            },
            state: {
                attributes: {
                    package: event.currentTarget.dataset.package,
                    sandbox: event.currentTarget.dataset.sandbox,
                    color: event.currentTarget.dataset.color
                }
            }
        })
    }
}