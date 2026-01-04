// Enable/disable inter-switch links dropdown based on number of switches
function updateInterSwitchLinks() {
  const numSwitches = parseInt(document.getElementById('numSwitches').value);
  const interSwitchLinksSelect = document.getElementById('interSwitchLinks');
  
  if (numSwitches === 1) {
    interSwitchLinksSelect.disabled = true;
  } else {
    interSwitchLinksSelect.disabled = false;
  }
  
  calculateAndDraw();
}

function calculateAndDraw() {
  const numServers = parseInt(document.getElementById('numServers').value);
  const numNetworkCardsPerServer = parseInt(document.getElementById('numNetworkCardsPerServer').value);
  const numSwitches = parseInt(document.getElementById('numSwitches').value);
  const interSwitchLinks = parseInt(document.getElementById('interSwitchLinks').value);
  const switchServerDistance = parseInt(document.getElementById('switchServerDistance').value);
  const diagramHeight = parseInt(document.getElementById('diagramHeight').value);
  const serverSpacing = parseInt(document.getElementById('serverSpacing').value);
  const switchSpacing = parseInt(document.getElementById('switchSpacing').value);

  // Calculate the network statistics
  const totalNetworkCards = numServers * numNetworkCardsPerServer;
  const totalSwitchPorts = numSwitches * 64; // Assuming 64 ports per switch
  const interSwitchPortsUsed = numSwitches === 2 ? interSwitchLinks * 2 : 0; // Each link uses a port on both switches
  const availableSwitchPorts = totalSwitchPorts - interSwitchPortsUsed;
  
  // Check if the configuration is valid
  const isValid = totalNetworkCards <= availableSwitchPorts;
  
  // Update results panel
  const results = `
    <p><strong>Network Configuration:</strong></p>
    <p><strong>Servers:</strong> ${numServers}</p>
    <p><strong>Network Cards per Server:</strong> ${numNetworkCardsPerServer}</p>
    <p><strong>Switches:</strong> ${numSwitches} x 64-port</p>
    ${numSwitches === 2 ? `<p><strong>Inter-Switch Links:</strong> ${interSwitchLinks}</p>` : ''}
    <p><strong>Total Network Cards:</strong> ${totalNetworkCards}</p>
    <p><strong>Total Switch Ports:</strong> ${totalSwitchPorts}</p>
    ${numSwitches === 2 ? `<p><strong>Inter-Switch Ports Used:</strong> ${interSwitchPortsUsed}</p>` : ''}
    <p><strong>Available Switch Ports:</strong> ${availableSwitchPorts}</p>
    <p><strong>Configuration Status:</strong> ${isValid ? '<span style="color: green;">Valid</span>' : '<span style="color: red;">Invalid - Too many network cards for available switch ports</span>'}</p>
  `;
  
  document.getElementById('results').innerHTML = results;
  
  if (isValid) {
    drawTopology(numServers, numNetworkCardsPerServer, numSwitches, interSwitchLinks, switchServerDistance, diagramHeight, serverSpacing, switchSpacing);
  }
}

function drawTopology(numServers, numNetworkCardsPerServer, numSwitches, interSwitchLinks, switchServerDistance, diagramHeight, serverSpacing, switchSpacing) {
  // Clear previous diagram
  d3.select("#diagram").selectAll("*").remove();
  
  // Determine diagram dimensions
  const displayWidth = Math.max(Math.min(window.innerWidth - 40, 1200), numServers * serverSpacing);
  const width = displayWidth;
  const height = diagramHeight;
  
  // Create SVG
  const svg = d3.select("#diagram")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);
  
  // Create layers for connections and nodes
  const connectionsGroup = svg.append("g").attr("class", "connections");
  const nodesGroup = svg.append("g").attr("class", "nodes");
  
  // Constants for styling
  const switchWidth = 80;
  const switchHeight = 40;
  const serverWidth = 60;
  const serverHeight = 30;
  
  // Y positions
  const switchY = 80;
  const serverY = switchY + switchServerDistance;
  
  // Draw switches
  const switchPositions = [];
  
  for (let i = 0; i < numSwitches; i++) {
    // Calculate X position based on number of switches
    let switchX;
    if (numSwitches === 1) {
      switchX = width / 2;
    } else {
      // Two switches, use the switch spacing to determine positions
      switchX = (width / 2) + (i === 0 ? -switchSpacing/2 : switchSpacing/2);
    }
    
    switchPositions.push(switchX);
    
    // Draw switch
    nodesGroup.append("rect")
      .attr("class", "switch")
      .attr("x", switchX - switchWidth / 2)
      .attr("y", switchY - switchHeight / 2)
      .attr("width", switchWidth)
      .attr("height", switchHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "#3498db");
      
    nodesGroup.append("text")
      .attr("class", "switch-label")
      .attr("x", switchX)
      .attr("y", switchY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .text(`Switch ${i + 1}`);
  }
  
  // If there are two switches, draw inter-switch links
  if (numSwitches === 2) {
    const switch1X = switchPositions[0];
    const switch2X = switchPositions[1];
    
    for (let i = 0; i < interSwitchLinks; i++) {
      // Calculate offset for multiple links
      const offset = interSwitchLinks > 1 
        ? (i - (interSwitchLinks - 1) / 2) * 4 
        : 0;
      
      connectionsGroup.append("path")
        .attr("d", `M ${switch1X + switchWidth/4} ${switchY + offset} L ${switch2X - switchWidth/4} ${switchY + offset}`)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");
    }
    
    // Add a label for inter-switch links
    nodesGroup.append("text")
      .attr("x", (switch1X + switch2X) / 2)
      .attr("y", switchY - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#2c3e50")
      .text(`${interSwitchLinks} Links`);
  }
  
  // Draw servers
  const serverPositions = [];
  
  for (let i = 0; i < numServers; i++) {
    // Calculate server position
    // If odd number of servers, center them, otherwise space them evenly
    let serverX;
    if (numServers % 2 === 1) {
      // Odd number of servers
      const middleIndex = Math.floor(numServers / 2);
      const offset = i - middleIndex;
      serverX = width / 2 + offset * serverSpacing;
    } else {
      // Even number of servers
      const offset = i - (numServers / 2) + 0.5;
      serverX = width / 2 + offset * serverSpacing;
    }
    
    serverPositions.push(serverX);
    
    // Draw server
    nodesGroup.append("rect")
      .attr("class", "server")
      .attr("x", serverX - serverWidth / 2)
      .attr("y", serverY - serverHeight / 2)
      .attr("width", serverWidth)
      .attr("height", serverHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "#2ecc71");
      
    nodesGroup.append("text")
      .attr("class", "server-label")
      .attr("x", serverX)
      .attr("y", serverY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "10px")
      .attr("fill", "white")
      .text(`Server ${i + 1}`);
    
    // Add network card indicators
    for (let nc = 0; nc < numNetworkCardsPerServer; nc++) {
      // Position network card indicators at the top of each server
      const ncX = serverX - serverWidth/2 + serverWidth * (nc + 1) / (numNetworkCardsPerServer + 1);
      const ncY = serverY - serverHeight/2;
      
      nodesGroup.append("circle")
        .attr("cx", ncX)
        .attr("cy", ncY)
        .attr("r", 3)
        .attr("fill", "white");
    }
  }
  
  // Draw connections between servers and switches
  for (let s = 0; s < numServers; s++) {
    const serverX = serverPositions[s];
    
    for (let nc = 0; nc < numNetworkCardsPerServer; nc++) {
      // Calculate which switch to connect to
      let switchIndex = 0;
      
      if (numSwitches === 2) {
        // Alternating pattern between switches
        switchIndex = nc % 2;
      }
      
      const switchX = switchPositions[switchIndex];
      
      // Calculate connection points
      const ncX = serverX - serverWidth/2 + serverWidth * (nc + 1) / (numNetworkCardsPerServer + 1);
      const ncY = serverY - serverHeight/2;
      
      // Create curved connection
      const midY = (switchY + ncY) / 2;
      
      connectionsGroup.append("path")
        .attr("d", `M ${switchX} ${switchY + switchHeight/2} C ${switchX} ${midY}, ${ncX} ${midY}, ${ncX} ${ncY}`)
        .attr("fill", "none")
        .attr("stroke", "#95a5a6")
        .attr("stroke-width", 1);
    }
  }
  
  // Add title labels
  nodesGroup.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Small-Scale InfiniBand Network Topology");
    
  nodesGroup.append("text")
    .attr("x", width / 2)
    .attr("y", switchY - 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Switches");
    
  nodesGroup.append("text")
    .attr("x", width / 2)
    .attr("y", serverY + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Servers");
  
  // No legend needed as requested
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('numSwitches').addEventListener('change', updateInterSwitchLinks);
  calculateAndDraw();
});

window.addEventListener('resize', calculateAndDraw);
