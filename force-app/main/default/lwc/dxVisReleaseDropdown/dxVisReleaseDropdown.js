import { LightningElement, api, track } from 'lwc';

export default class DxVisReleaseDropdown extends LightningElement {

    @track selectedDate;
    @track releaseDateOptions = [];

    _releaseDates;
    @api
    get releaseDates() {
        return this._releaseDates;
    }
    set releaseDates(value) {
        this._releaseDates = value;
        this.formatReleaseDates();
    }

    formatReleaseDates() {
        if (this.releaseDates && this.releaseDates.length > 0) {
            console.log('Formatting Release Dates:', JSON.parse(JSON.stringify(this.releaseDates)));
            this.releaseDateOptions = this.releaseDates.map(date => {
                return { label: date, value: date };
            });
            console.log('Formatted Release Dates:', JSON.parse(JSON.stringify(this.releaseDateOptions)));
        } else {
            console.error('No release dates found.');
        }
    }

    handleChange(event) {
        this.selectedDate = event.target.value;
        console.log('Selected Date:', this.selectedDate);
        this.dispatchEvent(new CustomEvent('releasedatechange', { detail: { value: this.selectedDate } }));
    }

    @api
    resetDropdown() {
        this.selectedDate = ''; // Reset the selected date
        this.releaseDateOptions = [{label: 'NA', value: 'NA' }];
        // this._releaseDates = ["NA"];
    }

  

}