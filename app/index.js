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

function chartBuilder(){
    var  padding = {
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
                ['x',2002,2004,2006,2008,2010,2012,2014,2016,2018],
                ['DFL Seats',52,66,85,87,62,73,62,57,null],
                ['GOP Seats',81,68,49,47,72,61,72,77,null]
            ],
            type: 'line'
        },
        legend: {
            show: false
        },
        point: {
            show: true,
            r: function(d) { if (d.x == '2016') { return 6; } else { return 0; } }
        },
        color:  {  pattern: ["#3F88C5","#A52129"] },
        axis: {
          y: {
                max: 134,
                min: 0,
                padding: {bottom: 0, top:0},
                tick: {
                 values: [0,67,134],
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
              lines: [
                    {value: 67, text: '', position: 'start', class:'powerline'}
              ]
    
            },
            x: {
                lines: [
                    {value: 2002, text: 'Midterm', position: 'start'},
                    {value: 2004, text: 'Bush (R) Win', position: 'start'},
                    {value: 2006, text: 'Midterm', position: 'start'},
                    {value: 2008, text: 'Obama (D) Win', position: 'start'},
                    {value: 2010, text: 'Midterm', position: 'start'},
                    {value: 2012, text: 'Obama (D) Win', position: 'start'},
                    {value: 2014, text: 'Midterm', position: 'start'},
                    {value: 2016, text: 'Trump (R) Win', position: 'start'},
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

var data = rankings.scores;

function chamberGrid(target, data, party) {
    d3.helper = {};

    d3.helper.tooltip = function(accessor){
        return function(selection){
            var tooltipDiv;
            var bodyNode = d3.select('body').node();
            selection.on("mouseover", function(d, i){
                // Clean up lost tooltips
                d3.select('body').selectAll('div.tooltip').remove();
                // Append tooltip
                tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
                var absoluteMousePos = d3.mouse(bodyNode);
                tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                    .style('top', (absoluteMousePos[1] - 15)+'px')
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
                tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                    .style('top', (absoluteMousePos[1] - 15)+'px');
                var tooltipText = accessor(d, i) || '';
                tooltipDiv.html(tooltipText);
            })
            .on("mouseout", function(d, i){
                // Remove tooltip
                tooltipDiv.remove();
            });
    
        };
    };

  d3.select(target).selectAll(".seat")
  .data(data.filter(function(d){ return d.party == party}).sort(function(a, b) { return d3['descending'](a.score, b.score); })).enter().append("div")
  .attr("id", function (d) { return "d" + d.district; })
  .on("click", function (d) { 
    // d3.selectAll(".seat").classed("selected",false);
    // d3.select(this).classed("selected",true);
   })
  .attr("class",function (d){ 
        if (party == "GOP") { 
            var color =  "r2";
        }
        else if (party == "DFL") { 
            var color =  "d2";
        }
      
        return color + " seat district"; })
    .html(function (d){ 
        return d.district;
    })
  .call(d3.helper.tooltip(function(d, i){
    return d.seatName;
  }));

}

chamberGrid("#mnaxis .gopGrid", data, "GOP");
chamberGrid("#mnaxis .dflGrid", data, "DFL");

var map = new Map("map");

map.render();