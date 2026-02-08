import { LightningElement, api } from 'lwc';

export default class SfdxPackageListContent extends LightningElement {
    @api item;

    get orgDep() {
        return this.item?.IsOrgDependent === true ? true : false
    }
    get cardColor() {
        return this.item?.IsOrgDependent === true ? 'background: #f1736b': 'background: #65bf78'
    }
    // get getSandbox() {
    //     return (this.item?.uname).split("_").pop();
    // }
}