import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams, insertSpaceBeforeCapital } from 'c/dxUtils';

export default class DxVisTabAutomation extends LightningElement {
    @track result;
    ZTTLoader = true;
    PDTLoader = true;
    searchInput = false;
    //Details Results
    DetailsResults;
    //Team params
    allTeams = "All Teams";
    noTeams = "No Team Name";

    //Get params
    @api package;
    @api sandbox;
    //Package Deploy Time
    packageDeployTime;
    //Data operations
    ZTTResultData;
    ZTTNoData;
    ZTTTeam;
    ZTTStatus;
    filterZTTKeywords = [null, null]
    filterPDTKeywords = [null, null]

    PDTResultData;
    PDTNoData;
    PDTTeam;
    PDTStatus;
    statusOptions = [
        { label: "All", value: null },
        { label: "Success", value: "SUCCESS" },
        { label: "Failure", value: "FAILURE" }
    ];
    setZTTTeamName;
    setPDTTeamName;
    //Status
    exeZTTStatus;
    exePDTStatus;

    // Connected Call events
    connectedCallback() {
        this.fetchAutomationData();
    }

    //Get Kanban API data
    fetchAutomationData() {
        this.ZTTLoader = true;
        this.PDTLoader = true;
        apiService({
            request: 'GET',
            apiName: 'package-automation-test',
            apiParams: serializeParams({
                uname: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            this.result = response;
            if (response?.DetailsResults) {
                this.DetailsResults = response?.DetailsResults;
                this.packageDeployTime = response?.DetailsResults?.PackageDeployTime;
            }
            //ZTT Results
            if (response?.ZTTResult.length > 0) {
                this.ZTTResultData = response?.ZTTResult;
                this.exeZTTStatus = this.executionResult(response?.ZTTResult);
                this.setZTTTeamName = this.ZTTResultData.reduce((team, { TeamName }, index) => {
                    if (team.some(obj => obj.value === TeamName)) {
                        return team;
                    }
                    team.push({
                        label: TeamName ? TeamName.replace(/([A-Z])/g, ' $1').trim() : '',
                        value: TeamName
                    });
                    return team;
                }, [])
                for (let t of this.setZTTTeamName) if (t.label == '' && t.value == undefined) { t.label = 'No Team Name'; t.value = 'NoTeam' };
            }
            else {
                this.ZTTNoData = response?.ZTTResult.length === 0 ? true : false;

            }
            //ZTT Results
            if (response?.PDTResult.length > 0) {
                this.PDTResultData = response?.PDTResult;
                this.exePDTStatus = this.executionResult(response?.PDTResult);
                this.setPDTTeamName = this.PDTResultData.reduce((team, { TeamName }, index) => {
                    if (team.some(obj => obj.value === TeamName)) {
                        return team;
                    }
                    team.push({
                        label: TeamName ? TeamName.replace(/([A-Z])/g, ' $1').trim() : '',
                        value: TeamName
                    });
                    return team;
                }, [])
                for (let t of this.setPDTTeamName) if (t.label == '' && t.value == undefined) { t.label = 'No Team Name'; t.value = 'NoTeam' };
            }
            else {
                this.PDTNoData = response?.PDTResult.length === 0 ? true : false;
            }
            //Loaders
            this.ZTTLoader = false;
            this.PDTLoader = false;
        }).catch(error => {
            console.error(error);
            this.ZTTLoader = false;
            this.PDTLoader = false;
        })
    }

    executionResult = (getObj) => {
        let status;
        if (getObj) {
            let getExeStats = getObj.filter(item => new Date(this.packageDeployTime.toString().replace(/_/g, ' ')).getTime() > new Date(item.bambooBuildTime).getTime());
            status = getExeStats.length > 0 ? 'FAIL' : 'PASS';
        }
        return status;
    }
    // get exeZTTStatus() {
    //     if (this.ZTTResultData && this.packageDeployTime) {
    //         this.executionResult(this.ZTTResultData);
    //     }
    // };
    // get exePDTStatus() {
    //     if (this.PDTResultData && this.packageDeployTime) {
    //         this.executionResult(this.PDTResultData);
    //     }
    // };


    //Filter ZTT Teams
    get ZTTFilterOptions() {
        if (this.ZTTResultData && this.setZTTTeamName) {
            return [...[{ label: this.allTeams, value: null }], ...this.setZTTTeamName];
        }
    }
    get PDTFilterOptions() {
        if (this.PDTResultData && this.setPDTTeamName) {
            return [...[{ label: this.allTeams, value: null }], ...this.setPDTTeamName];
        }
    }
    filterZTTRsults(key1, key2) {
        if (key1 && key1 !== 'NoTeam' && key2) {
            this.ZTTResultData = this.result.ZTTResult.filter(el => this.filterZTTKeywords.includes(el.TeamName) && this.filterZTTKeywords.includes(el.status));
        }
        else if (key1 && key1 !== 'NoTeam' && !key2) {
            this.ZTTResultData = this.result.ZTTResult.filter(el => this.filterZTTKeywords.includes(el.TeamName));
        }
        else if (!key1 && key2) {
            this.ZTTResultData = this.result.ZTTResult.filter(el => this.filterZTTKeywords.includes(el.status));
        }
        else if (key1 === 'NoTeam' && key2) {
            this.ZTTResultData = this.result.ZTTResult.filter(el => (!el.hasOwnProperty('TeamName') || el.TeamName === '') && this.filterZTTKeywords.includes(el.status));
        }
        else if (key1 === 'NoTeam' && !key2) {
            this.ZTTResultData = this.result.ZTTResult.filter(el => (!el.hasOwnProperty('TeamName') || el.TeamName === ''));
        }
        else {
            this.ZTTResultData = this.result.ZTTResult;
        }
        console.log("ZTT Filtered Data", JSON.parse(JSON.stringify(this.ZTTResultData)));
    }

    filterPDTRsults(key1, key2) {
        if (key1 && key1 !== 'NoTeam' && key2) {
            this.PDTResultData = this.result.PDTResult.filter(el => this.filterPDTKeywords.includes(el.TeamName) && this.filterPDTKeywords.includes(el.status));
        }
        else if (key1 && key1 !== 'NoTeam' && !key2) {
            this.PDTResultData = this.result.PDTResult.filter(el => this.filterPDTKeywords.includes(el.TeamName));
        }
        else if (!key1 && key2) {
            this.PDTResultData = this.result.PDTResult.filter(el => this.filterPDTKeywords.includes(el.status));
        }
        else if (key1 === 'NoTeam' && key2) {
            this.PDTResultData = this.result.PDTResult.filter(el => (!el.hasOwnProperty('TeamName') || el.TeamName === '') && this.filterPDTKeywords.includes(el.status));
        }
        else if (key1 === 'NoTeam' && !key2) {
            this.PDTResultData = this.result.PDTResult.filter(el => (!el.hasOwnProperty('TeamName') || el.TeamName === ''));
        }
        else {
            this.PDTResultData = this.result.PDTResult;
        }
        console.log("PDT Filtered Data", JSON.parse(JSON.stringify(this.PDTResultData)));
    }

    //Filter ZTT results
    filterZTTByTeamName(event) {
        console.log('Filter value', event.detail.value);
        this.filterZTTKeywords[0] = event.detail.value;
        console.log(event.detail.value, this.filterZTTKeywords);
        this.filterZTTRsults(this.filterZTTKeywords[0], this.filterZTTKeywords[1]);
    }
    filterZTTByStatus(event) {
        this.filterZTTKeywords[1] = event.detail.value;
        console.log(event.detail.value, this.filterZTTKeywords);
        this.filterZTTRsults(this.filterZTTKeywords[0], this.filterZTTKeywords[1]);
    }
    //Filter PDT results
    filterPDTByTeamName(event) {
        console.log('Filter value', event.detail.value);
        this.filterPDTKeywords[0] = event.detail.value;
        console.log(event.detail.value, this.filterPDTKeywords);
        this.filterPDTRsults(this.filterPDTKeywords[0], this.filterPDTKeywords[1]);
    }
    filterPDTByStatus(event) {
        this.filterPDTKeywords[1] = event.detail.value;
        console.log(event.detail.value, this.filterPDTKeywords);
        this.filterPDTRsults(this.filterPDTKeywords[0], this.filterPDTKeywords[1]);
    }

    //Search Input
    filtereBySearchInput = (search, keys, tests) => {
        console.log('Search input changed..', search, keys, tests);
        let getTests = tests;
        let lowSearch = search.toLowerCase();
        if (search.length > 0) {
            this.ZTTResultData = tests.filter(test =>
                keys.some(key =>
                    String(test[key]).toLowerCase().includes(lowSearch)
                )
            );

        }
        else if (search.length === 0 || search === '') {
            this.ZTTResultData = getTests;
        }
    }

    onChangeSearchInput(event) {
        if (this.ZTTResultData) {
            this.filtereBySearchInput(event.detail.value, ['testPackageName', 'testMethodName', 'testClassName'], this.ZTTResultData);
        }
    }
    onBlurSearchInput(event) {
        if (this.ZTTResultData) {
            this.filtereBySearchInput(event.detail.value, ['testPackageName', 'testMethodName', 'testClassName'], this.ZTTResultData);
        }
    }

}