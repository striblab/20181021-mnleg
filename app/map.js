import 'intersection-observer';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import mnleg from '../sources/mnleg.json';
import mn from '../sources/mncd.json';
import axis from '../sources/axis.json';

class Map {

    constructor(target) {
        this.target = target;
        this.svg = d3.select(target + " svg").attr("width", $(target).outerWidth()).attr("height", $(target).outerHeight());
        this.g = this.svg.append("g");
        this.zoomed = false;
        this.scaled = $(target).width() / 520;
        this.colorScale = d3.scaleOrdinal()
            .domain(["D Tossup", "D Competitive", "D Lean", "D Strong", "R Tossup", "R Competitive", "R Lean", "R Strong"])
            .range(["dstrong", "dstrong", "dfade", "dfade", "rstrong", "rstrong", "rfade", "rfade"]);
        // this.colorScale = d3.scaleOrdinal()
        // .domain(["GOP", "DFL"])
        // .range(['#C0272D',"#0258A0"]);
    }

    /********** PRIVATE METHODS **********/

    // Detect if the viewport is mobile or desktop, can be tweaked if necessary for anything in between
    _detect_mobile() {
        var winsize = $(window).width();

        if (winsize < 520) {
            return true;
        } else {
            return false;
        }
    }

    /********** PUBLIC METHODS **********/

    // Render the map
    render() {
        var self = this;

        var projection = d3.geoAlbers().scale(5037).translate([50, 970]);

        var width = $(self.target).outerWidth();
        var height = $(self.target).outerHeight();
        var centered;

        var data = axis.scores;

        var path = d3.geoPath(projection);

        var svg = d3.select(self.target + " svg").attr("width", width).attr("height", height);
        var g = svg.append("g");

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

        // Only fire resize events in the event of a width change because it prevents
        // an awful mobile Safari bug and developer rage blackouts.
        // https://stackoverflow.com/questions/9361968/javascript-resize-event-on-scroll-mobile
        var cachedWidth = window.innerWidth;
        d3.select(window).on("resize", function() {
            var newWidth = window.innerWidth;
            if (newWidth !== cachedWidth) {
                cachedWidth = newWidth;
            }
        });

        g.append("g")
            .attr("class", "districts")
            .selectAll("path")
            .data(topojson.feature(mnleg, mnleg.objects.mnleg).features)
            .enter().append("path")
            .attr("d", path)
            .attr("id", function(d) {
                return "D" + d.properties.seatName;
            })
            .style("stroke-width", '0.5')
            .style("stroke", "#ffffff")
            .attr("class", function(d) {
                var lean;
                for (var i = 0; i < data.length; i++) {
                    if (d.properties.DISTRICT == data[i].seatName) {
                        if (data[i].party == "GOP" && data[i].watching == "N") {
                            lean = "R Strong";
                        } else if (data[i].party == "GOP" && data[i].watching == "Y") {
                            lean = "R Tossup";
                        } else if (data[i].party == "DFL" && data[i].watching == "N") {
                            lean = "D Strong";
                        } else if (data[i].party == "DFL" && data[i].watching == "Y") {
                            lean = "D Tossup";
                        }
                        break;
                    }
                }
                return self.colorScale(lean) + " district " + d.properties.seatName;;
            })
            .call(d3.helper.tooltip(function(d, i) {
                var string;
                var status;
                var opponent = "";
                for (var i = 0; i < data.length; i++) {
                    if (d.properties.DISTRICT == data[i].seatName) {
                        opponent = "<div>vs. " + data[i].opponent + " (" + data[i].opponent_party + ")</div>";
                        status = data[i].first + " " + data[i].last + data[i].incumbent + " (" + data[i].party + ")";
                        // if (data[i].special_status == "open") { status = "Open Seat"; }
                        string = "<div class='districtName'>District " + data[i].seatName + "</div><div>" + status + "</div>" + opponent + "<div class='tipCat'>CPVI</div><div>" + data[i].cpvi + "</div><div><div class='tipCat'>Current member from</div>" + data[i].from + "</div><div><div class='tipCat'>Trump margin</div>" + d3.format("+.0f")(data[i].margin) + "%</div><div class='tipCat'>Special status</div><div>" + data[i].special_status + "</div>";
                        break;
                    }
                }
                return string;
            }));

        //Draw congressional district borders
        g.append('g')
        .attr('class', 'cds')
        .selectAll('path')
        .data(topojson.feature(mn, mn.objects.mncd).features)
        .enter().append('path')
        .attr('d', path)
        .attr('class', function(d) {
            return 'cd CD' + d.properties.DISTRICT;
        })
        .attr('id', function(d) {
            return 'P' + d.properties.DISTRICT;
        })
        .style("fill-opacity",0)
        .style('stroke-width', '1px')
        .style('stroke', '#333333');


        var aspect = 500 / 550,
            chart = $(self.target + " svg");
        var targetWidth = chart.parent().width();
        chart.attr("width", targetWidth);
        chart.attr("height", targetWidth / aspect);
        if ($(window).width() <= 520) {
            $(self.target + " svg").attr("viewBox", "0 0 500 550");
        }

        $(window).on("resize", function() {
            targetWidth = chart.parent().width();
            chart.attr("width", targetWidth);
            chart.attr("height", targetWidth / aspect);
        });
    }
}

export {
    Map as
    default
}