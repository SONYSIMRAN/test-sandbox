import { LightningElement, api } from 'lwc';
import DxVisKanbanModal from 'c/dxVisKanbanModal';
import { serializeParams, replaceUnderscoreBySpace } from 'c/dxUtils';

export default class DxVisKanbanCard extends LightningElement {
    @api item;
    //Progress
    //Details
    customGrade = true;
    customProgress = true;
    customMeter = true;
    //Meter values
    meterResult;
    meterProfile;
    meterQualityType;

    COL_MAP = {
        TEST: "magenta",
        LOAD: "orange",
        PROD: "lime-green",
    };
    get sectionClass() {
        let className = 'kanban-card card position-relative ';
        className += 'b-' + this.COL_MAP[this.item.sandbox];
        return className;
    }
    get cardHeader() {
        let className = 'justify-content-between d-flex ';
        className += this.COL_MAP[this.item.sandbox];
        return className;
    }
    get summaryRiskMeter() {
        let riskMeter = false;
        if (this.item.sandbox === 'LOAD') {
            riskMeter = true;
        }
        return riskMeter;
    }
    connectedCallback() {
        console.log('Package Details', this.summaryRiskMeter, JSON.parse(JSON.stringify(this.item)));
        if (this.item.sandbox === 'LOAD' && this.item.riskScore.length > 0) {
            this.item.riskScore.filter(x => x.quality_type === 'summary_risk').map((profile, i) => {
                this.meterProfile = profile.profile;
                this.meterResult = profile.result;
                this.meterQualityType = replaceUnderscoreBySpace(profile.quality_type) || 'No Data';
            });
        }
    }
    get noPROD() {
        return this.item.sandbox !== 'PROD' ? true : false
    }
    get envStatusClass() {
        let envClass = 'env-gate-status '
        if (this.item.status) {
            envClass += this.item.status.PDTStatus === 'FAIL' || this.item.status.ZTTStatus === 'FAIL' ? "env-gate-status-danger" : "env-gate-status-success"
        }
        return envClass;
    }
    //Modal Event
    async handleModalClick() {
        const result = await DxVisKanbanModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: 'Kanban Modal',
            content: {
                sandbox: this.item.sandbox,
                packageName: this.item.packageName,
                color: this.COL_MAP[this.item.sandbox],
                branch: this.item.Branch,
                isOrgDependent: this.item.IsOrgDependent,
                SubscriberPackageVersionId: this.item.SubscriberPackageVersionId,
                Version: this.item.Version,
                bambooReleaseName: this.item.bambooReleaseName,
                codeQuality: this.item.codeQuality,
                packageDeployTime: this.item.packageDeployTime,
                release: this.item.release,
                riskScore: this.item.riskScore,
                sortScore: this.item.sortScore,
                uname: this.item.uname,
                status: this.item.status
            }
        });
        // if modal closed with X button, promise returns result = 'undefined'
        // if modal closed with OK button, promise returns result = 'okay'
    }
}