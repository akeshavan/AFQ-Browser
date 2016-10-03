//tracklist js

//Data : track names
var tracks=["Left Thalamic Radiation","Right Thalamic Radiation","Left Corticospinal","Right Corticospinal","Left Cingulum Cingulate","Right Cingulum Cingulate","Left Cingulum Hippocampus","Right Cingulum Hippocampus","Callosum Forceps Major","Callosum Forceps Minor","Left IFOF","Right IFOF","Left ILF","Right ILF","Left SLF","Right SLF","Left Uncinate","Right Uncinate","Left Arcuate","Right Arcuate"]

// color Palettes in Hex format, HTML needs colors in d3colors format
// colors are the Tableau20 colors
var colors = [0x1F77B4, 0xAEC7E8, 0xFF7F0E, 0xFFBB78, 0x2CA02C, 0x98DF8A, 0xD62728, 0xFF9896, 0x9467BD, 0xC5B0D5, 0x8C564B, 0xC49C94, 0xE377C2, 0xF7B6D2, 0x7F7F7F, 0xC7C7C7, 0xBCBD22, 0xDBDB8D, 0x17BECF, 0x9EDAE5];
var d3colors = ["#1F77B4", "#AEC7E8", "#FF7F0E", "#FFBB78", "#2CA02C", "#98DF8A", "#D62728", "#FF9896", "#9467BD", "#C5B0D5", "#8C564B", "#C49C94", "#E377C2", "#F7B6D2", "#7F7F7F", "#C7C7C7", "#BCBD22", "#DBDB8D", "#17BECF", "#9EDAE5"];
// highlightColors[i] = (colors[i] + 10 lightness) converted to RGB hex
var highlightColors = [0x2991DB, 0xD7E4F4, 0xFF9A42, 0xFFD6AD, 0x37C837, 0xBCEAB3, 0xDF5353, 0xFFC8C7, 0xAC8ACC, 0xDDD0E6, 0xA96C60, 0xD5B9B3, 0xECA2D6, 0xFCE3EE, 0x999, 0xE0E0E0, 0xDCDC38, 0xE8E8B5, 0x30D6E8, 0xC7EAF0];

var m = {top: 20, right: 10, bottom: 10, left: 20},
w = 400 - m.left - m.right,
h = 350 - m.top - m.bottom;
var axisOffset = {bottom: 40};

// init variable to hold data later
var tractdata = d3.map();
var brushing = false;

//insert trackname checkboxes in the tracklist panel
var svg = d3.select('#tracklist').selectAll(".input").data(tracks).enter().append('div');
svg.append('input')
      .attr("type", "checkbox")
      .attr("class", "tracks")
      .attr("id", function (d, i) { return "input" + (i + 1); })
      .attr("name", function (d, i) { return i; })
// add label to the checkboxes
svg.append('label')
      .text(function (d) { return d; })
      .attr("for", function (d, i) { return "input" + (i + 1); })
      .attr("id", function (d, i) { return "label" + i; });

//add event handler to the checkbox
d3.selectAll(".tracks")
  .on("change", function () {
      var state = this.checked
      var name = this.name
      //call trackdetails handler
      showHideTrackDetails(state, name)
      highlightBundle(state, name)
  });


// all select/un-select all checkbox
d3.selectAll("#selectAllTracks")
  .on("change", function () {
      var state = this.checked;
      if (state) {
          d3.selectAll(".tracks").each(function (d, i) {
              this.checked = true;
              showHideTrackDetails(this.checked, this.name);
              highlightBundle(this.checked, this.name);
          });
      } else {
          d3.selectAll(".tracks").each(function (d, i) {
              this.checked = false;
              showHideTrackDetails(this.checked, this.name);
              highlightBundle(this.checked, this.name);
          });
      }

  });

//function toggleState()

var x = d3.scale.linear()
    .range([m.left+20, w+m.left+20]);

var y = d3.scale.linear()
    .range([h - axisOffset.bottom, 0]);

var line = d3.svg.line()
    .interpolate("basis")
    .x(function (d) {
        if (d.pos) {
            return x(+d.pos);
        } else {
            return x(+d.key);
        }
    })
    .y(function (d) {
        if (d.FA) {
            return y(+d.FA);
        } else {
            return y(+d.values);
        }
    });

var bundleBrush = {};

// Set initial opacitites here
var initBrainOpacity = 0.1;
var initFiberOpacity = 0.05;
var initColorOpacity = 0.75;
var initHighlightOpacity = 0.75;

// Set initial line widths here
var initFiberLineWidth = 1.0;
var initColorLineWidth = 2.0;
var initHighlightLineWidth = 2.5;

// var mouseoverHighlight = true

var plotsGuiConfigObj = function () {
    this.lhOpacity = 1.0;
    this.rhOpacity = 100;
    this.fiberOpacity = initFiberOpacity;
    this.highlight = true;
};

var plotsGui = new dat.GUI({
    autoplace: false,
    width: 350,
    scrollable: false
});

var plotsControlBox = new plotsGuiConfigObj();

// gui.domElement.id = 'gui';
var plotsGuiContainer = $('.plotsGUI').append($(plotsGui.domElement));

var lhOpacityController = plotsGui.add(plotsControlBox, 'lhOpacity')
		.min(0).max(1).name('y range');

//lhOpacityController.onChange(function (value) {
//    lh.traverse(function (child) {
//        if (child instanceof THREE.Mesh) {
//            child.material.opacity = value;
//        }
//    })
//});

var rhOpacityController = plotsGui.add(plotsControlBox, 'rhOpacity')
    .min(0).max(100).name('x range');

//rhOpacityController.onChange(function (value) {
//    rh.traverse(function (child) {
//        if (child instanceof THREE.Mesh) {
//            child.material.opacity = value;
//        }
//    })
//});

var fiberOpacityController = plotsGui.add(plotsControlBox, 'fiberOpacity')
    .min(0).max(1).name('Fiber Opacity');

var highlightController = plotsGui.add(plotsControlBox, 'highlight')
    .name('Mouseover Highlight');

highlightController.onChange(function (value) {
    console.log(value);
});

plotsGui.close();


queue()
    .defer(d3.csv, "data/nodes.csv")
    .await(ready);

function ready(error, data) {
    if (error) throw error;

    tractdata = d3.nest()
     .key(function (d) { return d.tract; })
     .key(function (d) { return d.subject; })
     .entries(data);


    var tract_mean = d3.nest()
      .key(function (d) { return d.tract; })
      .key(function (d) { return d.pos; })
      .rollup(function (v) { return d3.mean(v, function (d) { return +d.FA; }); })
      .entries(data);


    for (i = 0; i < tract_mean.length; i++) {
        tractdata[i].values.push(tract_mean[i]);
    }
    // set x and y domains for the track plots
    y.domain([0, 1]);
    x.domain(d3.extent(data, function (d) { return d.pos; })).nice();

    //create axes
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
        .tickSize(0 - w - 5)
        .ticks(5);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickPadding(8)
            .ticks(5);

    var brush = d3.svg.brush()
        .x(x)
        .on("brush", brushed)
        .on("brushstart", brushStart)
        .on("brushend", brushEnd);

    //initialize panels for each track - and attach track data with them
    var trpanels = d3.select("#trackdetails").selectAll("svg").data(tractdata);
    trpanels.enter().append("svg")
        .attr("id", function (d) { return "track" + (+d.key - 1); })
        .attr("width", w + m.left + m.right + 40)
        .attr("height", h + m.top + m.bottom + axisOffset.bottom)
        .attr("display", "none")
        .append("g")
        .attr("transform", "translate(" + m.left + "," + m.top + ")")
//y-axis
        .append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + m.left + ",0)")
        .call(yAxis)
    //x-axis
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(-40," + (h - axisOffset.bottom) + ")")
        .call(xAxis);


    // Populate budleBrush
    d3.select("#trackdetails").selectAll("svg")[0]
        .forEach(function (d) {
            bundleBrush[d.id] = {
                brushOn: false,
                brushExtent: [0, 100]
            }
        });

    // brush
    var brushg = d3.select("#trackdetails").selectAll("svg")
        .append("g")
        .attr("class", "brush")
        .call(brush);

    brushg.selectAll("rect")
        .attr("y", m.top)
        .attr("height", h - axisOffset.bottom);

    trpanels.append("rect")
           .attr("class", "plot")
           .attr("width", w + m.left + m.right + 20)
           .attr("height", h + m.top + m.bottom + 15)
                 .attr("x", 0)
                 .attr("y", 0)
                .style("stroke", function (d) { return d3colors[d.key - 1]; })
                .style("fill", "none")
                .style("stroke-width", 2);

    // 	trpanels.append("text")
    //   	.attr("transform", "rotate(-90)")
    //   	.attr("x", -h/2)
    //   	.attr("y",0)
    //   	.style("stroke", "#AFBABF")
    //   	.attr("dy", "1em")
    //   	.style("text-anchor", "middle")
    //   	.text("Fractional Anisotropy");

    trpanels.append("text")
        	.attr("x", 350)
        	.attr("y", h + 25)
            .attr("class", "plot_text")
        	.style("text-anchor", "end")
        	.style("stroke", "#888888;")
        	.text("% Distance Along Fiber Bundle");

    trpanels.append("text")
          .attr("x", w + 40)
          .attr("y", h - 280)
          .attr("class", "plot_text")
          .style("text-anchor", "end")
          .style("stroke", function (d) { return d3colors[d.key - 1]; })
          .style("fill", function (d) { return d3colors[d.key - 1]; })
          .text(function (d) { return tracks[d.key - 1]; });

    // associate tracksline with each subject
    var tracklines = trpanels.selectAll(".tracks")
        .data(function (d) { return d.values; })
        .enter().append("g")
        .attr("class", "tracks")
        .attr("id", function (d, i) {
            if (i >= sub_data.length) {
                return "Mean" + (i - sub_data.length);
            } else {
                return "Subject" + (i);
            }
        })
        .style("opacity", 0.3)
        .style("stroke-width", "1px")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", onclick);

    //if (ramp != null) {
    //    tracklines.style("stroke", ramp(1));
    //}

    d3.selectAll("#Mean0")
        .style("opacity", 0.99)
        .style("stroke-width", "3.5px")

    

    tracklines.append("path")
        .attr("class", "line")
        .attr("d", function (d) { return line(d.values); });

    function mouseover() {
        if (!brushing) {
            if ($(this).css("stroke-width") == "1px") {			//uses the stroke-width of the line clicked on to determine whether to turn the line on or off
                d3.selectAll('#' + this.id)
                    //.transition()
                    //.duration(50)
                    .style("opacity", 1)
                    .style("stroke-width", "2px");
            }
        }
    }


    function onclick() {
        if (!brushing) {
            if ($(this).css("stroke-width") == "2.1px") {				//uses the stroke-width of the line clicked on to determine whether to turn the line on or off

                d3.selectAll('#' + this.id)
                    //.transition()
                    //.duration(50)
                    .style("opacity", 0.3)
                    .style("stroke-width", "1px");
            } else if ($(this).css("stroke-width") == "1px") {
                d3.selectAll('#' + this.id)
                    //.transition()
                    //.duration(50)
                    .style("opacity", 1)
                    .style("stroke-width", "2.1px");
            }
        }
    }

    function mouseout() {
        if (!brushing) {
            if ($(this).css("stroke-width") == "2px") {				//uses the stroke-width of the line clicked on to determine whether to turn the line on or off
                d3.selectAll('#' + this.id)
                    .transition()
                    //.duration(50)
                    .style("opacity", 0.3)
                    .style("stroke-width", "1px");
            }
        }
    }

    function brushed() {
        bundleBrush[this.parentElement.id].brushOn = !brush.empty();
        if (brush.empty()) {
            bundleBrush[this.parentElement.id].brushExtent = [0, 100];
        } else {
            bundleBrush[this.parentElement.id].brushExtent = brush.extent();
        }
    }

    function brushStart() {
        brushing = true;
    }

    function brushEnd() {
        brushing = false;
    }
}

function showHideTrackDetails(state, name)
{
  if (state==true){
    d3.select("#track"+name).style("display", "inline");
      d3.select("#label"+name)
        .style("color",d3colors[name]);
  }
  else {
    d3.select("#track"+name).style("display", "none");
    d3.select("#label"+name)
      .style("color","#111111");
  }

}
