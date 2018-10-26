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
                    return 2;
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
                return '<div class="chart-tooltip gray3"><span class="tooltip-label">' + d[1].x + '</span></div><div class="chart-tooltip r4"><span class="tooltip-label">' + d[1].id + ':</span>' +
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
    .range(["d1", "d1", "d1", "d1", "r1", "r1", "r1", "r1"]);

function chamberGrid(target, data, party, lean, index, tier, first) {
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

    //figure out the race counts
    var dataWatching = data.filter(function(d) {
        return (d.party == party) && (d.watching == "Y")
    });

    var dataParty = data.filter(function(d) {
        return (d.party == party)
    });

    //populate the balance of power bars
    if (party == "R") {
        $(".bigBar .rfade").text(dataParty.length - dataWatching.length);
        $(".bigBar .rfade").css("width", d3.format("%")((dataParty.length - dataWatching.length) / 134));
        $(".bigBar .rstrong").text(dataWatching.length);
        $(".bigBar .rstrong").css("width", d3.format("%")((dataWatching.length) / 134));
    } else {
        $(".bigBar .dfade").text(dataParty.length - dataWatching.length);
        $(".bigBar .dfade").css("width", d3.format("%")((dataParty.length - dataWatching.length) / 134));
        $(".bigBar .dstrong").text(dataWatching.length);
        $(".bigBar .dstrong").css("width", d3.format("%")((dataWatching.length) / 134));
    }

    //filter the data based on party and lean
    var dataFiltered = data.filter(function(d) {
            return (d.party == party && d.lean == lean);
        }).sort(function(a, b) {

            if (party == "R") { return d3['ascending'](a.margin, b.margin); }
            else { return d3['descending'](a.margin, b.margin); }
    });

    //build the grid
    // for (var j=0; j < 5; j++) {

    d3.select(target).html("");
        
    d3.select(target).selectAll(".seat" + first)
        .data(dataFiltered.filter(function(d) {
            // var multiplier;
            // if (tier == "pos") { multiplier = 1; }
            // else if (tier == "neg") {  multiplier = -1; }

            // var percentile = (j * 10) * multiplier;
            // var ceiling = percentile + (10 * multiplier);

            if (tier == "pos") {return (d.margin > 0); }
            else if (tier == "neg") {return (d.margin < 0); }
        }))
        .enter()
        .append("div")
        .attr("id", function(d) {
            return "d" + d.district;
        })
        .on("click", function(d) {
            // d3.selectAll(".seat").classed("selected",false);
            // d3.select(this).classed("selected",true);
        })
        .attr("class", function(d) {
            var color = "";
            
            if (d.party == "R" && d.watching == "Y") { color = "r4"; }
            else if (d.party == "R") { color = "r1"; }
            else if (d.party == "DFL" && d.watching == "Y") { color = "d4"; }
            else if (d.party == "DFL") { color = "d1"; }

            if (d.special_status == "open" && d.party == "DFL" && d.watching == "Y") { color = "stripe-d-open-y"; }
            else if (d.special_status == "open" && d.party == "R" && d.watching == "Y") { color = "stripe-r-open-y"; }
            else if (d.special_status == "open" && d.party == "DFL" && d.watching == "N") { color = "stripe-d-open-n"; }
            else if (d.special_status == "open" && d.party == "R" && d.watching == "N") { color = "stripe-r-open-n"; }

            if (d.special_status == "rematch" && d.party == "DFL" && d.watching == "Y") { color = "stripe-d-rematch-y"; }
            else if (d.special_status == "rematch" && d.party == "R" && d.watching == "Y") { color = "stripe-r-rematch-y"; }
            else if (d.special_status == "rematch" && d.party == "DFL" && d.watching == "N") { color = "stripe-d-rematch-n"; }
            else if (d.special_status == "rematch" && d.party == "R" && d.watching == "N") { color = "stripe-r-rematch-n"; }

            return color + " seat seat" + first;
        })
        .html(function(d) {
            return d.district;
        })
        .call(d3.helper.tooltip(function(d, i) {
            var status = d.first + " " + d.last + d.incumbent + " (" + d.party + ")";
            var opponent = "<div>vs. " + d.opponent + " (" + d.opponent_party + ")</div>";
            if (d.opponent == "null") { opponent = ""; }
            return "<div class='districtName'>District " + d.seatName + "</div><div>" + status + "</div>" + opponent + "<div class='tipCat'>CPVI</div><div>" + d.cpvi + "</div><div><div class='tipCat'>Current member from</div>" + d.from + "</div><div><div class='tipCat'>Trump margin</div>" + d3.format("+.1f")(d.margin) + "%</div><div class='tipCat'>Special status</div><div>" + d.special_status + "</div>";
        }));

    // }

}

chamberGrid("#tier1", data, "DFL", "D Strong", 3, "pos", 6);
chamberGrid("#tier2", data, "DFL", "D Lean", 2, "pos", 7);
chamberGrid("#tier3", data, "DFL", "D Competitive", 1, "pos", 8);
chamberGrid("#tier6", data, "DFL", "D Competitive", 1, "neg", 9);
chamberGrid("#tier5", data, "DFL", "D Lean", 2, "neg", 10);
chamberGrid("#tier4", data, "DFL", "D Strong", 3, "neg", 11);


chamberGrid("#tier12", data, "R", "R Strong", 3, "pos", 0);
chamberGrid("#tier11", data, "R", "R Lean", 2, "pos", 1);
chamberGrid("#tier10", data, "R", "R Competitive", 1, "pos", 2);
chamberGrid("#tier7", data, "R", "R Competitive", 1, "neg", 3);
chamberGrid("#tier8", data, "R", "R Lean", 2, "neg", 4);
chamberGrid("#tier9", data, "R", "R Strong", 3, "neg", 5);


// render district map
var map = new Map("#map");

map.render();


//prez popularity chart
function chartPoll(container, data) {

    d3.select(container).selectAll(".pollstack")
        .data(data).enter().append("div")
        .attr("class", function(d, i) {
            return "pollstack";
        })
        .on("click", function(d) {

        })
        .html(function(d) {

            var color = "r4";
            var color2 = "#5BBF48";

            if (d.party == "D") {
                color = "d4";
            }
            if (d.approval < 0.50) {
                color2 = "#E07242";
            }

            return '<div class="column prez ' + color + '">' + d.president + ' ' + d.year + '</div><div class="column approval" style="color:' + color2 + ';">' + d3.format(".0%")(d.approval) + '</div><div class="column chartCol ' + color + '">' + d.party + d3.format("+")(d.mnhouse_loss) + '</div>';
        });

}


var data;

function loadData(data) {
    chartPoll("#approvalSpill", data);
}

$.ajax({
    url: './data/approval.json',
    async: false,
    dataType: 'json',
    success: function(response) {
        data = response.approval;
        loadData(data);
    }
});