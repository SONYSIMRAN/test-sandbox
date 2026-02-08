import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import images from '@salesforce/resourceUrl/visualizer_images';
import { NavigationMixin } from 'lightning/navigation';

export default class DxVisTabPackageDetails extends NavigationMixin(LightningElement) {
    userProfile = images + '/user.png';
    @track result;
    isLoading = true;
    //Get params
    @api package;
    @api sandbox;
    @api cardColor;
    //Progress params
    customGrade = true;
    customProgress = true;

    //Left Column
    qualityScoreDetailsLoader = true;
    @track qualityScoreDetails;
    //Deployment Details
    deploymentFileLoader = true;
    headerDescription = '';
    deploymentFile;
    deploymentFileNoData;
    // Package Owner
    packageManagerLoader = true;
    packageManager;
    //Dependency List
    dependencyList;
    selectedDP;
    dependencyPackagesLoader = false;
    //Metadata details
    metadataTypeListLoader = true;
    metadataTypeList;

    // Connected Call events
    connectedCallback() {
        this.fetchPackageInfoData();
    }

    //Get Kanban API data
    fetchPackageInfoData() {
        this.isLoading = true;
        apiService({
            request: 'GET',
            apiName: 'getpackageinfo',
            apiParams: serializeParams({
                packagename: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            if (response?.CodeQualityInfoPage?.detail) {
                this.qualityScoreDetails = response.CodeQualityInfoPage.detail;
                this.qualityScoreDetailsLoader = false;
            }
            if (response?.deploymentFile?.file) {
                this.deploymentFileLoader = false;
                this.deploymentFile = response.deploymentFile.file;
                this.headerDescription = response.deploymentFile.file.Description;
                const selectedCardHeaderColor = new CustomEvent("cardheadercolor", {
                    detail: response?.deploymentFile?.file?.IsOrgDependent
                  });               
                  // Dispatches the event.
                  this.dispatchEvent(selectedCardHeaderColor);

                
            }
            if (response?.packageOwnership?.packages[0]?.contact) {
                this.packageManager = response.packageOwnership.packages[0].contact;
                this.packageManagerLoader = false;
            }
            if (response?.deploymentFile?.file?.packageName && response?.metadataFile?.file?.dependency_package) {
                this.dependencyList = this.createDependencyPackageList(response.deploymentFile.file.packageName, response.metadataFile.file.dependency_package);
                this.selectedDP = response.deploymentFile.file.packageName;
            }
            if (response?.metadataFile?.file?.metadataType) {
                this.metadataTypeList = response.metadataFile.file.metadataType;
            }
            this.result = response;
            this.isLoading = false;
            this.metadataTypeListLoader = false;
        }).catch(error => {
            console.error(error);
            this.isLoading = false;
            this.qualityScoreDetailsLoader = false;
            this.metadataTypeListLoader = false;
        })
    }

    handleMemberClick(event) {
        console.log("event",event);
        const memberName = event.currentTarget.getAttribute('data-member-name');
        const memberType = event.currentTarget.getAttribute('data-member-type');
        const id = event.currentTarget.getAttribute('data-member-id');
        const sandboxName = this.sandbox; 
        const packageName = this.package;
        console.log("parameters", memberName, memberType, sandboxName, packageName, id);
        // Navigate to the graph page with parameters
        this.navigateToGraphPage(memberName, memberType, sandboxName, packageName, id);
    }

    // Navigate to the graph page
    navigateToGraphPage(memberName, memberType, sandboxName, packageName, id) {
        let comInfo = {
            componentDef: "c:dxVisPackageMetadataDepGraph", // Component to navigate to
            attributes: {
                memberName: memberName,
                memberType: memberType,
                sandboxName: sandboxName,
                packageName: packageName,
                id: id
            }
        };
        let encodePackageInfo = btoa(JSON.stringify(comInfo)); // Encode the component info

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo // Navigate to the encoded URL
            }
        });
    }

    createDependencyPackageList(currentpackage, packageList) {
        if (packageList.length > 0 && currentpackage) {
            let options = [
                // { label: "Package Dependencies", value: "Package-Dep-Header" },
                { label: "all", value: currentpackage }
            ];
            packageList.forEach((el) => {
                options.push({ label: el, value: el });
            });
            // For innovation Sprint
            options = [...options,
            // { label: 'divider', value: 'package-dep-divider' },
            // { label: 'Unused Metadata', value: 'Unused-Header' },
            { label: 'Unused Metadata', value: 'Unused-Metadata' }];
            return options;
        }
    }
    handleDepFilterChange(event) {
        console.log(event.detail.value);
        let filterValue = event.detail.value;
        this.metadataTypeListLoader = true;
        if (filterValue.includes('Unused')) {
            apiService({
                request: 'GET',
                apiName: 'package-unused-metadata-list',
                apiParams: serializeParams({
                    uname: `${filterValue}_${this.sandbox}`,
                })
            }).then(response => {
                if (response?.metadataFile?.file?.metadataType) {
                    this.metadataTypeList = response.metadataFile.file.metadataType;
                }
                console.log("filter", JSON.parse(JSON.stringify(this.metadataTypeList)));
                this.metadataTypeListLoader = false;
            }).catch(error => {
                console.error(error);
                this.metadataTypeListLoader = false;
            })
        }
        else {
            apiService({
                request: 'GET',
                apiName: 'getpackageinfo',
                apiParams: serializeParams({
                    packagename: `${filterValue}_${this.sandbox}`,
                })
            }).then(response => {
                if (response?.metadataFile?.file?.metadataType) {
                    this.metadataTypeList = response.metadataFile.file.metadataType;
                }
                console.log("filter", JSON.parse(JSON.stringify(this.metadataTypeList)));
                this.metadataTypeListLoader = false;
            }).catch(error => {
                console.error(error);
                this.metadataTypeListLoader = false;
            })
        }
    }
    //Quality score
    get deploymentFileObj() {
        if (this.deploymentFile) {
            return Object.entries(this.deploymentFile).filter(key => typeof key[1] !== 'object').map(([key, value]) => ({ key, value }));
        }
    }


}