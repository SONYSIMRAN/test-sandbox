import { LightningElement, api } from 'lwc';

export default class DxVis360CardHeaderValues extends LightningElement {
    @api sortScore;
    @api riskScore;
    @api sandboxName;

    get isLoadEnv() {
        return this.sandboxName === 'LOAD';
    }

    get summaryRiskScore() {
        return this.riskScore.filter(profile => profile.quality_type === 'summary_risk');
    }
}