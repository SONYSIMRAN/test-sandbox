import { LightningElement, api, track } from 'lwc';

export default class DxVisView360Card extends LightningElement {
    @api item = null;
    @track clickedPackageTooltip = null;

    connectedCallback() {
        // console.log('Package Item: ', this.item.packageName, 'automation_ztt=', this.filterGateEnabled('automation_ztt'), 'automation_pdt=', this.filterGateEnabled('automation_pdt'), JSON.parse(JSON.stringify(this.item)));
        document.addEventListener('click', this.hideInfoTooltip, false);
    }
    filterGateEnabled(value) {
        const enabledValue = this.item?.status?.enabledValue;
        if (enabledValue) {
            const gate = enabledValue.find(item => item.name === value);
            return gate ? gate.enabled === 1 : false;
        }
        return false;
    }
    hideInfoTooltip = () => {
        this.clickedPackageTooltip = null;
        console.log('clickedPackageTooltip', this.clickedPackageTooltip);
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.hideInfoTooltip, false);
    }
    setActiveTooltip(event) {
        this.clickedPackageTooltip = event.detail;
    }
    get view360CardClass() {
        let defaultClass = 'slds-card view-360-card';
        const sandbox = this.item?.sandbox;
        if (sandbox && sandbox !== 'PROD') {
            const { PDTStatus, ZTTStatus } = this.item.status;
            const isZttEnabled = this.filterGateEnabled('automation_ztt');
            const isPdtEnabled = this.filterGateEnabled('automation_pdt');

            if ((isZttEnabled || isPdtEnabled) && (PDTStatus === 'FAIL' || ZTTStatus === 'FAIL')) {
                defaultClass += ' risk-red';
            } else {
                defaultClass += ' risk-green';
            }
        }
        return defaultClass;
    }

}