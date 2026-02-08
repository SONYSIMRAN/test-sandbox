import { LightningElement, track, api } from 'lwc';
import images from '@salesforce/resourceUrl/visualizer_images';
import apiService from '@salesforce/apex/DXApiService.apiService';
import getInstalledPackages from '@salesforce/apex/DXPackagesController.getInstalledPackages';
import IS_SALESFORCE_USER from '@salesforce/label/c.is_Salesforce_User';
import { serializeParams } from 'c/dxUtils';


export default class DxApp extends LightningElement {
  //Authentication config
  tokenValid = true;
  //Authentication config

  //Header Config
  cardView = true;
  kanbanView = true;
  listView = true;
  buttonPackageDep = true;
  buttonSandboxCodeSize = true;
  buttonPackageSorting = true;
  selectSandbox = true;
  buttonMetricsDashboard = true;
  //Header Config
  iconTilesView = images + '/tiles-view-icon.svg';
  iconKanbanView = images + '/kanban-view-icon.svg';
  iconListView = images + '/list-view-icon.svg';
  iconPackageDepView = images + '/graph-action-icon.svg';
  iconCodeSizeView = images + '/code-size-icon.svg';
  iconSortView = images + '/sorting-action-icon.svg';
  @track result = [];
  sandboxName = "LOAD";
  sandboxList;
  isLoading = true;
  @track selectedSandboxNamedCredential;
  isSalesforceUser = false;
  isDataLoaded = false;
  packageData;
  @track labels = {};



  connectedCallback() {
    this.isSalesforceUser = IS_SALESFORCE_USER.toLowerCase() === 'true';
    this.template.addEventListener('sandboxchange', (event) => this.handleSandboxChange(event));
    console.log('this.isSalesforceUser ', this.isSalesforceUser );
    this.updateLabels();
    this.fetchPackages();
  }

  updateLabels() {
    if (this.isSalesforceUser) {
        this.labels = {
            qualityLabel: 'Release',
            sortAsc: 'Release - ASC',
            sortDesc: 'Release - DESC'
        };
    } else {
        this.labels = {
            qualityLabel: 'Quality',
            sortAsc: 'Quality - ASC',
            sortDesc: 'Quality - DESC'
        };
    }
  }

  //App Methods
  getSandbox(event) {
    // console.log("Token", this.getAccessToken());
    this.sandboxName = event.detail.sandbox;
    console.log('sandboxName', event.detail.sandbox);
    this.fetchPackages();
  }
  // sortpackages = (filterTerm) => {
  //   // let filterTerm = e && e.target && e.target && e.target.id;
  //   if (filterTerm === "desc") {
  //     this.result.sort((a, b) => {
  //       return b.sortScore - a.sortScore;
  //     });
  //   }
  //   else if (filterTerm === "asc") {
  //     this.result.sort((a, b) => {
  //       return a.sortScore - b.sortScore;
  //     });
  //    }
  // }

  sortPackages = (field, order = "asc") => {
    console.log('sortPackages--->>', field, order);
    this.result.sort((a, b) => {
        let valueA, valueB;
        if (this.isSalesforceUser) {
            // For Salesforce, field is the release date
            valueA = new Date(a[field]);
            valueB = new Date(b[field]);
        } else {
            // For GCP, field is the sortScore
            valueA = a[field];
            valueB = b[field];
        }

        if (order === "desc") {
            return valueB - valueA;
        }
        return valueA - valueB;
    });
    console.log('Sorted result--->>', JSON.parse(JSON.stringify(this.result)));
  }

  packageSorting(event) {
    const filterTerm = event.detail;
    const fieldToSortBy = this.isSalesforceUser ? 'PackageVersionName' : 'sortScore';
    console.log('packageSorting--->>', filterTerm, fieldToSortBy);
    this.sortPackages(fieldToSortBy, filterTerm);
    
  }

  handleSandboxChange(event) {
    this.selectedSandboxNamedCredential = event.detail.sandboxNamedCredential;
    console.log('selectedSandboxNamedCredential--->>', this.selectedSandboxNamedCredential, event);
    this.fetchPackages();
  }

  updateDataLoaded() {
    const salesforceDataLoaded = Array.isArray(this.packageData) && this.packageData.length > 0;
    const gcpDataLoaded = Array.isArray(this.sandboxList) && this.sandboxList.length > 0;
  
    this.isDataLoaded = this.isSalesforceUser ? salesforceDataLoaded : gcpDataLoaded;
    this.isLoading = !this.isDataLoaded;

    console.log('isDataLoaded:', this.isDataLoaded);
    console.log('isLoading:', this.isLoading);
  }


  
  fetchPackages() {
    this.tokenValid = true;
    this.isLoading = true;
    console.log('this.isSalesforceUser in fetch', this.isSalesforceUser);

    if (this.isSalesforceUser) {
      this.fetchSalesforcePackages();
    } else {
      this.fetchGcpPackages();
    }
  }
  
  fetchSalesforcePackages() {
    const namedCredential = this.selectedSandboxNamedCredential === undefined ? 'Visualizer' : this.selectedSandboxNamedCredential;
    // const namedCredential = this.selectedSandboxNamedCredential;
    console.log('namedCredential', namedCredential);
    getInstalledPackages({ namedCredential: namedCredential })
      .then(response => {
        this.packageData = response;
        console.log('packageData', JSON.parse(JSON.stringify(this.packageData)));
        console.log('installed packages=', response);
        this.result = response.map((item) => ({
          id: item.Id,
          packageName: item.PackageName,
          PackageVersionName : item.PackageVersionName,
          Version: item.Version,
          SubscriberPackageVersionId: item.SubscriberPackageVersionId,
          IsOrgDependent : item.IsOrgDependent,
          isSalesforceUser: this.isSalesforceUser
          // Add other fields as needed
        }));
        this.updateDataLoaded();
        // this.isLoading = false;
      })
      .catch(error => {
        console.error(error);
        this.isLoading = false;
      });
  }
  
  fetchGcpPackages() {
    apiService({
      request: 'GET',
      apiName: 'list-sandbox-packages-overview',
      apiParams: serializeParams({
        sandbox: this.sandboxName
      })
    })
    .then(response => {
      this.sandboxList = response.sandboxList;
      this.result = response.packageList.map((item, index) => {
        let id = `${index + 1}`;
        return { ...item, id: id }
      })
      // Sort by deploy time
      this.result.sort((a, b) => new Date(b.packageDeployTime.toString().replace(/_/g, ' ')).getTime() - new Date(a.packageDeployTime.toString().replace(/_/g, ' ')).getTime());
      this.updateDataLoaded();
      // this.isLoading = false;
      
    })
    .catch(error => {
      console.error(error);
      if (error?.status === 500) {
        this.tokenValid = false;
      }
      this.isLoading = false;
    });
  }

  // fetchPackages() {
  //   this.tokenValid = true;
  //   this.isLoading = true;
  //   apiService({
  //     request: 'GET',
  //     apiName: 'list-sandbox-packages-overview',
  //     apiParams: serializeParams({
  //       sandbox: this.sandboxName
  //     })
  //   }).then(response => {
  //     console.log("response", JSON.stringify(response));
  //     // this.result = response.packageList;
  //     this.sandboxList = response.sandboxList;
  //     this.result = response.packageList.map((item, index) => {
  //       let id = `${index + 1}`;
  //       return { ...item, id: id }
  //     })
  //     //Sort by deploy time
  //     this.result.sort((a, b) => {
  //       return new Date(b.packageDeployTime.toString().replace(/_/g, ' ')).getTime() - new Date(a.packageDeployTime.toString().replace(/_/g, ' ')).getTime();
  //     });
  //     this.isLoading = false;
  //   }).catch(error => {
  //     console.error(error);
  //     if (error?.status === 500) {
  //       this.tokenValid = false;
  //     }
  //     this.isLoading = false;
  //   })
  // }
}