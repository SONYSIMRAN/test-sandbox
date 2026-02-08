import { LightningElement, track, api } from 'lwc';

export default class DxVisEnabledFilter extends LightningElement {
  
    @api label = null;
    @api column = '';
    @track selectedEnabled = '';


    @track enabledOptions = [
        { label: 'All', value: '' },
        { label: 'On', value: 'On' },
        { label: 'Off', value: 'Off' }
    ];
     
    
    handleEnabledChange(event) {
        this.selectedEnabled = event.detail.value;
        this.column = this.getAttribute('data-column');
        console.log('Selected Status:', this.selectedEnabled);
        console.log('Column:', this.column);

        const enabledChangeEvent = new CustomEvent('enabledchange', {
            detail: { column: this.column, enabled: this.selectedEnabled }
        });
        this.dispatchEvent(enabledChangeEvent);
    }


}