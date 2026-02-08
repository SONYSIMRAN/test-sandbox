// dxPackagesList.js
import { LightningElement, track } from 'lwc';
import getInstalledPackages from '@salesforce/apex/DXPackagesController.getInstalledPackages';

export default class DxPackagesList extends LightningElement {
    @track installedPackages = [];
    @track error;
    @track isLoading = true; // Add isLoading tracker

    connectedCallback() {
        this.loadInstalledPackages();
    }

    loadInstalledPackages() {
        getInstalledPackages()
            .then(result => {
                console.log('Received data from Apex--->:', result);
                this.installedPackages = result.map(pkg => ({
                    Id: pkg.Id,
                    packageName: pkg.PackageName,
                    Version: pkg.Version,
                    PackageVersionName : pkg.PackageVersionName,
                    NamespacePrefix: pkg.NamespacePrefix,
                    IsOrgDependent : 'Yes',
                    // codeQuality : {
                    //     consolidatedScore : 0,
                    //     detail: {
                    //         quality : "",
                    //         coverage : 0,
                    //         automation : 0,
                    //         performance : 0,
                    //         dependency: ""
                    //     }
                    // }
                }));
            })
            .catch(error => {
                this.error = error;
                console.error('Error fetching installed packages:', error);
            })
            .finally(() => {
                this.isLoading = false; // Set isLoading to false after data is fetched
            });
    }
}