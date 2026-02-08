import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import dxVisChartJS from '@salesforce/resourceUrl/dxVisChartJS';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams, removeBeforeUnderline } from 'c/dxUtils';

export default class DxVisSandboxCodesizeGraph extends LightningElement {
    @api graphdata;
    @api sandbox;
    apexStatusCount;
    //Counts
    apexBatchCount;
    apexExcludesBatchAndTestCount;
    apexTestCount;
    apexTotalCount;
    apexEnv;
    //Date ranges
    currentDate;
    dateBefore6Month;
    startDate;
    endDate;


    get chartData() {
        if (this.graphdata) {
            return this.graphdata.length > 0 ? true : false;
        }
    }
    //Graph 
    codeSizeGraphLoader = true;
    @track defaultSelectedIndex = 'summary_coverage';
    cqdNoData = false;
    cqdOptions = [];
    graphNoData = false;
    //Data format
    labelName;
    labels = [];
    scores = [];
    //Chatrt options
    @track isChartJsInitialized;
    labelYAxis = 'No of Characters';
    gridBorder = 2;
    maxScoreValue;
    getYAxislabel = 'No of Characters';

    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;
        Promise.all([
            loadScript(this, dxVisChartJS + "/dxVisChartJS/chart.js.min.js")
        ]).then(() => {
            //Set Filter date
            this.startDate = this.addMonths(new Date(), -3);
            this.endDate = new Date().toISOString();
            //Load Graph
            this.fetchCodeSizeData(false);
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
    connectedCallback() {
        console.log('Selected Month = ', this.month_selected);
    }
    //Date Combobox Events
    monthsList =
        [
            { label: 'January', value: '1' },
            { label: 'February', value: '2' },
            { label: 'March', value: '3' },
            { label: 'April', value: '4' },
            { label: 'May', value: '5' },
            { label: 'June', value: '6' },
            { label: 'July', value: '7' },
            { label: 'August', value: '8' },
            { label: 'September', value: '9' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' },
        ];

    month_selected = this.monthsList[(new Date).getMonth()].label;

    get months() {
        this.monthsList.length = (new Date).getMonth() + 1;
        return this.monthsList.reverse();
    }
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1);
    }
    getLastDayOfMonth(year, month) {
        return new Date(year, month + 1, 0);
    }
    handleMonthChange(event) {
        let selectedMonthDate = new Date(new Date().setMonth(event.detail.value - 1));
        this.month_selected = selectedMonthDate;
        console.log(this.month_selected);
        let getFirstDay = this.getFirstDayOfMonth(new Date(selectedMonthDate).getFullYear(), new Date(selectedMonthDate).getMonth());
        let getLastDay = this.getLastDayOfMonth(new Date(selectedMonthDate).getFullYear(), new Date(selectedMonthDate).getMonth());
        if (event.detail.value < this.months.length) {
            // console.log('First Month Date: ', getFirstDay.toDateString(), 'Last Month Date: ', getLastDay.toDateString());
            this.startDate = getFirstDay.toISOString();
            this.endDate = getLastDay.toISOString();
            console.log('Clicked', this.startDate, this.endDate);
            this.fetchCodeSizeData(true);
        }
        else {
            // console.log('First Month Date: ', getFirstDay.toDateString(), 'Current Date: ', selectedMonthDate.toDateString());
            this.startDate = getFirstDay.toISOString();
            this.endDate = selectedMonthDate.toISOString();
            console.log('Clicked', this.startDate, this.endDate);
            this.fetchCodeSizeData(true);
        }

    }
    //Date Combobox Events
    // Date Events
    addMonths(date, months) {
        date.setMonth(date.getMonth() + months);
        return date.toISOString();
    }
    //Get code size data
    fetchCodeSizeData(updateChart) {
        this.isLoading = true;
        this.codeSizeGraphLoader = true;
        if (this.startDate && this.endDate) {
            console.log('Histogram', this.sandbox, this.startDate, this.endDate);
            apiService({
                request: 'GET',
                apiName: 'getsandbox-codesize',
                apiParams: serializeParams({
                    sandbox: this.sandbox,
                    startDate: this.startDate,
                    endDate: this.endDate
                })
            }).then(response => {
                console.log("response", JSON.parse(JSON.stringify(response)));
                this.apexStatusCount = response.apexStatus;
                if (response?.apexStatus) {
                    this.apexBatchCount = response.apexStatus.batchCount || '--';
                    this.apexExcludesBatchAndTestCount = response.apexStatus.excludesBatchAndTestCount || '--';
                    this.apexTestCount = response.apexStatus.testCount || '--';
                    this.apexTotalCount = response.apexStatus.totalCount || '--';
                    this.apexEnv = response.apexStatus.env || '--';
                }
                this.graphdata = response?.codeSize.length > 0 && response.codeSize;
                this.graphNoData = response?.codeSize.length == 0;
                if (this.graphdata?.length > 0) {
                    //format Data
                    if (updateChart) {
                        this.labels = [];
                        this.scores = [];
                        this.chart.data.datasets[0].data = [];
                        this.chart.update();
                    }
                    this.graphdata.map((x) => {
                        if (x.score) {
                            this.scores.push(x.score);
                        }
                        if (x.create_time) { this.labels.push(new Date(x.create_time).toLocaleString()) }
                    });

                    if (this.scores.length > 0) {
                        this.maxScoreValue = Math.max(...this.scores) < 100 ? 100 : 10000000;
                        console.log('Update chart', updateChart);
                        if (updateChart) {
                            const canvasElemenet = this.template.querySelector('canvas.CodeSizeGraph');
                            this.chart.data.labels = this.labels;
                            this.chart.data.datasets[0].data = this.scores;
                            //Update new data                           
                            console.log('chart data', this.chart.data);
                            // this.canvasElemenet.style.width = this.scores ? this.scores.length * 5 + 'px' : '100%';
                            this.chart.update();
                        }
                        else {
                            //Create Graph
                            const canvasElemenet = this.template.querySelector('canvas.CodeSizeGraph');
                            const ctx = canvasElemenet;
                            this.chart = new Chart(ctx, this.codeSizeGraphConfig);
                            // this.canvasElemenet.style.height = '500px';
                            // this.canvasElemenet.style.width = this.scores ? this.scores.length * 5 + 'px' : '100%';
                        }
                    }
                }
                this.isLoading = false;
                this.codeSizeGraphLoader = false;
            }).catch(error => {
                console.error(error);
                this.isLoading = false;
                this.codeSizeGraphLoader = false;
            })
        }
    }

    //Handle Filter click
    handleOnclickFilter() {
        this.startDate = this.addMonths(new Date(), - 1);
        this.endDate = new Date().toISOString();
        console.log('Clicked', this.startDate, this.endDate);
        this.fetchCodeSizeData(true);
    }

    //Create Code Size Graph
    codeSizeGraphConfig = {
        type: 'line',
        data: {
            labels: this.labels,
            datasets: [
                {
                    label: 'Sandbox Code Size',
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
                    pointRadius: 3,
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
                    max: this.maxScoreValue,
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