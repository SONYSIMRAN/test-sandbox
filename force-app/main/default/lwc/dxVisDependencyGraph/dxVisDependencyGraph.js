import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import d3 from '@salesforce/resourceUrl/dxVisD3';
import images from '@salesforce/resourceUrl/visualizer_images';

export default class DxVisDependencyGraph extends LightningElement {
    @api dependencies;
    @api
    updateGraph(filteredDependencies) {
        console.log('Updating graph with new dependencies:', filteredDependencies);
        this.renderGraph(filteredDependencies);
    }
    d3JsLoaded = false;

    //Header Config
    cardView = true;
    kanbanView = true;
    listView = true;
    buttonPackageDep = true;
    buttonSandboxCodeSize = true;
    buttonPackageSorting = false;
    selectSandbox = false;
    buttonMetricsDashboard = false;
    //Header Config
    iconTilesView = images + '/tiles-view-icon.svg';
    iconKanbanView = images + '/kanban-view-icon.svg';
    iconListView = images + '/list-view-icon.svg';
    iconPackageDepView = images + '/graph-action-icon.svg';
    iconCodeSizeView = images + '/code-size-icon.svg';
    iconSortView = images + '/sorting-action-icon.svg';

    renderedCallback() {
        if (this.d3JsLoaded) {
            return;
        }

        console.log('Loading D3.js from:', d3 + '/d3.v7.min.js');
        Promise.all([
            loadScript(this, d3 + "/dxVisD3/d3.v7.min.js"),
            loadScript(this, d3 + "/dxVisD3/d3-tip.min.js"),
            // loadStyle(this, bootstrap + '/bootstrap/bootstrap.css'),
            // loadStyle(this, dxVisStyle + '/dxVisStyle/dx-vis-style.css')
        ]).then(() => {
            this.d3JsLoaded = true;
            console.log('D3.js library loaded.');
            this.renderGraph(this.dependencies);
        })
        .catch(error => {
            console.log(error);
        });
    }

    drag(simulation) {
        const dragstarted = (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };

        const dragged = (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        };

        const dragended = (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        };

        return window.d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }


    // renderGraph() {
    //     if (!this.dependencies || !this.dependencies.nodes || !this.dependencies.links) {
    //         console.error('Invalid dependencies data:', this.dependencies);
    //         return;
    //     }
    
    //     if (!window.d3) {
    //         console.error('D3.js not loaded.');
    //         return;
    //     }
    
    //     const graphContainer = this.template.querySelector('.networkGraph');
    //     if (!graphContainer) {
    //         console.error('Graph container not found');
    //         return;
    //     }
    
    //     // Clear any previous SVG
    //     window.d3.select(graphContainer).selectAll('svg').remove();
    
    //     const data = {
    //         nodes: [],
    //         links: [],
    //     };
    
    //     this.dependencies.links.forEach((d) => {
    //         if (!data.nodes.find(item => item.packageName === d.source)) {
    //             data.nodes.push({ packageName: d.source, id: d.source });
    //         }
    //         if (!data.nodes.find(item => item.packageName === d.target)) {
    //             data.nodes.push({ packageName: d.target, id: d.target });
    //         }
    //     });
    
    //     this.dependencies.links.forEach((d) => {
    //         data.links.push({
    //             ...d,
    //             type: d.source === 'unpackaged' || d.target === 'unpackaged' ? 'unpackaged' : 'packaged',
    //         });
    //     });
    
    //     const width = graphContainer.clientWidth * 0.9 || 1000;
    //     const height = graphContainer.clientHeight * 0.7 || 700;
    
    //     const svg = window.d3.select(graphContainer)
    //         .append('svg')
    //         .attr('width', width)
    //         .attr('height', height)
    //         .style('font', '13px sans-serif');
    
    //     const g = svg.append('g');
    
    //     // Define arrowhead marker
    //     svg.append('defs').append('marker')
    //         .attr('id', 'arrowhead')
    //         .attr('viewBox', '0 -5 10 10')
    //         .attr('refX', 15)  // Adjust to position arrow correctly
    //         .attr('refY', 0)
    //         .attr('markerWidth', 8)
    //         .attr('markerHeight', 8)
    //         .attr('orient', 'auto')
    //         .append('path')
    //         .attr('d', 'M0,-5L10,0L0,5')
    //         .attr('fill', '#999');
    
    //     // Force simulation with collision, charge, and link distance
    //     const simulation = window.d3.forceSimulation(data.nodes)
    //         .force('link', window.d3.forceLink(data.links).id(d => d.id).distance(150))
    //         .force('charge', window.d3.forceManyBody().strength(-300))
    //         .force('center', window.d3.forceCenter(width / 2, height / 2))
    //         .force('collide', window.d3.forceCollide().radius(20));
    
    //     // Create links with arrowheads
    //     const link = g.append('g')
    //         .attr('stroke', '#999')
    //         .attr('stroke-opacity', 0.6)
    //         .selectAll('line')
    //         .data(data.links)
    //         .enter().append('line')
    //         .attr('stroke-width', d => Math.sqrt(d.value))
    //         .attr('marker-end', 'url(#arrowhead)');  // Reference arrowhead marker
    
    //     // Create nodes with special size for the main node
    //     const node = g.append('g')
    //         .attr('stroke', '#fff')
    //         .attr('stroke-width', 1.5)
    //         .selectAll('circle')
    //         .data(data.nodes)
    //         .enter().append('circle')
    //         .attr('r', d => d.packageName === 'mainNodeId' ? 12 : 6)  // Larger size for the main node
    //         .attr('fill', (d, i) => window.d3.schemeCategory10[i % 10])
    //         .call(this.drag(simulation));
    
    //     // Add node labels
    //     const labels = g.append('g')
    //         .attr('class', 'labels')
    //         .selectAll('text')
    //         .data(data.nodes)
    //         .enter().append('text')
    //         .attr('x', d => d.x)
    //         .attr('y', d => d.y)
    //         .attr('dy', -15)
    //         .attr('text-anchor', 'middle')
    //         .text(d => d.packageName)
    //         .style('font-size', '10px')
    //         .style('fill', '#000');
    
    //     node.append('title')
    //         .text(d => d.id);
    
    //     simulation.on('tick', () => {
    //         link
    //             .attr('x1', d => d.source.x)
    //             .attr('y1', d => d.source.y)
    //             .attr('x2', d => d.target.x)
    //             .attr('y2', d => d.target.y);
    
    //         node
    //             .attr('cx', d => d.x)
    //             .attr('cy', d => d.y);
    
    //         labels
    //             .attr('x', d => d.x)
    //             .attr('y', d => d.y);
    //     });
    // }
      

    renderGraph(dependencies) {
        if (!dependencies || !dependencies.nodes) {
            console.error('Invalid dependencies data:', dependencies);
            return;
        }
    
        if (!window.d3) {
            console.error('D3.js not loaded.');
            return;
        }
    
        const graphContainer = this.template.querySelector('.networkGraph');
        if (!graphContainer) {
            console.error('Graph container not found');
            return;
        }
    
        // Clear any previous SVG
        window.d3.select(graphContainer).selectAll('svg').remove();
    
        const data = {
            nodes: [],
            links: [],
        };
    
        console.log('dependencies in graph:---', JSON.parse(JSON.stringify(dependencies)));
    
        // Populate nodes from dependencies
        // dependencies.nodes.forEach(node => {
        //     data.nodes.push({ packageName: node.packageName, id: node.id });
        // });
    
        // Populate links from dependencies
        if (dependencies.links) {
            dependencies.links.forEach(d => {
                // Ensure both source and target nodes exist
                if (!data.nodes.some(item => item.id === d.source)) {
                    data.nodes.push({ packageName: d.source, id: d.source });
                }
                if (!data.nodes.some(item => item.id === d.target)) {
                    data.nodes.push({ packageName: d.target, id: d.target });
                }
                data.links.push({
                    ...d,
                    type: d.source === 'unpackaged' || d.target === 'unpackaged' ? 'unpackaged' : 'packaged',
                });
            });
        }
    
        console.log('data in graph:---', JSON.parse(JSON.stringify(data)));
    
        const width = graphContainer.clientWidth * 0.9 || 1000;
        const height = graphContainer.clientHeight * 0.7 || 700;
    
        const svg = window.d3.select(graphContainer)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('font', '13px sans-serif');
    
        const g = svg.append('g');
    
        // Define arrowhead marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 15)
            .attr('refY', 0)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');
    
        // Force simulation
        const simulation = window.d3.forceSimulation(data.nodes)
            .force('link', window.d3.forceLink(data.links).id(d => d.id).distance(150))
            .force('charge', window.d3.forceManyBody().strength(-300))
            .force('center', window.d3.forceCenter(width / 2, height / 2))
            .force('collide', window.d3.forceCollide().radius(20));
    
        // Create links with arrowheads
        const link = g.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(data.links)
            .enter().append('line')
            .attr('stroke-width', d => Math.sqrt(d.value))
            .attr('marker-end', 'url(#arrowhead)');  // Reference arrowhead marker
    
        // Create nodes with special size for the main node
        const node = g.append('g')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(data.nodes)
            .enter().append('circle')
            .attr('r', 6) // Default size for nodes
            .attr('fill', (d, i) => window.d3.schemeCategory10[i % 10])
            .call(this.drag(simulation));
    
        // Add node labels
        const labels = g.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(data.nodes)
            .enter().append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('dy', -15)
            .attr('text-anchor', 'middle')
            .text(d => d.packageName)
            .style('font-size', '10px')
            .style('fill', '#000');
    
        node.append('title')
            .text(d => d.id);
    
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
    
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
    
            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
    }
    
      
    
}