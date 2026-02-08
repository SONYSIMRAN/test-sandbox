import { LightningElement, api } from 'lwc';

export default class DxVisTabAutomationDetailsResults extends LightningElement {
    @api details;
    @api type;
    @api status;

    
    get exeTestStatus() {
        if (this.status) {
            return this.status === 'FAIL';
        }
        else {
            return false;
        }
    }
    get ZTT() {
        if (this.type === 'ZTT') {
            return true;
        }
    }
    get PDT() {
        if (this.type === 'PDT') {
            return true;
        }
    }

    get ZTTResults() {
        if (this.details?.ZTTResults) {
            return this.details.ZTTResults ? Math.floor(this.details.ZTTResults) === this.details.ZTTResults ? this.details.ZTTResults + '%' : (this.details.ZTTResults).toFixed(2) + '%' : 'No Data';
        }
    }
    get ZTTStatus() {
        if (this.details?.ZTTStatus) {
            return this.details.ZTTStatus === 'PASS' ? true : false;
        }
    }
    //PDT Results
    get PDTResults() {
        if (this.details?.PDTResults) {
            return this.details.PDTResults ? Math.floor(this.details.PDTResults) === this.details.PDTResults ? this.details.PDTResults + '%' : (this.details.PDTResults).toFixed(2) + '%' : 'No Data';
        }
    }
    get PDTStatus() {
        if (this.details?.PDTStatus) {
            return this.details.PDTStatus === 'PASS' ? true : false;
        }
    }
}