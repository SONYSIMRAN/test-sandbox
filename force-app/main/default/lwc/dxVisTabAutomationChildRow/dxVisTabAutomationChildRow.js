import { LightningElement, api } from 'lwc';

export default class DxVisTabAutomationChildRow extends LightningElement {

    @api deployTime;
    @api row;
    get exeStatus() {
        return new Date(this.row.bambooBuildTime).getTime() > new Date(this.deployTime.toString().replace(/_/g, ' ')).getTime();
    };

    get rowClass() {
        let classes = 'card m-2 rounded-0 rounded-bottom-right-1 row-card p-2';
        if (this.exeStatus) {
            classes += ' row-card-border-success';
        }
        else {
            classes += ' row-card-border-fail';
        }
        return classes;
    }

    //Convert to second
    get convertToSec() {
        if (this.row?.executionTime) {
            var minutes = Math.floor(this.row.executionTime / 60000);
            var seconds = ((this.row.executionTime % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }
        else {
            return '--';
        }
    }
    get getBuildTime() {
        if (this.row?.bambooBuildTime) {
            return new Date(this.row.bambooBuildTime).toLocaleString()
        }
        else {
            return '--'
        }
    }

    //Groups
    get groups() {
        if (this.row?.groups) {
            const splitGroups = this.row.groups.split(',');
            return splitGroups;
        }
    }
    get success() {
        if (this.row?.status) {
            return this.row.status === 'SUCCESS' ? true : false;
        }
    }
    get failure() {
        if (this.row?.status) {
            return this.row.status === 'FAILURE' ? true : false;
        }
    }
    get exception() {
        if (this.row?.exception) {
            return this.row.exception ? true : false;
        }
    }
}