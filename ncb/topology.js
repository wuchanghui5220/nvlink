function drawTopology(numSU, numSpine, numLeaf, numServers, numNetworkCardsPerServer, serversPerSU, spineLeafDistance, leafNodeDistance, serversPerRow, diagramHeight) {
    const minWidth = Math.min(window.innerWidth - 40, 1200);
    const width = Math.max(minWidth, numLeaf * 80);
    const height = diagramHeight;
    const spineY = 50;
    const leafY = spineY + spineLeafDistance;
    const serverY = leafY + leafNodeDistance;
    
    d3.select("#diagram").selectAll("*").remove();
    const svg = d3.select("#diagram")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);

    const connectionsGroup = svg.append("g").attr("class", "connections");
    const nodesGroup = svg.append("g").attr("class", "nodes");
    
    // Draw Spine switches
    const spineX = d => (width / (numSpine + 1)) * (d + 1);
    nodesGroup.selectAll(".spine")
        .data(d3.range(numSpine))
        .join("rect")
        .attr("class", "spine")
        .attr("x", d => spineX(d) - 30)
        .attr("y", spineY)
        .attr("width", 60)
        .attr("height", 30)
        .attr("fill", "#3498db");
    
    nodesGroup.selectAll(".spine-label")
        .data(d3.range(numSpine))
        .join("text")
        .attr("class", "spine-label")
        .attr("x", spineX)
        .attr("y", spineY + 15)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text((d, i) => `Spine ${i + 1}`);
    
    // Draw Leaf switches
    const leafX = d => (width / (numLeaf + 1)) * (d + 1);
    nodesGroup.selectAll(".leaf")
        .data(d3.range(numLeaf))
        .join("rect")
        .attr("class", "leaf")
        .attr("x", d => leafX(d) - 30)
        .attr("y", leafY)
        .attr("width", 60)
        .attr("height", 30)
        .attr("fill", "#3498db");
    
    nodesGroup.selectAll(".leaf-label")
        .data(d3.range(numLeaf))
        .join("text")
        .attr("class", "leaf-label")
        .attr("x", leafX)
        .attr("y", leafY + 15)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text((d, i) => `Leaf ${i + 1}`);
    
    // Draw connections between Spine and Leaf switches
    for (let l = 0; l < numLeaf; l++) {
        for (let s = 0; s < numSpine; s++) {
            const startX = spineX(s);
            const startY = spineY + 30;
            const endX = leafX(l);
            const endY = leafY;
            const midY = (startY + endY) / 2;

            connectionsGroup.append("path")
                .attr("d", `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`)
                .attr("fill", "none")
                .attr("stroke", "#34495e")
                .attr("stroke-width", 0.5);
        }
    }
    
    // Draw Servers
    const serverWidth = 50;
    const serverHeight = 20;
    const serverSpacing = Math.min(60, width / (numSU * serversPerRow));
    const totalRows = Math.ceil(numServers / serversPerRow);
    
    for (let su = 0; su < numSU; su++) {
        for (let s = 0; s < Math.min(serversPerSU, numServers - su * serversPerSU); s++) {
            const row = Math.floor(s / serversPerRow);
            const col = s % serversPerRow;
            const x = (width / numSU) * (su + 0.5) + (col - serversPerRow / 2 + 0.5) * serverSpacing;
            const y = serverY + row * 60;
            
            nodesGroup.append("rect")
                .attr("x", x - serverWidth / 2)
                .attr("y", y - serverHeight / 2)
                .attr("width", serverWidth)
                .attr("height", serverHeight)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "#2ecc71");
            
            nodesGroup.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "8px")
                .attr("fill", "white")
                .text(`Node ${su * serversPerSU + s + 1}`);
            
            // Draw connections between Leaf switches and Servers
            for (let nc = 0; nc < numNetworkCardsPerServer; nc++) {
                const targetLeaf = su * numNetworkCardsPerServer + nc;
                const startX = leafX(targetLeaf);
                const startY = leafY + 30;
                const endX = x;
                const endY = y - serverHeight / 2;
                const midY = (startY + endY) / 2;

                connectionsGroup.append("path")
                    .attr("d", `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`)
                    .attr("fill", "none")
                    .attr("stroke", "#bdc3c7")
                    .attr("stroke-width", 0.5);
            }
        }
    }
}

function downloadTopologyPNG(whiteBackground = false) {
    const svg = document.querySelector('#diagram svg');
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    
    if (whiteBackground) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(source, 'image/svg+xml');
        const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'white');
        doc.documentElement.insertBefore(rect, doc.documentElement.firstChild);
        source = serializer.serializeToString(doc);
    }
    
    const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
    const img = new Image();
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(function(blob) {
            saveAs(blob, `topology${whiteBackground ? '_white' : ''}.png`);
        });
    };
    
    img.src = url;
}

// 更新拓扑图
function updateTopology() {
    const spineLeafDistance = parseInt(document.getElementById('spineLeafDistance').value);
    const leafNodeDistance = parseInt(document.getElementById('leafNodeDistance').value);
    const serversPerRow = parseInt(document.getElementById('serversPerRow').value);
    const diagramHeight = parseInt(document.getElementById('diagramHeight').value);
    
    // 从结果中获取计算数据
    const numSpine = parseInt(document.getElementById('numSpineSwitches').textContent);
    const numLeaf = parseInt(document.getElementById('numLeafSwitches').textContent);
    const numServers = parseInt(document.getElementById('totalServers').textContent);
    const numNetworkCardsPerServer = parseInt(document.getElementById('networkCardsPerServer').textContent);
    const serversPerSU = parseInt(document.getElementById('serversPerSU').textContent);
    const numSU = parseInt(document.getElementById('numSU').textContent);
    
    drawTopology(numSU, numSpine, numLeaf, numServers, numNetworkCardsPerServer, serversPerSU, 
                spineLeafDistance, leafNodeDistance, serversPerRow, diagramHeight);
}

// 监听拓扑参数变化
document.getElementById('spineLeafDistance').addEventListener('change', updateTopology);
document.getElementById('leafNodeDistance').addEventListener('change', updateTopology);
document.getElementById('serversPerRow').addEventListener('change', updateTopology);
document.getElementById('diagramHeight').addEventListener('change', updateTopology);