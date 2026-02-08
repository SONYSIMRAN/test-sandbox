import { LightningElement, track, wire } from 'lwc';
import getSandboxCredentials from '@salesforce/apex/DXPackagesController.fetchSandboxData';

export default class DxSandboxDropdown extends LightningElement {
    @track sandboxOptions = [];
    @track selectedSandbox;

    @wire(getSandboxCredentials)
    wiredSandboxes({ error, data }) {
        if (data) {
            this.sandboxOptions = data.map(sandbox => {
                return { label: sandbox.Sandbox_Name__c, value: sandbox.Named_Credential__c };
            });

            const defaultSandbox = data.find(sandbox => sandbox.IsDefault__c);
            if (defaultSandbox) {
                // this.selectedSandbox = defaultSandbox.Named_Credential__c ? defaultSandbox.Named_Credential__c : 'default';
                this.selectedSandbox = defaultSandbox.Named_Credential__c;
                console.log('this.selectedSandbox in Comp::', this.selectedSandbox);
                this.dispatchSandboxChangeEvent(this.selectedSandbox);
            } else if (this.sandboxOptions.length > 0) {
                this.selectedSandbox = this.sandboxOptions[0].value;
                this.dispatchSandboxChangeEvent(this.selectedSandbox);
            }
        } else if (error) {
            console.error('Error fetching sandboxes', error);
        }
    }

    handleSandboxChange(event) {
        const selectedSandbox = event.detail.value;
        this.selectedSandbox = selectedSandbox;
        this.dispatchSandboxChangeEvent(selectedSandbox);
    }

    dispatchSandboxChangeEvent(sandboxNamedCredential) {
        const sandboxChangeEvent = new CustomEvent('sandboxchange', {
            detail: { sandboxNamedCredential: sandboxNamedCredential }
        });
        this.dispatchEvent(sandboxChangeEvent);
    }
}