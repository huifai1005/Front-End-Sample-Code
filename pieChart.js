 (function () {

            angular.module(APPNAME).controller('chartController', ChartController);

            ChartController.$inject = ['$scope', '$window', '$baseController', '$salesService', '$chartProvider', '$alertService', 'sweetAlert'];

            function ChartController($scope, $window, $baseController, $salesService, $chartProvider, $alertService, sweetAlert) {
                var vm = this;

                vm.$scope = $scope;
                $baseController.merge(vm, $baseController);

                vm.$window = $window;
                vm.$salesService = $salesService;
                vm.$alertService = $alertService;
                vm.sweetAlert = sweetAlert;
                vm.$chartProvider = $chartProvider;

                vm.productTypeId = 1;
                vm.targetYear;
                vm.chartYear = new Date().getFullYear();
                vm.targetStartDate;
                vm.targetEndDate;
                vm.chartStartDate;
                vm.chartEndDate;

                vm.highestRevenueProduct = [];
                vm.highestSoldProduct = [];
                vm.lowestRevenueProduct = [];
                vm.lowestSoldProduct = [];

                vm.request;
                vm.items;

                vm.lashProducts;
                vm.hasLashProducts = false;
                vm.hasChart = true;
                             

                vm.changeYear = _changeYear;
                vm.changeTimeRange = _changeTimeRange;
                vm.goToDetail = _goToDetail;
                vm.changeType = _changeType;
                vm.flipChart = _flipChart;

                vm.btnProductType = "Show Addon Products";
                vm.btnFlip = "Show Sales Number";
                vm.productTitle = "Lash girl products";
                vm.showRevenue = true;     

                vm.pieChartDataFiller = _pieChartDataFiller;
                vm.getTargetFullYear = _getTargetFullYear;
                vm.pieChartConstrutor = _pieChartConstructor;

                vm.findHighLowRevenue = _findHighLowRevenue;
                vm.findHighLowSold = _findHighLowSold;

                vm.refreshChart = _refreshChart;

                //pie chart objs
                vm.pieChartSoldObj;
                vm.pieChartRevenueObj;                

                vm.$onInit = _render;


                function _render() {

                    var currentYear = vm.getTargetFullYear(vm.chartYear);
                    vm.chartStartDate = currentYear.firstDate
                    vm.chartEndDate = currentYear.lastDate;

                    vm.request = {
                        productTypeId: vm.productTypeId
                        , startDate: vm.chartStartDate
                        , endDate: vm.chartEndDate
                    };
                    vm.$salesService.get(vm.request, _getOnSuccess, _getOnError);
                    vm.$salesService.getAddonsByLGProductId(vm.test, _getAssociatedAddonOnSuccess, _getAssociatedAddonOnError);
                }

                function _getOnSuccess(data) {

                    if (data && data.data.items) {
                        if (!vm.hasLashProducts) {
                            vm.lashProducts = data.data.items;
                            vm.hasLashProducts = true;
                        }
                        vm.items = data.data.items;

                        vm.pieChartConstrutor(vm.items);

                        vm.findHighLowRevenue();

                        vm.findHighLowSold();

                    }
                    else {
                        vm.$alertService.error("No History");
                        vm.hasChart = false;
                    }

                }
                function _getOnError() {

                }

                function _getAssociatedAddonOnSuccess() {

                }

                function _getAssociatedAddonOnError() {

                }

                function _goToDetail(id) {
                    vm.$window.location.href = "/admin/statistics/barchart/" + id;
                }



                /*-----------------------------------map data and time modifier functions---------------------*/
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

                        vm.refreshChart();
                    }
                    else {
                        vm.sweetAlert.alertWrongDateRange();
                    }

                }

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

                    vm.refreshChart();
                }

                function _changeType(productType) {
                    if (productType == 'lashGirlProducts') {
                        vm.productTypeId = 1;
   
                        vm.productTitle = "Lash girl products";

                        vm.request = {
                            productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                        }

                        vm.refreshChart();
                    }
                    else {
                        vm.productTypeId = 2;
 
                        vm.productTitle = "Addon Products";

                        vm.request = {
                            productTypeId: vm.productTypeId
                       , startDate: vm.chartStartDate
                       , endDate: vm.chartEndDate
                        }

                        vm.refreshChart();
                    }
                }

                function _flipChart(statisticsType) {
                    if (statisticsType == 'revenue') {
                        vm.showRevenue = true;     
                    }
                    else {
                        vm.showRevenue = false; 
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


                function _findHighLowRevenue() {
                    vm.lowestRevenueProduct = [];
                    vm.highestRevenueProduct = [];

                    var items = vm.items;

                    items.sort(function (a, b) {
                        return a.revenue - b.revenue
                    });

                    var lowestRevenueItem = [items[0]];
                    var highestRevenueItem = [items[items.length - 1]];

                    //check for same revenue number in the array
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].revenue == items[i + 1].revenue) {
                            lowestRevenueItem.push(items[i + 1]);
                        }
                        else {
                            break;//stop looking if not the same
                        }
                    }

                    for (var i = items.length - 1; i > 0; i--) {
                        if (items[i].revenue == items[i - 1].revenue) {
                            highestRevenueItem.push(items[i - 1]);
                        }
                        else {
                            break;
                        }
                    }

                    vm.lowestRevenueProduct = lowestRevenueItem;
                    vm.highestRevenueProduct = highestRevenueItem;

                }

                function _findHighLowSold() {

                    vm.lowestSoldProduct = [];
                    vm.highestSoldProduct = [];
                    var items = vm.items;

                    items.sort(function (a, b) {
                        return a.sales - b.sales
                    });

                    var lowestSoldItem = [items[0]];
                    var highestSoldItem = [items[items.length - 1]];

                    for (var i = 0; i < items.length; i++) {
                        if (items[i].sales == items[i + 1].sales) {
                            lowestSoldItem.push(items[i + 1]);
                        }
                        else {
                            break;
                        }
                    }

                    for (var i = items.length - 1; i > 0; i--) {
                        if (items[i].sales == items[i - 1].sales) {
                            highestSoldItem.push(items[i - 1]);
                        }
                        else {
                            break;
                        }
                    }

                    vm.lowestSoldProduct = lowestSoldItem;
                    vm.highestSoldProduct = highestSoldItem;
                }

                function _refreshChart() {
                    vm.hasChart = true;
                    vm.items = null;

                    vm.pieChartSoldObj.destroy();//clear the data before assigning new data
                    vm.pieChartRevenueObj.destroy();

                    vm.$salesService.get(vm.request, _getOnSuccess, _getOnError);
                }

                function _pieChartConstructor(data) {
                    var dataNumberOfSales = [];
                    var label = [];
                    for (var i = 0; i < data.length; i++) {
                        dataNumberOfSales.push(data[i].sales);
                        label.push(data[i].title);
                    }

                    var colors = ['rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'];

                    //generate more colors if preset colors are not enough
                    var additionalColorsNumber = data.length - colors.length;
                    if (additionalColorsNumber > 0) {
                        for (var i = 0; i < additionalColorsNumber; i++) {
                            var r = parseInt(Math.random() * 256);
                            var b = parseInt(Math.random() * 256);
                            var g = parseInt(Math.random() * 256);

                            var color = 'rgba(' + r + ',' + b + ',' + g + ',1)'
                            colors.push(color);
                        }
                    }

                    //pie chart
                    var chartData = vm.pieChartDataFiller(label, dataNumberOfSales, colors);
                    vm.pieChartSoldObj = vm.$chartProvider.pieChart("pieChartNumberOfSold", chartData);

                    var dataRevenue = [];
                    for (var i = 0; i < data.length; i++) {
                        dataRevenue.push(data[i].revenue);
                    }

                    chartData = vm.pieChartDataFiller(label, dataRevenue, colors);
                    vm.pieChartRevenueObj = vm.$chartProvider.pieChart("pieChartTotalRevenue", chartData);

                }

                function _pieChartDataFiller(label, data, colors) {
                    var chartData = {
                        labels: label //array[]
                            , datasets: [
                            {
                                data: data,
                                backgroundColor: colors//array[]
                            }]
                    };

                    return chartData;
                }
            }
            
        })();
