// Enhanced visualizations for SQL Detective Game
let currentChart = null;
let currentView = 'table';

// Initialize visualizations
function initVisualizations() {
    setupViewToggle();
}

// Setup view toggle buttons
function setupViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn-pixel');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
            
            // Update active button
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Switch between views
function switchView(view) {
    currentView = view;
    const container = document.getElementById('results-container');
    const existingContent = container.innerHTML;
    
    // Don't switch if there's no data
    if (container.querySelector('.results-placeholder')) {
        return;
    }
    
    // Get the last query result data
    if (window.lastQueryResult) {
        renderView(view, window.lastQueryResult);
    }
}

// Render appropriate view
function renderView(view, resultData) {
    const container = document.getElementById('results-container');
    
    if (view === 'table') {
        // Use the existing table view from ui.js
        if (resultData && resultData.success && resultData.result && resultData.result.length > 0) {
            const resultSet = resultData.result[0];
            const columns = resultSet.columns;
            const values = resultSet.values;
            
            // Check if this is timeline data for special visualization
            if (columns.includes('timestamp') && columns.includes('event_description') && window.displayTimelineView) {
                window.displayTimelineView(columns, values, container);
            } else if (window.displayTableView) {
                window.displayTableView(columns, values, container);
            } else {
                renderTableView(resultData, container);
            }
        } else {
            container.innerHTML = '<div class="results-placeholder"><p>No data available</p></div>';
        }
    } else if (view === 'chart') {
        renderChartView(resultData, container);
    } else if (view === 'evidence') {
        renderEvidenceBoard(resultData, container);
    }
}

// Fallback table view renderer
function renderTableView(resultData, container) {
    if (!resultData || !resultData.success || !resultData.result || resultData.result.length === 0) {
        container.innerHTML = '<div class="results-placeholder"><p>No data available</p></div>';
        return;
    }
    
    const resultSet = resultData.result[0];
    const columns = resultSet.columns;
    const values = resultSet.values;
    
    let html = '<table class="results-table"><thead><tr>';
    
    columns.forEach(col => {
        html += `<th>${escapeHtml(col)}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    values.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            const cellValue = cell === null ? '<em>NULL</em>' : escapeHtml(String(cell));
            html += `<td>${cellValue}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Render chart view
function renderChartView(resultData, container) {
    if (!resultData || !resultData.success || !resultData.result || resultData.result.length === 0) {
        container.innerHTML = '<div class="results-placeholder"><p>No data available for chart</p></div>';
        return;
    }
    
    const resultSet = resultData.result[0];
    const columns = resultSet.columns;
    const values = resultSet.values;
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
    
    // Find numeric columns
    const numericColumns = [];
    const numericIndices = [];
    
    columns.forEach((col, idx) => {
        if (values.length > 0) {
            const sampleValue = values[0][idx];
            if (typeof sampleValue === 'number' || !isNaN(parseFloat(sampleValue))) {
                numericColumns.push(col);
                numericIndices.push(idx);
            }
        }
    });
    
    // Find label column (usually first text column or 'name')
    let labelColumn = null;
    let labelIndex = -1;
    
    for (let i = 0; i < columns.length; i++) {
        if (columns[i].toLowerCase().includes('name') || 
            columns[i].toLowerCase().includes('suspect') ||
            columns[i].toLowerCase().includes('location')) {
            labelColumn = columns[i];
            labelIndex = i;
            break;
        }
    }
    
    if (labelIndex === -1 && columns.length > 0) {
        labelColumn = columns[0];
        labelIndex = 0;
    }
    
    // Create chart container
    container.innerHTML = '<div class="chart-container"><canvas id="result-chart"></canvas></div>';
    const canvas = document.getElementById('result-chart');
    const ctx = canvas.getContext('2d');
    
    if (numericColumns.length === 0) {
        container.innerHTML = '<div class="results-placeholder"><p>No numeric data found for chart visualization</p></div>';
        return;
    }
    
    // Prepare data
    const labels = values.map(row => String(row[labelIndex] || ''));
    const datasets = numericColumns.map((col, idx) => {
        const colIndex = numericIndices[idx];
        const data = values.map(row => {
            const val = row[colIndex];
            return typeof val === 'number' ? val : parseFloat(val) || 0;
        });
        
        return {
            label: col,
            data: data,
            backgroundColor: getColorForIndex(idx),
            borderColor: getColorForIndex(idx, 0.8),
            borderWidth: 2
        };
    });
    
    // Determine chart type
    let chartType = 'bar';
    if (columns.includes('timestamp') || columns.includes('date')) {
        chartType = 'line';
    } else if (numericColumns.length === 1 && values.length <= 10) {
        chartType = 'bar';
    }
    
    // Create chart
    currentChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: datasets.length > 1,
                    position: 'top',
                    labels: {
                        color: '#ecf0f1',
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Query Results Visualization',
                    color: '#ecf0f1',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: chartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#95a5a6'
                    },
                    grid: {
                        color: 'rgba(149, 165, 166, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#95a5a6'
                    },
                    grid: {
                        color: 'rgba(149, 165, 166, 0.2)'
                    }
                }
            } : {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#95a5a6'
                    },
                    grid: {
                        color: 'rgba(149, 165, 166, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#95a5a6'
                    },
                    grid: {
                        color: 'rgba(149, 165, 166, 0.2)'
                    }
                }
            }
        }
    });
}

// Render evidence board view
function renderEvidenceBoard(resultData, container) {
    if (!resultData || !resultData.success || !resultData.result || resultData.result.length === 0) {
        container.innerHTML = '<div class="results-placeholder"><p>No evidence to display</p></div>';
        return;
    }
    
    const resultSet = resultData.result[0];
    const columns = resultSet.columns;
    const values = resultSet.values;
    
    // Create evidence board HTML
    let html = '<div class="evidence-board">';
    
    values.forEach((row, idx) => {
        html += '<div class="evidence-card">';
        
        // Create pin
        html += '<div class="evidence-pin"></div>';
        
        // Card content
        html += '<div class="evidence-content">';
        
        columns.forEach((col, colIdx) => {
            const value = row[colIdx];
            if (value !== null && value !== undefined) {
                const isKeyField = col.toLowerCase().includes('name') || 
                                 col.toLowerCase().includes('id') ||
                                 col.toLowerCase().includes('suspect');
                
                html += `<div class="evidence-field ${isKeyField ? 'key-field' : ''}">`;
                html += `<span class="evidence-label">${col}:</span>`;
                html += `<span class="evidence-value">${escapeHtml(String(value))}</span>`;
                html += '</div>';
            }
        });
        
        html += '</div>'; // evidence-content
        html += '</div>'; // evidence-card
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Get color for chart dataset
function getColorForIndex(index, alpha = 0.6) {
    const colors = [
        'rgba(52, 152, 219, ' + alpha + ')',  // Blue
        'rgba(231, 76, 60, ' + alpha + ')',   // Red
        'rgba(46, 204, 113, ' + alpha + ')',  // Green
        'rgba(241, 196, 15, ' + alpha + ')', // Yellow
        'rgba(155, 89, 182, ' + alpha + ')', // Purple
        'rgba(230, 126, 34, ' + alpha + ')'  // Orange
    ];
    return colors[index % colors.length];
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.initVisualizations = initVisualizations;
window.switchView = switchView;
window.renderView = renderView;
