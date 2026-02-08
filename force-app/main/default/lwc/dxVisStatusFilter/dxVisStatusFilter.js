import { LightningElement, api, track } from 'lwc';

export default class DxVisStatusFilter extends LightningElement {
    @api label = 'Status'; // Default label if not provided
    @api column = ''; // Attribute to receive data-column value

    @track selectedStatus = '';
    @track lastSelectedColumn = '';
    @api selectedValue = '';
   
     statusOptions = [
        { label: 'All', value: '' },
        { label: 'Pass', value: 'Pass' },
        { label: 'Fail', value: 'Fail' },
        // Add more status options as needed
    ];

    
    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
        // this.lastSelectedColumn = this.column;
        this.column = this.getAttribute('data-column'); // Capture the column value from data-column attribute
        console.log('Selected Status:', this.selectedStatus);
        console.log('Column:', this.column);
        const statusChangeEvent = new CustomEvent('statuschange', {
            detail: { column: this.column, status: this.selectedStatus}
        });
        this.dispatchEvent(statusChangeEvent);
    }
}