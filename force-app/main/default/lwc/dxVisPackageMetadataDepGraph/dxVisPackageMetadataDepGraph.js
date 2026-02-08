import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import images from '@salesforce/resourceUrl/visualizer_images';

export default class DxVisPackageMetadataDepGraph extends LightningElement {

    // Header Config (for UI icons)
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = true;
    buttonSandboxCodeSize = true;
    buttonPackageSorting = false;
    selectSandbox = false;
    buttonMetricsDashboard = false;

    // Header Config Icons
    iconTilesView = images + '/tiles-view-icon.svg';
    iconKanbanView = images + '/kanban-view-icon.svg';
    iconListView = images + '/list-view-icon.svg';
    iconPackageDepView = images + '/graph-action-icon.svg';
    iconCodeSizeView = images + '/code-size-icon.svg';
    iconSortView = images + '/sorting-action-icon.svg';

    @track dependencies = { nodes: [], links: [] };
    @track filteredDependencies = { nodes: [], links: [] };
    @track filters = {};
    @track filterValues = [];
    @track metadataTypes = [];
    pageRef;
    @track isLoading = false;
    @track selectedMemberType = ''; 
    @track isOriginalGraph = true;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.pageRef = currentPageReference;
            const memberName = currentPageReference.attributes.attributes?.memberName;
            const memberType = currentPageReference.attributes.attributes?.memberType || '';
            const sandboxName = currentPageReference.attributes.attributes?.sandboxName;
            const packageName = currentPageReference.attributes.attributes?.packageName;
            const id = currentPageReference.attributes.attributes?.id;


            this.selectedMemberType = memberType;
            console.log('Selected Member Type:', this.selectedMemberType);
            console.log('Selected Member id:', id);
            this.fetchPackageDependenciesData({ name: memberName, type: memberType, package: packageName, sandbox: sandboxName });
            this.fetchReversePackageDependenciesData({ name: memberName, metadata: memberType, sandbox: sandboxName, id:'', package: packageName });
            
        }
    }
    fetchPackageDependenciesData(params) {
        this.isLoading = true;

        apiService({
            request: 'GET',
            apiName: 'getpackagdependencies',
            apiParams: serializeParams(params)
        })
        .then(response => {
            console.log('API Response:', response);
            this.dependencies = response || { nodes: [], links: [] };

            // Extract metadata types and initialize filters
            this.extractMetadataTypes();
            this.initializeFilters();
            this.applyFilters();
        })
        .catch(error => {
            console.error('[ERROR] Error fetching dependencies:', error);
        })
        .finally(() => {
            this.isLoading = false;
        });
    }
    extractMetadataTypes() {
        const types = new Set();
        this.dependencies.nodes.forEach(node => {
            if (node.type) {
                types.add(node.type);
            }
        });
        this.metadataTypes = Array.from(types);
        console.log('Extracted Metadata Types:', JSON.parse(JSON.stringify(this.metadataTypes)));
    }
    // initializeFilters() {
    //     this.metadataTypes.forEach(type => {
    //         this.filters[type] = (type === this.selectedMemberType);  
    //     });
    //     console.log('Initialized Filters:',  JSON.parse(JSON.stringify(this.filters)));
    //     this.prepareFilterValues();
    // }
    initializeFilters(selectDefault = false) {
        this.metadataTypes.forEach(type => {
            this.filters[type] = (type === this.selectedMemberType);
    
            if (selectDefault && type === 'ApexClass') {
                this.filters[type] = true;
            }
        });
        console.log('Initialized Filters:',  JSON.parse(JSON.stringify(this.filters)));
        this.prepareFilterValues();
    }
    
    prepareFilterValues() {
        this.filterValues = this.metadataTypes.map(type => {
            return {
                type: type,
                checked: this.filters[type]
            };
        });
        console.log('Prepared Filter Values:', JSON.parse(JSON.stringify(this.filterValues)));
    }

    applyFilters() {
        const filteredNodes = this.getFilteredNodes();
        const filteredLinks = this.getFilteredLinks(filteredNodes);
        this.updateFilteredDependencies(filteredNodes, filteredLinks);
    }
    getFilteredNodes() {
        return this.dependencies.nodes.filter(node => this.filters[node.type]);
    }
    getFilteredLinks(filteredNodes) {
        const filteredNodeNames = filteredNodes.map(node => node.name);
        console.log('filteredNodeNames', filteredNodeNames);
        return this.dependencies.links.filter(link =>
            filteredNodeNames.includes(link.source) && filteredNodeNames.includes(link.target)
        );
    }
    updateFilteredDependencies(filteredNodes, filteredLinks) {
        this.filteredDependencies = {
            nodes: filteredNodes,
            links: filteredLinks
        };
        console.log('filteredDependencies', JSON.parse(JSON.stringify(this.filteredDependencies)));
        if (filteredNodes.length > 0 && filteredLinks.length > 0) {
            console.log('Rendering graph with data');
        } else {
            console.warn('No valid nodes or links to render the graph');
        }

        this.updateGraphComponent();
    }
    updateGraphComponent() {
        const graphComponent = this.template.querySelector('c-dx-vis-dependency-graph');
        if (graphComponent) {
            graphComponent.updateGraph(this.filteredDependencies);
        }
    }
    handleFilterChange(event) {
        const filterName = event.target.dataset.filter;
        const isChecked = event.target.checked;

        // Ensure ApexClass remains checked if it is the selected member type
        if (filterName === 'ApexClass' && this.selectedMemberType === 'ApexClass' && !isChecked) {
            event.target.checked = true;
            console.log('ApexClass cannot be unchecked as it is the default selected member type');
            return;
        }

        this.filters[filterName] = isChecked;
        console.log('Filter Toggled:', filterName, 'Checked:', isChecked);
        this.prepareFilterValues();
        this.applyFilters();
    }
    // Reset to original graph
    resetGraph() {
        this.initializeFilters(true); 
        this.prepareFilterValues(); 
        this.isOriginalGraph = true;
        this.applyFilters();
        console.log('Graph Reset to Original:', JSON.parse(JSON.stringify(this.filteredDependencies)));
    }
    
    get isDataAvailable() {
        return this.dependencies && this.dependencies.nodes.length > 0 && this.dependencies.links.length > 0;
    }

    fetchReversePackageDependenciesData(params) {
        this.isLoading = true;

        apiService({
            request: 'GET',
            apiName: 'reverse-metadata-lookup',
            apiParams: serializeParams(params)
        })
        .then(response => {
            console.log('API Response in revrese :', response);
            // this.dependencies = response || { nodes: [], links: [] };

            // Extract metadata types and initialize filters
            // this.extractMetadataTypes();
            // this.initializeFilters();
            // this.applyFilters();
        })
        .catch(error => {
            console.error('[ERROR] Error fetching dependencies:', error);
        })
        .finally(() => {
            this.isLoading = false;
        });
    }
}