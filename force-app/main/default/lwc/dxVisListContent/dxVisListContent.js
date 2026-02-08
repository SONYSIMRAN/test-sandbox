import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DxVisListContent extends NavigationMixin(LightningElement) {
    @api item;

    get orgDep() {
        return this.item?.IsOrgDependent === 'Yes'? true : false
    }
    get cardColor() {
        return this.item?.IsOrgDependent === 'Yes' ? 'background: #f1736b': 'background: #65bf78'
    }
    get getSandbox() {
        return (this.item?.uname).split("_").pop();
    }

    //navigate to info
    navigateToInfo(event) {
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