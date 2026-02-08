import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getInstalledPackages from '@salesforce/apex/DXPackagesController.getInstalledPackages';
import IS_SALESFORCE_USER from '@salesforce/label/c.is_Salesforce_User';

export default class SfdxPackageListView extends LightningElement {
    @api packageData;
    @track organizedData = [];
    @track packData = [];
    @track isLoading = false;
    @track namedCredential = 'Visualizer';
    //Counts
    totalPackaegCount = 0;
    orgDependentCount = 0;
    noOrgDependent = 0;
    unpackagedMetadata = 0;


    isSalesforceUser = IS_SALESFORCE_USER.toLowerCase() === 'true';
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = true;
    buttonMetricsDashboard = false;



    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            // Retrieve packageData from attributes
            this.packData = currentPageReference.attributes.attributes?.packageData;
            console.log('this.packData---', JSON.parse(JSON.stringify(this.packData)));
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
                // Calculate the counts
                this.totalPackageCount = this.packData?.length || 0;
                console.log('totalPackageCount', this.totalPackageCount);
                this.orgDependentCount = this.packData.filter((element) => element.IsOrgDependent === true).length;
                console.log('orgDependentCount', this.orgDependentCount);
                this.noOrgDependent = this.packData.filter((element) => element.IsOrgDependent === false).length;
                console.log('noOrgDependent', this.noOrgDependent);
                this.isLoading = false;
            })
            .catch((error) => {
                console.error('Error fetching packages: ', error);
                this.isLoading = false;
            });
    }

}