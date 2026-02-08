import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import images from '@salesforce/resourceUrl/visualizer_images';
import getInstalledPackages from '@salesforce/apex/DXPackagesController.getInstalledPackages';
import IS_SALESFORCE_USER from '@salesforce/label/c.is_Salesforce_User';

export default class SfdxPackage360View extends LightningElement {
    @api packageData;
    @track organizedData = [];
    @track packData = [];
    @track isLoading = false;
    @track selectedVersion = '';
    @track selectedDate = '';
    @track versions = [];
    @track releaseDates = [];
    @track namedCredential = 'Visualizer';


    isSalesforceUser = IS_SALESFORCE_USER.toLowerCase() === 'true';
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = true;
    buttonMetricsDashboard = false;
    //  Icons header
    releaseRisk = images + '/meter-360.svg';
    releaseStatus = images + '/info-360.svg';
    releasePackageCount = images + '/count-360.svg';
    releaseArtifact = images + '/artifacts-360.svg';


    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            // Retrieve packageData from attributes
            this.packData = currentPageReference.attributes.attributes?.packageData;
            console.log('this.packData---', JSON.parse(JSON.stringify(this.packData)));
            if (this.packData) {
                this.organizeData();
                this.versions = this.getUniqueVersions(this.packData);
                this.updateReleaseDates();
            }
        }
    }
    
    handleSandboxChange(event) {
        this.namedCredential = event.detail.sandboxNamedCredential; // Store the named credential
        this.refreshData(this.namedCredential);
    }

    refreshData(namedCredential) {
        console.log('namedCredential in refresh', namedCredential);
        this.isLoading = true;
        getInstalledPackages({ namedCredential: namedCredential  || this.namedCredential })
            .then((result) => {
                console.log('result in sfdx', result);
                this.packData = result;
                this.organizeData();
                this.versions = this.getUniqueVersions(this.packData);
                this.updateReleaseDates();
                this.isLoading = false;
            })
            .catch((error) => {
                console.error('Error fetching packages: ', error);
                this.isLoading = false;
            });
    }

    // getPackageClass(pkg) {
    //     let baseClass = 'slds-p-around_x-small slds-border_bottom view-360-header slds-grid slds-grid_align-spread';
    //     let orgDependentClass = pkg.IsOrgDependent ? 'org-dependent-true' : 'org-dependent-false';

    //     return `${baseClass} ${orgDependentClass}`;
    // }
   
    organizeData() {
        if (this.packData) {
            const groupedByVersion = this.packData.reduce((acc, pkg) => {
                const versionName = pkg.PackageVersionName || 'Unknown Version';
                if (!acc[versionName]) {
                    acc[versionName] = [];
                }
                // Create a new object for each package
                const packageWithClass = {
                    ...pkg,
                    // class: `slds-card package-card slds-is-relative ${pkg.IsOrgDependent ? 'org-dependent-true' : 'org-dependent-false'}`,
                    // computedClass: this.getPackageClass(pkg)
                };
                acc[versionName].push(packageWithClass);
                return acc;
            }, {});

            this.organizedData = Object.keys(groupedByVersion).map(versionName => ({
                versionName,
                packages: groupedByVersion[versionName]
            }));
        }
    }

    getUniqueVersions(packages) {
        const allVersions = [];
        packages.forEach(pkg => {
            console.log('pkg', JSON.parse(JSON.stringify(pkg)));
            const maskedVersion = this.maskVersion(pkg.Version);
            if (!allVersions.includes(maskedVersion)) {
                allVersions.push(maskedVersion);
            }
        });
        return allVersions.sort();
    }

    maskVersion(version) {
        const versionParts = version.split('.');
        return versionParts.length >= 3 ? `${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.*` : version;
    }

    getUniqueReleaseDates(packages) {
        const allDates = [];
        packages.forEach(pkg => {
            if (!allDates.includes(pkg.PackageVersionName)) {
                allDates.push(pkg.PackageVersionName);
            }
        });
        return allDates.sort((a, b) => new Date(b) - new Date(a));
    }

    handleVersionChange(event) {
        this.selectedVersion = event.detail.value;
        this.updateReleaseDates();
        this.filterPackages();
    }

    handleReleaseDateChange(event) {
        this.selectedDate = event.detail.value;
        this.filterPackages();
    }

    updateReleaseDates() {
        if (!this.selectedVersion) {
            this.releaseDates = [];
            return;
        }
        const filteredPackages = this.packData.filter(pkg => 
            this.maskVersion(pkg.Version) === this.selectedVersion
        );

        const uniqueReleaseDates = this.getUniqueReleaseDates(filteredPackages);
        this.releaseDates = uniqueReleaseDates.length > 0 ? uniqueReleaseDates : ['NA'];
        if (this.selectedDate && !this.releaseDates.includes(this.selectedDate)) {
            this.selectedDate = '';
        }
    }

    filterPackages() {
        const filteredData = this.packData.filter(pkg => {
            const versionMatch = this.selectedVersion ? this.maskVersion(pkg.Version) === this.selectedVersion : true;
            const dateMatch = this.selectedDate ? pkg.PackageVersionName === this.selectedDate : true;
            return versionMatch && dateMatch;
        });

        console.log('Filtered Data:', JSON.parse(JSON.stringify(filteredData)), this.selectedVersion);

        const groupedByVersion = filteredData.reduce((acc, pkg) => {
            const versionName = pkg.PackageVersionName || 'Unknown Version';
            if (!acc[versionName]) {
                acc[versionName] = [];
            }
            acc[versionName].push(pkg);
            return acc;
        }, {});
        
        this.organizedData = Object.keys(groupedByVersion).map(versionName => ({
            versionName,
            packages: groupedByVersion[versionName]
        }));
    }

    handleRefreshReset() {
        this.selectedVersion = '';
        this.selectedDate = '';
        const releaseDropdown = this.template.querySelector('c-dx-vis-release-dropdown');
        const versionDropdown = this.template.querySelector('c-dx-vis-version-dropdown');
        console.log('releaseDropdown', releaseDropdown);
        console.log('versionDropdown', versionDropdown);
        if (releaseDropdown) {
            releaseDropdown.resetDropdown();
        }
        if (versionDropdown) {
            versionDropdown.resetDropdown();
        }
        this.refreshData();
    }

}