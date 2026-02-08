import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';
import { loadScript } from 'lightning/platformResourceLoader';
import dxVisChartJS from '@salesforce/resourceUrl/dxVisChartJS';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DxVisTabDependencyScore extends LightningElement {
    @track result;
    depGraphLoader = true;
    //Get params
    @api package;
    @api sandbox;
    @track isChartJsInitialized;
    @track labels = [];
    chartDataSet1 = [];
    chartDataSet2 = [];
    graphNoData = false;

    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;

        Promise.all([
            loadScript(this, dxVisChartJS + "/dxVisChartJS/chart.js.min.js")
        ]).then(() => {
            this.fetchDependencyScore();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading ChartJS',
                    message: error,
                    variant: 'error',
                }),
            );
        });
    }
    // Connected Call events
    connectedCallback() {

    }

    //Get Kanban API data
    fetchDependencyScore() {
        this.depGraphLoader = true;
        apiService({
            request: 'GET',
            apiName: 'getpackage-depen-score-histo',
            apiParams: serializeParams({
                packagename: `${this.package}_${this.sandbox}`,
            })
        }).then(response => {
            this.result = response && response['dep-score-histo'].length > 0 ? response['dep-score-histo'] : this.graphNoData = true;
            console.log("response", JSON.parse(JSON.stringify(this.result)));
            if (this.result.length > 0) {
                this.result.forEach(element => {
                    //Push date labels
                    const date = element.date;
                    const year = date.substring(0, 4);
                    const month = date.substring(5, 7);
                    const day = date.substring(8, 10);
                    const labelDate = `${day}-${month}-${year}`;
                    this.labels.push(labelDate);
                    this.chartDataSet1.push({ x: labelDate, y: element.dep_score });
                    this.chartDataSet2.push({ x: labelDate, y: element.metadata_count });
                });
                //Draw graph
                console.log("response", JSON.parse(JSON.stringify(this.labels)));
                console.log("response", JSON.parse(JSON.stringify(this.chartDataSet1)));
                const ctx = this.template.querySelector('canvas.depGraph');
                this.chart = new Chart(ctx, this.depGraphConfig);
                this.chart.canvas.parentNode.style.height = '100%';
                this.chart.canvas.parentNode.style.width = '100%';
            }
            this.depGraphLoader = false;
        }).catch(error => {
            console.error(error);
            this.depGraphLoader = false;
        })
    }

    //Graph event
    depGraphConfig = {
        //Format Graph data
        type: 'line',
        data: {
            labels: this.labels,
            datasets: [{
                label: "Dependency Score",
                backgroundColor: 'rgba(231, 118, 129, 0.2)',
                borderColor: "#e04b59",
                pointBackgroundColor: "#e04b59",
                pointBorderColor: "transparent",
                data: this.chartDataSet1,
                fill: true,
                tension: 0.2,
                pointStyle: 'line'
            },
            {
                label: "Metadata Count",
                backgroundColor: "rgba(0, 111, 190, 0.2)",
                borderColor: "#006fbe",
                pointBackgroundColor: "#006fbe",
                pointBorderColor: "transparent",
                data: this.chartDataSet2,
                fill: true,
                tension: 0.2,
                pointStyle: 'line'
            }
            ]
        },
        options: {
            maintainAspectRatio: false,
            responsive: false,
            title: {
                display: true,
                text: 'Dependency graph for dependency score and metadata count'
            },
            plugins: {
                tooltip: {
                    position: 'nearest',
                    bodySpacing: 3,
                    padding: 12,
                    displayColors: true
                }
            }
        }
    };
}