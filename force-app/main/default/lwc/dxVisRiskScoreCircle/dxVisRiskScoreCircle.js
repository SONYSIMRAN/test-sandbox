import { LightningElement, api } from 'lwc';

export default class DxVisRiskScoreCircle extends LightningElement {
    @api scoreValue = null;
    @api scoreRisk =null;
    @api qualityType;


    get hoverEffect() {
        return this.qualityType === 'Impacted Packages' ? true : false;
    }
    get riskCircleEffect() {
        let defaultClass = "pulshing-circle";
        if (this.scoreRisk.toLowerCase() === 'high') {
            defaultClass += ' risk-bg-circle-high';
        }
        else if (this.scoreRisk.toLowerCase() === 'medium') {
            defaultClass += ' risk-bg-circle-medium';
        }
        else if (this.scoreRisk.toLowerCase() === 'low') {
            defaultClass += ' risk-bg-circle-low';
        }
        return defaultClass;
    }
    
    get riskScoreClass() {
        let baseClass = 'risk-score-circle';
        if (this.scoreRisk.toLowerCase() === 'high') {
            baseClass += ' risk-score-circle-high';
        }
        else if (this.scoreRisk.toLowerCase() === 'medium') {
            baseClass += ' risk-score-circle-medium';
        }
        else if (this.scoreRisk.toLowerCase() === 'low') {
            baseClass += ' risk-score-circle-low';
        }
        return baseClass;
    }
}