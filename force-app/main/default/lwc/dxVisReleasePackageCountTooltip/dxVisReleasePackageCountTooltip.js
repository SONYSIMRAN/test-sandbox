import { LightningElement, api, track } from 'lwc';

export default class DxVisReleasePackageCount extends LightningElement {
    @api packages = [];
    @api isVisible = false;
    @track packageCount = 0;

  
    renderedCallback() {
        console.log('packages Data  in count ;;;;;:', JSON.parse(JSON.stringify(this.packages)));
        this.calculatePackageCount();
    }

    calculatePackageCount() {
        if (this.packages && Array.isArray(this.packages)) {
            this.packageCount = this.packages.length;
        } else {
            this.packageCount = 0;
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}