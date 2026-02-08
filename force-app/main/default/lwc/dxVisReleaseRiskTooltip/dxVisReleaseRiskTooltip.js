import { LightningElement, api, track } from 'lwc';

export default class DxVisReleaseRiskTooltip extends LightningElement {
    @api packages;
    @track overallRiskStatus = '';
    @api position = {};

    connectedCallback() {
        this.calculateOverallRiskScore();
    }

    calculateOverallRiskScore() {
        let riskCounts = {
            high: 0,
            medium: 0,
            low: 0
        };
        let anyLowSummaryRisk = false;

        this.packages.forEach(pkg => {
            const summaryRiskProfile = pkg.riskScore.find(score => score.quality_type === 'summary_risk');

            if (summaryRiskProfile) {
                riskCounts[summaryRiskProfile.profile]++;
                if (summaryRiskProfile.profile === 'low') {
                    anyLowSummaryRisk = true;
                }
            }
        });

        if (anyLowSummaryRisk) {
            this.overallRiskStatus = 'High Risk';
        } else if (riskCounts.low >= 3 || riskCounts.medium >= 2) {
            this.overallRiskStatus = 'High Risk';
        } else if (riskCounts.medium === 1 && riskCounts.low > 0) {
            this.overallRiskStatus = 'Medium Risk';
        } else if (riskCounts.medium === 1 && anyLowSummaryRisk) {
            this.overallRiskStatus = 'Medium Risk';
        } else {
            this.overallRiskStatus = 'Low Risk';
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
    
    // get popoverClass() {
    //     const topClass = this.position.top ? `top-${this.position.top}` : '';
    //     const leftClass = this.position.left ? `left-${this.position.left}` : '';
    //     return `popover ${topClass} ${leftClass}`;
    // }
    // get popoverClass() {
    //     return `slds-popover slds-nubbin_top slds-popover_alert ${this.position.top ? 'top-position' : ''} ${this.position.left ? 'left-position' : ''}`;
    // }

    
}