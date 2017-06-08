(function () {
    "use strict";

    angular.module(APPNAME).controller('addOnController', AddOnController);
    AddOnController.$inject = ['$scope', '$window', '$baseController', '$productService', '$cartService', '$serverModel', '$q'];

    function AddOnController($scope, $window, $baseController, $productService, $cartService, $serverModel, $q) {
        var vm = this;

        vm.$scope = $scope;
        $baseController.merge(vm, $baseController);
        vm.$window = $window;
        vm.$productService = $productService;
        vm.notify = vm.$productService.getNotifier($scope);
        vm.$cartService = $cartService;
        vm.$serverModel = $serverModel;
        vm.$q = $q;

        vm.productId = vm.$serverModel.item;
        vm.products;
        vm.cart;
        vm.productIndex;
        vm.buttonText = "Continue";


        vm.next = _next;
        vm.add = _add;
        vm.substract = _substract;

        vm.getProducts = _getProduct;
        vm.getCart = _getCart;
        vm.matchQuantity = _matchQuantity;


        vm.$onInit = _render();

        function _render() {

            vm.$window.scrollTo(0,0);
            vm.$q.all([vm.getProducts(),vm.getCart()])
                .then(vm.matchQuantity);

            vm.$systemEventService.broadcast("addon", "Choose Your Add-Ons");
        }

        function _matchQuantity(response) {
            vm.products = response[0].data.items;
            vm.cart = response[1].data.items;

            if (vm.products) {
                for (var i = 0; i < vm.products.length; i++) {
                    vm.products[i].quantity = 0;//set all product quantities to be 0
                }
            }

            if (vm.cart && vm.products) {
                for (var i = 0; i < vm.products.length; i++) {
                    for (var j = 0; j < vm.cart.length; j++) {

                        if (vm.products[i].id == vm.cart[j].productId) {//match products and items in the cart
                            if (vm.products[i].basePrice == vm.cart[j].cost) {//only pick the one with current price
                                vm.products[i].quantity = vm.cart[j].quantity;//match the product quantities from the cart
                                break;
                            }
                        }
                    }
                }
            }
        }


        function _getProduct() {
            var deferred = $q.defer();

            vm.$productService.getAddOns(vm.productId, _getOnSuccess, _getOnError);

            return deferred.promise;

            function _getOnSuccess(response) {
                deferred.resolve(response);
            }

            function _getOnError(jqXHR) {
                vm.$alertService.error(jqXHR.responseText, "Get Products failed");
            }

        }

        function _getCart() {
            var deferred = $q.defer();

            vm.$cartService.getQuantity(_getQuantityOnSuccess, _getQuantityOnError);

            return deferred.promise;

            function _getQuantityOnSuccess(response) {
                deferred.resolve(response);
            }

            function _getQuantityOnError(jqXHR) {
                vm.$alertService.error(jqXHR.responseText, "Get Quantity failed");
            }
        }


        function _add(product) {
            vm.productIndex = vm.products.indexOf(product);

            var model = {
                productId: product.id
            };

            vm.$cartService.add(model, _addOnSuccess, _addOnError);
        }

        function _substract(product) {
            if (product.quantity > 0) {
                vm.productIndex = vm.products.indexOf(product);
                vm.$cartService.deleteLastOne(product.id, product.basePrice, _deleteOnSuccess, _deleteOnError);
            }
        }

        function _next() {
            vm.$window.location.href = "#!/lashpick";
        }

        function _addOnSuccess() {
            vm.products[vm.productIndex].quantity++;
        }

        function _addOnError(jqXHR) {
            vm.$alertService.error(jqXHR.responseText, "Add to cart failed");
        }

        function _deleteOnSuccess() {
            vm.products[vm.productIndex].quantity--;
        }

        function _deleteOnError(jqXHR) {
            vm.$alertService.error(jqXHR.responseText, "Delete from cart failed");
        }
    }


})();