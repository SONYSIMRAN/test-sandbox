import { LightningElement, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';

export default class DxKanbanView extends LightningElement {
    //Header Config
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = false;
    envStatusDashboard = true;
    //Header Config
    result;
    isLoading = true;
    //Progress
    customGrade = true;
    customProgress = true;
    //Sorted Data
    //Color palate
    COL_MAP = {
        TEST: "magenta",
        LOAD: "orange",
        PROD: "lime-green",
    };
    connectedCallback() {
        this.fetchKanbanData();
    }
    formatData(data) {
        let sortMatrix = ['TEST', 'LOAD', 'PROD'];
        let environmentsData = JSON.parse(JSON.stringify(data));
        let response = environmentsData.sort((a, b) => {
            return sortMatrix.indexOf(a.Name) - sortMatrix.indexOf(b.Name);
        });
        response.forEach(el => {
            let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
            el.Releases.sort((a, b) => {
                let nameA = new Date(dateRegex.test(a.Name) ? a.Name : '01/01/1970').getTime();
                let nameB = new Date(dateRegex.test(b.Name) ? b.Name : '01/01/1970').getTime();
                return nameB - nameA;
            });
        });
        return response;
    }
    //Get Kanban API data
    fetchKanbanData(event) {
        this.isLoading = true;
        apiService({
            request: 'GET',
            apiName: 'package-pipeline',
            apiParams: serializeParams({
                sandbox: sessionStorage.getItem("selectedSandbox")
            })
        }).then(response => {
            // this.result = response.packageList;
            this.result = this.formatData(response.Environments);
            //Group data in sandbox
            console.log("response", sessionStorage.getItem("selectedSandbox"), JSON.parse(JSON.stringify(this.result)));
            this.isLoading = false;
        }).catch(error => {
            console.error(error);
            this.isLoading = false;
        })
    }

    //Classes
    get sectionClass() {
        let className = 'kanban-col ';
        className += 'b-' + this.COL_MAP[this.result.Name];
        return className;
    }
    get cardHeader() {
        let className = 'kanban-header center-content ';
        className += this.COL_MAP[this.result.Name];
        return className;
    }

}