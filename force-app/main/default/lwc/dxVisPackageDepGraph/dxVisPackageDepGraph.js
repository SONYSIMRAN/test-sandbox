import { LightningElement, api, track, wire } from 'lwc';
import apiService from '@salesforce/apex/DXApiService.apiService';
import { serializeParams } from 'c/dxUtils';

import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import { CurrentPageReference } from 'lightning/navigation';

export default class DxVisPackageDepGraph extends LightningElement {

    @api item;
    @api graphdata;
    @api sandbox = "LOAD";
    @api bubbleGraphData = [];

    @track packageOptions = []; // Array to store package options for the dropdown
    @track selectedPackage = ''; // Track the selected package
    @track incomingChecked = false; // Track the incoming checkbox state
    @track outgoingChecked = false; // Track the outgoing checkbox state

    //Header param
    headerConfig = true;
    //Header Config
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = true;
    buttonSandboxCodeSize = true;
    buttonPackageSorting = false;
    selectSandbox = false;
    isLoading = true;
    //Get state event
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            console.log('Page ref', currentPageReference);
            this.sandbox = currentPageReference.attributes.attributes?.sandbox;
        }
    }
    //Render callback
    renderedCallback() {
    }

    //Connected callback
    connectedCallback() {
        console.log('Sandbox', this.sandbox);
        this.fetchPackageDepData();
    }

    //Component events
    fetchPackageDepData() {
        this.isLoading = true;
        apiService({
            request: 'GET',
            apiName: 'sandbox-depend-graph',
            apiParams: serializeParams({
                sandbox: this.sandbox
            })
        }).then(response => {
            this.graphdata = response;
            this.isLoading = false;
            console.log('Graph data', JSON.parse(JSON.stringify(this.graphdata)));
            if (this.graphdata) {
                //New graph data type
                //Create bubble graph data
                const sourceTargetsCount = {};

                // Iterate through the links in graphdata
                this.graphdata.links.forEach(link => {
                    // If the source is already in the object, increment its count
                    if (sourceTargetsCount[link.source]) {
                        sourceTargetsCount[link.source]++;
                    } else {
                        // Otherwise, initialize the count to 1
                        sourceTargetsCount[link.source] = 1;
                    }
                    // Check if the target is already in the object, increment its count
                    if (sourceTargetsCount[link.target]) {
                        sourceTargetsCount[link.target]++;
                    } 
                });
                // Log the results
                for (const source in sourceTargetsCount) {
                    this.bubbleGraphData.push({ name: source, value: sourceTargetsCount[source] });
                }

                this.preparePackageOptions();
                this.updateFilteredLinks();

                // console.log(`Data Bubble graph : ${JSON.stringify(this.bubbleGraphData)}`);
                if (this.bubbleGraphData.length > 0) {
                    this.packageBubblGraph();
                }
            }
        }).catch(error => {
            console.error(error);
        })
    }
    packageBubblGraph() {
        // set the dimensions and margins of the graph
        const width = 1100
        const height = 250
        var graphDataTop = {
            'children': this.bubbleGraphData
        }
        var getGraphActualData = this.graphdata;
        // append the svg object to the body of the page
        const svg = d3.select(this.template.querySelector('.packageBubblesGraph'))
            .append("svg")
            .attr("width", width)
            .attr("height", height)
        // Color palette for continents?
        const color = d3.scaleOrdinal(d3.schemePaired);

        // Size scale for countries
        const size = (value) => {
            if (value < 15) { return 20 } else { return value * 1.3 }
        }  // circle radius calculation

        // create a tooltip
        const Tooltip = d3.select(this.template.querySelector('.packageBubblesGraph'))
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function (event, d) {
            Tooltip.style("opacity", 1);
            d3.select(this).style("cursor", "pointer");
        }
        const mousemove = function (event, d) {
            Tooltip
                .html('<u>' + d.name + '</u>' + "<br>" + d.value)
                .style("left", (event.x / 2) + "px")
                .style("top", (event.y / 2) + "px")
        }
        var mouseleave = function (event, d) {
            Tooltip.style("opacity", 0);
            d3.select(this).style("cursor", "pointer");

        }
        //Click Package bubbles
        var clickBubble = (event, d) => {
            this.selectedPackage = d.name;
            this.outgoingChecked = true;
            this.incomingChecked = false;

            const selectedCheckbox = this.outgoingChecked ? 'Outgoing' : 'Incoming';
            // console.log('clicked bubble= ' + d.name, JSON.stringify(getGraphActualData));
            // const filteredLinks = getGraphActualData.links && getGraphActualData.links.filter(link =>
            //     link.source === d.name || link.target === d.name && Object.keys(link).length > 0
            // );
            const filteredLinks = this.graphdata.links.filter(link =>
                (selectedCheckbox === 'Incoming' && link.target === this.selectedPackage) ||
                (selectedCheckbox === 'Outgoing' && link.source === this.selectedPackage)
            );
            this.filteredLinks = filteredLinks;
            this.createNetworkGraph(d.name, filteredLinks);
        }

        const truncateLabel = (label, labelLen) => {
            const max = 5;
            const maxLen = 30;
            if (label.length > max && labelLen <= maxLen) {
                label = label.slice(0, max) + '...';
            }
            return label;
        }
        const getFontSize = (value, min, max) => {
            const minPx = 8;
            const maxPx = 14;
            const pxRange = maxPx - minPx;
            const dataRange = max - min;
            // Convert value to number if it's a string
            const numericValue = parseFloat(value);
            if (isNaN(numericValue)) {
                // Handle the case where the value is not a valid number
                console.error('Invalid value:', value);
                return `${minPx}px`; // Default to minimum size
            }
            const ratio = pxRange / dataRange;
            const size = Math.min(maxPx, Math.round(numericValue * ratio) + minPx);
            return `${size}px`;
        }

        // Initialize the circle: all located at the center of the svg area
        var node = svg.selectAll('.graph')
            .data(graphDataTop.children)
            .enter()
            .append('g').attr('class', 'graph')
        // .attr("cx", width / 2)
        // .attr("cy", height / 2)
        // .attr('transform', (d) => { return 'translate(' + d.x + ' ' + d.y + ')'; });

        node.append("circle")
            .attr("class", "node")
            .attr("r", d => size(d.value))
            .style("fill", color)
            .style("fill-opacity", 0.8)
            .attr("stroke", color)
            .style("stroke-opacity", 1)
            .style("stroke-width", 1)
            .style("cusror", "pointer")
            .on("mouseover", mouseover) // What to do when hovered
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", clickBubble)
        // .call(d3.drag() // call specific function when circle is dragged
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));
        node.append("text")
            .text((d) => truncateLabel(d.name, d.value))
            .style("text-anchor", "middle")
            // .style('font-family', 'Roboto')
            .style('font-size', (d) => getFontSize(d.value, 6, 25))
            .style("fill", "#080808")
            .style('cusror', 'pointer')
            .on("mouseover", mouseover) // What to do when hovered
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", clickBubble);

        node.append("text")
            .attr("dy", "1.1em")
            .text((d) => { return d.value })
            .style("text-anchor", "middle")
            // .style('font-family', 'Roboto')
            .style('font-size', (d) => getFontSize(d.value, 6, 25))
            .style("fill", "#fff080808fff")
            .style('cusror', 'pointer')
            .on("mouseover", mouseover) // What to do when hovered
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .on("click", clickBubble);

        // Features of the forces applied to the nodes:
        const simulation = d3.forceSimulation()
            .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(10)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(1.4).radius(function (d) { return (size(d.value) + 3) }).iterations(1)) // Force that avoids circle overlapping
            .force('y', d3.forceY().y(function (d) { return size(d.value); }))
        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
            .nodes(graphDataTop.children)
            .on("tick", function (d) {
                node.attr('transform', (d) => { return 'translate(' + d.x + ' ' + d.y + ')'; });
            });

    }
    createNetworkGraph(packageName, networkData) {
        console.log("Chart filtered Data= ", JSON.parse(JSON.stringify(networkData)));
        const data = {
            nodes: [],
            links: [],
        };
        networkData.forEach((d) => {
            if (!data.nodes.find(item => item.packageName === d.source)) {
                data.nodes.push({ packageName: d.source, id: d.source });
            }
            if (!data.nodes.find(item => item.packageName === d.target)) {
                data.nodes.push({ packageName: d.target, id: d.target });
            }
        });
        networkData.forEach((d) => {
            data.links.push({
                ...d,
                type:
                    d.source === "unpackaged" || d.target === "unpackaged"
                        ? "unpackaged"
                        : "packaged",
            });
        });
        console.log('NetworkGraph data= ', JSON.parse(JSON.stringify(data)));
        const types = ["unpackaged", "packaged"];
        const height = 400;
        const width = 800;
        const color = d3.scaleOrdinal(types, d3.schemeSet2);
        const drag = (simulation) => {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        };

        function linkArc(d) {
            const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            return `M${d.source.x},${d.source.y}A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
        }

        // Reset chart when new one is created
        if (!d3.select(this.template.querySelectorAll(".networkGraph")).empty()) {
            d3.selectAll(this.template.querySelectorAll(".networkGraph > svg")).remove();
            d3.selectAll(this.template.querySelectorAll(".networkGraph > svg > *")).remove();
        }
        const packageRadius = (value) => {
            if (value == packageName) { return 10 } else { return 3 }
        }

        // const arrowXPosition = (arrXValue) => {
        //     if (arrXValue == packageName) { return 25 } else { return 15 }
        // }
        // const arrowYPosition = (arrYValue) => {
        //     if (arrYValue == packageName) { return -15 } else { return -0.5 }
        // }
        const textPosition = (pValue) => {
            if (pValue == packageName) { return 12 } else { return 5 }
        }
        const lineColor = (type) => {
            if (type.packageName === packageName) { return '#099229' } else { return '#FF7F0E' }
        }
        const simulation = d3
            .forceSimulation(data.nodes)
            .force(
                "link",
                d3.forceLink(data.links).id((d) => d.id)
            )
            .force("charge", d3.forceManyBody().strength(-1100))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3
            .select(this.template.querySelector('.networkGraph'))
            .append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .style("font", "13px sans-serif");
        svg
            .append("defs")
            .selectAll("marker")
            .data(types)
            .join("marker")
            .attr("id", (d) => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", (d) => this.incomingChecked ? 25 : 15)
            .attr("refY", -0.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", '#9b08b5')
            .attr("d", "M0,-5L10,0L0,5");

        const link = svg
            .append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .selectAll("path")
            .data(data.links)
            .join("path")
            .attr("stroke", (d) => lineColor(d.source))
            .attr(
                "marker-end",
                (d) => `url(${new URL(`#arrow-${d.type}`, window.location.href)})`
            );

        const node = svg
            .append("g")
            .attr("fill", "currentColor")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(data.nodes)
            .join("g")
            .call(drag(simulation));

        node
            .append("circle")
            .attr("stroke", "#737373")
            .attr("fill", "#d2d2d2")
            .attr("stroke-width", 1)
            .attr("r", (d) => packageRadius(d.packageName));

        node
            .append("text")
            .attr("x", (d) => textPosition(d.packageName))
            .attr("y", "0.31em")
            .text((d) => d.id)
            .style('font-size', '11px')
            .clone(true)
            .lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

        simulation.on("tick", () => {
            link.attr("d", linkArc);
            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
        console.log('Chart end');
        this.template.querySelector(".networkGraph").scrollIntoView();
        // };
        // }

    }
    preparePackageOptions() {
        this.packageOptions = this.graphdata.nodes.map(node => ({
            label: node.packageName,
            value: node.packageName
        }));
        console.log('this.packageOptions', this.packageOptions);
    }

    updateFilteredLinks() {
        this.filteredLinks = this.graphdata.links.filter(link =>
            (this.incomingChecked && link.target === this.selectedPackage) ||
            (this.outgoingChecked && link.source === this.selectedPackage)
        );
        console.log('Filtered Links:', this.filteredLinks);
        return this.filteredLinks;
    }
    handlePackageChange(event) {
        this.selectedPackage = event.detail.value;
        console.log('Selected Package:', this.selectedPackage);
        var fl = this.updateFilteredLinks();
        this.createNetworkGraph(this.selectedPackage, this.filteredLinks);
    }
    handleCheckboxChange(event) {
        const targetValue = event.target.label;
        const isChecked = event.target.checked;
        console.log('targetValue,isChecked ', isChecked, targetValue);
        if (isChecked) {
            if (targetValue === 'Incoming') {
                this.incomingChecked = true;
            } else if (targetValue === 'Outgoing') {
                this.outgoingChecked = true;
            }
        } else {
            if (targetValue === 'Incoming') {
                this.incomingChecked = false;
            } else if (targetValue === 'Outgoing') {
                this.outgoingChecked = false;
            }
        }
        const filteredLinks = this.updateFilteredLinks();
        this.createNetworkGraph(this.selectedPackage, filteredLinks);
    }
}