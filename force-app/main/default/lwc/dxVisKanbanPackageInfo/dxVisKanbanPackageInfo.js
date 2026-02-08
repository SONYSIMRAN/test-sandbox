import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';

export default class DxVisKanbanPackageInfo extends LightningElement {
    @api item;
    @track result;
    isLoading = true;
    //Progressbar
    customGrade = true;
    customProgress = true;
    //Code Coverage
    codeCoverageLoader = true;
    codeCoverageFile;
    coverageData;
    degradationStatusData;
    //Deployment File Data
    deploymentFileLoader = true;
    deploymentFile;
    deploymentData;
    //Child objects
    package2Data;
    attributesData;
    //Code Scann Report
    codeScanReportDetail;
    codeScanReportScore;

    // Connected Call events
    connectedCallback() {
        this.fetchKanbanInfoData();
        console.log(JSON.parse(JSON.stringify(this.item)));
    }
    //Get Kanban API data
    fetchKanbanInfoData(event) {
        this.isLoading = true;
        apiService({
            request: 'GET',
            apiName: 'getKanbanPackageDetailInfo',
            apiParams: serializeParams({
                uname: this.item.uname
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            this.result = response;
            this.coverageData = !(response && response.CodeQualityInfoPage && response.CodeQualityInfoPage.CodeCoverage && response.CodeQualityInfoPage.CodeCoverage.file);
            this.deploymentData = !(response && response.deploymentFile && response.deploymentFile.file);
            if (!this.deploymentData) {
                sessionStorage.setItem('deploymentFile', JSON.stringify(response.deploymentFile.file));
                this.deploymentFile = response.deploymentFile.file;
                this.package2Data = response.deploymentFile.file.Package2 || null;
                this.attributesData = response.deploymentFile.file.attributes || null;
            }
            if (!this.coverageData) {
                this.codeCoverageFile = response.CodeQualityInfoPage.CodeCoverage.file;
                this.degradationStatusData = response.CodeQualityInfoPage.CodeCoverage.file.degradationStatus || null;
            }
            this.codeScanReportDetail = response.CodeQualityInfoPage.CodeScanReport.reportDetail || null;
            this.codeScanReportScore = response.CodeQualityInfoPage.CodeScanReport.score || null;

            //Loader state
            this.codeCoverageLoader = false;
            this.deploymentFileLoader = false;
            this.isLoading = false;
        }).catch(error => {
            console.error(error);
            this.isLoading = false;
        })
    }

    //Set HTML
    get coverageSummary() {
        if (this.codeCoverageFile) {
            return Object.entries(this.codeCoverageFile).filter(key => typeof key[1] !== 'object').map(([key, value]) => ({ key, value }));
        }
    }
    get degradationStatus() {
        if (this.degradationStatusData) {
            return Object.entries(this.degradationStatusData).filter(key => typeof key[1] !== 'object').map(([key, value]) => ({ key, value }));
        }
    }
    //Set Deploymemt data
    get deploymentFileData() {
        if (this.deploymentFile) {
            return Object.entries(this.deploymentFile).filter(key => typeof key[1] !== 'object').map(([key, value]) => ({ key, value }));
        }
    }
    get package2() {
        if (this.package2Data) {
            return Object.entries(this.package2Data).filter(key => typeof key[1] !== 'object').map(([key, value]) => ({ key, value }));
        }
    }
    get attributes() {
        if (this.attributesData) {
            return Object.entries(this.attributesData).filter(key => typeof key[1] !== 'object').map(([key, value]) => ({ key, value }));
        }
    }
}