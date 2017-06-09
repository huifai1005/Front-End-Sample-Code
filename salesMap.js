(function () {
            angular.module(APPNAME).controller('salesMapController', SalesMapController);

            SalesMapController.$inject = ['$scope', '$window', '$baseController', '$salesService', 'sweetAlert'];

            function SalesMapController($scope, $window, $baseController, $salesService, sweetAlert) {
                var vm = this;

                vm.$scope = $scope;
                $baseController.merge(vm, $baseController);

                vm.$window = $window;
                vm.$salesService = $salesService;
                vm.sweetAlert = sweetAlert;


                vm.items;

                vm.productTypeId = 1;
                vm.targetYear;
                vm.chartYear = new Date().getFullYear();
                vm.targetStartDate;
                vm.targetEndDate;
                vm.chartStartDate;
                vm.chartEndDate;

                vm.showRevenue = true;

                vm.getTargetFullYear = _getTargetFullYear;

                vm.initiateSalesMap = _initiateSalesMap;
                vm.fillMapData = _fillMapData;
                vm.clearMapData = _clearMapData;
                vm.showMap = _showMap;


                vm.salesData = [];
                vm.revenueData = [];
                vm.request;

                vm.dataTitle1 = "Revenue of";
                vm.dataTitle2 = "Products";
                vm.dataTitle = vm.dataTitle1 + vm.dataTitle2;
                vm.dataSubtitle;

                vm.flipChart = _flipChart;
                vm.changeYear = _changeYear;
                vm.changeTimeRange = _changeTimeRange;
                vm.changeType = _changeType;


                vm.$onInit = _render;

                function _render() {

                    var currentYear = vm.getTargetFullYear(vm.chartYear);
                    vm.chartStartDate = currentYear.firstDate;
                    vm.chartEndDate = currentYear.lastDate;

                    vm.request = {
                        productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                    };

                    vm.dataSubtitle = vm.chartStartDate + " to " + vm.chartEndDate;
                    vm.$salesService.getSalesMap(vm.request, _getSalesMapOnSuccess, _getSalesMapOnError);
                }


                function _getSalesMapOnSuccess(response) {
                    vm.items = response.data.items//set it to null if nothing comes back

                    if (response && response.data.items) {                       
                        vm.clearMapData();
                        vm.fillMapData(vm.items);
                        vm.showMap();
                    }
                    else {
                        vm.clearMapData();
                        vm.showMap();
                    }
                }
                function _getSalesMapOnError() {
                   console.log("get sales map filed");
                }




                /*-----------------------------------map data and time modifier functions---------------------*/
                function _changeYear() {

                    vm.chartYear = vm.targetYear

                    var dates = vm.getTargetFullYear(vm.chartYear);

                    vm.chartStartDate = dates.firstDate;
                    vm.chartEndDate = dates.lastDate;

                    vm.request = {
                        productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                    }
                    vm.dataSubtitle = vm.chartStartDate + " to " + vm.chartEndDate;
                    vm.$salesService.getSalesMap(vm.request, _getSalesMapOnSuccess, _getSalesMapOnError);
                }

                function _changeTimeRange() {
                    var currentDate = new Date();
                    var currentDateISO = currentDate.toISOString();
                    var currentDateShortString = currentDateISO.slice(0, 10);

                    //validate start and end dates
                    if (vm.targetStartDate < vm.targetEndDate && vm.targetEndDate <= currentDateShortString) {
                        vm.chartStartDate = vm.targetStartDate;
                        vm.chartEndDate = vm.targetEndDate;

                        vm.request = {
                            productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                        }
                        vm.dataSubtitle = vm.chartStartDate + "to" + vm.chartEndDate;
                        vm.$salesService.getSalesMap(vm.request, _getSalesMapOnSuccess, _getSalesMapOnError);
                    }
                    else {
                        vm.sweetAlert.alertWrongDateRange();
                    }
                }

                function _changeType(productType) {
                    if (productType == 'lashGirlProducts') {
                        vm.productTypeId = 1;
                        vm.dataTitle2 = " Lash Girl Products";

                        vm.request = {
                            productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                        }

                        vm.$salesService.getSalesMap(vm.request, _getSalesMapOnSuccess, _getSalesMapOnError);
                    }
                    else {
                        vm.productTypeId = 2;
                        vm.dataTitle2 = " Addon Products";
                        vm.request = {
                            productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                        }

                        vm.$salesService.getSalesMap(vm.request, _getSalesMapOnSuccess, _getSalesMapOnError);
                    }
                }

                function _flipChart(statisticsType) {
                    if (statisticsType == 'revenue') {
                        vm.showRevenue = true;
                        vm.dataTitle1 = "Revenue of";
                        vm.dataTitle = vm.dataTitle1 + vm.dataTitle2;
                        vm.initiateSalesMap(vm.revenueData, vm.dataTitle, vm.dataSubtitle, "$");
                    }
                    else {
                        vm.showRevenue = false;
                        vm.dataTitle1 = "Number of Sales of";
                        vm.dataTitle = vm.dataTitle1 + vm.dataTitle2;
                        vm.initiateSalesMap(vm.salesData, vm.dataTitle, vm.dataSubtitle);
                    }
                }
                /*-----------------------------------map data and time modifier functions---------------------*/


                function _getTargetFullYear(year) {
                    var currentYear = new Date().getFullYear();

                    var firstDate = new Date(year, 0, 1); //get current year and set it to first date
                    var firstDateISO = firstDate.toISOString(); //iso date format 2017-01-01T08:00:00.000Z
                    var firstDateShortString = firstDateISO.slice(0, 10);//remove the long tail and keep only the date

                    var lastDate;
                    var lastDateISO;
                    var lastDateShortString;

                    if (year == currentYear) {
                        var lastDate = new Date();
                        var lastDateISO = lastDate.toISOString();
                        var lastDateShortString = lastDateISO.slice(0, 10);
                    }
                    else {
                        var lastDate = new Date(year, 11, 31);
                        var lastDateISO = lastDate.toISOString();
                        var lastDateShortString = lastDateISO.slice(0, 10);
                    }
                    return {
                        firstDate: firstDateShortString
                        , lastDate: lastDateShortString
                    };
                }


                function _initiateSalesMap(salesData, dataTitle, dataSubtitle, dataPrefix) {
                    var data = salesData,
                // Get the map data
                mapData = Highcharts.geojson(Highcharts.maps['countries/us/custom/us-small']);

                    Highcharts.data({

                        startColumn: 1,
                        startRow: 1,
                        complete: function (options) {
                            $.each(options.series[0].data, function () {
                                data.push({
                                    ucName: this[0],
                                    value: this[1]
                                });
                            });
                        }
                    });

                    // Process mapdata
                    $.each(mapData, function () {
                        var path = this.path,
                            copy = {
                                path: path
                            };

                        // This point has a square legend to the right
                        if (path[1] === 9727) {

                            // Identify the box
                            Highcharts.seriesTypes.map.prototype.getBox.call({}, [copy]);

                            // Place the center of the data label in the center of the point legend box
                            this.middleX = ((path[1] + path[4]) / 2 - copy._minX) / (copy._maxX - copy._minX); // eslint-disable-line no-underscore-dangle
                            this.middleY = ((path[2] + path[7]) / 2 - copy._minY) / (copy._maxY - copy._minY); // eslint-disable-line no-underscore-dangle

                        }
                        // Tag it for joining
                        this.ucName = this.name.toUpperCase();
                    });




                    // Initiate the chart
                    Highcharts.mapChart('salesMap', {

                        title: {
                            text: dataTitle
                        },

                        subtitle: {
                            text: dataSubtitle
                        },

                        mapNavigation: {
                            enabled: true,
                            enableButtons: false
                        },

                        xAxis: {
                            labels: {
                                enabled: false
                            }
                        },

                        colorAxis: {
                            labels: {
                                format: '{value}%'
                            }
                        },

                        series: [{
                            mapData: mapData,
                            data: data,
                            joinBy: 'ucName',
                            name: dataTitle,
                            states: {

                                hover: {
                                    color: '#a4edba'
                                }
                            },
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return this.point.properties['hc-a2'];
                                },
                                style: {
                                    fontSize: '10px'
                                }
                            },
                            tooltip: {
                                valueSuffix: '',
                                valuePrefix: dataPrefix
                            }
                        }, {
                            type: 'mapline',
                            data: Highcharts.geojson(Highcharts.maps['countries/us/custom/us-small'], 'mapline'),
                            color: 'silver'
                        }]
                    });
                }

                function _clearMapData() {
                    vm.salesData = [];
                    vm.revenueData = [];
                }

                function _showMap() {
                    if (vm.showRevenue) {
                        vm.dataTitle = vm.dataTitle1 + vm.dataTitle2;
                        vm.initiateSalesMap(vm.revenueData, vm.dataTitle, vm.dataSubtitle, "$");
                    }
                    else {
                        vm.dataTitle = vm.dataTitle1 + vm.dataTitle2;
                        vm.initiateSalesMap(vm.salesData, vm.dataTitle, vm.dataSubtitle);
                    }
                }

                function _fillMapData(data) {
                    for (var i = 0; i < data.length; i++) {
                        switch (data[i].state) {
                            case "AL":
                                vm.salesData.push({ ucName: "ALABAMA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "ALABAMA", value: data[i].revenue });
                                break;
                            case "AK":
                                vm.salesData.push({ ucName: "ALASKA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "ALASKA", value: data[i].revenue });
                                break;
                            case "AZ":
                                vm.salesData.push({ ucName: "ARIZONA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "ARIZONA", value: data[i].revenue });
                                break;
                            case "AR":
                                vm.salesData.push({ ucName: "ARKANSAS", value: data[i].sales });
                                vm.revenueData.push({ ucName: "ARKANSAS", value: data[i].revenue });
                                break;
                            case "CA":
                                vm.salesData.push({ ucName: "CALIFORNIA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "CALIFORNIA", value: data[i].revenue });
                                break;
                            case "CO":
                                vm.salesData.push({ ucName: "COLORADO", value: data[i].sales });
                                vm.revenueData.push({ ucName: "COLORADO", value: data[i].revenue });
                                break;
                            case "CT":
                                vm.salesData.push({ ucName: "CONNECTICUT", value: data[i].sales });
                                vm.revenueData.push({ ucName: "CONNECTICUT", value: data[i].revenue });
                                break;
                            case "DE":
                                vm.salesData.push({ ucName: "DELAWARE", value: data[i].sales });
                                vm.revenueData.push({ ucName: "DELAWARE", value: data[i].revenue });
                                break;
                            case "FL":
                                vm.salesData.push({ ucName: "FLORIDA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "FLORIDA", value: data[i].revenue });
                                break;
                            case "GA":
                                vm.salesData.push({ ucName: "GEORGIA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "GEORGIA", value: data[i].revenue });
                                break;
                            case "HI":
                                vm.salesData.push({ ucName: "HAWAII", value: data[i].sales });
                                vm.revenueData.push({ ucName: "HAWAII", value: data[i].revenue });
                                break;
                            case "ID":
                                vm.salesData.push({ ucName: "IDAHO", value: data[i].sales });
                                vm.revenueData.push({ ucName: "IDAHO", value: data[i].revenue });
                                break;
                            case "IL":
                                vm.salesData.push({ ucName: "ILLINOIS", value: data[i].sales });
                                vm.revenueData.push({ ucName: "ILLINOIS", value: data[i].revenue });
                                break;
                            case "IN":
                                vm.salesData.push({ ucName: "INDIANA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "INDIANA", value: data[i].revenue });
                                break;
                            case "IA":
                                vm.salesData.push({ ucName: "IOWA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "IOWA", value: data[i].revenue });
                                break;
                            case "KS":
                                vm.salesData.push({ ucName: "KANSAS", value: data[i].sales });
                                vm.revenueData.push({ ucName: "KANSAS", value: data[i].revenue });
                                break;
                            case "KY":
                                vm.salesData.push({ ucName: "KENTUCKY", value: data[i].sales });
                                vm.revenueData.push({ ucName: "KENTUCKY", value: data[i].revenue });
                                break;
                            case "LA":
                                vm.salesData.push({ ucName: "LOUISIANA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "LOUISIANA", value: data[i].revenue });
                                break;
                            case "ME":
                                vm.salesData.push({ ucName: "MAINE", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MAINE", value: data[i].revenue });
                                break;
                            case "MD":
                                vm.salesData.push({ ucName: "MARYLAND", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MARYLAND", value: data[i].revenue });
                                break;
                            case "MA":
                                vm.salesData.push({ ucName: "MASSACHUSETTS", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MASSACHUSETTS", value: data[i].revenue });
                                break;
                            case "MI":
                                vm.salesData.push({ ucName: "MICHIGAN", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MICHIGAN", value: data[i].revenue });
                                break;
                            case "MN":
                                vm.salesData.push({ ucName: "MINNESOTA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MINNESOTA", value: data[i].revenue });
                                break;
                            case "MS":
                                vm.salesData.push({ ucName: "MISSISSIPPI", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MISSISSIPPI", value: data[i].revenue });
                                break;
                            case "MO":
                                vm.salesData.push({ ucName: "MISSOURI", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MISSOURI", value: data[i].revenue });
                                break;
                            case "MT":
                                vm.salesData.push({ ucName: "MONTANA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "MONTANA", value: data[i].revenue });
                                break;
                            case "NE":
                                vm.salesData.push({ ucName: "NEBRASKA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NEBRASKA", value: data[i].revenue });
                                break;
                            case "NV":
                                vm.salesData.push({ ucName: "NEVADA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NEVADA", value: data[i].revenue });
                                break;
                            case "NH":
                                vm.salesData.push({ ucName: "NEW HAMPSHIRE", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NEW HAMPSHIRE", value: data[i].revenue });
                                break;
                            case "NJ":
                                vm.salesData.push({ ucName: "NEW JERSEY", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NEW JERSEY", value: data[i].revenue });
                                break;
                            case "NM":
                                vm.salesData.push({ ucName: "NEW MEXICO", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NEW MEXICO", value: data[i].revenue });
                                break;
                            case "NY":
                                vm.salesData.push({ ucName: "NEW YORK", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NEW YORK", value: data[i].revenue });
                                break;
                            case "NC":
                                vm.salesData.push({ ucName: "NORTH CAROLINA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NORTH CAROLINA", value: data[i].revenue });
                                break;
                            case "ND":
                                vm.salesData.push({ ucName: "NORTH DAKOTA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "NORTH DAKOTA", value: data[i].revenue });
                                break;
                            case "OH":
                                vm.salesData.push({ ucName: "OHIO", value: data[i].sales });
                                vm.revenueData.push({ ucName: "OHIO", value: data[i].revenue });
                                break;
                            case "OK":
                                vm.salesData.push({ ucName: "OKLAHOMA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "OKLAHOMA", value: data[i].revenue });
                                break;
                            case "OR":
                                vm.salesData.push({ ucName: "OREGON", value: data[i].sales });
                                vm.revenueData.push({ ucName: "OREGON", value: data[i].revenue });
                                break;
                            case "PA":
                                vm.salesData.push({ ucName: "PENNSYLVANIA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "PENNSYLVANIA", value: data[i].revenue });
                                break;
                            case "RI":
                                vm.salesData.push({ ucName: "RHODE ISLAND", value: data[i].sales });
                                vm.revenueData.push({ ucName: "RHODE ISLAND", value: data[i].revenue });
                                break;
                            case "SC":
                                vm.salesData.push({ ucName: "SOUTH CAROLINA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "SOUTH CAROLINA", value: data[i].revenue });
                                break;
                            case "SD":
                                vm.salesData.push({ ucName: "SOUTH DAKOTA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "SOUTH DAKOTA", value: data[i].revenue });
                                break;
                            case "TN":
                                vm.salesData.push({ ucName: "TENNESSEE", value: data[i].sales });
                                vm.revenueData.push({ ucName: "TENNESSEE", value: data[i].revenue });
                                break;
                            case "TX":
                                vm.salesData.push({ ucName: "TEXAS", value: data[i].sales });
                                vm.revenueData.push({ ucName: "TEXAS", value: data[i].revenue });
                                break;
                            case "UT":
                                vm.salesData.push({ ucName: "UTAH", value: data[i].sales });
                                vm.revenueData.push({ ucName: "UTAH", value: data[i].revenue });
                                break;
                            case "VT":
                                vm.salesData.push({ ucName: "VERMONT", value: data[i].sales });
                                vm.revenueData.push({ ucName: "VERMONT", value: data[i].revenue });
                                break;
                            case "VA":
                                vm.salesData.push({ ucName: "VIRGINIA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "VIRGINIA", value: data[i].revenue });
                                break;
                            case "WA":
                                vm.salesData.push({ ucName: "WASHINGTON", value: data[i].sales });
                                vm.revenueData.push({ ucName: "WASHINGTON", value: data[i].revenue });
                                break;
                            case "WV":
                                vm.salesData.push({ ucName: "WEST VIRGINIA", value: data[i].sales });
                                vm.revenueData.push({ ucName: "WEST VIRGINIA", value: data[i].revenue });
                                break;
                            case "WI":
                                vm.salesData.push({ ucName: "WISCONSIN", value: data[i].sales });
                                vm.revenueData.push({ ucName: "WISCONSIN", value: data[i].revenue });
                                break;
                            case "WY":
                                vm.salesData.push({ ucName: "WYOMING", value: data[i].sales });
                                vm.revenueData.push({ ucName: "WYOMING", value: data[i].revenue });
                                break;
                        }
                    }
                }
            }
})();
