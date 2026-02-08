import { LightningElement, api, track } from 'lwc';

export default class DxVisVersionDropdown extends LightningElement {
    @track selectedVersion;
    @api disabled = false;
    @track versionOptions = [];

    _versions;
    @api
    get versions() {
        return this._versions;
    }
    set versions(value) {
        this._versions = value;
        this.formatVersions();
    }

    formatVersions() {
        console.log('Formatting Versions===>:', JSON.parse(JSON.stringify(this.versions)));
        if (this.versions && this.versions.length > 0) {
            console.log('Formatting Versions:', JSON.parse(JSON.stringify(this.versions)));
            this.versionOptions = this.versions.map(version => {
                return { label: version, value: version };
            });
            console.log('Formatted Versions:', JSON.parse(JSON.stringify(this.versionOptions)));
        } else {
            console.error('No versions found.');
        }
    }

    handleChange(event) {
        this.selectedVersion = event.target.value;
        console.log('Selected Version:', this.selectedVersion);
        this.dispatchEvent(new CustomEvent('versionchange', { detail: { value: this.selectedVersion } }));
    }

    @api
    resetDropdown() {
        this.selectedVersion = ''; // Reset the selected version
    }
}