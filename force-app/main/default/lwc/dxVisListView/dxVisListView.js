import { LightningElement, track } from 'lwc';
import images from '@salesforce/resourceUrl/visualizer_images';
import apiServiceTypeArrayObj from '@salesforce/apex/DXApiService.apiServiceTypeArrayObj';
import { serializeParams } from 'c/dxUtils';

export default class DxVisListView extends LightningElement {
    //Header Config
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = false;
    //Header Config
    iconTilesView = images + '/tiles-view-icon.svg';
    iconKanbanView = images + '/kanban-view-icon.svg';
    iconListView = images + '/list-view-icon.svg';
    iconPackageDepView = images + '/graph-action-icon.svg';
    iconCodeSizeView = images + '/code-size-icon.svg';
    iconSortView = images + '/sorting-action-icon.svg';
    @track result = [];
    isLoading = true;

    //Header param
    headerConfig = true;
    //Counts
    totalPackaegCount = 0;
    orgDependentCount = 0;
    noOrgDependent = 0;
    unpackagedMetadata = 0;

    connectedCallback() {
        this.fetchPackageList();
    }

    fetchPackageList() {
        this.isLoading = true;
        apiServiceTypeArrayObj({
            request: 'GET',
            apiName: 'getpackage-listview'
        }).then(response => {
            console.log(response);
            this.result = response;
            //Set Counts
            this.totalPackaegCount = response?.length;
            this.orgDependentCount = response.filter((element) => element.IsOrgDependent === "Yes").length;
            this.noOrgDependent = response.filter((element) => element.IsOrgDependent === "No").length;
            //Metadata Count
            const arraySum = [];
            if (response && response.metadataCount) {
                response.forEach((element) => arraySum.push(element.metadataCount));
            }
            let connectedDx = response.filter(
                (element) => element.name === "connected-dx"
            );
            let totalMetadataCount = arraySum
                .filter((x) => x !== undefined)
                .reduce((partialSum, a) => partialSum + a, 0);
            if (connectedDx[0] && connectedDx[0].metadataCount) {
                this.unpackagedMetadata = Math.round((connectedDx[0].metadataCount / totalMetadataCount) * 100) + '%' || '0%';
            }
            //Set Counts
            this.isLoading = false;
        }).catch(error => {
            console.error(error);
            this.isLoading = false;
        })
    }
}