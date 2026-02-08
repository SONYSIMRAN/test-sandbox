import { LightningElement, api } from 'lwc';

export default class DxVisRiskScore extends LightningElement {
    @api score;
    @api profile;
    

    get riskScoreClass() {
        if (this.profile === 'high') {
            return 'risk-high';
        } else if (this.profile === 'medium') {
            return 'risk-medium';
        } else if (this.profile === 'low') {
            return 'risk-low';
        }
        // Default to 'risk-unknown' if the profile doesn't match known values
        return 'risk-unknown';
    }
}