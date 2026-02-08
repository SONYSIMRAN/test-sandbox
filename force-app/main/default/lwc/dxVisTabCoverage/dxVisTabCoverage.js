import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';

export default class DxVisTabCoverage extends LightningElement {
    //Get params
    @api package;
    @api sandbox;
    //Progress params
    customGrade = true;
    customProgress = true;

    //Coverage Data details
    coverageListLoader = true;
    coverageList;

    // Connected Call events
    connectedCallback() {
        this.fetchCoverageData();
    }

    //Get Kanban API data
    fetchCoverageData() {
        this.isLoading = true;
        apiService({
            request: 'GET',
            apiName: 'package-codequality-unit-test',
            apiParams: serializeParams({
                uname: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            if (response?.CoverageAggregate?.file?.coverageList) {
                this.coverageList = response.CoverageAggregate.file.coverageList;
            }
            this.coverageListLoader = false;
        }).catch(error => {
            console.error(error);
            this.coverageListLoader = false;
        })
    }
}