import { LightningElement, track } from 'lwc';
import getInstalledPackages from '@salesforce/apex/DXPackagesController.getInstalledPackages';
import images from '@salesforce/resourceUrl/visualizer_images';

export default class SfdxSearchView extends LightningElement { 
    // Views Config
    searchView = true;

    // Header Config
    cardView = false;
    kanbanView = false;
    listView = false;
    buttonPackageDep = false;
    buttonSandboxCodeSize = false;
    buttonPackageSorting = false;
    selectSandbox = false;

    // Icons
    iconTilesView = images + '/images/tiles-view-icon.svg';
    iconKanbanView = images + '/images/kanban-view-icon.svg';
    iconListView = images + '/images/list-view-icon.svg';
    iconPackageDepView = images + '/images/graph-action-icon.svg';
    iconCodeSizeView = images + '/images/code-size-icon.svg';
    iconSortView = images + '/images/sorting-action-icon.svg';

    // Search Config
    @track selectedSearchCategory = 'PackageName';
    @track searchTerm = '';
    @track namedCredential = 'Visualizer';
    @track filteredPackages = [];
    @track resultCount = null;
    searchResults = false;
    isLoading = false;
    @track inputType = 'search';
    @track inputPlaceholder = 'Enter characters to search';

    searchOptions = [
        { label: 'Package Name', value: 'PackageName' },
        { label: 'Description', value: 'Description' },
        { label: 'Version', value: 'Version' },
        { label: 'Release', value: 'PackageVersionName' }
    ];

    connectedCallback() {
        // Fetch data when needed (on initial load or other event)
    }

    fetchData(searchTerm = '') {
        this.isLoading = true; // Start loading indicator
        getInstalledPackages({ namedCredential: this.namedCredential })
            .then(result => {
                if (searchTerm) {
                    // Only filter if there is a search term
                    this.filteredPackages = result.filter(pkg => {
                        let searchField = pkg[this.selectedSearchCategory] ? pkg[this.selectedSearchCategory].toLowerCase() : '';
    
                        // Special case for filtering by release date (PackageVersionName)
                        if (this.selectedSearchCategory === 'PackageVersionName') {
                            const packageReleaseDate = pkg[this.selectedSearchCategory];
    
                            // Debug logs to check the package date and search date
                            console.log('Package Release Date:', packageReleaseDate);
                            console.log('Search Term (selected date):', searchTerm);
    
                            // Check if packageReleaseDate exists
                            if (packageReleaseDate) {
                                // Parse the package release date in MM/DD/YYYY format
                                const [month, day, year] = packageReleaseDate.split('/');
    
                                // Format the date correctly to YYYY-MM-DD for comparison
                                const formattedPackageDate = `${year}-${month}-${day}`; // Now MM and DD are swapped
                                console.log('Formatted Package Date:', formattedPackageDate);
    
                                // Use the searchTerm date (YYYY-MM-DD) directly
                                const searchDate = searchTerm.split('T')[0]; // Ensure searchTerm is in YYYY-MM-DD
                                console.log('Search Date:', searchDate);
    
                                // Compare both dates (YYYY-MM-DD)
                                return formattedPackageDate === searchDate;
                            }
                            return false; // If the package date is invalid or missing, skip this package
                        }
    
                        // General search for other fields
                        return searchField.includes(searchTerm.toLowerCase());
                    });
                } else {
                    // If no search term, clear the filtered packages
                    this.filteredPackages = [];
                }
    
                this.resultCount = this.filteredPackages.length || '0';
                this.searchResults = this.filteredPackages.length > 0;
            })
            .catch(error => {
                console.error('Error fetching packages:', error);
                this.filteredPackages = [];
                this.resultCount = '0';
                this.searchResults = false;
            })
            .finally(() => {
                this.isLoading = false; // End loading indicator
            });
    }
    
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value.trim();
        this.fetchData(this.searchTerm);
    }

    handleSearchCategoryChange(event) {
        this.selectedSearchCategory = event.detail.value;
        this.searchTerm = '';
       
        // Change input type and placeholder based on the selected category
        if (this.selectedSearchCategory === 'PackageVersionName') {
            this.inputType = 'date';
            this.inputPlaceholder = 'Select release date';
        } else {
            this.inputType = 'search';
            this.inputPlaceholder = 'Enter characters to search';
        }

        // Refetch data after search category change
        this.fetchData(this.searchTerm);
    }
}