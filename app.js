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
      
      // clear metadata
      demoPanel.html("")

      // Add the subjects to the panel with key and value pairs:
      Object.entries(metaData).forEach(([key, value]) => {
        demoPanel.append("h6").text(`${key}: ${value}`)
      })
    })
  }

// Funciton to build plots:
function buildPlots(sampleID) {
  d3.json("./data/samples.json").then((jsonData) => {

    var sampleData = jsonData.samples.filter(sample => sample.id == sampleID)[0]
    var otuIds = sampleData.otu_ids
    var sampleValues = sampleData.sample_values
    var sampleSlice = sampleValues.slice(0, 10)
    var reverseSlice = sampleSlice.reverse()
    var otuLabels = sampleData.otu_labels   

  // Data for horizontal bar chart:
  var trace1 = {
    x: reverseSlice,
    y: otuIds.slice(0,10).map(otuIds => `OTU ${otuIds}`).reverse(),
    text: otuLabels.slice(0,10).reverse(),
    marker:{color: "#0000ff"},
    type: "bar",
    orientation: "h"
  };

  var barData = [trace1];
  var barLayout = {
    title: `Top 10 OTUs for Subject ${sampleID}`,
  };

  // Plot bar chart:
  Plotly.newPlot("bar", barData, barLayout);
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
        .text(subject)
        .property("value", subject);
    });

    // Use the first sample from the list to build the initial plots:
    var firstSample = subjectID[0];
    buildPlots(firstSample);
    displayInfo(firstSample);
  });
}
//d3.selectAll("#selDataset").on("change", optionChanged);
function optionChanged() {

    var dropdownMenu = d3.select("#selDataset");
    var subject = dropdownMenu.property("value");
    
    // Display the demo info and charts for the selected subject:
    displayInfo(subject);
    buildPlots(subject);
}

// Call init to initialize the page:
init();