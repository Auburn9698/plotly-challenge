// JSON structure for reference:
// metadata: [id, ethnicity, gender, age, location, bbtype, wfreq]
// "metadata":[{"id": 940, "ethnicity": "Caucasian", "gender": "F", "age": 24.0, "location": "Beaufort/NC", "bbtype": "I", "wfreq": 2.0},
// samples: [id (values), otu_ids (lists), sample_values (lists), otu_labels (lists)]

// Function to display demog. info in the panel:
function displayInfo(sampleID) {
    d3.json("./data/samples.json").then((jsonData) => {
      console.log(jsonData);

      var metaData = jsonData.metadata.filter(sample => sample.id == sampleID)[0]
      var demoPanel = d3.select("#sample-metadata")
      
      // Clear info panel; prevents the info accumulating
      demoPanel.html("")

      // Add the subjects to the panel with key and value pairs:
      Object.entries(metaData).forEach(([key, value]) => {
        demoPanel.append("h5").text(`${key}: ${value}`)
      })
    })
  }

// Function to build plots:
function buildPlots(sampleID) {
  d3.json("./data/samples.json").then((jsonData) => {

    var sampleData = jsonData.samples.filter(sample => sample.id == sampleID)[0]
    var otuIds = sampleData.otu_ids
    var sampleValues = sampleData.sample_values
    // Slice for the first 10 values:
    var sampleSlice = sampleValues.slice(0, 10)
    // Reverse the order:
    var reverseSamples = sampleSlice.reverse()

    var otuLabels = sampleData.otu_labels
    // Slice for the first 10 values:
    var labelSlice = otuLabels.slice(0,10)
    // Reverse the order:
    var reverseLabel = labelSlice.reverse()   

  // Data for horizontal bar chart:
  var trace1 = {
    x: reverseSamples,
    y: otuIds.slice(0,10).map(otuIds => `OTU ${otuIds}`).reverse(),
    text: reverseLabel,
    marker:{color: "#0000ff"},
    type: "bar",
    orientation: "h"
  };

  var barData = [trace1];
  var barLayout = {
    title: `Top 10 OTUs for Test Subject ${sampleID}`,
    xaxis: { title: "Abundance" },
  };

  // Plot bar chart:
  Plotly.newPlot("bar", barData, barLayout);

  // Set up data for bubble chart:
  var trace2 = {
    x: otuIds,
    y: sampleValues,
    mode: "markers",
    marker: {
        color: otuIds,
        colorscale: "Earth",
        size: sampleValues
    },
    text: otuLabels
  };

  /* Plotly colorscales: Blackbody, Bluered, Blues, Earth, Electric, Greens, Greys, Hot,
    Jet, Picnic, Portland, Rainbow, RdBu, Reds, Viridis, YlGnBu, YlOrRd */
    
  // Set responsive as true:
  var config = {responsive: true}
  var bubbleData = [trace2];
  var bubbleLayout = {
      title: "OTUs for Test Subject",
      showlegend: false,
      xaxis: {title: "OTU ID"},
      yaxis: {title: "Abundance"}
  };
  Plotly.newPlot("bubble", bubbleData, bubbleLayout, config);

  var subject_metadata = jsonData.metadata.filter(subject => subject.id == sampleID)

  var trace3 = {
      type: "indicator",
      mode: "gauge+number",
      value: subject_metadata[0].wfreq,
      title: {text: "Wash Frequency per Week"},
      gauge: {
          axis: {range: [0,9], tickwidth: 1, tickcolor: "darkblue"},
          bar: { color: "darkblue" },
          steps: [
            { range: [0, 1], color: "#ffffff" },
            { range: [1, 2], color: "#e6f0ff" },
            { range: [2, 3], color: "#cce0ff" },
            { range: [3, 4], color: "#b3d1ff" },
            { range: [4, 5], color: "#99c2ff" },
            { range: [5, 6], color: "#80b3ff" },
            { range: [6, 7], color: "#66a3ff" },
            { range: [7, 8], color: "#4d94ff" },
            { range: [8, 9], color: "#3385ff" }
          ],
        }
    }
    var gaugeData = [trace3];
    var gaugeLayout = {
        margin: { t: 0, b: 0 },
        paper_bgcolor: "lavender",
        fontcolor: "#8B4A8C"
    };
    Plotly.newPlot("gauge", gaugeData, gaugeLayout)
})
}

function init() {
  var dropdownMenu = d3.select("#selDataset");

  // Populate the dropdown menu with the samples:
  d3.json("./data/samples.json").then((jsonData) => {
    var subjectID = jsonData.names;
    subjectID.forEach((subject) => {
      dropdownMenu
        .append("option")
        .text("BB_" + subject)
        .property("value", subject);
    });

    // Use the first sample from the list to build the initial plots:
    var firstSample = subjectID[0];
    buildPlots(firstSample);
    displayInfo(firstSample);
  });
}

// Function for changing the dataset, using "optionChanged" on the index.html:
function optionChanged() {

    var dropdownMenu = d3.select("#selDataset");
    var subject = dropdownMenu.property("value");
    
    // Display the demo info and charts for the selected subject:
    displayInfo(subject);
    buildPlots(subject);
}

// Call init to initialize the page:
init();