import { LightningElement, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import dxVisChartJS from '@salesforce/resourceUrl/dxVisChartJS';
import getScoreDataList from '@salesforce/apex/ToolingAPIHelper.getScoreDataList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SfdxSandboxCodeSizeGraph extends LightningElement {
    @api graphdata;
    @api sandbox; 
    @track selectedMonth = '';
    @track selectedSandbox = '';


    //Date ranges
   // currentDate;
   // dateBefore6Month;
   // startDate;
   // endDate;

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


    get chartData() {
        if (this.graphdata) {
            return this.graphdata.length > 0 ? true : false;
        }
    }

   // connectedCallback() {
   //     console.log('Selected Month = ', this.month_selected);
   // }
    //Date Combobox Events
    monthOptions = 
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
        { label: 'December', value: '12' }
        ];
    //    month_selected = this.monthOptions[(new Date).getMonth()].label;

    // get months() {
      //  this.monthOptions.length = (new Date).getMonth() + 1;
      //  return this.monthOptions.reverse();
    // }
    // getFirstDayOfMonth(year, month) {
    //     return new Date(year, month, 1);
    // }
    // getLastDayOfMonth(year, month) {
    //     return new Date(year, month + 1, 0);
    // }

    



    //Date Combobox Events
    // Date Events
   // addMonths(date, months) {
    //    date.setMonth(date.getMonth() + months);
     //   return date.toISOString();
   // }


    handleMonthChange(event) {
      this.selectedMonth = event.detail.value;
    }



    

     // Options for the dropdown
   // get sandboxOptions() {
    //  return [
    //      { label: 'Visualizer', value: 'Visualizer' },
    //      { label: 'Dxvizapp', value: 'Dxvizapp' }
     //  ];
    // } 
     
   // handleSandboxChange(event) {
    //   const selectedSandbox = event.detail.sandboxNamedCredential;
     //   console.log('selectedSandbox--->', selectedSandbox);
      //  // Emit a custom event with the selected sandbox
       // const sandboxChangeEvent = new CustomEvent('sandboxchange', {
     //       detail: { sandboxNamedCredential: selectedSandbox }
     //   });
      //  this.dispatchEvent(sandboxChangeEvent);
   // }






    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;
        Promise.all([
            loadScript(this, dxVisChartJS + "/dxVisChartJS/chart.js.min.js")
        ]).then(() => {
            //Set Filter date
            // this.startDate = this.addMonths(new Date(), -3);
            // this.endDate = new Date().toISOString();
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

    //Get code size data
    fetchCodeSizeData(updateChart) {
        console.log('Histogram', JSON.parse(JSON.stringify(this.graphdata)) );  
        // const updateChart = true;
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