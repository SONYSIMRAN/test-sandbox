import { LightningElement, api, track } from 'lwc';
import apiServiceTypeArray from '@salesforce/apex/DXApiService.apiServiceTypeArrayObj';
import { serializeParams } from 'c/dxUtils';

export default class DxVisView360CardTooltip extends LightningElement {
    @api riskProfile;
    @api sandbox;
    @api package;
    @api releaseBranch;
    @api clickedPackage;
    @api activeTooltip;
    @api riskValue;
    @track isLoading = true;
    @track impactedPackages;
    @track emptyList; 
    @api selectTooltip;
    @api tooltipTopPos;
    @track packageCount;

    preventParentClick(event) {
        event.stopPropagation();
    }
    get tooltipPos() {
        return `top: ${parseInt(this.tooltipTopPos + 3)}px`;
    }
    get impactedPackage() {
        this.getImpactedPackages();
        return this.selectTooltip === this.package && this.riskProfile === 'Impacted Packages';
    }
    connectedCallback() {
        // console.log('inside tootltip=', this.sandbox, this.package, this.releaseBranch);
    }
    get tooltipClass() {
        const riskClasses = {
            high: 'card-risk-tootip risk-bg-high',
            medium: 'card-risk-tootip risk-bg-medium',
            low: 'card-risk-tootip risk-bg-low'
        };
        return riskClasses[this.riskValue.toLowerCase()] || 'card-risk-tootip';
    }
    getImpactedPackages() {
        if(this.riskProfile === 'Impacted Packages') {
            apiServiceTypeArray({
                request: 'GET',
                apiName: 'get-impacted-packages',
                apiParams: serializeParams({
                    packageName: this.package,
                    releaseBranch: this.releaseBranch
                })
            }).then(response => {
                this.impactedPackages = response;
                if(this.impactedPackages === null)
                {
                    this.emptyList = true;
                    this.packageCount = 0;
                }
                else {
                    this.emptyList = false;
                    this.packageCount = parseInt(this.impactedPackages.length + 1);
                }
                this.isLoading = false;
            }).catch(error => {
                console.error(error);
            })
        }
    }
}