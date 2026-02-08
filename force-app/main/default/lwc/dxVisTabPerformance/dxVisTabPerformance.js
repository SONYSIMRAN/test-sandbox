import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class DxVisTabPerformance extends LightningElement {
    @track result;
    singleUserTabLoader = true;
    partialTestTabLoader = true;
    //Get params
    @api package;
    @api sandbox;
    //Single user params
    singleUsertest;
    singleUserNoData = false;
    //Partial Tests Params
    partialTest;
    partialNoData = false;

    // Connected Call events
    connectedCallback() {
        this.fetchPerformanceData();
    }

    //Get Kanban API data
    fetchPerformanceData() {
        this.perfornamceTabLoader = true;
        apiService({
            request: 'GET',
            apiName: 'package-performance-test',
            apiParams: serializeParams({
                uname: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            this.result = response;
            //Single User
            if (response?.singleUserTest?.TransactionDetails.length > 0) {
                this.singleUsertest = response.singleUserTest.TransactionDetails;
            }
            else {
                this.singleUserNoData = true;
            } if (response?.partialTest?.TransactionDetails.length > 0) {
                this.partialTest = response.partialTest.TransactionDetails;

            }
            else {
                this.partialNoData = true;
            }
            this.singleUserTabLoader = false;
            this.partialTestTabLoader = false;
        }).catch(error => {
            this.singleUserTabLoader = false;
            this.partialTestTabLoader = false;
            console.error(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error Info',
                    message: error,
                    variant: 'error',
                }),
            );
        })
    }
    //Single User Events
    get filterOptions() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Pass', value: 'Pass' },
            { label: 'Fail', value: 'Fail' },
        ];
    }

    handleChangeSingleUser(event) {
        let filterTerm = event.detail.value;
        if (filterTerm !== "All" && !this.singleUserNoData) {
            this.singleUsertest = this.result.singleUserTest.TransactionDetails.filter(el => {
                if (el.Results) {
                    return el.Results.includes(filterTerm);
                }
            });
        }
        else if ((filterTerm === "All" || e === "All") && !this.singleUserNoData) {
            this.singleUsertest = this.result.singleUserTest.TransactionDetails;
        }
    }
    //Single user events 
    //Partial tests
    handleChangePartial(event) {
        let filterTerm = event.detail.value;
        if (filterTerm !== "All" && !this.partialNoData) {
            this.partialTest = this.result.partialTest.TransactionDetails.filter(el => {
                if (el.Result) {
                    return el.Result.includes(event.detail.value);
                }
            });
        }
        else if ((filterTerm === "All" || e === "All") && !this.partialNoData) {
            this.partialTest = this.result.partialTest.TransactionDetails;
        }
    }
}