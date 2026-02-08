import { LightningElement, api, track } from 'lwc';

export default class DxVisPackageDiff extends LightningElement {
    @api deploymentFileData;
    diffUrl;
    @track height = '900px';
    @track referrerPolicy = 'no-referrer';
    @track width = '100%';
    //package details
    packageName;
    packageVersion;
    packageBranch;
    //Connected Call back
    connectedCallback() {
        if (sessionStorage.getItem("deploymentFile") != null) {
            this.deploymentFileData = JSON.parse(sessionStorage.getItem('deploymentFile'));
            this.packageName = this.deploymentFileData.packageName || null;
            this.packageVersion = this.deploymentFileData.Version || null;
            this.packageBranch = this.deploymentFileData.Branch || null;
            this.diffUrl = `https://console.cloud.google.com/storage/browser/_details/dx_package_visualizer_metadata/code-integrity/${this.packageName}/load/${this.packageVersion}/${this.packageName}-${this.packageBranch}`;
            //https://console.cloud.google.com/storage/browser/_details/dx_package_visualizer_metadata/code-integrity/dx-req/load/41.0.0.7/dx-req-develop.htm
            console.log('package Data: ', this.deploymentFileData);
        }
    }

    handleClick() {
        window.open(this.diffUrl, '_blank').focus();
    }
}