import { LightningElement, api, track } from 'lwc';
import { formatRiskScoreType } from 'c/utils';
import { NavigationMixin } from 'lightning/navigation';

export default class DxVisView360CardBody extends NavigationMixin(LightningElement) {
    @api packageName;
    @api enabledValue;
    @api sandboxName;
    @api riskScore = null;
    @api status;
    @api codeQualityDetail;
    @track zttGateEnabled = false;
    @track pdtGateEnabled = false;
    @track emptyRiskScores = false;
    @track emptycodeQualityScores = false;
    @track greenFalse = true;
    @api releaseBranch;
    @api selectTooltip;

    //card Colors
    colorMap = {
        'yes': 'background: #f1736b',
        'no': 'background: #65bf78',
        'na': 'background: #6c757d'
    };
    cardColor;
    @api cardHeaderColor;
    connectedCallback() {
        this.status = {
            ...this.status,
            manualQA: false
        };
        this.cardColor = this.colorMap[this.cardHeaderColor.toLowerCase()];
        this.computeGateEnabled();
        this.emptyRiskScores = this.formattedRiskScores.length === 0;

        //Hide tooltip
        // document.addEventListener('click', this.hideInfoTooltip, false);
    }
    //Tooltip info for impacted packages
    // hideInfoTooltip = () => {
    //     this.clickedPackageTooltip = null;
    // }
    // disconnectedCallback() {
    //     document.removeEventListener('click', this.hideInfoTooltip, false);
    // }
    preventParentClick(event) {
        event.stopPropagation();
    }
    @track riskProfile = null;
    @track riskValue = null;
    @track tooltipTopPosition = null;
    // @track clickedPackageTooltip = null;
    riskCircleClickhandler(event) {
        event.stopPropagation();
        this.riskProfile = event.currentTarget.dataset.qualityType;
        this.riskValue = event.currentTarget.dataset.riskValue;
        this.clickedPackageTooltip = event.currentTarget.dataset.riskPackage;
        let getTopPosParent = this.template.querySelector('.tooltip-class-position').getBoundingClientRect();
        let getClickedPos = this.template.querySelector(`[data-quality-type="${this.riskProfile}"]`).getBoundingClientRect();
        this.tooltipTopPosition = getClickedPos.top - getTopPosParent.top;
        this.dispatchEvent(new CustomEvent('activetooltip', { detail: event.currentTarget.dataset.riskPackage }));
    }

    get formattedRiskScores() {
        if (this.riskScore && this.riskScore.length > 0) {
            return this.riskScore.map(score => ({
                ...score,
                qualityType: formatRiskScoreType(score.quality_type)
            }));
        } else {
            return [];
        }
    }

    get isLoadEnv() {
        return this.sandboxName === 'LOAD';
    }

    computeGateEnabled() {
        console.log('this.status.enabledValue', JSON.parse(JSON.stringify(this.status)));
        if (this.status?.enabledValue?.length > 0) {
            this.status.enabledValue.forEach(item => {
                switch (item.name) {
                    case 'automation_ztt':
                        this.zttGateEnabled = item.enabled === 1;
                        break;
                    case 'automation_pdt':
                        this.pdtGateEnabled = item.enabled === 1;
                        break;
                    default:
                        break;
                }
            });
        }

    }

    //Info page
    navigateToInfoPage(event) {
        console.log('Detail', 'sandbox= ', event.currentTarget.dataset.sandbox, 'tabname= ', event.currentTarget.dataset.tabname);
        let comInfo = {
            componentDef: "c:dxPackageInfo",
            attributes: {
                package: event.currentTarget.dataset.package,
                sandbox: event.currentTarget.dataset.sandbox,
                activeTab: event.currentTarget.dataset.tabname,
                color: event.currentTarget.dataset.color
            }
        }
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            },
            state: {
                attributes: {
                    package: event.currentTarget.dataset.package,
                    sandbox: event.currentTarget.dataset.sandbox,
                    activeTab: event.currentTarget.dataset.tabname,
                    color: event.currentTarget.dataset.color
                }
            }
        })
    }
}