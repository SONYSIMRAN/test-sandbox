import { LightningElement, api, track } from 'lwc';

export default class DxVisReleaseStatusTooltip extends LightningElement {
    @api packages;
    @track overallStatus = '';
    @api isVisible = false;
    // @api tooltipPosition = { top: '0px', left: '0px' };

    // get tooltipStyle() {
    //     return `top: ${this.tooltipPosition.top}; left: ${this.tooltipPosition.left};`;
    // }

    connectedCallback() {
        // console.log('packages', this.packages);
        console.log('packages Data  in release ;;;;;:', JSON.stringify(this.packages));
        this.calculateOverallStatus();
    }

    calculateOverallStatus() {
        if (this.packages) {
            let hasFailure = this.packages.some(pkg => 
               ( pkg.status.ZTTExecutionStatus === 'FAIL' || pkg.status.PDTExecutionStatus === 'FAIL' || pkg.status.ZTTStatus === 'FAIL' || pkg.status.PDTStatus === 'FAIL')
            );
            this.overallStatus = hasFailure ? 'FAIL' : 'PASS';
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}