import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import DxVisTestErrorInfoModal from 'c/dxVisTestErrorInfoModal';

export default class DxVisTabTests extends LightningElement {
    testDataLoader = true;
    //Get params
    @api package;
    @api sandbox;
    //Set Accordion Data
    @track executionResults = [];
    accordionContents = {}
    accordionData;
    setError;
    totalCount = null;
    totalFailCount = 0;
    totalPassCount = 0;

    // Connected Call events
    connectedCallback() {
        this.fetchDependencyScore();
    }

    //Get Kanban API data
    fetchDependencyScore() {
        this.testDataLoader = true;
        apiService({
            request: 'GET',
            apiName: 'package-codequality-unit-test',
            apiParams: serializeParams({
                uname: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            if (response?.TestExecution?.file?.results) {
                Object.entries(response.TestExecution.file.results).forEach(([key, element]) => {
                    let failTestCount = 0;
                    let creatObj = {
                        unitTestsCount: null,
                        failTestCount: null,
                        passedTestCount: null,
                        totalRunTime: null,
                        header: key,
                        details: []
                    }
                    this.accordionContents.header = key;
                    this.accordionContents.details = [];
                    if (element) {
                        element.forEach(item => {
                            const { Outcome, RunTime, MethodName, Id, StackTrace, Message, git } = item;
                            creatObj.unitTestsCount = element.length;
                            if (Outcome !== 'Pass') {
                                creatObj.failTestCount = 1 + failTestCount++;
                            }
                            creatObj.passedTestCount = element.length ? element.length - failTestCount : 0;
                            1 + this.totalCount++;
                            if (Outcome !== 'Pass') {
                                1 + this.totalFailCount++;
                            }
                            creatObj.totalRunTime += RunTime;
                            if (git?.author) {
                                creatObj.details.push({
                                    name: MethodName,
                                    outCome: Outcome === 'Pass' ? { result: true } : { result: false, error: { errorId: Id, stackTrace: StackTrace, errorMessage: Message } },
                                    runTime: RunTime,
                                    gitInfo: {
                                        author: git.author,
                                        commitId: git.commitId,
                                        date: git.date,
                                        fileName: git.fileName,
                                        email: git.email,
                                        commitLink: `https://github.com/allegis-is-connected/${this.package}/commit/${git.commitId}`
                                    }
                                })
                            }
                        });
                    }
                    this.totalPassCount = this.totalCount - this.totalFailCount;
                    this.executionResults.push(creatObj);
                    console.log(creatObj);
                });
                // console.log(JSON.parse(JSON.stringify(this.accordionContents)));
            }
            this.testDataLoader = false;
        }).catch(error => {
            console.error(error);
            this.testDataLoader = false;
        })
    }

    //Modal Event
    async showModalErrorInfo(event) {
        console.log(JSON.parse(JSON.stringify(event.currentTarget.dataset.stack, event.currentTarget.dataset.message)));
        const result = await DxVisTestErrorInfoModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'medium',
            description: 'Tests Failed!',
            content: {
                errorId: event.currentTarget.dataset.id,
                stackTrace: event.currentTarget.dataset.stack,
                errorMessage: event.currentTarget.dataset.message
            }
        });
        // if modal closed with X button, promise returns result = 'undefined'
        // if modal closed with OK button, promise returns result = 'okay'
    }
   
}