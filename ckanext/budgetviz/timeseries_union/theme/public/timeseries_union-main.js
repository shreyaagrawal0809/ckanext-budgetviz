"use strict";

ckan.module('timeseries_ipfs-main', function($, _) {
    return {
        initialize: function() {
            d3.json(resource_url, function(data) {
                function clickcall() {
                    return false;
                }

                function populateSelection(data) {
                    var select = d3.select("#item-select")
                        .append("ul")
                        .attr("class", "nav nav-tabs nav-stacked")
                        .selectAll("li")
                        .data(data)
                        .enter().append("li")
                        .attr("class", function(d, i) {
                            if(i==0){
                                return "active";
                            }
                        })
                        .on("click", function(d) {
                            drawchart(d);
                        })

                    select.append("a")
                        .attr({
                            onclick: "return false;",
                            href: "#"
                        })
                        .text(function(d) {
                            return d.name
                        })

                    $(".nav a").on("click", function() {
                        $(".nav").find(".active").removeClass("active");
                        $(this).parent().addClass("active");
                    });
                }

                function drawchart(data) {
                    nv.addGraph(function() {
                        var chartdata;
                        var maxValue = d3.max(data.series, function(d) {
                            return d3.max(d.values, function(d) {
                                return +d.value;
                            })
                        });

                        var minValue = d3.min(data.series, function(d) {
                            return d3.min(d.values, function(d) {
                                return d.value;
                            })
                        });

                        var chart = nv.models.lineWithFocusChart()
                            .color(["#002A4A", "#FF9311", "#D64700", "#17607D"])
                            .x(function(d) {
                                return parseInt((d.label).substring(0, 4));
                            })
                            .y(function(d) {
                                return d.value
                            });
                        chart.focusHeight(110);
                        chart.margin({ "left": 90, "right": 20, "top": 0, "bottom": 50 })
                        chart.yAxis.axisLabelDistance(30)
                        chart.xAxis.axisLabelDistance(20)
                        chart.yAxis.ticks(10)
                        chart.focusMargin({ "top": 20 });
                        chart.yAxis
                            .tickFormat(d3.format(',.1f'));
                       
                        chart.xAxis.axisLabel("Year");
                        chart.yAxis.axisLabel(data.name);
                        //chart.brushExtent([formatdate("2006"), formatdate("2016")]);
                        chartdata = d3.select('#chart svg')
                            .datum(data.series)
                            .call(chart);

                        chartdata.transition().duration(500).call(chart);
                        nv.utils.windowResize(chart.update);
                        return chart;
                    });
                }

                populateSelection(data);
                drawchart(data[0])
            });
        }()
    };
});