import { LightningElement, api } from 'lwc';

export default class DxVisTabAutomationTestCounts extends LightningElement {
    @api result;
    // testCounts = [{ test: 'Total', type: true }, { tets: 'Passed', type: true }, { test: 'Failed', type: true }];
    // connectedCallback() {
    //     console.log(JSON.parse(JSON.stringify(this.result)));
    // }

    filterItems = (data, filterItem) => {
        let tempArr;
        if (data && filterItem) {
            tempArr = data.filter((el) => {
                return el.status.includes(filterItem)
            })
            return tempArr.length
        }
    }

    get totalCounts() {
        if (this.result) {
            return this.result.length || '0';
        }
    }
    get passedCount() {
        if (this.result) {
            return this.filterItems(this.result, "SUCCESS");
        }
    }
    get failedCount() {
        if (this.result) {
            return this.filterItems(this.result, "FAILURE");
        }
    }
}