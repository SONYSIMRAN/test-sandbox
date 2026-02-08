import { LightningElement, api, track } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams, removeBeforeUnderline, convertToPerc, replaceUnderscoreBySpace } from 'c/dxUtils';
import { loadScript } from 'lightning/platformResourceLoader';
import dxVisChartJS from '@salesforce/resourceUrl/dxVisChartJS';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DxVisTabHistogramCodeQuality extends LightningElement {
    histogramData;
    histogramGraphLoader = true;
    //Get params
    @api package;
    @api sandbox;
    //Filter cqd names
    filterCQDNames;
    @track defaultSelectedIndex = 'summary_coverage';
    cqdNoData = false;
    cqdOptions = [];
    graphNoData = false;
    //Data format
    labelName;
    labels = [];
    scores = [];
    // maxScoreValue = 100;
    //Chart optoins
    @track isChartJsInitialized;
    gridBorder = 2;
    threeHundred = 300;
    fiveHundred = 500;



    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;
        Promise.all([
            loadScript(this, dxVisChartJS + "/dxVisChartJS/chart.js.min.js")
        ]).then(() => {
            // this.fetchHistogramData();
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
        this.fetchHistogramData(false);
    }

    //Get Kanban API data
    fetchHistogramData(updateChart) {
        this.histogramGraphLoader = true;
        apiService({
            request: 'GET',
            apiName: 'get-historical-metrics',
            apiParams: serializeParams({
                sandbox: `${this.sandbox}`,
                packageName: `${this.package}`,
                cqdName: `${this.defaultSelectedIndex}`
            })
        }).then(response => {
            this.filterCQDNames = response?.filterCQDNames.length > 0 ? response.filterCQDNames : this.cqdNoData = true;
            this.labelName = response?.historicalMetrics?.length > 0 ? removeBeforeUnderline(response.historicalMetrics[0].name) : '';
            this.histogramData = response?.historicalMetrics.length > 0 ? response.historicalMetrics : this.graphNoData = true;
            console.log("histogramData", JSON.parse(JSON.stringify(this.histogramData)));

            if (this.histogramData.length > 0) {
                //format Data
                this.histogramData.map((x) => {
                    if (x.score) {
                        this.scores.push(x.score);
                    }
                    if (x.create_time) { this.labels.push(new Date(x.create_time).toLocaleString()) }
                });
                if (this.scores.length > 0) {
                    if (updateChart) {
                        const canvasElemenet = this.template.querySelector('canvas.HistogramGraph');
                        this.chart.data.labels = this.labels;
                        this.chart.data.datasets[0].data[2] = this.scores;
                        // this.canvasElemenet.style.width = this.scores ? this.scores.length * 5 + 'px' : '100%';
                        this.chart.update();
                    }
                    else {
                        //Create Graph
                        const canvasElemenet = this.template.querySelector('canvas.HistogramGraph');
                        const ctx = canvasElemenet;
                        this.chart = new Chart(ctx, this.histogramGraphConfig);
                        this.canvasElemenet.style.height = '500px';
                        // this.canvasElemenet.style.width = this.scores ? this.scores.length * 5 + 'px' : '100%';
                    }
                }
            }
            this.histogramGraphLoader = false;
        }).catch(error => {
            console.error(error);
            this.histogramGraphLoader = false;
        })
    }
    //Graph width height
    get graphStyles() {
        if (this.histogramData?.length > 0) {
            return 'width: ' + this.histogramData.length * 5 + 'px';
        }
    }
    get graphWidth() {
        if (this.histogramData?.length > 0) {
            return this.histogramData.length * 5;
        }
    }
    //Combobox data
    get filterOptions() {
        let cqdOptions = [];
        if (this.filterCQDNames && this.filterCQDNames.length > 0) {
            this.filterCQDNames.map((el) => {
                if (el.name) {
                    cqdOptions.push({ label: replaceUnderscoreBySpace(el.name), value: el.name });
                }
            });
        }
        return cqdOptions;
    }


    handleCqdChange(event) {
        this.defaultSelectedIndex = event.detail.value;
        console.log('selected value', this.defaultSelectedIndex);
        this.fetchHistogramData(true);

    }
    //Chart options
    getYAxislabel = () => {
        let customlabels = ['apex_code_size_limit', 'sandbox_apex_code_size'];
        let yAxisLabel = customlabels.includes(this.defaultSelectedIndex) ? 'No of Characters' : 'Scores';
        return yAxisLabel;
    }
    //Draw Histograp Graph
    histogramGraphConfig = {
        type: 'line',
        data: {
            labels: this.labels,
            datasets: [
                {
                    label: '',
                    data: this.scores,
                    lineTension: 0.3,
                    fill: true,
                    borderColor: '#1ea2e3',
                    backgroundColor: 'transparent',
                    pointBackgroundColor: function (context) {
                        var index = context.dataIndex;
                        var value = context.dataset.data[index];
                        return value >= 90 && value <= 100 ? '#28df69' : value >= 80 && value <= 90 ? '#cbcf00' : value >= 60 && value <= 80 ? '#cd6013' : value <= 60 ? '#e12920' : '#14719f';
                    },
                    pointBorderColor: '#b5b5b5',
                    pointRadius: 5,
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        above: 'rgb(159 206 229 / 35%)',
                    }
                }
            ],
        },
        options: {
            maintainAspectRatio: false,
            responsive: false,
            pointStyle: 'circle',
            scales: {
                x: {
                    display: true,
                    grid: {
                        tickColor: '#ffb100',
                        color: '#ddcbcb',
                        borderColor: '#ffb100',
                        borderWidth: this.gridBorder,
                        tickWidth: this.gridBorder
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    grid: {
                        tickColor: '#7ae178',
                        color: '#cacaca',
                        borderColor: '#7ae178',
                        borderWidth: this.gridBorder,
                        tickWidth: this.gridBorder
                    },
                    title: {
                        display: true,
                        text: this.getYAxislabel,
                        color: '#191',
                        font: {
                            family: 'Times',
                            size: 20,
                            style: 'normal',
                            lineHeight: 1.2
                        },
                    }
                }
            },
            plugins: {
                legend: {
                    align: 'start',
                    labels: {
                        boxWidth: 20,
                        boxHeight: 20,
                        usePointStyle: true,
                        pointStyle: 'triangle',
                        font: {
                            family: 'Times',
                            size: 18
                        }
                    }
                }
            }
        }
    }
}