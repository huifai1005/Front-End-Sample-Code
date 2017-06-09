(function () {
    angular.module(APPNAME).factory('$salesService', SalesService);

    SalesService.$inject = ['$baseService', '$sabio', '$http'];

    function SalesService($baseService, $sabio, $http) {
        return {
            get: _get
            , getMonthlyReport: _getMonthlyReport
            , getSalesMap: _getSalesMap
            , getSalesMapByProductId: _getSalesMapByProductId
            , getAddonsByLGProductId: _getAddonsByLGProductId
            , getAllProductsMonthlyReport: _getAllProductsMonthlyReport
        };

        function _get(request, onSuccess, onError) {
            $http({
                method: "GET"
                , url: "/api/sales/revenue?" + "producttypeid=" + request.productTypeId + "&startdate=" + request.startDate + "&enddate=" + request.endDate
            }).then(onSuccess
                    , onError);
        }

        function _getMonthlyReport(id,year,onSuccess,onError) {
            $http({
                method: "GET"
               , url: "/api/sales/months/" + id + "/" + year 
            }).then(onSuccess
                   , onError);
        }
        function _getSalesMap(request, onSuccess, onError) {
            $http({
                method: "GET"
                , url: "/api/sales/map?" + "producttypeid=" + request.productTypeId + "&startdate=" + request.startDate + "&enddate=" + request.endDate
            }).then(onSuccess
                    , onError);
        }

        function _getSalesMapByProductId(request, onSuccess, onError) {
            $http({
                method: "GET"
                , url: "/api/sales/map/" + request.productTypeId + "?startdate=" + request.startDate + "&enddate=" + request.endDate
            }).then(onSuccess
                    , onError);
        }

        function _getAddonsByLGProductId(request, onSuccess, onError) {
            $http({
                method: "GET"
                , url: "/api/sales/addons/revenue/" + request.id + "/" + request.startDate +"/"+request.endDate
            }).then(onSuccess
                    , onError);
        }
        function _getAllProductsMonthlyReport(year,onSuccess,onError) {
            $http({
                method: "GET"
                , url: "/api/sales/months/allproducts/" + year
            }).then(onSuccess
                    , onError);
        }
    }
})();