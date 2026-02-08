import { LightningElement, api } from 'lwc';
import images from '@salesforce/resourceUrl/visualizer_images';
import { NavigationMixin } from 'lightning/navigation';
import SandboxCodeSizeModal from 'c/dxVisSandboxCodeSizeModal';
import logPageView from '@salesforce/apex/DXPageMetricController.logPageView';
import IS_SALESFORCE_USER from '@salesforce/label/c.is_Salesforce_User';
import getInstalledPackages from '@salesforce/apex/DXPackagesController.getInstalledPackages';
import DxVisPackageDependencyModal from 'c/dxVisPackageDependencyModal';
import SfdxSandboxCodeSizeModal from 'c/sfdxSandboxCodeSizeModal';


// Define the page name mapping
const pageNameMapping = {
    '/kanban': 'Kanban View',
    '/list': 'List View',
    '/cards': 'Cards View',
    '/metrics': 'Metrics Dashboard',
    '/gates': 'Quality Gates Dashboard',
    '/dependency': 'Package Dependency',
    '/sfdxKanban' : 'SFDX Kanban View',
    'sfdxList': 'SFDX List View'
    // Add more mappings as needed for your pages
};

export default class DxHeader extends NavigationMixin(LightningElement) {
    iconTilesView = images + '/tiles-view-icon.svg';
    iconKanbanView = images + '/kanban-view-icon.svg';
    iconListView = images + '/list-view-icon.svg';
    iconPackageDepView = images + '/graph-action-icon.svg';
    iconCodeSizeView = images + '/code-size-icon.svg';
    iconPackageEnvStatus = images + '/env-dashboard.svg';
    iconSortView = images + '/sorting-action-icon.svg';
    sandboxNames = null;
    @api view360EnvNames = null;
    @api viewQualityGatesEnvNames = null;
    // selectedSandbox;
    @api cardView = false;
    @api kanbanView = false;
    @api listView = false;
    @api buttonPackageDep = false;
    @api buttonSandboxCodeSize = false;
    @api buttonPackageSorting = false;
    @api selectSandbox = false;
    getSelectedSandbox;
    selectedSandbox = 'LOAD';
    @api combobox360View = false;
    @api comboboxEnvGatesView = false;
    @api buttonPackageEnvStatus = false;
    @api envGateData = null;
    @api buttonMetricsDashboard = false;
    @api packageData = [];
    @api sandboxOptions;
    isSalesforceUser = IS_SALESFORCE_USER.toLowerCase() === 'true';
    startTime;
    @api labels = {};

    get view360Options() {
        let sandboxOptions = [];
        if (Array.isArray(this.view360EnvNames)) {
            this.view360EnvNames.forEach(sandbox => {
                sandboxOptions.push({ label: sandbox, value: sandbox });
            });
        }
        return sandboxOptions;
    }
    get viewEnvGatesOptions() {
        let sandboxOptions = [];
        if (Array.isArray(this.viewQualityGatesEnvNames)) {
            this.viewQualityGatesEnvNames.forEach(sandbox => {
                sandboxOptions.push({ label: sandbox, value: sandbox });
            });
        }
        return sandboxOptions;
    }
    @api get sandboxList() {
        return this.sandboxNames;
    }
    set sandboxList(value) {
        this.sandboxNames = value;
    }
    @api get hideParent() {
        return !this.cardView && !this.kanbanView && !this.listView && !this.buttonPackageDep && !this.buttonSandboxCodeSize && !this.buttonPackageSorting && !this.selectSandbox;
    }

    get selectOption() {
        let sandboxOptions = [];
        if (Array.isArray(this.sandboxNames)) {
            this.sandboxNames.forEach(sandbox => {
                sandboxOptions.push({ label: sandbox, value: sandbox });
            });
        }
        return sandboxOptions;
    }

    connectedCallback() {
        let getSelect = this.template.querySelector('select[name="bombobox360View"]');
        if (getSelect) {
            this.getSelectedSandbox = getSelect.value;
            console.log('Env Status', this.buttonPackageEnvStatus);
        }
    }

    //Component methods
    getSandboxName(event) {
        sessionStorage.setItem("selectedSandbox", event.target.value);
        this.getSelectedSandbox = event.target.value;
        let ev = new CustomEvent('childmethod', { detail: { sandbox: event.target.value } });
        this.dispatchEvent(ev);
    }


    logAndNavigate(pageName, encodePackageInfo, startTime) {
        const timeSpentInSeconds = (performance.now() - startTime) / 1000;
        console.log('timeSpentInSeconds', timeSpentInSeconds,performance.now(),  startTime); // Calculate time spent in seconds
        logPageView({ pageName, timeSpentInSeconds })
            .then(result => {
                console.log('Page view logged successfully', result);
                this.navigateToPage(encodePackageInfo);
            })
            .catch(error => {
                console.error('Error logging page view', error);
                this.navigateToPage(encodePackageInfo);
            });
    }


    // Navigate to the page
    navigateToPage(encodePackageInfo) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + encodePackageInfo
            }
        });
    }

    handleKanbanViewClick(event) {
        console.log('isSalesforceUser--->', this.isSalesforceUser);
        if (this.isSalesforceUser) {
            this.navigateToSfdxPackage360View();
        } else {
            this.navigateToKanbanView(event);
        }
    }

    handleListViewClick(event) {
        console.log('isSalesforceUser--->', this.isSalesforceUser);
        if (this.isSalesforceUser) {
            this.navigateToSfdxListView();
        } else {
            this.navigateToListView(event);
        }
    }

    navigateToSfdxListView() {
        const startTime = performance.now();
        let comInfo = {
            componentDef: "c:sfdxPackageListView",
            attributes: {
                packageData: this.packageData
            }
        };
        let pageName = pageNameMapping['/sfdxList'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this.logAndNavigate(pageName, encodePackageInfo, startTime);
    }

    navigateToSfdxPackage360View() {
        const startTime = performance.now();
        let comInfo = {
            componentDef: "c:sfdxPackage360View",
            attributes: {
                packageData: this.packageData
            }
        }
        console.log('comInfo', comInfo );
        let pageName = pageNameMapping['/sfdxKanban'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        // console.log('encodePackageInfo', encodePackageInfo );
        this.logAndNavigate(pageName, encodePackageInfo, startTime);
    }

    //kanban View Navigation
    navigateToKanbanView(event) {
        const startTime = performance.now();
        this.packageName = event.target.dataId;
        let comInfo = {
            componentDef: "c:dxVisPackage360View"
        }
        // let encodePackageInfo = btoa(JSON.stringify(comInfo));
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__webPage',
        //     attributes: {
        //         url: '/one/one.app#' + encodePackageInfo
        //     }
        // })
        let pageName = pageNameMapping['/kanban'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this.logAndNavigate(pageName, encodePackageInfo, startTime);
    }


    
    //List View
    //kanban View Navigation
    navigateToListView(event) {
        const startTime = performance.now();
        this.packageName = event.target.dataId;
        let comInfo = {
            componentDef: "c:dxVisListView"
        }
        // let encodePackageInfo = btoa(JSON.stringify(comInfo));
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__webPage',
        //     attributes: {
        //         url: '/one/one.app#' + encodePackageInfo
        //     }
        // })
        let pageName = pageNameMapping['/list'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this.logAndNavigate(pageName, encodePackageInfo, startTime);
    }
    //Tiles View Navigation
    navigateToCardsView(event) {
        const startTime = performance.now();
        this.packageName = event.target.dataId;
        let comInfo = {
            componentDef: "c:dxApp"
        }
        // let encodePackageInfo = btoa(JSON.stringify(comInfo));
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__webPage',
        //     attributes: {
        //         url: '/one/one.app#' + encodePackageInfo
        //     }
        // })
        let pageName = pageNameMapping['/cards'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        this.logAndNavigate(pageName, encodePackageInfo, startTime);
    }

    navigateToMetricsDashboard() {
        const startTime = performance.now();
        let comInfo = {
            componentDef: "c:dxMetricsDashboard"
        }
        // let encodeComponentInfo = btoa(JSON.stringify(comInfo));
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__webPage',
        //     attributes: {
        //         url: '/one/one.app#' + encodeComponentInfo
        //     }
        // });
        //let pageName = 'Metrics Dashboard';
        let pageName = pageNameMapping['/metrics'];
        let encodeComponentInfo = btoa(JSON.stringify(comInfo));
        this.logAndNavigate(pageName, encodeComponentInfo, startTime);
    }

    //handle package dependency
    async handlePackageDependency(event) {
        const startTime = performance.now(); // Start time tracking
        console.log('startTime in dependency--', startTime);
        this.packageName = event.target.dataId;
        let comInfo = {
            componentDef: "c:dxVisPackageDepGraph",
            attributes: {
                sandbox: this.selectedSandbox
            }
        }
        let pageName = pageNameMapping['/dependency'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
    
        try {
            // Calculate time spent in seconds
            const timeSpentInSeconds = (performance.now() - startTime) / 1000;
            console.log('timeSpentInSeconds in dependency--', timeSpentInSeconds, startTime);
    
            // Log page view with time spent and navigate
            const result = await logPageView({ pageName, timeSpentInSeconds });
            console.log('Page view logged successfully', result);
    
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/one/one.app#' + encodePackageInfo,
                    sandbox: this.selectedSandbox
                }
            });
        } catch (error) {
            console.error('Error logging page view', error);
        }
    }
    

    async handlePackageEnvStatus(event) {
        const startTime = performance.now(); // Capture the start time
        this.packageName = event.target.dataId;
        let comInfo = {
            componentDef: "c:dxVisQualityGatesView",
            attributes: {
                envGatesData: this.envGateData,
                sandbox: this.selectedSandbox
            }
        };
    
        let pageName = pageNameMapping['/gates'];
        let encodePackageInfo = btoa(JSON.stringify(comInfo));
        
        // Calculate time spent in seconds
        const timeSpentInSeconds = (performance.now() - startTime) / 1000;
    
        logPageView({ pageName, timeSpentInSeconds })
            .then(result => {
                console.log('Page view logged successfully', result);
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: '/one/one.app#' + encodePackageInfo,
                        envGatesData: this.envGateData,
                        sandbox: this.selectedSandbox
                    },
                    state: {
                        attributes: {
                            envGatesData: this.envGateData,
                            sandbox: this.selectedSandbox
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error logging page view', error);
            });
    }
    

    //Sort Packages
    sortpackages(event) {
        let ev = new CustomEvent('packagesorting', { detail: event.target.value });
        this.dispatchEvent(ev);
    }

    //Handle Sandbox MOdal
    async handleSandboxModal() {
        const modal = await SandboxCodeSizeModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: 'Sandbox Codesize Modal',
            content: {
                sandbox: this.getSelectedSandbox || this.selectedSandbox
            }
        });
    }

    async handleSfdxSanboxModal() {
        const modal = await SfdxSandboxCodeSizeModal.open({
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: 'Sfdx Sandbox Codesize Modal',
            content: {
                sandbox: this.getSelectedSandbox || this.selectedSandbox
            }
        });
    }


    handleSandboxCodeSizeGraph(event) {
        console.log('isSalesforceUser--->', this.isSalesforceUser);
        if (this.isSalesforceUser) {
            this.handleSfdxSanboxModal();
        } else {
            this.handleSandboxModal();
        }
    }

    handleSandboxChange(event) {
        const selectedSandbox = event.detail.sandboxNamedCredential;
        console.log('selectedSandbox--->', selectedSandbox);
        // Emit a custom event with the selected sandbox
        const sandboxChangeEvent = new CustomEvent('sandboxchange', {
            detail: { sandboxNamedCredential: selectedSandbox }
        });
        this.dispatchEvent(sandboxChangeEvent);
    }
 


}