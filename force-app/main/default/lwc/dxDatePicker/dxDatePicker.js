import { LightningElement, track } from 'lwc';

export default class DxDateRangePicker extends LightningElement {
    @track startDate = '';
    @track endDate = '';
    // @track isLoader = false;


    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }

    handleApplyClick() {
        this.isLoader = true;
        console.log('handleApplyClick', this.startDate, this.endDate);
        this.dispatchEvent(new CustomEvent('daterangeapply', {
            detail: { startDate: this.startDate, endDate: this.endDate }
        }));
    }
}