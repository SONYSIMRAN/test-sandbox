import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';

export default class DxVisPackageCompare extends LightningElement {
    @api message;
    @api item;
    result;
    isLoading = true;
    //Accordion A Data set
    @track section = '1';
    accordionPackageALoader = true;
    accordionPackageAData;
    accordionPackageANoData = false;
    accordionPackageAName;
    accordionPackageASandbox;
    accordionPackageAVerion;
    //Create package Compare list
    packageCompareList;

    //Accordion B Data set
    @track sectionB = '1';
    accordionPackageBDataLoader = false;
    accordionPackageBData;
    accordionPackageBName;
    accordionPackageBSandbox;
    accordionPackageBVerion;
    packageBNoData = false;

    //Connected callback
    connectedCallback() {
        this.fetchPackageCompareData();
        console.log(JSON.parse(JSON.stringify(this.item)));
    }

    //Page Events

    //Get Package Compare API data
    fetchPackageCompareData(event) {
        this.isLoading = true;
        this.accordionPackageALoader = true;
        apiService({
            request: 'GET',
            apiName: 'package-compare-init',
            apiParams: serializeParams({
                packagename: this.item.uname
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            this.result = response;
            if(response && response.metadataFile && response.metadataFile.file && (response.metadataFile.file.metadataType).length == 0) {
               this.accordionPackageANoData = true; 
            }
            //Package Accordion A
            this.accordionPackageAData = response.metadataFile.file.metadataType || null;
            this.accordionPackageAName = response.metadataFile.file.packageName || '';
            this.accordionPackageASandbox = response.metadataFile.file.sandbox || '';
            this.accordionPackageAVerion = response.metadataFile.file.packageVersion || '';
            //Create Package Copare List
            this.packageCompareList = response.compareList.map((el) => {
                const { packagename, version } = el;
                return {
                    id: `${this.accordionPackageAName}_${packagename}`,
                    name: `${this.accordionPackageAName} ${packagename} ${version}`,
                };
            });
            this.accordionPackageALoader = false;
            this.isLoading = false;
        }).catch(error => {
            console.error(error);
            this.isLoading = false;
            this.accordionPackageALoader = false;
        })
    }
    //Accordion events
    
    handleToggleSection(event) {
        this.section = event.detail.openSections;
    }
    handleToggleSectionB(event) {
        this.sectionB = event.detail.openSections;
    }
    //Handle package B select
    //Component methods
    handlePackageBSelect(event) {
        this.accordionPackageBDataLoader = true;
        console.log("selectedSandbox", event.target.value);
        let selectedValue = event.target.value;
        apiService({
            request: 'GET',
            apiName: 'package-compare-results',
            apiParams: serializeParams({
                packagename: this.item.uname,
                comparepackage: selectedValue,
            })
        }).then(response => {
            console.log("response", JSON.parse(JSON.stringify(response)));
            this.accordionPackageBData = response.file.metadataType || null;
            this.packageBNoData = !(response && response.file && response.file.metadataType);
            this.accordionPackageBName = response.file.packageName || '';
            this.accordionPackageBSandbox = response.file.sandbox || '';
            this.accordionPackageBVerion = response.file.packageVersion || '';
            this.accordionPackageBDataLoader = false;
        }).catch(error => {
            console.error(error);
            this.accordionPackageBDataLoader = false;
        })
    }
}