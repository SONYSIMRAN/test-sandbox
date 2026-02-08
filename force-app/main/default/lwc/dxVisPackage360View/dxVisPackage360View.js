import { LightningElement, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import images from '@salesforce/resourceUrl/visualizer_images';
import DxVisArtifactsModal from 'c/dxVisArtifactsModal';

export default class DxVisPackage360View extends LightningElement {
    // Header Config
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = false;
    combobox360View = false;
    view360EnvNames = [];
    summaryRiskScores = [];

    // Header config end
    result;
    isLoading = true;
    @track filtereEnvData = [];
    @track releaseDates = [];
    @track selectedDate = '';
    @track versions = [];
    @track selectedVersion = '';
    // @track showTooltip = false;
    @track activeHeaderData = [];
    @track activeHeaderId = '';
    @track packageCount = 0;
    @track showReleaseStatusTooltip = false;
    @track showPackageCountTooltip = false;
    @track showArtifactModal = false;
    @track showRiskScoreTooltip = false;
    @track popoverPosition = {};




    sandboxName = 'LOAD';
    // Icons header
    releaseRisk = images + '/meter-360.svg';
    releaseStatus = images + '/info-360.svg';
    releasePackageCount = images + '/count-360.svg';
    releaseArtifact = images + '/artifacts-360.svg';
    // Dashboard ENV status
    envStatusDashboard = true;
    envGateData = null;

    connectedCallback() {
        this.fetchKanbanData();
    }

    // Format and sort data
    formatData(data) {
        let sortMatrix = ['TEST', 'LOAD', 'PROD'];
        let environmentsData = JSON.parse(JSON.stringify(data));
        console.log('Kanban View Data', environmentsData);
        let response = environmentsData.sort((a, b) => {
            return sortMatrix.indexOf(a.Name) - sortMatrix.indexOf(b.Name);
        });

        response = response.map(env => {
            let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
            let sortedReleases = env.Releases.sort((a, b) => {
                let nameA = new Date(dateRegex.test(a.Name) ? a.Name : '01/01/1970').getTime();
                let nameB = new Date(dateRegex.test(b.Name) ? b.Name : '01/01/1970').getTime();
                return nameB - nameA;
            });
            return Object.assign({}, env, { Releases: sortedReleases });
        });
        console.log('Kanban View New Response', response);
        return response;
    }

    setSandboxList(names) {
        if (names) {
            this.view360EnvNames = names.map(el => el.Name);
        }
        this.combobox360View = true;
    }

    getSandbox(event) {
        this.sandboxName = event.detail.sandbox;
        console.log('Header params', event.detail.sandbox, this.result);
        this.filtereEnvData = this.result.filter(env => env.Name === this.sandboxName).map(list => list.Releases);
        console.log('Env Data: ', this.filtereEnvData[0]);
    }

    // get isVersionDropdownDisabled() {
    //     return !this.selectedDate;
    // }

    get isReleaseDateDropdownDisabled() {
        return !this.selectedVersion;
    }


    // Get Kanban API data
    fetchKanbanData() {
        this.isLoading = true;
        apiService({
            request: 'GET',
            apiName: 'package-pipeline',
            apiParams: serializeParams({
                sandbox: sessionStorage.getItem("selectedSandbox")
            })
        }).then(response => {
            // this.maskVersions(response.Environments);
            // console.log('this.maskVersions', JSON.parse(JSON.stringify(this.maskVersions)));
            this.result = this.formatData(response.Environments);
            this.envGateData = response.Environments;
            console.log('this.envGateData', response.Environments);
            this.setSandboxList(response.Environments);
            this.filtereEnvData = this.result.filter(env => env.Name === this.sandboxName).map(list => list.Releases);
            console.log('this.filtereEnvData in -fetch-->', JSON.parse(JSON.stringify(this.filtereEnvData)));
            this.versions = this.getUniqueVersions(response.Environments);
            console.log('this.versions in -fetch-->', JSON.parse(JSON.stringify(this.versions)));
            this.updateReleaseDates();
            this.isLoading = false;
        }).catch(error => {
            console.error(error);
            this.isLoading = false;
        });
    }
    

    getUniqueReleaseDates(packages) {
        const allDates = [];
        packages.forEach(pkg => {
            if (!allDates.includes(pkg.release)) {
                allDates.push(pkg.release);
            }
        });
        console.log('Filtered Release Dates--->', allDates);
        return allDates.sort((a, b) => new Date(b) - new Date(a));
    }

    getUniqueVersions(environments) {
        const allVersions = [];
        environments.forEach(env => {
            env.Releases.forEach(release => {
                release.Packages.forEach(pkg => {
                    const maskedVersion = this.maskVersion(pkg.Version);
                    if (!allVersions.includes(maskedVersion)) {
                        allVersions.push(maskedVersion);
                    }
                });
            });
        });
        console.log('Filtered Versions--->', allVersions);
        return allVersions.sort();
    }

    maskVersion(version) {
        const versionParts = version.split('.');
        return versionParts.length >= 3 ? `${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.*` : version;
    }

    handleVersionChange(event) {
        this.selectedVersion = event.detail.value;
        console.log('Selected Version:', this.selectedVersion);
        this.filterPackages();
        this.updateReleaseDates();
    }

    handleReleaseDateChange(event) {
        this.selectedDate = event.detail.value;
        console.log('Selected Release Date:', this.selectedDate);
        this.filterPackages();
    }
    
    updateReleaseDates() {
        if (!this.selectedVersion) {
            this.releaseDates = [];
            return;
        }
        const filteredPackages = this.result.filter(env => env.Name === this.sandboxName).map(list => list.Releases).flat().map(release => {
            return release.Packages.filter(pkg => !this.selectedVersion || this.maskVersion(pkg.Version) === this.selectedVersion);
        }).flat();

        const uniqueReleaseDates = this.getUniqueReleaseDates(filteredPackages);

        this.releaseDates = uniqueReleaseDates.length > 0 ? uniqueReleaseDates : ['NA'];
        if (this.selectedDate && !this.releaseDates.includes(this.selectedDate)) {
            this.selectedDate = '';
        }
    }

    filterPackages() {
        const filteredData = this.result.filter(env => env.Name === this.sandboxName).map(list => list.Releases).flat()
            .map(release => {
                const filteredPackages = release.Packages.filter(pkg => {
                    const versionMatch = this.selectedVersion ? this.maskVersion(pkg.Version) === this.selectedVersion : true;
                    const dateMatch = this.selectedDate ? pkg.release === this.selectedDate : true;
                    return versionMatch && dateMatch;
                });
                return filteredPackages.length > 0 ? { ...release, Packages: filteredPackages } : null;
            })
            .filter(release => release !== null);
        console.log('Filtered Data:', JSON.parse(JSON.stringify(filteredData)), this.selectedVersion);
        this.filtereEnvData = filteredData.length > 0 ? [filteredData] : [];
    }

    handleRefreshReset() {
        this.isLoading = true;
        this.sandboxName = 'LOAD';
        this.selectedDate = '';
        this.selectedVersion = '';
        console.log('Resetting filters:', this.selectedDate, this.selectedVersion);
        this.filtereEnvData = this.result.filter(env => env.Name === this.sandboxName).map(list => list.Releases);

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
        this.isLoading = false;
    }

    handleArtifactClick(event) {
        const artifactUrl = 'https://allegiscloud.sharepoint.com/teams/ConnectedSharedServices/Shared%20Documents/Forms/AllItems.aspx?csf=1&web=1&e=SdEFHb&ovuser=371cb917%2Db098%2D4303%2Db878%2Dc182ec8403ac%2Cssimran%40teksystems%2Ecom&OR=Teams%2DHL&CT=1724337298371&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNDA3MTEyODgyNSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D&CID=d5ca48a1%2Db06e%2D6000%2D3eac%2D35c54b723c5c&cidOR=SPO&FolderCTID=0x0120002AB8744831C0A54C8FF821809D70F62E&id=%2Fteams%2FConnectedSharedServices%2FShared%20Documents%2FConnected%2D%20Release%20Artifacts%20%28logs%2C%20notes%29&viewid=1c65ede6%2Dbcae%2D4a18%2Dbd0e%2D607c9509fd33';

        window.open(artifactUrl, '_blank'); 
    }

    handleIconClick(event) {
        const clickedHeaderId = event.currentTarget.dataset.id;
        const iconType = event.currentTarget.dataset.type;
        console.log('iconType', iconType);

        // Reset all boolean values to false initially
        this.showReleaseStatusTooltip = false;
        this.showPackageCountTooltip = false;
        this.showArtifactModal = false;
        this.showRiskScoreTooltip = false;

        if (this.activeHeaderId === clickedHeaderId) {
            this.activeHeaderId = '';
            this.activeHeaderData = [];
        } else {
            this.activeHeaderId = clickedHeaderId;
            this.activeHeaderData = this.getDataForHeader(this.activeHeaderId);
            console.log('activeHeaderData getHeader>>>', JSON.parse(JSON.stringify(this.activeHeaderData)));

            // Show the appropriate component based on the icon type
            if (iconType === 'status') {
                this.showReleaseStatusTooltip = true;
            } else if (iconType === 'packageCount') {
                this.showPackageCountTooltip = true;
            } else if (iconType === 'artifact') {
                this.showArtifactModal = true;
            } else if (iconType === 'risk') {
                this.showRiskScoreTooltip = true;
            }
        }

    const iconElement = event.currentTarget;
    console.log('iconElement', iconElement);
    const iconRect = iconElement.getBoundingClientRect();
    console.log('Icon rect:', JSON.stringify(iconRect));
      
    // Calculate position for the popover
    this.popoverPosition = {
        top: iconRect.bottom + window.scrollY + 'px', // Position below the icon
        left: iconRect.left + window.scrollX + 'px'  // Align with the icon's left edge
    };


    // // Positioning tooltip logic
    //     const tooltipElement = this.template.querySelector(`.popover[data-id="${clickedHeaderId}"]`);
    //     if (tooltipElement) {
    //         const iconRect = iconElement.getBoundingClientRect();
    //         tooltipElement.style.top = `${iconRect.bottom + window.scrollY}px`;
    //         tooltipElement.style.left = `${iconRect.left + window.scrollX + (iconRect.width / 2)}px`;
    //         tooltipElement.style.transform = 'translateX(-50%)'; // Center the tooltip
    //         tooltipElement.classList.add('active'); // Make the tooltip visible
    //     } else {
    //         console.warn('Tooltip element not found.');
    //     }
    }

    getDataForHeader(headerId) {
        const flattenedData = this.filtereEnvData.flatMap(entry => {
            if (Array.isArray(entry)) {
                return entry.flatMap(innerEntry => {
                    if (innerEntry && Array.isArray(innerEntry.Packages)) {
                        return innerEntry.Packages.map(pkg => ({
                            ...pkg,
                            shouldDisplayTooltip: innerEntry.Name === headerId
                        }));
                    }
                    return [];
                });
            }
            return [];
        });
        const filteredData = flattenedData.filter(pkg => pkg.shouldDisplayTooltip) || [];
        return filteredData;
    }
    
    handleTooltipClose() {
        this.showReleaseStatusTooltip = false;
        this.showPackageCountTooltip = false;
        this.showRiskScoreTooltip = false;
        this.activeHeaderId = '';
        this.activeHeaderData = []; 
    }

   
}