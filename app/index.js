/**
 * Main JS file for project.
 */

// Define globals that are added through the js.globals in
// the config.json file, here like this:
// /* global _ */

// Utility functions, such as Pym integration, number formatting,
// and device checking

//import utilsFn from './utils.js';
//utilsFn({ });


// Import local ES6 modules like this:
//import utilsFn from './utils.js';

// Or import libraries installed with npm like this:
// import module from 'module';

// Utilize templates on the client.  Get the main content template.
//import Content from '../templates/_index-content.svelte.html';
//
// Get the data parts that are needed.  For larger data points,
// utilize window.fetch.  Add the build = true option in the buildData
// options.
//import content from '../content.json';
// OR: let content = await (await window.fetch('./assets/data/content.json')).json();
//
// const app = new Content({
//   target: document.querySelector('.main-app-container'),
//   data: {
//     content
//   }
// });

import * as d3 from 'd3';
import * as c3 from 'c3';
import rankings from '../sources/axis.json';
import Map from './map.js';

// swing chart
function chartBuilder() {
    var padding = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 40,
    };

    var chart = c3.generate({
        bindto: '#chart',
        padding: padding,
        data: {
            x: 'x',
            columns: [
                ['x', 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018],
                ['DFL Seats', 52, 66, 85, 87, 62, 73, 62, 57, null],
                ['GOP Seats', 81, 68, 49, 47, 72, 61, 72, 77, null]
            ],
            type: 'line'
        },
        legend: {
            show: false
        },
        point: {
            show: true,
            r: function(d) {
                if (d.x == '2016') {
                    return 6;
                } else {
                    return 0;
                }
            }
        },
        color: {
            pattern: ["#3F88C5", "#A52129"]
        },
        axis: {
            y: {
                max: 134,
                min: 0,
                padding: {
                    bottom: 0,
                    top: 0
                },
                tick: {
                    values: [0, 67, 134],
                    count: 3,
                    format: d3.format('.0f')
                }
            },
            x: {
                tick: {
                    values: ['2002', '2004', '2006', '2008', '2010', '2012', '2014', '2016', '2018'],
                    count: 5,
                    multiline: false
                },
                padding: {
                    left: 0,
                    right: 0
                }
            }
        },
        grid: {
            y: {
                lines: [{
                    value: 67,
                    text: '',
                    position: 'start',
                    class: 'powerline'
                }]

            },
            x: {
                lines: [{
                        value: 2002,
                        text: 'Midterm',
                        position: 'start'
                    },
                    {
                        value: 2004,
                        text: 'Bush (R) Win',
                        position: 'start'
                    },
                    {
                        value: 2006,
                        text: 'Midterm',
                        position: 'start'
                    },
                    {
                        value: 2008,
                        text: 'Obama (D) Win',
                        position: 'start'
                    },
                    {
                        value: 2010,
                        text: 'Midterm',
                        position: 'start'
                    },
                    {
                        value: 2012,
                        text: 'Obama (D) Win',
                        position: 'start'
                    },
                    {
                        value: 2014,
                        text: 'Midterm',
                        position: 'start'
                    },
                    {
                        value: 2016,
                        text: 'Trump (R) Win',
                        position: 'start'
                    },
                    {
                        value: 2018,
                        text: 'Midterm',
                        position: 'start'
                    }
                ]
            }
        },
        tooltip: {
            contents: function(d, defaultTitleFormat, defaultValueFormat, color) {
                console.log(d);
                return '<div class="chart-tooltip gray3"><span class="tooltip-label">' + d[1].x + '</span></div><div class="chart-tooltip r4"><span class="tooltip-label">' + d[0].id + ':</span>' +
                    '<span class="tooltip-value">' + defaultValueFormat(d[1].value) + '</span>' +
                    '</div><div class="chart-tooltip d4">' +
                    '<span class="tooltip-label">' + d[0].id + ':</span>' +
                    '<span class="tooltip-value">' + defaultValueFormat(d[0].value) + '</span>' +
                    '</div>';
            }
        }
    });
}

chartBuilder();

// rankings chart
var data = rankings.scores;
var colorScale = d3.scaleOrdinal()
    .domain(["D Tossup", "D Competitive", "D Lean", "D Strong", "R Tossup", "R Competitive", "R Lean", "R Strong"])
    .range(["d1", "d2", "d3", "d4", "r1", "r2", "r3", "r4"]);

function chamberGrid(target, data, party, lean, index) {
    d3.helper = {};

    d3.helper.tooltip = function(accessor) {
        return function(selection) {
            var tooltipDiv;
            var bodyNode = d3.select('body').node();
            selection.on("mouseover", function(d, i) {
                    // Clean up lost tooltips
                    d3.select('body').selectAll('div.tooltip').remove();
                    // Append tooltip
                    tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
                    var absoluteMousePos = d3.mouse(bodyNode);
                    tooltipDiv.style('left', (absoluteMousePos[0] + 10) + 'px')
                        .style('top', (absoluteMousePos[1] - 15) + 'px')
                        .style('position', 'absolute')
                        .style('z-index', 1001);
                    // Add text using the accessor function
                    var tooltipText = accessor(d, i) || '';
                    // Crop text arbitrarily
                    //tooltipDiv.style('width', function(d, i){return (tooltipText.length > 80) ? '300px' : null;})
                    //    .html(tooltipText);
                })
                .on('mousemove', function(d, i) {
                    // Move tooltip
                    var absoluteMousePos = d3.mouse(bodyNode);
                    tooltipDiv.style('left', (absoluteMousePos[0] + 10) + 'px')
                        .style('top', (absoluteMousePos[1] - 15) + 'px');
                    var tooltipText = accessor(d, i) || '';
                    tooltipDiv.html(tooltipText);
                })
                .on("mouseout", function(d, i) {
                    // Remove tooltip
                    tooltipDiv.remove();
                });

        };
    };

    var dataFiltered = data.filter(function(d) {
        return (d.party == party) && (d.lean == lean)
    }).sort(function(a, b) {
        return d3['descending'](a.score, b.score);
    });

    $("#" + party + index).html(dataFiltered.length)

    d3.select(target).selectAll(".seat")
        .data(dataFiltered).enter().append("div")
        .attr("id", function(d) {
            return "d" + d.district;
        })
        .on("click", function(d) {
            // d3.selectAll(".seat").classed("selected",false);
            // d3.select(this).classed("selected",true);
        })
        .attr("class", function(d) {
            return colorScale(lean) + " seat";
        })
        .html(function(d) {
            return d.district;
        })
        .call(d3.helper.tooltip(function(d, i) {
            return "<div class='districtName'>District " + d.seatName + "</div><div>" + d.first + " " + d.last + " (" + d.party + ")</div><div>" + d.from + "</div><div class='" + colorScale(lean) + "'>" + d.cpvi + "</div>";
        }));

}

chamberGrid("#rGrid .blocks1", data, "GOP", "R Tossup", 1);
chamberGrid("#dGrid .blocks1", data, "DFL", "D Tossup", 1);

chamberGrid("#rGrid .blocks2", data, "GOP", "R Competitive", 2);
chamberGrid("#dGrid .blocks2", data, "DFL", "D Competitive", 2);

chamberGrid("#rGrid .blocks3", data, "GOP", "R Lean", 3);
chamberGrid("#dGrid .blocks3", data, "DFL", "D Lean", 3);

chamberGrid("#rGrid .blocks4", data, "GOP", "R Strong", 4);
chamberGrid("#dGrid .blocks4", data, "DFL", "D Strong", 4);

// render district map
var map = new Map("#map");

map.render();

// axic chart
// function chartAxis(container, chamber) {

//     var dAxis = [];
//     var rAxis = [];
//     var dValues = [];
//     var rValues = [];

//     dAxis[0] = "DEM_x";
//     rAxis[0] = "GOP_x";
//     dValues[0] = "DEM";
//     rValues[0] = "GOP";


//     var dataD = dataAxis.filter(function(d) {
//         return d.chamber == chamber && d.party == "DEM"
//     });
//     var dataR = dataAxis.filter(function(d) {
//         return d.chamber == chamber && d.party == "GOP"
//     });

//     var index = 1;

//     for (var i = 0; i < dataD.length; i++) {
//         dAxis[index] = dataD[i].margin;
//         dValues[index] = dataD[i].score;
//         index++;
//     }

//     index = 1;

//     for (var i = 0; i < dataR.length; i++) {
//         rAxis[index] = dataR[i].margin;
//         rValues[index] = dataR[i].score;
//         index++;
//     }


//     var padding = {
//         top: 20,
//         right: 60,
//         bottom: 20,
//         left: 60,
//     };

//     var chartAxis = c3.generate({
//         bindto: container,
//         padding: padding,
//         data: {
//             xs: {
//                 DEM: 'DEM_x',
//                 GOP: 'GOP_x'
//             },
//             columns: [
//                 rAxis,
//                 rValues,
//                 dAxis,
//                 dValues
//             ],
//             colors: {
//                 'DEM': '#3F88C5',
//                 'GOP': '#A52129',
//             },
//             type: 'scatter'
//         },
//         point: {
//             show: true,
//             r: function(d) {
//                 return 3;
//             }
//         },
//         legend: {
//             show: false
//         },
//         axis: {
//             rotated: true,
//             y: {
//                 max: 60,
//                 min: -60,
//                 padding: {
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     top: 0
//                 },
//                 tick: {
//                     count: 11,
//                     values: [-80, -60, -40, -20, 0, 20, 40, 60, 80],
//                     format: function(d) {
//                         if (d < 0) {
//                             return "D+" + (d * -1);
//                         } else if (d > 0) {
//                             return "R+" + (d * 1);
//                         } else if (d == 0) {
//                             return "EVEN";
//                         }
//                     }
//                 }
//             },
//             x: {
//                 max: 80,
//                 min: -80,
//                 label: {
//                     text: '⬅ Higher Trump win margin'
//                 },
//                 padding: {
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     top: 0
//                 },
//                 tick: {
//                     values: [-80, -60, -40, -20, 0, 20, 40, 60, 80],
//                     count: 5,
//                     multiline: false
//                 },
//             }
//         },
//         grid: {
//             focus: {
//                 show: false
//             },
//             y: {
//                 lines: [{
//                     value: 0,
//                     text: '',
//                     position: 'start',
//                     class: 'powerline'
//                 }]

//             },
//             x: {
//                 lines: [{
//                     value: 0,
//                     text: '',
//                     position: 'start',
//                     class: 'powerline'
//                 }]

//             }
//         },
//         regions: [{
//                 axis: 'x',
//                 start: -5,
//                 end: 5,
//                 class: 'regionX'
//             },
//             {
//                 axis: 'y',
//                 start: -5,
//                 end: 5,
//                 class: 'regionX'
//             }
//         ],
//         tooltip: {
//             contents: function(d, defaultTitleFormat, defaultValueFormat, color, i) {
//                 var state, color, district;

//                 var thisData = dataAxis.filter(function(g) {
//                     return g.chamber == chamber && g.party == d[0].id && g.score == d[0].value && g.margin == d[0].x;
//                 });

//                 if (d[0].id == "GOP") {
//                     color = "r4";
//                     state = thisData[0].statePostal;
//                     district = thisData[0].seatNum;
//                 } else {
//                     color = "d4"
//                     state = thisData[0].statePostal;
//                     district = thisData[0].seatNum;
//                 }

//                 return '<div class="chart-tooltip ' + color + '">' + state + '-' + district +
//                     '<span class="tooltip-label">: ' + d3.format("+.0f")(d[0].x) + ' | </span>' +
//                     '<span class="tooltip-value">' + defaultValueFormat(d[0].value) + '</span>' +
//                     '</div>';
//             }
//         }
//     });
// }