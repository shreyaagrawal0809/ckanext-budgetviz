"use strict";

ckan.module('groupbarchart-view', function($, _) {
    return {
        initialize: function() {

            function mungeData(data) {
                var parseDate = d3.time.format("%Y").parse;
                var chdata = [];
                for (var i = 0; i < data.length; i++) {
                    var key = Object.keys(data[i])
                    key.shift();
                    var state = new Object();
                    state.key = data[i].States
                    state.disabled = data[i].States == "All-States" ? false : true
                    var values_arr = []
                    for (var j = 0; j < key.length; j++) {
                        if (data[i][key[j]] == "..." || data[i][key[j]] == "-") {
                            continue;
                        } else {
                            var temp = new Object();
                            temp.x = parseInt(key[j].substring(0, 4));
                            temp.y = parseFloat(data[i][key[j]])
                            values_arr.push(temp);
                        }
                    }
                    state.values = values_arr
                    chdata.push(state);
                }
                return chdata;
            }

            function toTitleCase(str) {
                return str.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }

            var addMiscElements = function() {
                d3.select("#viz-header").text(toTitleCase(resource.name));
            }

            function remove_record_notes(data) {
                data = data.filter(function(d) {
                    if (d["States"].trim()[1] == "." || d["States"].trim()[1] == "-") {} else {
                        return d
                    }
                })
                return data
            }

            function add_notes() {
                try {
                    var extra_fields = package_details.extras
                    var unit, note;
                    for (var i in extra_fields) {
                        if (extra_fields[i].key.substr(0, 4).toLowerCase() == "unit") {
                            unit = extra_fields[i].value;
                        }
                        if (extra_fields[i].key.substr(0, 4).toLowerCase() == "note") {
                            note = extra_fields[i].value;
                        }
                    }
                    if (unit) {
                        d3.select(".notes-content")
                            .text(function(d) {
                                return unit;
                            })
                        d3.select(".notes-heading")
                            .text(function(d) {
                                return "Unit :";
                            })
                    }
                    if (note) {
                        d3.select(".unit-note-content")
                            .text(function(d) {
                                return note;
                            })
                        d3.select(".unit-note-heading")
                            .text(function(d) {
                                return "Note :";
                            })
                    }
                } catch (err) {}
            }

            function prepareData(data) {
                return mungeData(remove_record_notes(data))
            }

            function drawChart(data) {
                nv.addGraph(function() {
                    var chart = nv.models.lineWithFocusChart();
                    var xScale = d3.time.scale();
                    var mini, max;
                    var minmax;
                    chart.xScale;

                    chart.x(function(d) {
                            return d.x
                        })
                        .y(function(d) {
                            var value = parseFloat(d.y)
                            return parseFloat(value.toFixed(2))
                        })
                        .margin({ "left": 90, "right": 40, "top": 0, "bottom": 50 })

                        .focusHeight(120)
                        .focusMargin({ "top": 30 })
                        .pointSize(10)
                        .showLegend(true)
                        .legendPosition("top")
                        .focusMargin({ "top": 20 })
                        .clipEdge(false);

                    chart.xAxis
                        .tickFormat(function(d) {
                            var c = parseInt(d) + 1;
                            return String(d) + " - " + String(c)
                        }).axisLabel("Year")
                        .axisLabelDistance(20);
                    chart.x2Axis.height("200px")
                        .tickFormat(function(d) {
                            var c = parseInt(d) + 1;
                            return String(d) + " - " + String(c)
                        });

                    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                    if (width > 600) {
                        chart.legend.margin({ top: 10, right: 0, left: -20, bottom: 40 })
                            .align("center");
                    } else if (width > 405) {
                        chart.legend.margin({ top: 10, right: 0, left: -35, bottom: 40 })
                            .align("center");
                    } else {
                        chart.margin({ "left": 90, "right": 40, "top": 20, "bottom": 50 })
                        chart.showLegend(false)
                    }
                    chart.yAxis.axisLabel(resource.name + "(Rs. Crore)")
                        .axisLabelDistance(20);

                    chart.tooltip.valueFormatter(function(d) {
                            return d3.format(",.f")(d);
                        })
                        .headerFormatter(function(d) {
                            var c = parseInt(d) + 1;
                            return String(d) + " - " + String(c)
                        })

                    var chartdata = d3.select('#chart svg')
                        .datum(data)
                        .call(chart);

                    chartdata.transition().duration(500).call(chart);
                    nv.utils.windowResize(chart.update);

                    return chart;
                });
            }
            d3.csv(resource_url, function(error, data) {
                addMiscElements();
                drawChart(prepareData(data));
                add_notes()
            });
        }()
    };
});